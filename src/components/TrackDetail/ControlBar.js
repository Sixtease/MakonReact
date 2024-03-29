import React from 'react';
import PropTypes from 'prop-types';
import { pause, play } from 'glyphicons';
import { frame_to_time } from '../../routes/TrackDetail/module/util';
import { s_to_hms } from '../../lib/Util';

export class ControlBar extends React.Component {
  render() {
    const me = this;
    const {
      current_frame,
      force_current_frame,
      frame_cnt,
      is_playing,
      playback_off,
      playback_on
    } = me.props;
    return (
      <div className="control-bar">
        {is_playing ? (
          <button onClick={playback_off}>{pause}</button>
        ) : (
          <button onClick={playback_on}>{play}</button>
        )}
        <code>{s_to_hms(frame_to_time(current_frame))}</code>
        <input
          type="range"
          min="0"
          max={frame_cnt}
          value={current_frame}
          onChange={evt => force_current_frame(evt.target.value)}
        />
        <code>{s_to_hms(frame_to_time(frame_cnt))}</code>
      </div>
    );
  }
}

ControlBar.propTypes = {
  current_frame: PropTypes.number,
  force_current_frame: PropTypes.func,
  frame_cnt: PropTypes.number,
  is_playing: PropTypes.bool,
  playback_off: PropTypes.func,
  playback_on: PropTypes.func
};

export default ControlBar;
