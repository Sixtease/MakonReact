import React from 'react';

export class TrackDetail extends React.Component {
    render() {
        return (<h1>zaznam</h1>);
    }
};

TrackDetail.contextTypes = {
    store: React.PropTypes.object,
};

export default TrackDetail;
