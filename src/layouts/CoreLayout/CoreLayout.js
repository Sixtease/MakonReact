import React from 'react';
import PropTypes from 'prop-types';
import Header from '../../components/Header';
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
                            {this.props.children}
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

CoreLayout.propTypes = {
    children : PropTypes.element.isRequired,
    location : PropTypes.object.isRequired,
};

export default CoreLayout;
