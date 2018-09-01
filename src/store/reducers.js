import { combineReducers } from 'redux';
import { reducer as formReducer } from 'redux-form';
import { global_reducer } from './global-reducer';

export const makeRootReducer = (asyncReducers) => {
    return combineReducers({
        form: formReducer,
        global: global_reducer,
        ...asyncReducers,
    });
};

export const injectReducer = (store, { key, reducer }) => {
    if (Object.hasOwnProperty.call(store.asyncReducers, key)) return;

    store.asyncReducers[key] = reducer;
    store.replaceReducer(makeRootReducer(store.asyncReducers));
};

export default makeRootReducer;
