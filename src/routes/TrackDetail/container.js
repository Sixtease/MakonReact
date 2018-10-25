import { connect } from 'react-redux';
import { withRouter } from 'react-router';
import {
    force_current_frame,
    playback_off,
    playback_on,
    set_audio_metadata,
    set_selection,
    sync_current_time,
} from './module/action-creators';
import {
    get_current_word,
    get_marked_word,
    get_selected_words,
    get_subs_chunks,
} from './module/selectors';
import {
    init,
    time_to_frame,
} from './module/util';

import component from './component';
import './style.scss';

const map_dispatch_to_props = {
    force_current_frame,
    playback_off,
    playback_on,
    set_audio_metadata,
    set_selection,
    sync_current_time,
};

const map_state_to_props = (state) => ({
    current_frame:  time_to_frame(state.track_detail.current_time),
    current_word:   get_current_word(state),
    failed_word_rectangles:
                    state.track_detail.failed_word_rectangles,
    frame_cnt:      state.track_detail.frame_cnt,
    is_playing:     state.track_detail.is_playing,
    marked_word:    get_marked_word(state),
    selected_words: get_selected_words(state),
    sending_subs:   state.track_detail.sending_subs,
    sent_word_rectangles:
                    state.track_detail.sent_word_rectangles,
    subs:           state.track_detail.subs,
    subs_chunks:    get_subs_chunks(state).chunks,
});

const get_container = stem => connect(
    map_state_to_props, map_dispatch_to_props,
    (s, d) => ({ ...s, ...d, stem, init }),
)(withRouter(component));
export default get_container;
