export const SET_CURRENT_SECTION = 'SET_CURRENT_SECTION';
export const MAKE_DIR_FIXED = 'MAKE_DIR_FIXED';
export const MAKE_DIR_STATIC = 'MAKE_DIR_STATIC';
export const SET_OFFSET = 'SET_OFFSET';
export const SCROLLED_TO = 'SCROLLED_TO';

export function set_current_section(section_id) {
  return {
    type: SET_CURRENT_SECTION,
    section_id
  };
}

export function make_dir_fixed() {
  return {
    type: MAKE_DIR_FIXED
  };
}

export function make_dir_static() {
  return {
    type: MAKE_DIR_STATIC
  };
}

export function set_offset(offset) {
  return {
    type: SET_OFFSET,
    offset
  };
}

const ACTION_HANDLERS = {
  [SET_CURRENT_SECTION]: (state, action) => ({
    ...state,
    current_section: action.section_id
  }),
  [MAKE_DIR_FIXED]: (state, action) => ({
    ...state,
    is_dir_fixed: true
  }),
  [MAKE_DIR_STATIC]: (state, action) => ({
    ...state,
    is_dir_fixed: false
  }),
  [SET_OFFSET]: (state, action) => ({
    ...state,
    initial_offset: action.offset
  })
};

const initial_state = {
  is_dir_fixed: false
};
export function reducer(state = initial_state, action) {
  const handler = ACTION_HANDLERS[action.type];
  return handler ? handler(state, action) : state;
}
