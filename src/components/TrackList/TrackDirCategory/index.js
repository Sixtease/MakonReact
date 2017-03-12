import { injectReducer } from '../../../store/reducers';
import { connect } from 'react-redux';
import TrackDirCategoryView from './component';
import { toggle_visible, reducer } from './module';
import './style.scss';

const map_dispatch_to_props = {
    toggle_visible,
};

const map_state_to_props = (state) => {
    const state_props = {
        visible: state.track_dir,
        current_section: (state.track_list || {}).current_section,
    };
    return state_props;
};

export default connect(map_state_to_props, map_dispatch_to_props)(TrackDirCategoryView);
