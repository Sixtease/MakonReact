/* global window */

import { createSelector } from 'reselect';
import { get_chunk_text_nodes } from '../component';
import { frame_to_time } from './util';
import { demagicize_rect, demagicize_rects } from '../../../lib/Util';

function get_word_chunk_position(word_index, subs_chunks) {
  const chunk_index = subs_chunks.chunk_index_by_word_index[word_index];
  const chunk = subs_chunks[chunk_index];
  const icco = subs_chunks.icco_by_word_index[word_index];
  const chunk_text_nodes = get_chunk_text_nodes();
  const text_node = chunk_text_nodes ? chunk_text_nodes[chunk_index] : null;
  return {
    chunk,
    icco,
    text_node
  };
}

const range = window.document.createRange();
export const get_word_rectangles = (words, subs, subs_chunks) => {
  let rects = [];
  if (words && words.length > 0) {
    const last_word = words[words.length - 1];
    const {
      text_node: start_word_el,
      icco: start_word_icco
    } = get_word_chunk_position(words[0].i, subs_chunks);
    const {
      text_node: end_word_el,
      icco: end_word_icco
    } = get_word_chunk_position(last_word.i, subs_chunks);
    if (start_word_el && end_word_el) {
      range.setStart(start_word_el, start_word_icco);
      range.setEnd(end_word_el, end_word_icco);
      rects = demagicize_rects(
        range.getClientRects(),
        window.scrollX,
        window.scrollY
      );
    }
  }
  return rects;
};

export const get_subs = state => state.track_detail.subs;
const get_current_time = state => state.track_detail.current_time;
const get_selection_boundaries = state => ({
  start: {
    chunk_index: state.track_detail.selection_start_chunk_index,
    icco: state.track_detail.selection_start_icco
  },
  end: {
    chunk_index: state.track_detail.selection_end_chunk_index,
    icco: state.track_detail.selection_end_icco
  }
});
export const get_subs_chunks = createSelector(
  [get_subs],
  subs => {
    const chunks = [];
    const wbuf = [];
    const chunk_index_by_word_index = [];
    const icco_by_word_index = [];
    let chunk_index = -1;
    let char_offset = 0;
    let word_offset = 0;
    let is_now_humanic = null;
    let wbuf_str_length = 0;
    const flush = function() {
      const str = wbuf.concat('').join(' ');
      chunks.push({
        is_humanic: is_now_humanic,
        str,
        char_offset,
        word_offset
      });
      char_offset += str.length;
      word_offset += wbuf.length;
      wbuf.length = 0;
      wbuf_str_length = 0;
    };
    subs.forEach((sub, word_index) => {
      const subhum = !!sub.humanic;
      if (subhum !== is_now_humanic) {
        flush();
        is_now_humanic = subhum;
        chunk_index++;
      }
      chunk_index_by_word_index[word_index] = chunk_index;
      icco_by_word_index[word_index] = wbuf_str_length;
      wbuf.push(sub.occurrence);
      wbuf_str_length += sub.occurrence.length + 1;
    });
    flush();
    chunks.shift();
    return {
      chunks,
      chunk_index_by_word_index,
      icco_by_word_index
    };
  }
);
export const get_word_timestamps = createSelector(
  [get_subs],
  subs => subs.map((sub, i) => sub.timestamp).concat(Infinity)
);
const NULL_CURRENT_WORD = {
  is_null: true,
  occurrence: '',
  rects: [],
  start_offset: null,
  end_offset: null
};
let current_word;
export const get_current_word = createSelector(
  [get_word_timestamps, get_current_time, get_subs, get_subs_chunks],
  (word_timestamps, current_time, subs, subs_chunks) => {
    // pretend we're a bit ahead of time
    // to get the next word if we're just about to hit it
    const time_ahead = current_time + 0.03;
    if (subs.length === 0) {
      return NULL_CURRENT_WORD;
    }
    let i = current_word ? current_word.i : 0;
    while (word_timestamps[i + 1] <= time_ahead) i++;
    while (word_timestamps[i] > time_ahead) i--;
    if (i < 0) i = 0;
    const sub = subs[i];
    let start_offset = null;
    let end_offset = null;
    let rects = [];
    if (sub && subs_chunks) {
      const { text_node, icco } = get_word_chunk_position(i, subs_chunks);
      if (text_node) {
        start_offset = icco;
        end_offset = icco + sub.occurrence.length;
        if (text_node.length < end_offset) {
          return NULL_CURRENT_WORD;
        }
        range.setStart(text_node, start_offset);
        range.setEnd(text_node, end_offset);
        rects = demagicize_rects(
          range.getClientRects(),
          window.scrollX,
          window.scrollY
        );
      }
    }
    current_word = {
      i,
      rects,
      ...sub
    };
    return current_word;
  }
);
export const get_next_word = createSelector(
  [get_subs, get_current_word],
  (subs, current_word) => {
    if (subs.length === 0) {
      return NULL_CURRENT_WORD;
    }
    if (!current_word) {
      return NULL_CURRENT_WORD;
    }
    const i = current_word.i;
    const sub = subs[i + 1];
    if (sub) {
      return {
        i,
        ...sub
      };
    } else {
      return NULL_CURRENT_WORD;
    }
  }
);
// TODO: use the index Luke (make selector index_by_timestamp that uses subs)
export function get_word_index(word, subs) {
  if (!word || !subs || subs.length === 0) {
    return null;
  }
  let i = current_word ? current_word.i : 0;
  while (subs[i].timestamp > word.timestamp) {
    i--;
  }
  while (subs[i].timestamp < word.timestamp) {
    i++;
  }
  return i;
}
const get_word_index_by_position = (word_position, subs, subs_chunks, i) => {
  const null_rv = {
    to_the_left: null,
    to_the_right: null
  };
  if (
    !subs || // eslint-disable-line indent
    !subs_chunks ||
    !subs_chunks.chunk_index_by_word_index ||
    !subs_chunks.icco_by_word_index
  ) {
    return null_rv;
  }

  if (word_position.chunk_index === 0 && word_position.icco === 0) {
    return {
      to_the_left: 0,
      to_the_right: 0
    };
  }
  const last_chunk_i = subs_chunks.chunks.length - 1;
  if (word_position.chunk_index > last_chunk_i) {
    return null_rv;
  }
  if (
    word_position.chunk_index === last_chunk_i &&
    word_position.icco >= subs_chunks.chunks[last_chunk_i].str.length - 1
  ) {
    return {
      to_the_left: subs.length - 1,
      to_the_right: null
    };
  }

  if (i === void 0) {
    i = current_word ? current_word.i : 0;
  }
  const chunk_index_by_word_index = subs_chunks.chunk_index_by_word_index;
  const char_offset_by_word_index = subs_chunks.icco_by_word_index;

  while (
    chunk_index_by_word_index[i] !== void 0 &&
    chunk_index_by_word_index[i] > 0 &&
    chunk_index_by_word_index[i] > word_position.chunk_index
  )
    i--;
  let stop = chunk_index_by_word_index.length - 1;
  while (
    chunk_index_by_word_index[i] !== void 0 &&
    chunk_index_by_word_index[i] < stop &&
    chunk_index_by_word_index[i] < word_position.chunk_index
  )
    i++;

  while (
    char_offset_by_word_index[i] !== void 0 &&
    char_offset_by_word_index[i] > 0 &&
    char_offset_by_word_index[i] > word_position.icco
  )
    i--;
  while (
    char_offset_by_word_index[i] !== void 0 &&
    chunk_index_by_word_index[i + 1] === word_position.chunk_index &&
    char_offset_by_word_index[i] + subs[i].occurrence.length - 1 <
      word_position.icco
  )
    i++;

  if (chunk_index_by_word_index[i] !== word_position.chunk_index) {
    return null_rv;
  }

  const rv = { to_the_right: i };
  if (
    char_offset_by_word_index[i] === word_position.icco ||
    char_offset_by_word_index[i] === word_position.icco + 1
  ) {
    rv.to_the_left = i - 1;
  } else {
    rv.to_the_left = i;
  }
  return rv;
};
// TODO: simplify
export const get_selected_word_indices = createSelector(
  [get_subs, get_subs_chunks, get_selection_boundaries],
  (subs, subs_chunks, selection_boundaries) => {
    const start = selection_boundaries.start;
    const end = selection_boundaries.end;
    if (
      start.chunk_index === null ||
      end.chunk_index === null ||
      start.chunk_index > end.chunk_index ||
      start.icco === null ||
      end.icco === null ||
      (start.chunk_index === end.chunk_index && // eslint-disable-line indent
        start.icco > end.icco)
    ) {
      return null;
    }

    const end_index = get_word_index_by_position(end, subs, subs_chunks)
      .to_the_left;
    if (end_index === null) {
      return null;
    }

    if (
      start.chunk_index === end.chunk_index && // eslint-disable-line indent
      start.icco === end.icco
    ) {
      return {
        only: end_index
      };
    }

    const start_index = get_word_index_by_position(
      start,
      subs,
      subs_chunks,
      end_index
    ).to_the_right;
    if (start_index === null) {
      return null;
    }

    return {
      start: start_index,
      end: end_index
    };
  }
);
export const get_selected_words = createSelector(
  [get_subs, get_selected_word_indices],
  (subs, selected_word_indices) => {
    if (
      selected_word_indices === null ||
      !(selected_word_indices.start >= 0) ||
      !(selected_word_indices.end >= 0)
    ) {
      return [];
    }
    return subs.slice(
      selected_word_indices.start,
      selected_word_indices.end + 1
    );
  }
);
export const get_selected_word_rectangles = createSelector(
  [get_selected_words, get_subs, get_subs_chunks],
  get_word_rectangles
);
export const get_total_time = state =>
  frame_to_time(state.track_detail.frame_cnt);
export const get_edit_window_timespan = createSelector(
  [get_subs, get_selected_words, get_total_time],
  (subs, selected_words, total_time) => {
    if (!selected_words || selected_words.length === 0) {
      return {
        start: null,
        end: null
      };
    }
    const i = get_word_index(selected_words[selected_words.length - 1], subs);
    const pad_word = subs[i + 1] || { timestamp: total_time };
    return {
      start: selected_words[0].timestamp,
      end: pad_word.timestamp
    };
  }
);
export const get_marked_word = createSelector(
  [
    get_subs,
    get_subs_chunks,
    get_selection_boundaries,
    get_selected_word_indices
  ],
  (subs, subs_chunks, selection_boundaries, selected_word_indices) => {
    if (selected_word_indices && selected_word_indices.only >= 0) {
      const marked_word = subs[selected_word_indices.only];
      const { text_node, icco } = get_word_chunk_position(
        selected_word_indices.only,
        subs_chunks
      );
      if (text_node === null) {
        return null;
      }
      const start_offset = icco;
      const end_offset = icco + marked_word.occurrence.length;
      range.setStart(text_node, start_offset);
      range.setEnd(text_node, end_offset);
      const rect = demagicize_rect(
        range.getBoundingClientRect(),
        window.scrollX,
        window.scrollY
      );
      return {
        ...marked_word,
        rect
      };
    } else {
      return null;
    }
  }
);
