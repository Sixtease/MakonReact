import { API_BASE } from '../../../constants';

const endpoint = API_BASE + '/saveword/';

export function save_word(form_values) {
  return dispatch => {
    dispatch({
      type: 'save_word',
      ...form_values
    });
    fetch(`${endpoint}?${new URLSearchParams(form_values)}`, {
      method: 'POST'
    })
      .then(async res => {
        const data = await res.json();
        if (data && data.success) {
          dispatch({
            type: 'accepted_save_word',
            ...data
          });
        } else {
          dispatch({
            type: 'failed_save_word',
            ...form_values
          });
        }
      })
      .catch(() => {
        dispatch({
          type: 'save_word_error',
          ...form_values
        });
      });
  };
}
