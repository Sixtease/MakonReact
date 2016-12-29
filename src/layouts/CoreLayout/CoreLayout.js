import React from 'react';
import Header from '../../components/Header';
import './CoreLayout.scss';
import '../../styles/core.scss';

export const CoreLayout = ({ children }) => (
    <div className='container-fluid'>
        <Header />
        <div className='row'>
            <div className='col-xs-12'>
                <div className='core-layout__viewport'>
                    {children}
                </div>
            </div>
        </div>
    </div>
);

CoreLayout.propTypes = {
    children : React.PropTypes.element.isRequired,
};

export default CoreLayout;
