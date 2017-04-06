import fetch_jsonp from 'fetch-jsonp';
import { createSelector } from 'reselect';

export const FRAME_RATE = 44100;
export const frame_to_time = (frame) => frame / FRAME_RATE;
export const time_to_frame = (time)  => time  * FRAME_RATE;

const ACTION_HANDLERS = {
    set_subs: (state, action) => ({
        ...state,
        subs: action.subs,
    }),
    toggle_play: (state, action) => {
        const should_play = !state.is_playing;
        if (should_play) {
            action.audio.play();
        }
        else {
            action.audio.pause();
        }
        return {
            ...state,
            is_playing: !state.is_playing,
        };
    },
    set_audio_metadata: (state, action) => {
        return {
            ...state,
            frame_cnt: time_to_frame(action.audio.duration),
        };
    },
    sync_current_frame: (state, action) => {
        return {
            ...state,
            current_frame: action.current_frame,
            subs_txt:      action.subs_txt,
        };
    },
    force_current_frame: (state, action) => {
        return {
            ...state,
            current_frame: action.current_frame,
        };
    },
};

const initial_state = {
    subs: [],
    frame_cnt: 0,
    current_frame: 0,
    is_playing: false,
};

export const init = (store, stem) => {
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

function calculate_word_positions(subs) {
    var pos = 0;
    subs.forEach((word) => {
        word.position = pos;
        pos += word.occurrence.length + 1;
    });
}

const get_subs         = (state) => state.track_detail.subs;
const get_current_time = (state) => frame_to_time(state.track_detail.current_frame);
const get_subs_txt     = (state) => state.track_detail.subs_txt;
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
//const sel   = document.getSelection();
export const get_current_word = createSelector(
    [get_word_timestamps, get_current_time, get_subs, get_subs_txt],
    (word_timestamps, current_time, subs, subs_txt) => {
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
        const sub = subs[i];
        let start_offset = null;
        let end_offset   = null;
        let rects = [];
        if (sub && subs_txt && current_word) {
            start_offset = sub.position;
            end_offset   = sub.position+sub.occurrence.length;
            range.setStart(subs_txt, current_word.start_offset);
            range.setEnd  (subs_txt, current_word.end_offset  );
            //sel.removeAllRanges();
            //sel.addRange(range);
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

export function toggle_play(audio) {
    return {
        type: 'toggle_play',
        audio,
    };
};
export function set_audio_metadata(audio) {
    return {
        type: 'set_audio_metadata',
        audio,
    };
};
export function sync_current_frame(audio, subs_txt) {
    return {
        type: 'sync_current_frame',
        current_frame: audio.currentTime * 44100,
        audio,
        subs_txt,
    };
};
export function force_current_frame(current_frame, audio) {
    audio.currentTime = frame_to_time(current_frame);
    return {
        type: 'force_current_frame',
        current_frame,
        audio,
    };
};

export default function reducer (state = initial_state, action) {
    const handler = ACTION_HANDLERS[action.type];
    return handler ? handler(state, action) : state;
};
