import {
    get_edit_window_timespan,
    get_next_word,
} from 'routes/TrackDetail/module';
import {
    sync_current_time,
} from 'routes/TrackDetail/module/TrackDetail';

export const autostop_timeouts = [];
const SECOND = 1000;
let stop_time = null;
export const autostop = store => next => action => {
    const result = next(action);
    const next_state = store.getState();
    if (action.type === 'set_selection') {
        const timespan = get_edit_window_timespan(next_state);
        stop_time = timespan.end;
    }
    if (action.type === 'sync_current_time') {
        let remaining = stop_time - action.current_time;
        if (remaining > 0 && remaining < 0.5) {
            while (autostop_timeouts.length > 0) {
                clearTimeout(autostop_timeouts.shift());
            }
            autostop_timeouts.push(setTimeout(() => {
                store.dispatch({
                    type: 'playback_off',
                });
                autostop_timeouts.shift();
            }, remaining * SECOND));
        }

        const next_word = get_next_word(next_state);
        if (!next_word.is_null) {
            const t = next_word.timestamp - action.current_time;
            setTimeout(() => store.dispatch(sync_current_time()), t);
        }
    }
    return result;
};
