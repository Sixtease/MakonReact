import { connect } from "react-redux";
import component from "./component";
import "./style.scss";

import { save_word } from "./module";

const map_dispatch_to_props = {
  save_word
};

const map_state_to_props = state => ({});

export default connect(
  map_state_to_props,
  map_dispatch_to_props
)(component);
