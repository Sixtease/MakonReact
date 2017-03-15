import { connect } from 'react-redux';
import {  } from './module.js';

import TrackDetail from './component.js';

const map_dispatch_to_props = {
};

const map_state_to_props = (state) => ({
    subs: state.track_detail.subs,
});

export default connect(map_state_to_props, map_dispatch_to_props)(TrackDetail);
