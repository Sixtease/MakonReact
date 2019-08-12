import { connect } from 'react-redux';
import component from './component';

import {
  download_edit_window,
  playback_off,
  playback_on
} from '../../../routes/TrackDetail/module/action-creators';
import {
  get_edit_window_timespan,
  get_selected_words
} from '../../../routes/TrackDetail/module/selectors';

import { send_subs } from './module';
import './style.scss';

const map_dispatch_to_props = {
  download_edit_window,
  onSubmit: send_subs,
  playback_on,
  playback_off
};

const map_state_to_props = state => ({
  download_object_url: state.track_detail.download_object_url,
  edit_window_timespan: get_edit_window_timespan(state),
  is_playing: state.track_detail.is_playing,
  selected_words: get_selected_words(state)
});

export default connect(
  map_state_to_props,
  map_dispatch_to_props
)(component);
