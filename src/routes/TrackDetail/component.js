import React from 'react';
import EditWindow from 'components/EditWindow/index.js';
import audio from 'store/audio.js';

let subs_txt;
export const get_subs_txt = () => subs_txt;

export class TrackDetail extends React.Component {
    state: {
        subs_offset: {
            top: 0,
            left: 0,
        },
    }

    render() {
        const me = this;
        const {stem} = me.props.params;
        const {
            subs_str, is_playing, frame_cnt, current_frame, current_word,
            playback_on, playback_off, force_current_frame, selected_words,
            marked_word, sending_subs, sent_word_rectangles, failed_word_rectangles,
        } = me.props;
        const button_class = 'clickable glyphicon glyphicon-' + (is_playing ? 'pause' : 'play');
        const subs_offset = me.state ? me.state.subs_offset : {top: 0, left: 0};
        return (<div>
            <h1>{stem}</h1>
            <p></p>
            <div className="subs">
                <p  ref={(el) => {
                        subs_txt = el ? el.childNodes[0] : null;
                        me.subs_el  = el;
                    }}
                    onMouseUp={me.props.set_selection}
                >{subs_str}</p>
                <div className="sub-rects">
                    {current_word.rects.map((rect,i) => (
                        <span
                            key={'sub-rect-'+i}
                            className="sub-rect"
                            style={{
                                top:    rect.top    - subs_offset.top + window.scrollY,
                                left:   rect.left   - subs_offset.left,
                                width:  rect.right  - rect.left,
                                height: rect.bottom - rect.top
                            }}
                        />
                    ))}
                    {marked_word
                        ? <span
                            className="marked-word-rect"
                            style={{
                                top:    marked_word.rect.top    - subs_offset.top + window.scrollY,
                                left:   marked_word.rect.left   - subs_offset.left,
                                width:  marked_word.rect.right  - marked_word.rect.left,
                                height: marked_word.rect.bottom - marked_word.rect.top
                            }}
                        />
                        : null
                    }
                    {sending_subs && sent_word_rectangles
                        ? sent_word_rectangles.map((rect,i) => (
                            <span
                                key={'submitted-word-rect-'+i}
                                className="submitted-word-rect"
                                style={{
                                    top:    rect.top    - subs_offset.top + window.scrollY,
                                    left:   rect.left   - subs_offset.left,
                                    width:  rect.right  - rect.left,
                                    height: rect.bottom - rect.top
                                }}
                            />
                        ))
                        : null
                    }
                    {failed_word_rectangles.map((rect,i) => (
                        <span
                            key={'failed-word-rect-'+i}
                            className="failed-word-rect"
                            style={{
                                top:    rect.top    - subs_offset.top + window.scrollY,
                                left:   rect.left   - subs_offset.left,
                                width:  rect.right  - rect.left,
                                height: rect.bottom - rect.top
                            }}
                        />
                    )) }
                </div>
            </div>
            <div className="control-bar">
                {   is_playing
                    ? (
                        <button
                            className="glyphicon glyphicon-pause"
                            onClick={playback_off}
                        ></button>
                    )
                    : (
                        <button
                            className="glyphicon glyphicon-play"
                            onClick={playback_on}
                        ></button>
                    )
                }
                <input
                    type="range"
                    min="0"
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
    componentDidMount() {
        const me = this;
        const {stem} = me.props.params;
        const {set_audio_metadata, sync_current_time, set_selection} = me.props;
        const src = MP3_BASE + stem + '.mp3';
        window.scrollTo(0,0);
        set_selection();
        me.audio = audio(src);
        me.audio.addEventListener(
            'loadedmetadata', (evt) => set_audio_metadata(evt.target),
        );
        me.audio.addEventListener(
            'timeupdate', (evt) => sync_current_time(),
        );

        const subs_rect = me.subs_el.getClientRects();
        if (subs_rect.length > 0) {
            me.setState({
                subs_offset: subs_rect[0]
            });
        }
    }
};

TrackDetail.contextTypes = {
    store: React.PropTypes.object,
};

export default TrackDetail;
