import fetch_jsonp from 'fetch-jsonp';
import { createSelector } from 'reselect';
import { get_chunk_text_nodes } from './component.js';

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
        let rv = {
            ...state,
            is_playing: true,
        };
        let selected_words = get_selected_words({ track_detail:state });
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
        const start = action.start_offset;
        const end   = action.  end_offset;
        let new_state = {
            ...state,
            selection_start: start,
            selection_end:   end,
            is_playing: false,
        };
        return new_state;
    },
    send_subs: (state, action) => ({
        ...state,
        selection_start: null,
        selection_end: null,
        sending_subs: true,
        sent_word_rectangles: [
            ...state.sent_word_rectangles,
            ...get_word_rectangles(
                action.words,
                state.subs,
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
                    action.replaced_words[
                        action.replaced_words.length - 1
                    ],
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
    selection_start: null,
    selection_end:   null,
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
        if (     current_state.track_detail.forced_time
            !== previous_state.track_detail.forced_time
        ) {
            audio().currentTime = current_state.track_detail.forced_time;
        }
        if (current_state.track_detail.is_playing
            && !previous_state.track_detail.is_playing
        ) {
            audio().play();
        }
        if (!current_state.track_detail.is_playing
            && previous_state.track_detail.is_playing
        ) {
            audio().pause();
        }
        const marked_word = get_marked_word(current_state);
        const to_dispatch = [];
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
export const init = (store, stem) => {
    fetch_subs(store, stem);
    set_audio_controls(store);
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

function get_word_index(word, subs) {
    if (!word || !subs || subs.length === 0) {
        return null;
    }
    let i = word.index || 0;
    while (subs[i].timestamp > word.timestamp) {
        i--;
    }
    while (subs[i].timestamp < word.timestamp) {
        i++;
    }
    return i;
}

function get_word_chunk_position(word_index, subs_chunks) {
    const chunk_index = subs_chunks.chunk_index_by_word_index[word_index];
    const chunk = subs_chunks[chunk_index];
    const in_chunk_char_offset = subs_chunks.in_chunk_char_offset_by_word_index[word_index];
    const chunk_text_nodes = get_chunk_text_nodes();
    const text_node = chunk_text_nodes ? chunk_text_nodes[chunk_index] : null;
    return {
        chunk,
        in_chunk_char_offset,
        text_node,
    }
}

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

const range = document.createRange();
export const get_word_rectangles = (words, subs, subs_chunks) => {
    let start_offset = null;
    let end_offset   = null;
    let rects = [];
    if (words && words.length > 0) {
        start_offset = get_word_position(words[0], subs);
        if (start_offset === null) {
            return [];
        }
        const last_word = words[words.length - 1];
        end_offset = get_word_position(last_word, subs) + last_word.occurrence.length;
        if (end_offset === null) {
            return [];
        }
        const { text_node: start_word_el, in_chunk_char_offset: start_word_in_chunk_char_offset } = get_word_chunk_position(words[0] .i, subs_chunks);
        const { text_node:   end_word_el, in_chunk_char_offset:   end_word_in_chunk_char_offset } = get_word_chunk_position(last_word.i, subs_chunks);
        if (start_word_el && end_word_el) {
            range.setStart(start_word_el, start_word_in_chunk_index);
            range.setEnd  (  end_word_el,   end_word_in_chunk_index);
            rects = range.getClientRects();
        }
    }
    return rects;
};

const get_subs         = (state) => state.track_detail.subs;
const get_current_time = (state) => state.track_detail.current_time;
const get_selection_boundaries
                       = (state) => ({
                           start: state.track_detail.selection_start,
                           end:   state.track_detail.selection_end,
                       });
export const get_subs_chunks = createSelector(
    [get_subs],
    (subs) => {
        const chunks = [];
        const wbuf = [];
        const chunk_index_by_word_index  = [];
        const in_chunk_char_offset_by_word_index = []
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
            in_chunk_char_offset_by_word_index[word_index] = wbuf_str_length;
            wbuf.push(sub.occurrence);
            wbuf_str_length += sub.occurrence.length + 1;
        });
        flush();
        chunks.shift();
        return {
            chunks,
            chunk_index_by_word_index,
            in_chunk_char_offset_by_word_index,
        };
    },
);
export const get_word_timestamps = createSelector(
    [get_subs],
    (subs) => subs.map((sub, i) => sub.timestamp).concat(Infinity),
);
let current_word;
export const get_current_word = createSelector(
    [get_word_timestamps, get_current_time, get_subs, get_subs_chunks],
    (word_timestamps, current_time, subs, subs_chunks) => {
        if (subs.length === 0) {
            return {
                occurrence: '',
                rects: [],
                start_offset: null,
                end_offset: null,
            };
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
            const { text_node, in_chunk_char_offset } = get_word_chunk_position(i, subs_chunks);
            if (text_node) {
                start_offset = in_chunk_char_offset;
                end_offset   = in_chunk_char_offset + sub.occurrence.length;
                range.setStart(text_node, start_offset);
                range.setEnd  (text_node,  end_offset);
                rects = range.getClientRects();
            }
        }
        current_word = {
            i,
            start_offset: sub ? sub.position : null,
            end_offset: sub ? sub.position + sub.occurrence.length : null,
            rects,
            ...sub,
        };
        return current_word;
    },
);
export const get_selected_word_indices = createSelector(
    [get_subs, get_selection_boundaries],
    (subs, selection_boundaries) => {
        const l = subs.length - 1;
        const start_pos = selection_boundaries.start;
        const end_pos   = selection_boundaries.end;
        if (start_pos === null || end_pos === null || end_pos < start_pos) {
            return null;
        }
        var i = current_word ? current_word.i : 0;
        while (subs[i] && i > 0 && subs[i].position > end_pos) i--;
        while (subs[i] && i < l && subs[i].position + subs[i].occurrence.length + 1 < end_pos) i++;
        const end_index = i;
        if (start_pos === end_pos) {
            return {
                only: end_index,
            };
        }
        while (subs[i] && i < l && subs[i].position + subs[i].occurrence.length < start_pos) i++;
        while (subs[i] && i > 0 && subs[i].position - 1 > start_pos) i--;
        const start_index = i;
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
    [get_selected_words, get_subs],
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
        const i = selected_words[selected_words.length - 1].index;
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
            const { text_node, in_chunk_char_offset } = get_word_chunk_position(selected_word_indices.only, subs_chunks);
            const start_offset = in_chunk_char_offset;
            const end_offset   = in_chunk_char_offset + marked_word.occurrence.length;
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
    let start_offset = null;
    let   end_offset = null;
    if (sel.rangeCount > 0) {
        const start_range = sel.getRangeAt(0);
        const   end_range = sel.getRangeAt(sel.rangeCount-1);
        if (start_range && end_range) {
            const start_cont = start_range.startContainer.parentElement;
            const   end_cont =   end_range.  endContainer.parentElement;
            start_offset = +start_cont.dataset.char_offset + start_range.startOffset;
            end_offset   = +  end_cont.dataset.char_offset +   end_range.endOffset  ;
        }
    }
    return {
        type: 'set_selection',
        start_offset,
        end_offset,
        /* TODO
        start_chunk_index,
        in_start_chunk_offset,
        end_chunk_index,
        in_end_chunk_offset,
        */
    };
};

export function playback_on() {
    return {
        type: 'playback_on',
    };
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
export function sync_current_time() {
    return {
        type: 'sync_current_time',
        current_time: audio().currentTime,
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
