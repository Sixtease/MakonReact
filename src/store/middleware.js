import {get_edit_window_timespan} from 'routes/TrackDetail/module.js';
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
            }, remaining*SECOND));
        }
    }
    return result;
}
