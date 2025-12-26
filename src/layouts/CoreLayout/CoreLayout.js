import React from 'react';
import PropTypes from 'prop-types';
import { Route, withRouter } from 'react-router-dom';
import Header from '../../components/Header';
import { HomeView } from '../../routes/Home/';
import { TrackDetail } from '../../routes/TrackDetail';
import { Search } from '../../routes/Search';
import { TextySearch } from '../../routes/TextySearch';
import { About } from '../../routes/About';
import './CoreLayout.scss';
import '../../styles/core.scss';

export function CoreLayout(props) {
  return (
    <div className="container-fluid">
      <Header location={props.location} />
      <div className="row">
        <div className="col-xs-12">
          <div className="core-layout__viewport">
            <Route path="/" exact={true} component={HomeView} />
            <Route path="/zaznam/:id" exact={true} component={TrackDetail} />
            <Route path="/vyhledavani/" component={Search} />
            <Route path="/vyhledavani-texty/" component={TextySearch} />
            <Route path="/o-projektu/" component={About} />
          </div>
        </div>
      </div>
    </div>
  );
}

CoreLayout.propTypes = {
  location: PropTypes.object,
};

export default withRouter(CoreLayout);
