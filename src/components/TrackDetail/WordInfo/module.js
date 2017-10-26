/* global API_BASE */

import axios from 'axios';

const ACTION_HANDLERS = {
};

const endpoint = API_BASE + '/saveword/';

export function send_subs(form_values, dispatch, props) {
    return (dispatch, getState) => {
        const state = getState();
        dispatch({
            type: 'save_word',
            timestamp: props.marked_word.timestamp,
            ...form_values,
        });
        axios.request({
            url: endpoint,
            method: 'POST',
            params: {
                filestem: props.stem,
                timestamp: props.marked_word.timestamp,
                ...form_values,
            },
        }).then(res => {
            if (res.data && res.data.success) {
                dispatch({
                    type: 'accepted_save_word',
                    timestamp: props.marked_word.timestamp,
                    ...form_values,
                });
            }
            else {
                dispatch({
                    type: 'failed_save_word',
                    timestamp: props.marked_word.timestamp,
                    ...form_values,
                });
            }
        })
        .catch(() => {
            dispatch({
                type: 'save_word_error',
                timestamp: props.marked_word.timestamp,
                ...form_values,
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
