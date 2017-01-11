import { combineReducers } from 'redux';
import locationReducer from './location';

export const makeRootReducer = (asyncReducers) => {
    return combineReducers({
        location: locationReducer,
        nic: (action,state)=>{console.log('called reducer',state,action);return state;},
        ...asyncReducers,
    });
};

export const injectReducer = (store, { key, reducer }) => {
    if (Object.hasOwnProperty.call(store.asyncReducers, key)) return;

    store.asyncReducers[key] = reducer;
    store.replaceReducer(makeRootReducer(store.asyncReducers));
};

export default makeRootReducer;
