import fetch_jsonp from 'fetch-jsonp';
import query_string from 'query-string';
import audio from 'store/audio';
import {
    get_marked_word,
    get_selected_words,
} from './Selectors';
import ACTION_HANDLERS from './ActionHandlers';

export const FRAME_RATE = 24000;
export const frame_to_time = (frame) => frame / FRAME_RATE;
export const time_to_frame = (time)  => time  * FRAME_RATE;

const initial_state = {
    subs: [],
    frame_cnt: 0,
    current_time: 0,
    forced_time: null,
    is_playing: false,
    selection_start_chunk_index: null,
    selection_start_icco: null,
    selection_end_chunk_index: null,
    selection_end_icco: null,
    sent_word_rectangles: [],
    failed_word_rectangles: [],
    locked_for_load: false,
};

const fetch_subs = (store, stem) => {
    fetch_jsonp(
        API_BASE + '/static/subs/' + stem + '.sub.js', {
            timeout:               30000,
            jsonpCallback:         'jsonp_subtitles',
            jsonpCallbackFunction: 'jsonp_subtitles',
        }
    )
    .then((res) => res.json())
    .then((sub_data) => {
//        calculate_word_positions(sub_data.data);
        store.dispatch({
            type: 'set_subs',
            subs: sub_data.data,
        });
    });
};
let previous_state;
let previous_marked_word;
const set_audio_controls = (store) => {
    previous_state = store.getState();
    previous_state.track_detail = initial_state;
    store.subscribe(() => {
        const current_state = store.getState();
        const to_dispatch = [];
        if (     current_state.track_detail.forced_time
              && current_state.track_detail.forced_time
            !== previous_state.track_detail.forced_time
        ) {
            audio().set_time(current_state.track_detail.forced_time);
        }
        if (current_state.track_detail.is_playing
            && !previous_state.track_detail.is_playing
        ) {
            audio().play();
            to_dispatch.push({
                type: 'clear_forced_time',
            });
        }
        if (!current_state.track_detail.is_playing
            && previous_state.track_detail.is_playing
        ) {
            audio().pause();
        }
        const marked_word = get_marked_word(current_state);
        if (marked_word
            && (
                !previous_marked_word
                || marked_word.timestamp !== previous_marked_word.timestamp
            )
        ) {
            to_dispatch.push({
                type: 'force_current_time',
                current_time: marked_word.timestamp,
            });
        }
        previous_state = current_state;
        previous_marked_word = marked_word;
        to_dispatch.forEach((action) => store.dispatch(action));
    });
};
const apply_hash = (store, hash) => {
    const bare_hash = hash.replace(/^#/, '');
    let query = query_string.parse(bare_hash);
    const requested_time = query.ts;
    if (requested_time) {
        store.dispatch({
            type: 'force_current_time',
            current_time: requested_time,
        });
    }
};
export const init = (store, stem, hash) => {
    fetch_subs(store, stem);
    set_audio_controls(store);
    apply_hash(store, hash);
};

/*
function calculate_word_positions(subs, start_index = 0, start_position = 0) {
    var pos = start_position;
    subs.forEach((word, i) => {
        word.index = start_index + i;
        word.position = pos;
        pos += word.occurrence.length + 1;
    });
    return subs;
}
*/

/*
function get_word_position(word, subs) {
    if (!word || !subs || subs.length === 0) {
        return null;
    }
    let i = word.index || 0;
    while (subs[i].timestamp < word.timestamp) {
        i++;
    }
    while (subs[i].timestamp > word.timestamp) {
        i--;
    }
    if (    subs[i].timestamp  === word.timestamp
        &&  subs[i].occurrence === word.occurrence
    ) {
        return subs[i].position;
    }
    else {
        return null;
    }
}
*/

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
    return (dispatch, getState) => dispatch({
        type: 'playback_on',
        selected_words: get_selected_words(getState()),
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
        frame_cnt: audio().buffer.length,
    };
};
export function sync_current_time() {
    const current_time = audio().get_time();
    window.location.replace('#ts=' + current_time);
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

export function lock_for_load() {
    return {
        type: 'lock_for_load',
    };
};
export function unlock_after_load() {
    return {
        type: 'unlock_after_load',
    };
};

export default function reducer(state = initial_state, action) {
    const handler = ACTION_HANDLERS[action.type];
    return handler ? handler(state, action) : state;
};
