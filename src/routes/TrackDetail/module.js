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
        return {
            ...state,
            is_playing: true,
        };
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
    set_selection: (state, action) => ({
        ...state,
        selection_start: action.start_offset,
        selection_end:   action.end_offset,
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
const set_audio_controls = (store) => {
    previous_state = store.getState();
    previous_state.track_detail = initial_state;
    store.subscribe(() => {
        let current_state = store.getState();
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
        if (    current_state.track_detail.forced_time
            != previous_state.track_detail.forced_time
        ) {
            audio().currentTime = current_state.track_detail.forced_time;
        }
        previous_state = current_state;
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
const range = document.createRange();
export const get_current_word = createSelector(
    [get_word_timestamps, get_current_time, get_subs],
    (word_timestamps, current_time, subs) => {
        let subs_txt = get_subs_txt();
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
            range.setStart(subs_txt, current_word.start_offset);
            range.setEnd  (subs_txt, current_word.end_offset  );
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
export const get_selected_words = createSelector(
    [get_subs, get_selection_boundaries],
    (subs, selection_boundaries) => {
        const l = subs.length - 1;
        const start_pos = selection_boundaries.start;
        const end_pos   = selection_boundaries.end;
        if (start_pos === null || end_pos === null || end_pos <= start_pos) {
            return [];
        }
        var i = current_word ? current_word.i : 0;
        while (subs[i] && i>0 && subs[i].position > end_pos) i--;
        while (subs[i] && i<l && subs[i].position + subs[i].occurrence.length + 1 < end_pos) i++;
        const end_index = i;
        while (subs[i] && i<l && subs[i].position + subs[i].occurrence.length < start_pos) i++;
        while (subs[i] && i>0 && subs[i].position - 1 > start_pos) i--;
        const start_index = i;
        return subs.slice(start_index, end_index+1);
    },
);

const sel = document.getSelection();
export function set_selection() {
    let start_offset = null, end_offset = null;
    if (sel.rangeCount > 0) {
        const sel_range = sel.getRangeAt(0);
        if (sel_range) {
            start_offset = sel_range.startOffset;
            end_offset   = sel_range.endOffset;
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
