import { connect } from 'react-redux';
import component from './component';
import {get_selected_words} from 'routes/TrackDetail/module.js';
import {playback_on,playback_off} from './module.js';
import './style.scss';

const map_dispatch_to_props = {
    playback_on,
    playback_off,
};

const map_state_to_props = (state) => ({
    selected_words: get_selected_words(state),
    is_playing: state.track_detail.is_playing,
});

export default connect(map_state_to_props, map_dispatch_to_props)(component);
