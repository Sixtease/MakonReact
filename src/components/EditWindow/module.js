import audio from 'store/audio.js';

const ACTION_HANDLERS = {
};

export function playback_on() {
    return {
        type: 'playback_on',
    };
}

export function playback_off(audio) {
    return {
        type: 'playback_off',
    };
}

const initial_state = {
};

export default function reducer (state = initial_state, action) {
    const handler = ACTION_HANDLERS[action.type];
    return handler ? handler(state, action) : state;
};
