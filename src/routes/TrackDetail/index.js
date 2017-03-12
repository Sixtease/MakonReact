import { injectReducer } from '../../store/reducers';

export default (store) => ({
    path : 'zaznam/:stem',
    getComponent (nextState, cb) {
        require.ensure([], (require) => {
            const container = require('./container.js').default;
            const reducer   = require('./module.js'   ).default;
            injectReducer(store, { key: 'track_detail', reducer });
            cb(null, container);
        }, 'track_detail');
    },
});
