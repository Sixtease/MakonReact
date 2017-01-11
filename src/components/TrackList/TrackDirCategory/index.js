import { injectReducer } from '../../../store/reducers';
import { connect } from 'react-redux';
import TrackDirCategoryView from './component';
import { toggle_visible, reducer } from './module';

const map_dispatch_to_props = {
    toggle_visible,
};

const map_state_to_props = (state) => ({
    visible: state.trackDir,
});

export function attach_reducer(store) {
    injectReducer(store, { key: 'trackDir', reducer });
};

export default connect(map_state_to_props, map_dispatch_to_props)(TrackDirCategoryView);
