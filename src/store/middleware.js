import {
    get_next_word,
} from 'routes/TrackDetail/module';
import {
    sync_current_time,
} from 'routes/TrackDetail/module/TrackDetail';

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
