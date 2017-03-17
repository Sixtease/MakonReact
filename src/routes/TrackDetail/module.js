import fetch_jsonp from 'fetch-jsonp';
const ACTION_HANDLERS = {
    set_subs: (state, action) => ({
        ...state,
        subs: action.subs,
    }),
    toggle_play: (state, action) => {
        var should_play = !state.is_playing;
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
};
const initial_state = {
    subs: [],
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
export default function reducer (state = initial_state, action) {
    const handler = ACTION_HANDLERS[action.type];
    return handler ? handler(state, action) : state;
};
