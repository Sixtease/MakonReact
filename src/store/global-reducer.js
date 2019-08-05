const action_handlers = {
  set_subversions: (state, action) => ({
    ...state,
    subversions: action.subversions,
    subversions_arrived: true
  })
};

const initial_state = {
  subversions: {},
  subversions_arrived: false
};

export function global_reducer(state = initial_state, action) {
  const handler = action_handlers[action.type];
  return handler ? handler(state, action) : state;
}
