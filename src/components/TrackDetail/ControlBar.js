import React from 'react';
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
                <input
                    type='range'
                    min='0'
                    max={frame_cnt}
                    value={current_frame}
                    onChange={(evt) => force_current_frame(evt.target.value)}
                />
            </div>
        );
    }
}

ControlBar.propTypes = {
    current_frame:          React.PropTypes.number,
    force_current_frame:    React.PropTypes.func,
    frame_cnt:              React.PropTypes.number,
    is_playing:             React.PropTypes.bool,
    playback_off:           React.PropTypes.func,
    playback_on:            React.PropTypes.func,
};

export default ControlBar;
