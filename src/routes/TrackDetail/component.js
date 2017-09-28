/* global AUDIO_BASE */
/* global AUDIO_SUFFIX */

import React from 'react';
import EditWindow from 'components/EditWindow';
import { Subs, WordInfo } from 'components/TrackDetail';
import audio      from 'store/audio';

const SPACE = ' ';

const chunk_text_nodes = [];
export const get_chunk_text_nodes = () => chunk_text_nodes;

export class TrackDetail extends React.Component {
    state: {
        subs_offset: {
            top: 0,
            left: 0,
        },
    }

    render() {
        const me = this;
        const { stem } = me.props.params;
        const {
            is_playing, frame_cnt, current_frame,
            playback_on, playback_off, force_current_frame,
            marked_word,
        } = me.props;
        const subs_offset = me.state ? me.state.subs_offset : { top: 0, left: 0 };
        const subs_props = {
            chunk_text_nodes,
            set_subs_el: (el) => { me.subs_el = el; },
            subs_offset,
            ...me.props,
        };

        return (<div>
            <h1>{stem}</h1>
            <div className='container-fluid'>
                <div className='row'>
                    <div className='col-xs-8 col-md-9'>
                        <p />
                        <Subs { ...subs_props } />
                    </div>
                    <div className='col-xs-4 col-md-3'>
                        <WordInfo word={marked_word} />
                    </div>
                </div>
            </div>
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
            <EditWindow
                stem={stem}
            />
        </div>);
    }
    _is_playing() {
        return this.props.is_playing;
    }
    componentDidMount() {
        const me = this;
        const { stem } = me.props.params;
        const {
            set_audio_metadata, sync_current_time, set_selection,
            playback_off, playback_on,
            location: loc, router,
        } = me.props;
        const src = AUDIO_BASE + stem + AUDIO_SUFFIX;
        window.scrollTo(0, 0);
        set_selection();
        me.audio = audio(src);
        me.audio.addEventListener(
            'loadedmetadata', (evt) => set_audio_metadata(evt.target),
        );
        me.audio.addEventListener(
            'timeupdate', (evt) => sync_current_time(loc, router),
        );
        if (!window.KEY_PLAYBACK_CTRL) {
            window.KEY_PLAYBACK_CTRL = document.addEventListener(
                'keyup', (evt) => {
                    if (evt.ctrlKey && evt.key === SPACE) {
                        me._is_playing() ? playback_off() : playback_on();
                    }
                },
            );
        }

        const subs_rect = me.subs_el.getClientRects();
        if (subs_rect.length > 0) {
            me.setState({
                subs_offset: subs_rect[0],
            });
        }
    }
};

TrackDetail.contextTypes = {
    store: React.PropTypes.object,
};

TrackDetail.propTypes = {
    current_frame:          React.PropTypes.number,
    current_word:           React.PropTypes.object,
    failed_word_rectangles: React.PropTypes.array,
    force_current_frame:    React.PropTypes.func,
    frame_cnt:              React.PropTypes.number,
    is_playing:             React.PropTypes.bool,
    marked_word:            React.PropTypes.object,
    playback_off:           React.PropTypes.func,
    playback_on:            React.PropTypes.func,
    sending_subs:           React.PropTypes.bool,
    sent_word_rectangles:   React.PropTypes.array,
    subs_chunks:            React.PropTypes.array,
};

export default TrackDetail;
