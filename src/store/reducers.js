import { combineReducers } from 'redux';
import { reducer as form } from 'redux-form';
import { global_reducer as global } from './global-reducer';
import about from '../routes/About/module';
import search from '../routes/Search/module';
import texty_search from '../routes/TextySearch/module';
import track_detail from '../routes/TrackDetail/module/reducer';
import { reducer as track_dir } from '../components/TrackList/TrackDirCategory/module';
import { reducer as track_list } from '../components/TrackList/module';

export const rootReducer = combineReducers({
  about,
  form,
  global,
  search,
  texty_search,
  track_detail,
  track_dir,
  track_list,
});
