import { injectReducer } from '../../store/reducers';

export default (store) => ({
    path : 'vyhledavani/',
    getComponent(nextState, cb) {
        require.ensure([], (require) => {
            const container = require('./container.js').default;
            const reducer_module = require('./module.js');
            const reducer = reducer_module.default;
            injectReducer(store, { key: 'search', reducer });
            cb(null, container);
        }, 'search');
    },
});
