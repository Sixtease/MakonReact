import React from 'react';

export class TrackDetail extends React.Component {
    render(arg) {
        const {stem} = this.props.params;
        return (<div>
            <h1>zaznam</h1>
            {stem}
        </div>);
    }
};

TrackDetail.contextTypes = {
    store: React.PropTypes.object,
};

export default TrackDetail;
