import { connect } from 'react-redux';
import { toggle_play } from './module.js';

import TrackDetail from './component.js';

const map_dispatch_to_props = {
    toggle_play,
};

const map_state_to_props = (state) => ({
    subs: state.track_detail.subs,
});

let track_detail = connect(
    map_state_to_props, map_dispatch_to_props,
)(TrackDetail);
export default track_detail;
