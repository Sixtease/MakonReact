import fetch_jsonp from 'fetch-jsonp';

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
            frame_cnt: action.audio.duration * 44100,
        };
    },
    sync_current_frame: (state, action) => {
        return {
            ...state,
            current_frame: action.current_frame,
        };
    },
    force_current_frame: (state, action) => {
        action.audio.currentTime = action.current_frame / 44100;
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
            jsonpCallback:         'jsonp_subtitles',
            jsonpCallbackFunction: 'jsonp_subtitles',
        }
    )
    .then((res) => res.json())
    .then((sub_data) => {
        store.dispatch({
            type: 'set_subs',
            subs: sub_data.data,
        });
    });
};

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
export function sync_current_frame(audio) {
    return {
        type: 'sync_current_frame',
        current_frame: audio.currentTime * 44100,
        audio,
    };
};
export function force_current_frame(current_frame, audio) {
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
