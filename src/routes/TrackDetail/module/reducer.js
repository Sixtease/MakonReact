/* global Blob */

import { get_word_rectangles, get_word_index } from './selectors';

const ACTION_HANDLERS = {
    set_subs: (state, action) => ({
        ...state,
        subs: action.subs,
    }),
    playback_on: (state, action) => {
        const rv = {
            ...state,
            is_playing: true,
        };
        const selected_words = action.selected_words/* || get_selected_words({ track_detail:state }) */;
        if (selected_words.length > 0) {
            rv.forced_time = selected_words[0].timestamp;
        }
        return rv;
    },
    playback_off: (state, action) => {
        return {
            ...state,
            is_playing: false,
        };
    },
    clear_forced_time: (state) => ({
        ...state,
        forced_time: null,
    }),
    set_audio_metadata: (state, action) => ({
        ...state,
        frame_cnt: action.frame_cnt,
    }),
    sync_current_time: (state, action) => ({
        ...state,
        current_time: action.current_time,
    }),
    force_current_time: (state, action) => ({
        ...state,
        current_time: action.current_time,
        forced_time:  action.current_time,
    }),
    set_selection: (state, action) => {
        let new_state = {
            ...state,
            selection_start_chunk_index: action.start_chunk_index,
            selection_end_chunk_index:   action.end_chunk_index,
            selection_start_icco: action.start_icco, // icco is in-chunk character offset
            selection_end_icco:   action.  end_icco,
            is_playing: false,
            download_object_url: null,
        };
        return new_state;
    },
    send_subs: (state, action) => ({
        ...state,
        selection_start_chunk_index: null,
        selection_start_icco:        null,
        selection_end_chunk_index:   null,
        selection_end_icco:          null,
        sending_subs: true,
        sent_word_rectangles: [
            ...state.sent_word_rectangles,
            ...get_word_rectangles(
                action.words,
                state.subs,
                action.subs_chunks/* || get_subs_chunks({track_detail: state}) */,
            ),
        ],
    }),
    accepted_submission: (state, action) => ({
        ...state,
        sending_subs: false,
        sent_word_rectangles: [],
        subs: [
            ...state.subs.slice(
                0,
                get_word_index(action.replaced_words[0], state.subs),
            ),
            /*
            ...calculate_word_positions(
                [
                    ...action.accepted_words,
                    ...state.subs.slice(
                        get_word_index(
                            // eslint standard/computed-property-even-spacing: [0]
                            action.replaced_words[
                                action.replaced_words.length - 1
                            ],
                            state.subs,
                        ) + 1,
                    ),
                ],
                // eslint func-call-spacing: [0]
                get_word_index   (action.replaced_words[0], state.subs),
                get_word_position(action.replaced_words[0], state.subs),
            ),
            */
            ...action.accepted_words,
            ...state.subs.slice(
                get_word_index(
                    // eslint standard/computed-property-even-spacing: [0]
                    action.replaced_words[ action.replaced_words.length - 1 ],
                    state.subs,
                ) + 1,
            ),
        ],
    }),
    failed_submission: (state, action) => ({
        ...state,
        sending_subs: false,
        sent_word_rectangles: [],
        failed_word_rectangles: [
            ...state.failed_word_rectangles,
            ...get_word_rectangles(
                action.words,
                state.subs,
                action.subs_chunks/* || get_subs_chunks({track_detail: state}) */,
            ),
        ],
    }),
    submission_error: (state, action) => ({
        ...state,
        sending_subs: false,
        sent_word_rectangles: [],
    }),
    accepted_save_word: (state, action) => {
        const i = get_word_index(action, state.subs);
        return {
            ...state,
            subs: [
                ...state.subs.slice(0, i),
                {
                    ...state.subs[i],
                    occurrence: action.occurrence,
                    wordform: action.wordform,
                },
                ...state.subs.slice(i + 1),
            ],
        };
    },
    commence_store_stem: (state, action) => ({
        ...state,
        storing_stem: true,
    }),
    complete_store_stem: (state, action) => ({
        ...state,
        storing_stem: false,
        stored_stem: action.stem,
    }),
    failed_store_stem: (state, action) => ({
        ...state,
        storing_stem: false,
    }),
    set_stem_storable: (state, action) => ({
        ...state,
        storable_stem: action.stem,
    }),
    window_download_ready: (state, action) => ({
        ...state,
        download_object_url: action.object_url,
    }),
};

export const initial_state = {
    subs: [],
    frame_cnt: 0,
    current_time: 0,
    download_object_url: null,
    forced_time: null,
    is_playing: false,
    selection_start_chunk_index: null,
    selection_start_icco: null,
    selection_end_chunk_index: null,
    selection_end_icco: null,
    sent_word_rectangles: [],
    failed_word_rectangles: [],
    storable_stem: null,
    stored_stem: null,
    storing_stem: false,
};

export default function reducer(state = initial_state, action) {
    const handler = ACTION_HANDLERS[action.type];
    return handler ? handler(state, action) : state;
};
