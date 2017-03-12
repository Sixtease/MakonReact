// We only need to import the modules necessary for initial render
import CoreLayout from '../layouts/CoreLayout';
import Home from './Home';
import TrackDetailRoute from './TrackDetail/index.js';
import { injectReducer } from '../store/reducers';
import { reducer as track_list_reducer } from '../components/TrackList/module';
import { reducer as track_dir_reducer  } from '../components/TrackList/TrackDirCategory/module';

/*  Note: Instead of using JSX, we recommend using react-router
    PlainRoute objects to build route definitions.   */

export const createRoutes = (store) => {
    injectReducer(store, { key: 'track_list', reducer: track_list_reducer });
    injectReducer(store, { key: 'track_dir',  reducer: track_dir_reducer  });
    return {
        path        : '/',
        component   : CoreLayout,
        indexRoute  : Home,
        childRoutes : [
            TrackDetailRoute(store),
        ],
    };
};

/*  Note: childRoutes can be chunked or otherwise loaded programmatically
    using getChildRoutes with the following signature:

    getChildRoutes (location, cb) {
      require.ensure([], (require) => {
        cb(null, [
          // Remove imports!
          require('./Counter').default(store)
        ])
      })
    }

    However, this is not necessary for code-splitting! It simply provides
    an API for async route definitions. Your code splitting should occur
    inside the route `getComponent` function, since it is only invoked
    when the route exists and matches.
*/

export default createRoutes;
