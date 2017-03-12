const ACTION_HANDLERS = {
};
const initial_state = {
};
export function reducer (state = initial_state, action) {
    const handler = ACTION_HANDLERS[action.type];
    return handler ? handler(state, action) : state;
};

