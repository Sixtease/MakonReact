import {get_selected_words} from 'routes/TrackDetail/module.js';
export const autostop_timeouts = [];
const SECOND = 1000;
let stop_time = null;
export const autostop = store => next => action => {
    let result = next(action);
    let next_state = store.getState();
    ;;; console.log('next state',next_state);
    if (action.type === 'set_selection') {
        let selw = get_selected_words(next_state);
        if (selw && selw.length > 0) {
            stop_time = selw[selw.length-1].timestamp;
        }
        else {
            stop_time = null;
        }
        ;;; console.log('mdw set stop time to', stop_time);
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
