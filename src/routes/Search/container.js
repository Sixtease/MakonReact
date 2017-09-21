import { connect } from 'react-redux';
import {
    load_search_results,
    prev_page, next_page,
} from './module.js';

import Search from './component.js';
import './style.scss';

const map_dispatch_to_props = {
    load_search_results,
    prev_page,
    next_page,
};

const map_state_to_props = (state) => ({
    results: state.search.results,
    total:   state.search.total,
});

let search = connect(
    map_state_to_props, map_dispatch_to_props,
)(Search);
export default search;
