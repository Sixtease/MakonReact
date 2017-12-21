/* eslint no-duplicate-imports: 1 */
import reducer from './TrackDetail';
import {
    FRAME_RATE,
    frame_to_time,
    time_to_frame,
    init,
    set_selection,
    playback_on,
    playback_off,
    set_audio_metadata,
    sync_current_time,
    force_current_frame,
    force_current_time,
    lock_for_load,
    unlock_after_load,
} from './TrackDetail';

import {
    get_subs_chunks,
    get_word_rectangles,
    get_word_timestamps,
    get_current_word,
    get_next_word,
    get_selected_word_indices,
    get_selected_words,
    get_selected_word_rectangles,
    get_edit_window_timespan,
    get_marked_word,
} from './Selectors';

export default reducer;
export {
    FRAME_RATE,
    frame_to_time,
    time_to_frame,
    init,
    get_word_rectangles,
    get_subs_chunks,
    get_word_timestamps,
    get_current_word,
    get_next_word,
    get_selected_word_indices,
    get_selected_words,
    get_selected_word_rectangles,
    get_edit_window_timespan,
    get_marked_word,
    set_selection,
    playback_on,
    playback_off,
    set_audio_metadata,
    sync_current_time,
    force_current_frame,
    force_current_time,
    lock_for_load,
    unlock_after_load,
};
