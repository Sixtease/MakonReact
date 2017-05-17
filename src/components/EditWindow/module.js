import axios from 'axios';
import audio from 'store/audio.js';
import {
    get_edit_window_timespan,
    get_selected_words,
} from 'routes/TrackDetail/module.js';

const ACTION_HANDLERS = {
    send_subs: (state, action) => {
        console.log('send subtitles',action);
        return state;
    },
};

export function playback_on() {
    return {
        type: 'playback_on',
    };
};

export function playback_off(audio) {
    return {
        type: 'playback_off',
    };
};

export function send_subs(form_values, dispatch, props) {
    return (dispatch,getState) => {
        dispatch({
            type: 'send_subs',
        });
        const state = getState();
        const timespan = get_edit_window_timespan(state);
        const selw = get_selected_words(state);
        const endpoint = API_BASE + '/subsubmit/';
        axios.post(endpoint, {
            filestem: props.stem,
            start: timespan.start,
            end:   timespan.end,
            trans: form_values.edited_subtitles,
            author: state.form.username.values.username,
            session: localStorage.getItem('session'),
        }).then(console.log);
    };
};

const initial_state = {
};

export default function reducer (state = initial_state, action) {
    const handler = ACTION_HANDLERS[action.type];
    return handler ? handler(state, action) : state;
};
