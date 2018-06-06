/* global window */

import fetch_jsonp from 'fetch-jsonp';
import query_string from 'query-string';
import audio, { audio_sample_rate } from 'store/audio';
import { list_saved_buffers } from 'store/localsave';
import {
    get_edit_window_timespan,
    get_marked_word,
} from './selectors';
import {
    initial_state,
} from './reducer';

export const frame_to_time = (frame) => frame / audio_sample_rate;
export const time_to_frame = (time)  => time  * audio_sample_rate;

const fetch_subs = (store, stem) => {
    fetch_jsonp(
        API_BASE + '/static/subs/' + stem + '.sub.js', {
            timeout:               300000,
            jsonpCallback:         'jsonp_subtitles',
            jsonpCallbackFunction: 'jsonp_subtitles',
        }
    )
        .then((res) => res.json())
        .then((sub_data) => {
            // calculate_word_positions(sub_data.data);
            store.dispatch({
                type: 'set_subs',
                subs: sub_data.data,
            });
        });
};

export function reflect_time_in_hash(time) {
    window.location.replace('#ts=' + time);
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
            const timespan = get_edit_window_timespan(current_state);
            if (timespan.start === null || timespan.end === null) {
                audio().play();
            }
            else {
                audio().play_window(
                    timespan.start,
                    timespan.end,
                    { onended: () => store.dispatch({
                        type: 'playback_off',
                    }) }
                );
            }
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
            reflect_time_in_hash(marked_word.timestamp);
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

function set_stored_stem(store) {
    list_saved_buffers().then(stems => {
        if (!stems || stems.length === 0) {
            // nothing saved
        }
        else if (stems.length === 1) {
            store.dispatch({
                type: 'complete_store_stem',
                stem: stems[0],
            });
        }
        else {
            console.log('more than 1 stem stored, unexpectedly', stems);
        }
    });
}

export const init = (store, stem, hash) => {
    fetch_subs(store, stem);
    set_audio_controls(store);
    apply_hash(store, hash);
    set_stored_stem(store);
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
