import React from 'react';
import ReactDOM from 'react-dom/client';
import AppContainer from './containers/AppContainer';
import configureStore from './store/configureStore';

if (window.location.hostname === 'radio.makon.cz' && window.location.protocol === 'http:') {
  window.location.replace(
    `https://${
      window.location.host
    }${
      window.location.pathname
    }${
      window.location.search
    }${
      window.location.hash
    }`
  );
}

const store = configureStore();
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<AppContainer store={store} />);
