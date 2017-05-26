import axios from 'axios';
import audio from 'store/audio.js';
import {
    get_edit_window_timespan,
    get_selected_words,
    get_selected_word_rectangles,
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
        const state = getState();
        const selw = get_selected_words(state);
        const selw_rect = get_selected_word_rectangles(state);
        dispatch({
            type: 'send_subs',
            words: selw,
            word_rectangles: selw_rect,
        });
        const timespan = get_edit_window_timespan(state);
        const endpoint = API_BASE + '/subsubmit/';
        axios.request({
            url: endpoint,
            method: 'POST',
            params: {
                filestem: props.stem,
                start: timespan.start,
                end:   timespan.end,
                trans: form_values.edited_subtitles,
                author: state.form.username.values.username,
                session: localStorage.getItem('session'),
            },
        }).then(res=>{
            if (res.success) {
                ;;; console.log('success',res);
            }
            else {
                dispatch({
                    type: 'failed_submission',
                    words: selw,
                });
            }
        });
    };
};

const initial_state = {
};

export default function reducer (state = initial_state, action) {
    const handler = ACTION_HANDLERS[action.type];
    return handler ? handler(state, action) : state;
};
