import { injectReducer } from '../../store/reducers';

const get_component = (store, stem, next_state, cb) => {
    require.ensure([], (require) => {
        const container = require('./container.js').default;
        const reducer_module = require('./module/index.js');
        const reducer = reducer_module.default;
        injectReducer(store, { key: 'track_detail', reducer });
        reducer_module.init(store, stem, next_state.location.hash);
        cb(null, container(stem));
    }, 'track_detail');
};

export const track_detail_route = store => ({
    path: 'zaznam/:stem',
    getComponent: (next_state, cb) => get_component(store, next_state.params.stem, next_state, cb),
});

export const track_detail_imported_route = store => ({
    path: 'zaznam/prevzate/:stem',
    getComponent: (next_state, cb) => get_component(store, 'prevzate/' + next_state.params.stem, next_state, cb),
});
