import { get_next_word } from 'routes/TrackDetail/module/selectors';
import { sync_current_time } from 'routes/TrackDetail/module/action-creators';
import fetch_jsonp from 'fetch-jsonp';

const SECOND = 1000;
export const autostop = store => next => action => {
    const result = next(action);
    const next_state = store.getState();
    if (action.type === 'sync_current_time') {
        const next_word = get_next_word(next_state);
        if (next_state.track_detail.is_playing && !next_word.is_null) {
            const t = next_word.timestamp - action.current_time;
            if (t < 0.25) {
                setTimeout(() => store.dispatch(sync_current_time()), t * SECOND);
            }
        }
    }
    return result;
};

export const init = store => next => action => {
    const result = next(action);
    if (action.type === 'commence_session_init') {
        fetch_jsonp( API_BASE + '/init', {
            timeout:               300000,
            jsonpCallback:         'jsonp_init',
            jsonpCallbackFunction: 'jsonp_init',
        })
            .then(res => res.json())
            .then(init_data => {
                if (init_data && init_data.subversions) {
                    store.dispatch({
                        type: 'set_subversions',
                        subversions: init_data.subversions,
                    });
                }
            });
    }
    return result;
};
