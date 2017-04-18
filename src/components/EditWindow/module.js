const ACTION_HANDLERS = {
    edit_window_playback_on: (state, action) => ({
        ...state, is_playing: true,
    }),
    edit_window_playback_off: (state, action) => ({
        ...state, is_playing: false,
    }),
};

export function playback_on(audio) {
    audio.play();
    return {
        type: 'edit_window_playback_on',
        audio,
    }
}

export function playback_off(audio) {
    audio.pause();
    return {
        type: 'edit_window_playback_off',
        audio,
    }
}

const initial_state = {
    is_playing: false,
};

export default function reducer (state = initial_state, action) {
    const handler = ACTION_HANDLERS[action.type];
    return handler ? handler(state, action) : state;
};
