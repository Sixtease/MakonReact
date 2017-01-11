export const VISIBILITY_TOGGLE = 'VISIBILITY_TOGGLE';
export const VISIBLE = true;
export const COLLAPSED = false;

export function toggle_visible(category) {
    return {
        type: VISIBILITY_TOGGLE,
        key: category.key,
    };
};

export const actions = {
    toggle_visible,
};

const ACTION_HANDLERS = {
    [VISIBILITY_TOGGLE]: (state, action) => ({
        ...state,
        [action.key]: {visible: !((state[action.key]||{}).visible)},
    }),
};

const initial_state = {};
export function reducer (state = initial_state, action) {
    const handler = ACTION_HANDLERS[action.type];
    return handler ? handler(state, action) : state;
};
