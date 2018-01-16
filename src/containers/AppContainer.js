import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import CoreLayout from '../layouts/CoreLayout';

class AppContainer extends Component {
    static propTypes = {
        store  : PropTypes.object.isRequired,
    }

    shouldComponentUpdate() {
        return false;
    }

    render() {
        const { routes, store } = this.props;

        return (
            <Provider store={store}>
                <BrowserRouter>
                    <div style={{ height: '100%' }}>
                        <CoreLayout />
                    </div>
                </BrowserRouter>
            </Provider>
        );
    }
}

export default AppContainer;
