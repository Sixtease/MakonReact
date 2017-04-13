import { connect } from 'react-redux';
import component from './component';
import {get_selected_words} from 'routes/TrackDetail/module.js';
import './style.scss';

const map_dispatch_to_props = {};

const map_state_to_props = (state) => ({
    selected_words: get_selected_words(state),
});

export default connect(map_state_to_props, map_dispatch_to_props)(component);
