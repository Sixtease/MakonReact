import React from 'react';

export class TrackDetail extends React.Component {
    render() {
        const me = this;
        const {stem} = me.props.params;
        const {subs, toggle_play} = me.props;
        return (<div>
            <h1>{stem}</h1>
            <span onClick={toggle_play.bind(me,me.audio)} className="glyphicon glyphicon-play"></span>
            <input type="range" min="0" max="100" />
            <p>{subs.map((sub) => sub.occurrence).join(' ')}</p>
        </div>);
    }
    componentDidMount() {
        const me = this;
        const {stem} = me.props.params;
        const src = MP3_BASE + stem + '.mp3';
        me.audio = new Audio(src);
    }
};

TrackDetail.contextTypes = {
    store: React.PropTypes.object,
};

export default TrackDetail;
