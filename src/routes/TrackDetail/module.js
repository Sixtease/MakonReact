import fetch_jsonp from 'fetch-jsonp';
import { createSelector } from 'reselect';
import {get_subs_txt} from './component.js';

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
        let selected_words = get_selected_words({track_detail:state});
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
        sent_word_rectangles: action.word_rectangles,
    }),
    failed_submission: (state, action) => ({
        ...state,
        sending_subs: false,
        sent_word_rectangles: [],
        failed_word_rectangles: action.word_rectangles,
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
        calculate_word_positions(sub_data.data);
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
        if (    current_state.track_detail.forced_time
            != previous_state.track_detail.forced_time
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
            && previous_marked_word
            && marked_word.timestamp !== previous_marked_word.timestamp
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
    fetch_subs(store,stem);
    set_audio_controls(store);
};

function calculate_word_positions(subs) {
    var pos = 0;
    subs.forEach((word,i) => {
        word.index = i;
        word.position = pos;
        pos += word.occurrence.length + 1;
    });
}

function get_word_position(word, subs) {
    let i = word.position;
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
export const get_word_rectangles = (subs,words) => {
    let start_offset = null;
    let end_offset   = null;
    let rects = [];
    const subs_txt = get_subs_txt();
    if (words && words.length > 0 && subs_txt) {
        start_offset = get_word_position(words[0],subs);
        if (start_offset === null) {
            return [];
        }
        const last_word = words[words.length-1];
        end_offset = get_word_position(last_word,subs)+last_word.occurrence.length;
        if (end_offset === null) {
            return [];
        }
        range.setStart(subs_txt, start_offset);
        range.setEnd  (subs_txt,   end_offset);
        rects = range.getClientRects();
    }
    return rects;
}

const get_subs         = (state) => state.track_detail.subs;
const get_current_time = (state) => state.track_detail.current_time;
const get_selection_boundaries
                       = (state) => ({
    start: state.track_detail.selection_start,
    end:   state.track_detail.selection_end,
});
export const get_subs_str = createSelector(
    [get_subs],
    (subs) => subs.map((sub) => sub.occurrence).join(' '),
);
export const get_word_timestamps = createSelector(
    [get_subs],
    (subs) => subs.map((sub, i) => sub.timestamp).concat(Infinity),
);
let current_word;
export const get_current_word = createSelector(
    [get_word_timestamps, get_current_time, get_subs],
    (word_timestamps, current_time, subs) => {
        const subs_txt = get_subs_txt();
        if (subs.length === 0) {
            return {
                occurrence: '',
                rects: [],
                start_offset: null,
                end_offset: null,
            };
        }
        let i = current_word ? current_word.i : 0;
        while (word_timestamps[i+1] <= current_time) i++;
        while (word_timestamps[i  ] >  current_time) i--;
        if (i < 0) i = 0;
        const sub = subs[i];
        let start_offset = null;
        let end_offset   = null;
        let rects = [];
        if (sub && subs_txt && current_word) {
            start_offset = sub.position;
            end_offset   = sub.position+sub.occurrence.length;
            range.setStart(subs_txt, current_word.start_offset);//TODO: current_word.start_offset???
            range.setEnd  (subs_txt, current_word.  end_offset);
            rects = range.getClientRects();
        }
        return current_word = {
            i,
            start_offset: sub?sub.position:null,
            end_offset: sub?sub.position+sub.occurrence.length:null,
            rects,
            ...sub,
        };
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
        while (subs[i] && i>0 && subs[i].position > end_pos) i--;
        while (subs[i] && i<l && subs[i].position + subs[i].occurrence.length + 1 < end_pos) i++;
        const end_index = i;
        if (start_pos === end_pos) {
            return {
                only: end_index,
            };
        }
        while (subs[i] && i<l && subs[i].position + subs[i].occurrence.length < start_pos) i++;
        while (subs[i] && i>0 && subs[i].position - 1 > start_pos) i--;
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
    [get_subs,get_selected_words],
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
        const i = selected_words[selected_words.length-1].index;
        const pad_word = subs[i+1] || subs[i];
        return {
            start: selected_words[0].timestamp,
            end:   pad_word.timestamp,
        };
    },
);
export const get_marked_word = createSelector(
    [get_subs, get_selection_boundaries, get_selected_word_indices],
    (subs, selection_boundaries, selected_word_indices) => {
        if (selected_word_indices && selected_word_indices.only) {
            const marked_word = subs[selected_word_indices.only];
            const start_offset = marked_word.position;
            const end_offset = marked_word.position + marked_word.occurrence.length;
            const subs_txt = get_subs_txt();
            range.setStart(subs_txt, start_offset);
            range.setEnd  (subs_txt,   end_offset);
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
    let start_offset = null, end_offset = null;
    if (sel.rangeCount > 0) {
        const sel_range = sel.getRangeAt(0);
        if (sel_range) {
            start_offset = sel_range.startOffset;
            end_offset   = sel_range.  endOffset;
        }
    }
    return {
        type: 'set_selection',
        start_offset,
        end_offset,
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

export default function reducer (state = initial_state, action) {
    const handler = ACTION_HANDLERS[action.type];
    return handler ? handler(state, action) : state;
};
