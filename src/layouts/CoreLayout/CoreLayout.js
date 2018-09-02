import React from 'react';
import PropTypes from 'prop-types';
import { Route, withRouter } from 'react-router-dom';
import Header from '../../components/Header';
import home_route         from '../../routes/Home';
import track_detail_route from '../../routes/TrackDetail';
import search_route       from '../../routes/Search';
import './CoreLayout.scss';
import '../../styles/core.scss';

export class CoreLayout extends React.Component {
    render() {
        return (
            <div className='container-fluid'>
                <Header location={this.props.location} />
                <div className='row'>
                    <div className='col-xs-12'>
                        <div className='core-layout__viewport'>
                            <Route path='/' exact={true} component={home_route.component} />
                            <Route path='/zaznam/:id' exact={true} component={({ match }) => {
                                return React.createElement(
                                    track_detail_route.component(match.params.id)
                                );
                            }} />
                            <Route path='/vyhledavani/' component={search_route.component} />
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    componentWillMount() {
        home_route        .init_reducer(this.context.store);
        track_detail_route.init_reducer(this.context.store);
        search_route      .init_reducer(this.context.store);
    }
}

CoreLayout.propTypes = {
    location: PropTypes.object,
};

CoreLayout.contextTypes = {
    store: PropTypes.object,
};

export default withRouter(CoreLayout);
