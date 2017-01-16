//import { injectReducer } from '../../../store/reducers';
import { connect } from 'react-redux';
import TrackList from './component';
import {
    set_current_section,
    make_dir_fixed,
    make_dir_static,
    scrolled_to,
    set_offset,
    set_section_offset,
} from './module';

const map_dispatch_to_props = {
    set_current_section,
    scrolled_to,
    set_offset,
    set_section_offset,
};

const map_state_to_props = (state) => ({
    is_dir_fixed:    (state.track_list || {}).is_dir_fixed,
    current_section: (state.track_list || {}).current_section,
});

export default connect(map_state_to_props, map_dispatch_to_props)(TrackList);
