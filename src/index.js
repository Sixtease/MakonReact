import React from 'react';
import ReactDOM from 'react-dom';
import AppContainer from './containers/AppContainer';
import configureStore from './store/configureStore';

const store = configureStore();
ReactDOM.render(
  <AppContainer store={store} />,
  document.getElementById('root')
);
