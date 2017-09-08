import fetch_jsonp from 'fetch-jsonp';
import { createSelector } from 'reselect';
import { get_chunk_text_nodes } from './component.js';
import query_string from 'query-string';

export const FRAME_RATE = 44100;
export const frame_to_time = (frame) => frame / FRAME_RATE;
export const time_to_frame = (time)  => time  * FRAME_RATE;

import audio from 'store/audio.js';

const ACTION_HANDLERS = {
    set_subs: (state, action) => ({
        ...state,
        subs: action.subs,
    }),
    playback_on: (state, action) => {
        const rv = {
            ...state,
            is_playing: true,
        };
        const selected_words = action.selected_words/* || get_selected_words({ track_detail:state }) */;
        if (selected_words.length > 0) {
            rv.forced_time = selected_words[0].timestamp;
        }
        return rv;
    },
    playback_off: (state, action) => {
        return {
            ...state,
            is_playing: false,
        };
    },
    clear_forced_time: (state) => ({
        ...state,
        forced_time: null,
    }),
    set_audio_metadata: (state, action) => ({
        ...state,
        frame_cnt: time_to_frame(audio().duration),
    }),
    sync_current_time: (state, action) => ({
        ...state,
        current_time: action.current_time,
    }),
    force_current_time: (state, action) => ({
        ...state,
        current_time: action.current_time,
        forced_time:  action.current_time,
    }),
    set_selection: (state, action) => {
        let new_state = {
            ...state,
            selection_start_chunk_index: action.start_chunk_index,
            selection_end_chunk_index:   action.end_chunk_index,
            selection_start_icco: action.start_icco, // icco is in-chunk character offset
            selection_end_icco:   action.  end_icco,
            is_playing: false,
        };
        return new_state;
    },
    send_subs: (state, action) => ({
        ...state,
        selection_start_chunk_index: null,
        selection_start_icco:        null,
        selection_end_chunk_index:   null,
        selection_end_icco:          null,
        sending_subs: true,
        sent_word_rectangles: [
            ...state.sent_word_rectangles,
            ...get_word_rectangles(
                action.words,
                state.subs,
                action.subs_chunks/* || get_subs_chunks({track_detail: state}) */,
            ),
        ],
    }),
    accepted_submission: (state, action) => ({
        ...state,
        sending_subs: false,
        sent_word_rectangles: [],
        subs: [
            ...state.subs.slice(
                0,
                get_word_index(action.replaced_words[0], state.subs),
            ),
            /*
            ...calculate_word_positions(
                [
                    ...action.accepted_words,
                    ...state.subs.slice(
                        get_word_index(
                            // eslint standard/computed-property-even-spacing: [0]
                            action.replaced_words[
                                action.replaced_words.length - 1
                            ],
                            state.subs,
                        ) + 1,
                    ),
                ],
                // eslint func-call-spacing: [0]
                get_word_index   (action.replaced_words[0], state.subs),
                get_word_position(action.replaced_words[0], state.subs),
            ),
            */
            ...action.accepted_words,
            ...state.subs.slice(
                get_word_index(
                    // eslint standard/computed-property-even-spacing: [0]
                    action.replaced_words[ action.replaced_words.length - 1 ],
                    state.subs,
                ) + 1,
            ),
        ],
    }),
    failed_submission: (state, action) => ({
        ...state,
        sending_subs: false,
        sent_word_rectangles: [],
        failed_word_rectangles: [
            ...state.failed_word_rectangles,
            ...get_word_rectangles(
                action.words,
                state.subs,
                action.subs_chunks/* || get_subs_chunks({track_detail: state}) */,
            ),
        ],
    }),
    submission_error: (state, action) => ({
        ...state,
        sending_subs: false,
        sent_word_rectangles: [],
    }),
};

const initial_state = {
    subs: [],
    frame_cnt: 0,
    current_time: 0,
    forced_time: null,
    is_playing: false,
    selection_start_chunk_index: null,
    selection_start_icco: null,
    selection_end_chunk_index: null,
    selection_end_icco: null,
    sent_word_rectangles: [],
    failed_word_rectangles: [],
};

const fetch_subs = (store, stem) => {
    fetch_jsonp(
        API_BASE + '/static/subs/' + stem + '.sub.js', {
            timeout:               30000,
            jsonpCallback:         'jsonp_subtitles',
            jsonpCallbackFunction: 'jsonp_subtitles',
        }
    )
    .then((res) => res.json())
    .then((sub_data) => {
//        calculate_word_positions(sub_data.data);
        store.dispatch({
            type: 'set_subs',
            subs: sub_data.data,
        });
    });
};
let previous_state;
let previous_marked_word;
const set_audio_controls = (store) => {
    previous_state = store.getState();
    previous_state.track_detail = initial_state;
    store.subscribe(() => {
        const current_state = store.getState();
        const to_dispatch = [];
        if (     current_state.track_detail.forced_time
              && current_state.track_detail.forced_time
            !== previous_state.track_detail.forced_time
        ) {
            audio().currentTime = current_state.track_detail.forced_time;
        }
        if (current_state.track_detail.is_playing
            && !previous_state.track_detail.is_playing
        ) {
            audio().play();
            to_dispatch.push({
                type: 'clear_forced_time',
            });
        }
        if (!current_state.track_detail.is_playing
            && previous_state.track_detail.is_playing
        ) {
            audio().pause();
        }
        const marked_word = get_marked_word(current_state);
        if (marked_word
            && (
                !previous_marked_word
                || marked_word.timestamp !== previous_marked_word.timestamp
            )
        ) {
            to_dispatch.push({
                type: 'force_current_time',
                current_time: marked_word.timestamp,
            });
        }
        previous_state = current_state;
        previous_marked_word = marked_word;
        to_dispatch.forEach((action) => store.dispatch(action));
    });
};
const apply_hash = (store, hash) => {
    const bare_hash = hash.replace(/^#/, '');
    let query = query_string.parse(bare_hash);
    const requested_time = query.ts;
    if (requested_time) {
        store.dispatch({
            type: 'force_current_time',
            current_time: requested_time,
        });
    }
};
export const init = (store, stem, hash) => {
    fetch_subs(store, stem);
    set_audio_controls(store);
    apply_hash(store, hash);
};

/*
function calculate_word_positions(subs, start_index = 0, start_position = 0) {
    var pos = start_position;
    subs.forEach((word, i) => {
        word.index = start_index + i;
        word.position = pos;
        pos += word.occurrence.length + 1;
    });
    return subs;
}
*/

function get_word_chunk_position(word_index, subs_chunks) {
    const chunk_index = subs_chunks.chunk_index_by_word_index[word_index];
    const chunk = subs_chunks[chunk_index];
    const icco = subs_chunks.icco_by_word_index[word_index];
    const chunk_text_nodes = get_chunk_text_nodes();
    const text_node = chunk_text_nodes ? chunk_text_nodes[chunk_index] : null;
    return {
        chunk,
        icco,
        text_node,
    };
}

/*
function get_word_position(word, subs) {
    if (!word || !subs || subs.length === 0) {
        return null;
    }
    let i = word.index || 0;
    while (subs[i].timestamp < word.timestamp) {
        i++;
    }
    while (subs[i].timestamp > word.timestamp) {
        i--;
    }
    if (    subs[i].timestamp  === word.timestamp
        &&  subs[i].occurrence === word.occurrence
    ) {
        return subs[i].position;
    }
    else {
        return null;
    }
}
*/

const range = document.createRange();
export const get_word_rectangles = (words, subs, subs_chunks) => {
    let rects = [];
    if (words && words.length > 0) {
        const last_word = words[words.length - 1];
        const { text_node: start_word_el, icco: start_word_icco } = get_word_chunk_position(words[0] .i, subs_chunks);
        const { text_node:   end_word_el, icco:   end_word_icco } = get_word_chunk_position(last_word.i, subs_chunks);
        if (start_word_el && end_word_el) {
            range.setStart(start_word_el, start_word_icco);
            range.setEnd  (  end_word_el,   end_word_icco);
            rects = range.getClientRects();
        }
    }
    return rects;
};

const get_subs         = (state) => state.track_detail.subs;
const get_current_time = (state) => state.track_detail.current_time;
const get_selection_boundaries
                       = (state) => ({
                            start: {
                                chunk_index: state.track_detail.selection_start_chunk_index,
                                icco:        state.track_detail.selection_start_icco,
                            },
                            end: {
                                chunk_index: state.track_detail.selection_end_chunk_index,
                                icco:        state.track_detail.selection_end_icco,
                            },
                       });
export const get_subs_chunks = createSelector(
    [get_subs],
    (subs) => {
        const chunks = [];
        const wbuf = [];
        const chunk_index_by_word_index  = [];
        const icco_by_word_index = [];
        let chunk_index = -1;
        let char_offset = 0;
        let word_offset = 0;
        let is_now_humanic = null;
        let wbuf_str_length = 0;
        const flush = function () {
            const str = wbuf.concat('').join(' ');
            chunks.push({
                is_humanic: is_now_humanic,
                str,
                char_offset,
                word_offset,
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
            icco_by_word_index,
        };
    },
);
export const get_word_timestamps = createSelector(
    [get_subs],
    (subs) => subs.map((sub, i) => sub.timestamp).concat(Infinity),
);
const NULL_CURRENT_WORD = {
    occurrence: '',
    rects: [],
    start_offset: null,
    end_offset: null,
};
let current_word;
export const get_current_word = createSelector(
    [get_word_timestamps, get_current_time, get_subs, get_subs_chunks],
    (word_timestamps, current_time, subs, subs_chunks) => {
        if (subs.length === 0) {
            return NULL_CURRENT_WORD;
        }
        let i = current_word ? current_word.i : 0;
        while (word_timestamps[i + 1] <= current_time) i++;
        while (word_timestamps[i    ] >  current_time) i--;
        if (i < 0) i = 0;
        const sub = subs[i];
        let start_offset = null;
        let end_offset   = null;
        let rects = [];
        if (sub && subs_chunks) {
            const { text_node, icco } = get_word_chunk_position(i, subs_chunks);
            if (text_node) {
                start_offset = icco;
                end_offset   = icco + sub.occurrence.length;
                if (text_node.length < end_offset) {
                    return NULL_CURRENT_WORD;
                }
                range.setStart(text_node, start_offset);
                range.setEnd  (text_node,  end_offset);
                rects = range.getClientRects();
            }
        }
        current_word = {
            i,
            rects,
            ...sub,
        };
        return current_word;
    },
);
// TODO: use the index Luke (make selector index_by_timestamp that uses subs)
function get_word_index(word, subs) {
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
    if (
           !subs
        || !subs_chunks
        || !subs_chunks.chunk_index_by_word_index
        || !subs_chunks.icco_by_word_index
    ) {
        return null;
    }

    if (i === void (0)) {
        i = current_word ? current_word.i : 0;
    }
    const chunk_index_by_word_index = subs_chunks.chunk_index_by_word_index;
    const char_offset_by_word_index = subs_chunks.icco_by_word_index;

    while (chunk_index_by_word_index[i] !== void (0)
        && chunk_index_by_word_index[i] > 0
        && chunk_index_by_word_index[i] > word_position.chunk_index
    ) i--;
    let stop = chunk_index_by_word_index.length - 1;
    while (chunk_index_by_word_index[i] !== void (0)
        && chunk_index_by_word_index[i] < stop
        && chunk_index_by_word_index[i] < word_position.chunk_index
    ) i++;

    while (char_offset_by_word_index[i] !== void (0)
        && char_offset_by_word_index[i] > 0
        && char_offset_by_word_index[i] > word_position.icco
    ) i--;
    stop = char_offset_by_word_index.length - 1;
    while (char_offset_by_word_index[i] !== void (0)
        && char_offset_by_word_index[i] < stop
        && char_offset_by_word_index[i] + subs[i].occurrence.length - 1 < word_position.icco
    ) i++;

    if (   chunk_index_by_word_index[i] === word_position.chunk_index
        && char_offset_by_word_index[i] <= word_position.icco
        && char_offset_by_word_index[i] + subs[i].occurrence.length - 1 >= word_position.icco
    ) {
        return i;
    }
    else {
        return null;
    }
};
// TODO: simplify
export const get_selected_word_indices = createSelector(
    [get_subs, get_subs_chunks, get_selection_boundaries],
    (subs, subs_chunks, selection_boundaries) => {
        const start = selection_boundaries.start;
        const end   = selection_boundaries.end;
        if (   start.chunk_index === null
            ||   end.chunk_index === null
            || start.chunk_index > end.chunk_index
            || start.icco === null
            ||   end.icco === null
            || (
                   start.chunk_index === end.chunk_index
                && start.chunk_index  >  end.chunk_index
            )
        ) {
            return null;
        }

        const end_index = get_word_index_by_position(end, subs, subs_chunks);
        if (end_index === null) {
            return null;
        }

        if (
               start.chunk_index === end.chunk_index
            && start.icco        === end.icco
        ) {
            return {
                only: end_index,
            };
        }

        const start_index = get_word_index_by_position(start, subs, subs_chunks, end_index);
        if (start_index === null) {
            return null;
        }

        return {
            start: start_index,
            end:   end_index,
        };
    },
);
export const get_selected_words = createSelector(
    [get_subs, get_selected_word_indices],
    (subs, selected_word_indices) => {
        if (    selected_word_indices === null
            || !selected_word_indices.start
            || !selected_word_indices.end
        ) {
            return [];
        }
        return subs.slice(
            selected_word_indices.start,
            selected_word_indices.end + 1,
        );
    },
);
export const get_selected_word_rectangles = createSelector(
    [get_selected_words, get_subs, get_subs_chunks],
    get_word_rectangles,

);
export const get_edit_window_timespan = createSelector(
    [get_subs, get_selected_words],
    (subs, selected_words) => {
        if (!selected_words || selected_words.length === 0) {
            return {
                start: null,
                end: null,
            };
        }
        const i = get_word_index(selected_words[selected_words.length - 1], subs);
        const pad_word = subs[i + 1] || subs[i];
        return {
            start: selected_words[0].timestamp,
            end:   pad_word.timestamp,
        };
    },
);
export const get_marked_word = createSelector(
    [get_subs, get_subs_chunks, get_selection_boundaries, get_selected_word_indices],
    (subs, subs_chunks, selection_boundaries, selected_word_indices) => {
        if (selected_word_indices && selected_word_indices.only) {
            const marked_word = subs[selected_word_indices.only];
            const { text_node, icco } = get_word_chunk_position(selected_word_indices.only, subs_chunks);
            const start_offset = icco;
            const end_offset   = icco + marked_word.occurrence.length;
            range.setStart(text_node, start_offset);
            range.setEnd  (text_node,  end_offset);
            const rect = range.getBoundingClientRect();
            return {
                ...marked_word,
                rect,
            };
        }
        else {
            return null;
        }
    },
);

const sel = document.getSelection();
export function set_selection() {
    let start_chunk = null;
    let   end_chunk = null;
    let start_chunk_index = null;
    let   end_chunk_index = null;
    let start_icco = null;
    let   end_icco = null;
    let start_global_offset = null;
    let   end_global_offset = null;
    if (sel.rangeCount > 0) {
        const start_range = sel.getRangeAt(0);
        const   end_range = sel.getRangeAt(sel.rangeCount - 1);
        if (start_range && end_range) {
            start_chunk = start_range.startContainer.parentElement;
              end_chunk =   end_range.  endContainer.parentElement;
            start_chunk_index = +start_chunk.dataset.chunk_index;
              end_chunk_index = +  end_chunk.dataset.chunk_index;
            start_icco = start_range.startOffset;
              end_icco =   end_range.endOffset  ;
            start_global_offset = +start_chunk.dataset.char_offset + start_icco;
              end_global_offset = +  end_chunk.dataset.char_offset +   end_icco;
        }
    }
    return {
        type: 'set_selection',
        start_chunk,
          end_chunk,
        start_chunk_index,
          end_chunk_index,
        start_icco,
          end_icco,
        start_global_offset,
          end_global_offset,
    };
};

export function playback_on() {
    return (dispatch, getState) => dispatch({
        type: 'playback_on',
        selected_words: get_selected_words(getState()),
    });
};
export function playback_off() {
    return {
        type: 'playback_off',
    };
};
export function set_audio_metadata() {
    return {
        type: 'set_audio_metadata',
    };
};
export function sync_current_time(loc, router) {
    const current_time = audio().currentTime;
    window.location.hash = '#ts=' + current_time;
    return {
        type: 'sync_current_time',
        current_time,
    };
};
export function force_current_frame(current_frame) {
    return force_current_time(frame_to_time(current_frame));
};
export function force_current_time(current_time) {
    return {
        type: 'force_current_time',
        current_time,
    };
};

export default function reducer(state = initial_state, action) {
    const handler = ACTION_HANDLERS[action.type];
    return handler ? handler(state, action) : state;
};
