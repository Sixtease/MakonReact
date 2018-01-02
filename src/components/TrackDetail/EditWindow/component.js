import React from 'react';
import PropTypes from 'prop-types';
import { Field, reduxForm } from 'redux-form';

class EditWindow extends React.Component {
    _is_shown() {
        const me = this;
        const selw = me.props.selected_words;
        return selw.length > 0;
    }

    render() {
        const me = this;
        const {
            is_playing, audio, playback_on, playback_off,
            download_edit_window,
            handleSubmit,
        } = me.props;
        let cls = 'edit-window';
        if (me._is_shown()) {
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
                            className='glyphicon glyphicon-play'
                            onClick={() => playback_on(audio)}
                            title='přehrát'
                        />
                    )
                }
                <button
                    className='glyphicon glyphicon-ok'
                    onClick={handleSubmit}
                    title='odeslat'
                />
                <button
                    className='glyphicon glyphicon-download'
                    onClick={download_edit_window}
                    title='stáhnout audio'
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
            || ps[ps.length - 1].timestamp !== ns[ns.length - 1].timestamp
        ) {
            const selw_str = ns.map((w) => w.occurrence).join(' ');
            if (selw_str) {
                me.props.autofill('edited_subtitles', selw_str);
            }
        }
    }

    componentDidMount() {
        const me = this;
        if (!window.KEY_SEND_SUBS_CTRL) {
            window.KEY_SEND_SUBS_CTRL = document.addEventListener(
                'keyup', (evt) => {
                    if (evt.ctrlKey && evt.key === 'Enter') {
                        if (me._is_shown()) {
                            me.props.handleSubmit();
                        }
                    }
                },
            );
        }
    }
};

EditWindow.propTypes = {
    audio:          PropTypes.object,
    autofill:       PropTypes.func,
    download_edit_window:
                    PropTypes.func,
    handleSubmit:   PropTypes.func,
    is_playing:     PropTypes.bool,
    playback_off:   PropTypes.func,
    playback_on:    PropTypes.func,
    selected_words: PropTypes.array,
};

/* eslint no-class-assign: [0] */
const component = reduxForm({
    form: 'edit_window',
})(EditWindow);

export default component;
