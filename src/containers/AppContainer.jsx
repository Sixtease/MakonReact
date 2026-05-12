import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { BrowserRouter, Router } from 'react-router-dom';
import { Provider } from 'react-redux';
import CoreLayout from '../layouts/CoreLayout';
import { commence_session_init } from './actions';

let previous_location;
const router_set_state = Router.prototype.setState;
const ref_path = '/zaznam/';
Router.prototype.setState = function(...args) {
  const loc = this.props.history.location;
  if (
    loc.pathname.substr(0, ref_path.length) === ref_path &&
    loc.pathname === previous_location.pathname &&
    loc.search === previous_location.search &&
    loc.hash !== previous_location.hash
  ) {
    previous_location = { ...loc };
    return;
  }

  previous_location = { ...loc };
  return router_set_state.apply(this, args);
};
const router_did_mount = Router.prototype.componentDidMount;
Router.prototype.componentDidMount = function(...args) {
  previous_location = {
    ...this.props.history.location
  };
  if (typeof router_did_mount === 'function') {
    return router_did_mount.apply(this, args);
  }
};

class AppContainer extends Component {
  constructor(props) {
    super(props);
    props.store.dispatch(commence_session_init());
  }

  static propTypes = {
    store: PropTypes.object.isRequired
  };

  shouldComponentUpdate() {
    return false;
  }

  render() {
    const { store } = this.props;

    return (
      <Provider store={store}>
        <BrowserRouter>
          <div style={{ height: '100%' }}>
            <CoreLayout />
          </div>
        </BrowserRouter>
      </Provider>
    );
  }
}

export default AppContainer;
