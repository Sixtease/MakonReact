import audio from 'store/audio.js';

const ACTION_HANDLERS = {
    edit_window_playback_on: (state, action) => ({
        ...state, is_playing: true,
    }),
    edit_window_playback_off: (state, action) => ({
        ...state, is_playing: false,
    }),
};

export function playback_on() {
    return {
        type: 'edit_window_playback_on',
    }
}

export function playback_off(audio) {
    return {
        type: 'edit_window_playback_off',
    }
}

const initial_state = {
    is_playing: false,
};

export default function reducer (state = initial_state, action) {
    const handler = ACTION_HANDLERS[action.type];
    return handler ? handler(state, action) : state;
};
