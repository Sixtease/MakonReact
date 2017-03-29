import { connect } from 'react-redux';
import {
    toggle_play, set_audio_metadata, sync_current_frame, force_current_frame, get_subs_str,
} from './module.js';

import TrackDetail from './component.js';

const map_dispatch_to_props = {
    toggle_play,
    set_audio_metadata,
    sync_current_frame,
    force_current_frame,
};

const map_state_to_props = (state) => ({
    subs:           state.track_detail.subs,
    is_playing:     state.track_detail.is_playing,
    frame_cnt:      state.track_detail.frame_cnt,
    current_frame:  state.track_detail.current_frame,
    subs_str:       get_subs_str(state),
});

let track_detail = connect(
    map_state_to_props, map_dispatch_to_props,
)(TrackDetail);
export default track_detail;
