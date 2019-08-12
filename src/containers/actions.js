import fetch_jsonp from 'fetch-jsonp';
import { API_BASE } from '../constants';

export function commence_session_init() {
  return (dispatch, get_state) => {
    const init_data_promise = fetch_jsonp(API_BASE + '/init', {
      timeout: 300000,
      jsonpCallback: 'jsonp_init',
      jsonpCallbackFunction: 'jsonp_init',
    })
      .then(res => res.json())
      .then(init_data => {
        if (init_data && init_data.subversions) {
          dispatch({
            type: 'set_subversions',
            subversions: init_data.subversions,
          });
        }
        return init_data.subversions;
      });
    dispatch({
      type: 'set_init_data_promise',
      init_data_promise,
    });
  };
}
