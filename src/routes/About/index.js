import { injectReducer } from '../../store/reducers';
import container from './container';
import reducer from './module';

export default {
    component: container,
    init_reducer: store => {
        injectReducer(store, { key: 'about', reducer });
    },
};
