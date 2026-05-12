import { SET_CURRENT_SECTION } from '../module.js';
import section_stemdir_map from '../../../store/section_stemdir_map.js';

export const VISIBILITY_TOGGLE = 'VISIBILITY_TOGGLE';
export const VISIBLE = true;
export const COLLAPSED = false;

export function toggle_visible(category) {
  return {
    type: VISIBILITY_TOGGLE,
    key: category.key
  };
}

const ACTION_HANDLERS = {
  [VISIBILITY_TOGGLE]: (state, action) => ({
    ...state,
    [action.key]: { visible: (state[action.key] || {}).visible ? 0 : 1 }
  }),
  [SET_CURRENT_SECTION]: (state, action) => {
    const newly_collapsed = Object.keys(state).filter(
      key => state[key].visible === true
    );
    const newly_expanded = section_stemdir_map[action.section_id].filter(key =>
      state[key] ? state[key].visible !== 1 : true
    );
    var state_update = {};
    newly_collapsed.forEach(key => {
      state_update[key] = { visible: false };
    });
    newly_expanded.forEach(key => {
      state_update[key] = { visible: true };
    });
    return {
      ...state,
      ...state_update
    };
  }
};

const initial_state = {};
export function reducer(state = initial_state, action) {
  const handler = ACTION_HANDLERS[action.type];
  return handler ? handler(state, action) : state;
}
