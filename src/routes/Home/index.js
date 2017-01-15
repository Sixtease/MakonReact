import HomeView from './components/HomeView';

/*
export default (store) => {
    ;;; console.log('returning getComponent',store);
//    injectReducer(store, { key: 'track_list', track_list_reducer });
//    injectReducer(store, { key: 'track_dir',  track_dir_reducer  });
    return {
        getComponent (nextState, cb) {
            require.ensure([], (require) => {
                ;;; console.log('getting component',HomeView);
                cb(null, HomeView);
            }, 'home');
        },
    };
};
*/

export default {
    component: HomeView,
};
