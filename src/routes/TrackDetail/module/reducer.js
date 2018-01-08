/* global Blob */

import ACTION_HANDLERS from './ActionHandlers';

export const initial_state = {
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

export default function reducer(state = initial_state, action) {
    const handler = ACTION_HANDLERS[action.type];
    return handler ? handler(state, action) : state;
};
