import axios from 'axios';
import {
    get_edit_window_timespan,
    get_selected_words,
    get_subs_chunks,
} from 'routes/TrackDetail/module';

const ACTION_HANDLERS = {
};

const endpoint = API_BASE + '/subsubmit/';

export function send_subs(form_values, dispatch, props) {
    return (dispatch, getState) => {
        const state = getState();
        const selw = get_selected_words(state);
        const subs_chunks = get_subs_chunks(state);
        dispatch({
            type: 'send_subs',
            words: selw,
            subs_chunks,
        });
        const timespan = get_edit_window_timespan(state);
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
        }).then(res => {
            if (res.data && res.data.success) {
                dispatch({
                    type: 'accepted_submission',
                    replaced_words: selw,
                    accepted_words: res.data.data,
                });
            }
            else {
                dispatch({
                    type: 'failed_submission',
                    words: selw,
                    subs_chunks,
                });
            }
        })
        .catch(() => {
            dispatch({
                type: 'submission_error',
                words: selw,
            });
        });
    };
};

const initial_state = {
};

export default function reducer(state = initial_state, action) {
    const handler = ACTION_HANDLERS[action.type];
    return handler ? handler(state, action) : state;
};
