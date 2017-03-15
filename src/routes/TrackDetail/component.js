import React from 'react';

export class TrackDetail extends React.Component {
    render() {
        const {stem} = this.props.params;
        const subs = this.props.subs;
        return (<div>
            <h1>zaznam</h1>
            {stem}
            <p>{subs.map((sub) => sub.occurrence).join(' ')}</p>
        </div>);
    }
};

TrackDetail.contextTypes = {
    store: React.PropTypes.object,
};

export default TrackDetail;
