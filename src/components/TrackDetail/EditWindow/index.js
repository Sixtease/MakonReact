import { connect } from 'react-redux';
import component from './component';

// XXX for some reason playback_on is imported as undefined from index.js
//  import { playback_on, playback_off, get_selected_words } from 'routes/TrackDetail/module';
import { playback_on, playback_off } from 'routes/TrackDetail/module/TrackDetail.js';
import { get_selected_words } from 'routes/TrackDetail/module';

import { send_subs } from './module';
import './style.scss';

const map_dispatch_to_props = {
    playback_on,
    playback_off,
    onSubmit: send_subs,
};

const map_state_to_props = (state) => ({
    selected_words: get_selected_words(state),
    is_playing: state.track_detail.is_playing,
});

export default connect(map_state_to_props, map_dispatch_to_props)(component);
