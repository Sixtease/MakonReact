import React from 'react';
export default ({
    current_frame,
    force_current_frame,
    frame_cnt,
    is_playing,
    playback_off,
    playback_on,
}) => (
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
