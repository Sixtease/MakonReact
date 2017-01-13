//import { injectReducer } from '../../../store/reducers';
import { connect } from 'react-redux';
import TrackList from './component';
import {
    reducer,
    set_current_section,
    make_dir_fixed,
    make_dir_static,
} from './module';

const map_dispatch_to_props = {
    set_current_section,
    make_dir_fixed,
    make_dir_static,
};

const map_state_to_props = (state) => ({
    is_dir_fixed:    state.is_dir_fixed,
    current_section: state.current_section,
});

export default connect(map_state_to_props, map_dispatch_to_props)(TrackList);
