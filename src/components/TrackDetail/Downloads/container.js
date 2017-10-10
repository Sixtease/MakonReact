import { connect } from 'react-redux';
import {
    get_subs_str,
} from './module';

import component from './component';
import './style.scss';

const map_dispatch_to_props = {
    download_txt: get_subs_str,
};

const map_state_to_props = (state) => ({});

const container = connect(
    map_state_to_props, map_dispatch_to_props,
)(component);
export default container;
