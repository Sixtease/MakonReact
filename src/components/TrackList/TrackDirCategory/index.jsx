import { connect } from 'react-redux';
import component from './component';
import { toggle_visible } from './module';
import './style.scss';

const map_dispatch_to_props = {
  toggle_visible
};

const map_state_to_props = state => ({
  visible: state.track_dir,
  current_section: (state.track_list || {}).current_section
});

export default connect(
  map_state_to_props,
  map_dispatch_to_props
)(component);
