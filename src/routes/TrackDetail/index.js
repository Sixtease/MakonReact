import { injectReducer } from '../../store/reducers';

const get_component = (store, stem, next_state, cb) => {
    require.ensure([], (require) => {
        const reducer = require('./module/reducer.js').default;
        injectReducer(store, { key: 'track_detail', reducer });

        const init = require('./module/util.js').init;
        init(store, stem, next_state.location.hash);

        const container = require('./container.js').default;
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
