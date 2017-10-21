/* global AUDIO_BASE */

import React from 'react';
import PropTypes from 'prop-types';
import audio from 'store/audio';
import {
    ControlBar,
    EditWindow,
    Subs,
    WordInfo,
    Downloads,
} from 'components/TrackDetail';

const SPACE = ' ';

const chunk_text_nodes = [];
export const get_chunk_text_nodes = () => chunk_text_nodes;
let subs_el;
export const get_subs_el = () => subs_el;

export class TrackDetail extends React.Component {
    state: {
        subs_offset: {
            top: 0,
            left: 0,
        },
    }

    render() {
        const me = this;
        const { marked_word, stem } = me.props;
        const subs_offset = me.state ? me.state.subs_offset : { top: 0, left: 0 };
        const subs_props = {
            chunk_text_nodes,
            set_subs_el: (el) => {
                subs_el = el;
            },
            subs_offset,
            ...me.props,
        };

        return (<div>
            <h1>{stem}</h1>
            <div className='container-fluid'>
                <div className='row'>
                    <div className='col-xs-8 col-md-9'>
                        <p />
                        <Subs {...subs_props} />
                    </div>
                    <div className='col-xs-4 col-md-3'>
                        <div className='sidebar'>
                            <WordInfo word={marked_word} />
                            <Downloads stem={stem} />
                        </div>
                    </div>
                </div>
            </div>
            <ControlBar {...me.props} />
            <EditWindow stem={stem} />
        </div>);
    }
    _is_playing() {
        return this.props.is_playing;
    }
    componentDidMount() {
        const me = this;
        const {
            set_audio_metadata, sync_current_time, set_selection,
            playback_off, playback_on,
            location: loc, router, stem,
        } = me.props;
        const stub = AUDIO_BASE + stem;
        window.scrollTo(0, 0);
        set_selection();
        me.audio = audio(stub);
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

        const subs_rect = subs_el.getClientRects();
        if (subs_rect.length > 0) {
            me.setState({
                subs_offset: subs_rect[0],
            });
        }
    }
};

TrackDetail.contextTypes = {
    store: PropTypes.object,
};

TrackDetail.propTypes = {
    current_frame:          PropTypes.number,
    current_word:           PropTypes.object,
    failed_word_rectangles: PropTypes.array,
    force_current_frame:    PropTypes.func,
    frame_cnt:              PropTypes.number,
    is_playing:             PropTypes.bool,
    marked_word:            PropTypes.object,
    playback_off:           PropTypes.func,
    playback_on:            PropTypes.func,
    sending_subs:           PropTypes.bool,
    sent_word_rectangles:   PropTypes.array,
    subs_chunks:            PropTypes.array,
};

export default TrackDetail;
