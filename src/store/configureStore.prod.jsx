import { createStore, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';
import { autostop, sync_audio } from './middleware.js';
import { rootReducer } from './reducers';

const configureStore = preloadedState =>
  createStore(
    rootReducer,
    preloadedState,
    applyMiddleware(thunk, autostop, sync_audio)
  );

export default configureStore;
