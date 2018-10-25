import to_wav from 'audiobuffer-to-wav';
import audio, { audio_sample_rate } from 'store/audio';
import {
    get_edit_window_timespan,
    get_selected_words,
} from './selectors';
import {
    frame_to_time,
    reflect_time_in_hash,
} from './util';

const sel = document.getSelection();
export function set_selection() {
    let start_chunk = null;
    let   end_chunk = null;
    let start_chunk_index = null;
    let   end_chunk_index = null;
    let start_icco = null;
    let   end_icco = null;
    let start_global_offset = null;
    let   end_global_offset = null;
    if (sel.rangeCount > 0) {
        const start_range = sel.getRangeAt(0);
        const   end_range = sel.getRangeAt(sel.rangeCount - 1);
        if (start_range && end_range) {
            start_chunk         =  start_range.startContainer.parentElement;
            end_chunk           =    end_range.  endContainer.parentElement;
            start_chunk_index   = +start_chunk.dataset.chunk_index;
            end_chunk_index     =   +end_chunk.dataset.chunk_index;
            start_icco          =  start_range.startOffset;
            end_icco            =    end_range.  endOffset;
            start_global_offset = +start_chunk.dataset.char_offset + start_icco;
            end_global_offset   =   +end_chunk.dataset.char_offset +   end_icco;
        }
    }
    return {
        type: 'set_selection',
        start_chunk,
        end_chunk,
        start_chunk_index,
        end_chunk_index,
        start_icco,
        end_icco,
        start_global_offset,
        end_global_offset,
    };
};

export function playback_on() {
    return (dispatch, get_state) => dispatch({
        type: 'playback_on',
        selected_words: get_selected_words(get_state()),
    });
};

export function playback_off() {
    return {
        type: 'playback_off',
    };
};

export function set_audio_metadata() {
    return {
        type: 'set_audio_metadata',
        frame_cnt: (
            chunks => chunks ? chunks[chunks.length - 1].to * audio_sample_rate : 0
        )(audio().audio_chunks.chunks),
    };
};

export function sync_current_time() {
    const current_time = audio().get_time();
    reflect_time_in_hash(current_time);
    return {
        type: 'sync_current_time',
        current_time,
    };
};

export function force_current_frame(current_frame) {
    return force_current_time(frame_to_time(current_frame));
};

export function force_current_time(current_time) {
    return {
        type: 'force_current_time',
        current_time,
    };
};

export function download_edit_window() {
    return (dispatch, get_state) => {
        const state = get_state();
        const timespan = get_edit_window_timespan(state);
        if (timespan.start === null || timespan.end === null) {
            return;
        }
        audio().get_window(timespan.start, timespan.end).then(window_buffer => {
            const wav = to_wav(window_buffer);
            const blob = new Blob([wav], { type: 'audio/wav' });
            const object_url = URL.createObjectURL(blob);
            dispatch({
                type: 'window_download_ready',
                object_url,
            });
        });
    };
};
