import { injectReducer } from "../../store/reducers";
import reducer from "./module/reducer";
import container from "./container";

export default {
  component: container,
  init_reducer: (store, location) => {
    injectReducer(store, { key: "track_detail", reducer });
  }
};
