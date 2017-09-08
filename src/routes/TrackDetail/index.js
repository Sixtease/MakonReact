import { injectReducer } from '../../store/reducers';

export default (store) => ({
    path : 'zaznam/:stem',
    getComponent(nextState, cb) {
        require.ensure([], (require) => {
            const container = require('./container.js').default;
            const reducer_module = require('./module.js');
            const reducer = reducer_module.default;
            injectReducer(store, { key: 'track_detail', reducer });
            const edit_window_reducer = require('components/EditWindow/module.js').default;
            injectReducer(store, { key: 'edit_window', reducer: edit_window_reducer });
            reducer_module.init(store, nextState.params.stem, nextState.location.hash);
            cb(null, container);
        }, 'track_detail');
    },
});
