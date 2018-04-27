import React from 'react';
import PropTypes from 'prop-types';
import { frame_to_time } from 'routes/TrackDetail/module/util';

function s_to_hms(sec) {
    const s = sec % 60;
    const m = Math.floor(sec / 60) % 60;
    const h = Math.floor(sec / 3600);
    const elements = [];
    if (h > 0) {
        elements.push(h);
    }
    if (m > 0 || h > 0) {
        elements.push(m >= 10 ? m : '0' + m);
    }
    elements.push(s > 10 ? s.toFixed(2) : '0' + s.toFixed(2));
    return elements.join(':');
}

export class ControlBar extends React.Component {
    render() {
        const me = this;
        const {
            current_frame,
            force_current_frame,
            frame_cnt,
            is_playing,
            playback_off,
            playback_on,
        } = me.props;
        return (
            <div className='control-bar'>
                {   is_playing
                    ? (
                        <button
                            className='glyphicon glyphicon-pause'
                            onClick={playback_off}
                        />
                    )
                    : (
                        <button
                            className='glyphicon glyphicon-play'
                            onClick={playback_on}
                        />
                    )
                }
                <code>{s_to_hms(frame_to_time(current_frame))}</code>
                <input
                    type='range'
                    min='0'
                    max={frame_cnt}
                    value={current_frame}
                    onChange={(evt) => force_current_frame(evt.target.value)}
                />
                <code>{s_to_hms(frame_to_time(frame_cnt))}</code>
            </div>
        );
    }
}

ControlBar.propTypes = {
    current_frame:          PropTypes.number,
    force_current_frame:    PropTypes.func,
    frame_cnt:              PropTypes.number,
    is_playing:             PropTypes.bool,
    playback_off:           PropTypes.func,
    playback_on:            PropTypes.func,
};

export default ControlBar;
