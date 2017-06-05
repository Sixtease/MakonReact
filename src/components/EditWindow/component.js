import React from 'react';
import { Field, reduxForm } from 'redux-form';

export class EditWindow extends React.Component {
    render() {
        const me = this;
        const {
            is_playing, selected_words: selw, audio, playback_on, playback_off,
            handleSubmit,
        } = me.props;
        let cls = 'edit-window';
        if (selw.length > 0) {
            cls += ' is-shown';
        }
        return (
            <div className={cls}>
                <Field
                    component='textarea'
                    name='edited_subtitles'
                />
                {
                    is_playing
                    ? (
                        <button
                            className='glyphicon glyphicon-stop'
                            onClick={() => playback_off(audio)}
                            title='zastavit'
                        />
                    )
                    : (
                        <button
                            className="glyphicon glyphicon-play"
                            onClick={() => playback_on(audio)}
                            title="přehrát"
                        />
                    )
                }
                <button
                    className="glyphicon glyphicon-ok"
                    onClick={handleSubmit}
                    title="odeslat"
                />
            </div>
        );
    }

    componentWillReceiveProps(nextProps) {
        const me = this;
        const ps = me.props .selected_words;
        const ns = nextProps.selected_words;
        if ( !(ps && ps.length) && !(ns && ns.length) ) {
            return;
        }
        if (!ps
            || ps.length !== ns.length
            || ps[0] && !ns[0]
            || ps[0].timestamp !== ns[0].timestamp
            || ps[ps.length-1].timestamp !== ns[ns.length-1].timestamp
        ) {
            const selw_str = ns.map((w)=>w.occurrence).join(' ');
            if (selw_str) {
                me.props.autofill('edited_subtitles', selw_str);
            }
        }
    }
};

/* eslint no-class-assign: [0] */
EditWindow = reduxForm({
    form: 'edit_window',
})(EditWindow);

export default EditWindow;
