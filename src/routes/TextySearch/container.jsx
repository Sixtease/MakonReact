import { connect } from 'react-redux';
import { withRouter } from 'react-router';
import { load_texty_results, prev_page, next_page, set_order_by } from './module';

import component from './component';
import '../Search/style.scss';

const map_dispatch_to_props = {
  load_texty_results,
  prev_page,
  next_page,
  set_order_by,
};

const map_state_to_props = state => ({
  results: state.texty_search.results,
  total: state.texty_search.total,
});

export default connect(
  map_state_to_props,
  map_dispatch_to_props
)(withRouter(component));
