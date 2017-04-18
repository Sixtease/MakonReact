import React from 'react';

export class EditWindow extends React.Component {
    render() {
        const me = this;
        const {is_playing, selected_words: selw, audio, playback_on, playback_off} = me.props;
        let cls = 'edit-window';
        if (selw.length > 0) {
            cls += ' is-shown';
        }
        return (
            <div className={cls}>
                {
                    is_playing
                    ? (
                        <button
                            className="glyphicon glyphicon-stop"
                            onClick={playback_off.bind(me,audio)}
                        ></button>
                    )
                    : (
                        <button
                            className="glyphicon glyphicon-play"
                            onClick={playback_on.bind(me,audio)}
                        ></button>
                    )
                }
                <textarea value={selw.map((w)=>w.occurrence).join(' ')}></textarea>
            </div>
        );
    }
};

export default EditWindow;
