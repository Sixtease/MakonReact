/* global API_BASE */

import axios from 'axios';

const endpoint = API_BASE + '/saveword/';

export function save_word(form_values) {
    return (dispatch) => {
        dispatch({
            type: 'save_word',
            ...form_values,
        });
        axios.request({
            url: endpoint,
            method: 'POST',
            params: {
                ...form_values,
            },
        }).then(res => {
            if (res.data && res.data.success) {
                dispatch({
                    type: 'accepted_save_word',
                    ...res.data,
                });
            }
            else {
                dispatch({
                    type: 'failed_save_word',
                    ...form_values,
                });
            }
        })
            .catch(() => {
                dispatch({
                    type: 'save_word_error',
                    ...form_values,
                });
            });
    };
};
