import React from 'react';
import EditWindow from 'components/EditWindow/index.js';
import audio from 'store/audio.js';

export class TrackDetail extends React.Component {
    state: {
        subs_offset: 0,
    }

    render() {
        const me = this;
        const {stem} = me.props.params;
        const {
            subs_str, is_playing, frame_cnt, current_frame, current_word,
            playback_on, playback_off, force_current_frame, selected_words,
        } = me.props;
        const button_class = 'clickable glyphicon glyphicon-' + (is_playing ? 'pause' : 'play');
        return (<div>
            <h1>{stem}</h1>
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
            <p>{selected_words.map((w)=>w.occurrence).join(' ')}</p>
            <div className="subs">
                <p  ref={(el) => {
                        this.subs_txt = el ? el.childNodes[0] : null;
                        this.subs_el  = el;
                    }}
                    onMouseUp={this.props.set_selection}
                >{subs_str}</p>
                <div className="sub-rects">
                    {current_word.rects.map((rect,i) => (
                        <span
                            key={'sub-rect-'+i}
                            className="sub-rect"
                            style={{
                                top:    rect.top  - this.state.subs_offset.top + window.scrollY,
                                left:   rect.left - this.state.subs_offset.left,
                                width:  rect.right - rect.left,
                                height: rect.bottom - rect.top
                            }}
                        ></span>
                    ))}
                </div>
            </div>
            <EditWindow />
        </div>);
    }
    componentDidMount() {
        const me = this;
        const {stem} = me.props.params;
        const {set_audio_metadata, sync_current_frame, set_selection} = me.props;
        const src = MP3_BASE + stem + '.mp3';
        set_selection();
        me.audio = audio(src);
        me.audio.addEventListener(
            'loadedmetadata', (evt) => set_audio_metadata(evt.target),
        );
        me.audio.addEventListener(
            'timeupdate', (evt) => sync_current_frame(me.subs_txt),
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
