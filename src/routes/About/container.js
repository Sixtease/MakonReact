import { connect } from "react-redux";
import { withRouter } from "react-router";
import {} from "./module.js";

import component from "./component.js";
import "./style.scss";

const map_dispatch_to_props = {};

const map_state_to_props = state => ({});

export default connect(
  map_state_to_props,
  map_dispatch_to_props
)(withRouter(component));
