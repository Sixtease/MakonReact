import HomeView from "./components/HomeView";
import { injectReducer } from "../../store/reducers";
import { reducer as track_list_reducer } from "../../components/TrackList/module.js";
import { reducer as track_dir_reducer } from "../../components/TrackList/TrackDirCategory/module.js";

export default {
  component: HomeView,
  init_reducer: store => {
    injectReducer(store, { key: "track_list", reducer: track_list_reducer });
    injectReducer(store, { key: "track_dir", reducer: track_dir_reducer });
  }
};
