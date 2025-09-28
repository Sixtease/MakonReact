import React from 'react';
import ReactDOM from 'react-dom/client';
import AppContainer from './containers/AppContainer';
import configureStore from './store/configureStore';

const store = configureStore();
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<AppContainer store={store} />);
