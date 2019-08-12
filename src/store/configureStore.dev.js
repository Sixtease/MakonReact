import { createStore, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';
import { autostop, sync_audio } from './middleware';
import { rootReducer } from './reducers';

const configureStore = preloadedState => {
  const store = createStore(
    rootReducer,
    preloadedState,
    applyMiddleware(thunk, autostop, sync_audio)
  );
  return store;
};

export default configureStore;
