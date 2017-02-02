export const SET_CURRENT_SECTION = 'SET_CURRENT_SECTION';
export const MAKE_DIR_FIXED  = 'MAKE_DIR_FIXED';
export const MAKE_DIR_STATIC = 'MAKE_DIR_STATIC';
export const SET_OFFSET = 'SET_OFFSET';
export const SET_SECTION_OFFSET = 'SET_SECTION_OFFSET';
export const SCROLLED_TO = 'SCROLLED_TO';

export function set_current_section(section_id) {
    return {
        type: SET_CURRENT_SECTION,
        section_id,
    };
}

export function make_dir_fixed() {
    return {
        type: MAKE_DIR_FIXED,
    };
};

export function make_dir_static() {
    return {
        type: MAKE_DIR_STATIC,
    };
};

export function scrolled_to(offset) {
    return {
        type: SCROLLED_TO,
        offset,
    };
};

export function set_offset(offset) {
    return {
        type: SET_OFFSET,
        offset,
    }
};

export function set_section_offset(section,offset) {
    return {
        type: SET_SECTION_OFFSET,
        section,
        offset,
    };
};

function handle_scrolled_to(state, action) {
    let new_state;
    if (action.offset > state.initial_offset) {
        new_state = reducer(state, {
            type: MAKE_DIR_FIXED,
        });
    }
    else {
        new_state = reducer(state, {
            type: MAKE_DIR_STATIC,
        });
    }
    var current_section = { section: null, offset: Infinity };
    Object.keys(state.section_offsets).forEach((section) => {
        let section_offset = state.section_offsets[section];
        if (
            section_offset > action.offset - 100
            && section_offset < current_section.offset
        ) {
            current_section = { section, offset: section_offset };
        }
    });
    return reducer(new_state, {
        type: SET_CURRENT_SECTION,
        section_id: current_section.section,
    });
}

const ACTION_HANDLERS = {
    [SET_CURRENT_SECTION]: (state, action) => ({
        ...state,
        current_section: action.section_id
    }),
    [MAKE_DIR_FIXED]: (state, action) => ({
        ...state,
        is_dir_fixed: true,
    }),
    [MAKE_DIR_STATIC]: (state, action) => ({
        ...state,
        is_dir_fixed: false,
    }),
    [SET_OFFSET]: (state, action) => ({
        ...state,
        initial_offset: action.offset,
    }),
    [SET_SECTION_OFFSET]: (state, action) => ({
        ...state,
        section_offsets: {
            ...state.section_offsets,
            [action.section]: action.offset,
        },
    }),
    [SCROLLED_TO]: handle_scrolled_to,
};

const initial_state = {
    is_dir_fixed: false,
};
export function reducer (state = initial_state, action) {
    const handler = ACTION_HANDLERS[action.type];
    return handler ? handler(state, action) : state;
};
