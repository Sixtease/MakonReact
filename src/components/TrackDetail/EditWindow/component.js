import React from 'react';
import PropTypes from 'prop-types';
import { Field, reduxForm } from 'redux-form';

class EditWindow extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            show_filename_input: false,
            download_filename: 'makon.wav',
        };
    }

    _is_shown() {
        const me = this;
        const selw = me.props.selected_words;
        return selw.length > 0;
    }

    render() {
        const me = this;
        const {
            stem, is_playing, audio, playback_on, playback_off,
            download_edit_window, handleSubmit, edit_window_timespan,
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
                <span style={{float: 'right'}} >
                    { me.state.show_filename_input ? [
                        <input
                            type='text'
                            value={me.state.download_filename}
                            onChange={evt => me.setState({download_filename: evt.target.value})}
                            key={1}
                        />,
                        <a
                            href={me.object_url}
                            download={me.state.download_filename}
                            key={2}
                        >
                            <button
                                className='glyphicon glyphicon-download'
                                type='button'
                            />
                        </a>
                    ] : <button
                        className='glyphicon glyphicon-download'
                        onClick={() => me.commence_download()}
                        title='stáhnout audio'
                    /> }
                </span>
            </div>
        );
    }

    suggest_filename() {
        const me = this;
        const { stem, edit_window_timespan: { start, end } } = me.props;
        if (start === null || end === null) {
            return 'makon_nahravka_' + stem + '_usek.wav';
        }
        return 'makon_nahravka_' + stem + '_usek_od_' + start.toFixed(2) + '_do_' + end.toFixed(2) + '.wav';
    }

    commence_download() {
        const me = this;
        me.object_url = me.props.download_edit_window();
        me.setState({show_filename_input: true});
    }

    componentWillReceiveProps(nextProps) {
        const me = this;
        const ps = me.props .selected_words;
        const ns = nextProps.selected_words;

        if (nextProps.edit_window_timespan.start !== null &&
            nextProps.edit_window_timespan.end   !== null
        ) {
            me.setState({download_filename: me.suggest_filename()});
        }

        if (me.props.edit_window_timespan.start !== nextProps.edit_window_timespan.start ||
            me.props.edit_window_timespan.end   !== nextProps.edit_window_timespan.end
        ) {
            me.setState({show_filename_input: false});
            me.object_url = null;
        }

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
        me.setState({
            show_filename_input: false,
            download_filename: me.suggest_filename(),
        });
        me.object_url = null;
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
