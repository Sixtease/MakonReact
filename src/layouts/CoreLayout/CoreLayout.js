import React from 'react';
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
    children : React.PropTypes.element.isRequired,
    location : React.PropTypes.object.isRequired,
};

export default CoreLayout;
