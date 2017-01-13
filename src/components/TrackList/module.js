export const SET_CURRENT_SECTION = 'SET_CURRENT_SECTION';
export const MAKE_DIR_FIXED  = 'MAKE_DIR_FIXED';
export const MAKE_DIR_STATIC = 'MAKE_DIR_STATIC';

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

export const actions = {
    set_current_section,
    make_dir_fixed,
    make_dir_static,
};

const ACTION_HANDLERS = {
    [SET_CURRENT_SECTION]: (state, action) => ({
        ...state,
        current_section: action.section_id
    }),
    make_dir_fixed: (state, action) => ({
        ...state,
        is_dir_fixed: true,
    }),
    make_dir_static: (state, action) => ({
        ...state,
        is_dir_fixed: false,
    }),
};

const initial_state = {
    is_dir_fixed: false,
};
export function reducer (state = initial_state, action) {
    const handler = ACTION_HANDLERS[action.type];
    return handler ? handler(state, action) : state;
};
