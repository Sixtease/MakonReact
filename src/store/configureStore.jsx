import { applyMiddleware, createStore } from 'redux';
import { thunk } from 'redux-thunk';
import { autostop, sync_audio } from './middleware';
import { rootReducer } from './reducers';

const configureStore = preloadedState =>
  createStore(
    rootReducer,
    preloadedState,
    applyMiddleware(thunk, autostop, sync_audio)
  );

export default configureStore;
