import audio from './audio';
import { get_next_word, get_edit_window_timespan, get_marked_word } from '../routes/TrackDetail/module/selectors';
import { reflect_time_in_hash } from '../routes/TrackDetail/module/util';
import { sync_current_time } from '../routes/TrackDetail/module/action-creators';

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

export const sync_audio = store => next => action => {
  const previous_state = store.getState();
  const result = next(action);
  const current_state = store.getState();
  const to_dispatch = [];
  if (
    current_state.track_detail.forced_time &&
    current_state.track_detail.forced_time !== previous_state.track_detail.forced_time
  ) {
    audio().set_time(current_state.track_detail.forced_time);
  }
  if (current_state.track_detail.is_playing && !previous_state.track_detail.is_playing && !audio().is_playing) {
    const timespan = get_edit_window_timespan(current_state);
    if (timespan.start === null || timespan.end === null) {
      audio().play();
    } else {
      audio().play_window(timespan.start, timespan.end, {
        onended: () =>
          store.dispatch({
            type: 'playback_off',
          }),
      });
    }
    to_dispatch.push({
      type: 'clear_forced_time',
    });
  }
  if (!current_state.track_detail.is_playing && previous_state.track_detail.is_playing) {
    audio().pause();
  }

  const previous_marked_word = get_marked_word(previous_state);
  const marked_word = get_marked_word(current_state);
  if (marked_word && (!previous_marked_word || marked_word.timestamp !== previous_marked_word.timestamp)) {
    to_dispatch.push({
      type: 'force_current_time',
      current_time: marked_word.timestamp,
    });
    reflect_time_in_hash(marked_word.timestamp);
  }
  to_dispatch.forEach(action => store.dispatch(action));
  return result;
};
