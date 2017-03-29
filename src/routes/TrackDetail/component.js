import React from 'react';

export class TrackDetail extends React.Component {
    render() {
        const me = this;
        const {stem} = me.props.params;
        const {
            subs_str, is_playing, frame_cnt, current_frame,
            toggle_play, force_current_frame,
        } = me.props;
        const button_class = 'glyphicon glyphicon-' + (is_playing ? 'pause' : 'play');
        return (<div>
            <h1>{stem}</h1>
            <span
                onClick={toggle_play.bind(me,me.audio)}
                className={button_class}
            ></span>
            <input
                type="range"
                min="0"
                max={frame_cnt}
                value={current_frame}
                onChange={(evt) => force_current_frame(evt.target.value, me.audio)}
            />
            <p>{subs_str}</p>
        </div>);
    }
    componentDidMount() {
        const me = this;
        const {stem} = me.props.params;
        const {set_audio_metadata, sync_current_frame} = me.props;
        const src = MP3_BASE + stem + '.mp3';
        me.audio = new Audio(src);
        me.audio.addEventListener(
            'loadedmetadata', (evt) => set_audio_metadata(evt.target),
        );
        me.audio.addEventListener(
            'timeupdate', (evt) => sync_current_frame(evt.target),
        );
    }
};

TrackDetail.contextTypes = {
    store: React.PropTypes.object,
};

export default TrackDetail;
