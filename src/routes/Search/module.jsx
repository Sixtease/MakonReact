import { API_BASE } from '../../constants';
import { PAGE_SIZE } from './constants';

const ACTION_HANDLERS = {
  set_search_results: (state, action) => ({
    ...state,
    results: action.results,
    total: action.total >= 0 ? action.total : state.total,
  }),
};

const initial_state = {
  results: [],
  total: null,
};

const endpoint = API_BASE + '/search/';

export function load_search_results(query, ordering = '', from = 0) {
  const order_by = ordering ? ordering.split(/ /) : [];
  return dispatch => {
    fetch(`${endpoint}?query=${encodeURIComponent(query)}&from=${from}&order_by=${order_by}`)
      .then(response => response.json())
      .then(res => {
        if (res && res.hits && res.hits.hits) {
          const hitlist = res.hits.hits;
          const results = hitlist.map(hit => {
            const id = hit._id;
            const [stem, time] = id.split('--');
            const snip =
              hit.highlight && hit.highlight.occurrences && hit.highlight.occurrences.length > 0
                ? hit.highlight.occurrences[0]
                : hit.occurrences;
            return {
              id,
              stem,
              time,
              snip,
            };
          });
          dispatch({
            type: 'set_search_results',
            results,
            total: res.hits.total.value,
          });
        }
      });
  };
}

export function prev_page(loc, history) {
  const q = new URLSearchParams(loc.search);
  return dispatch => {
    const from = +(q.get('from') || 0);
    if (from === 0) {
      return;
    }
    const new_from = Math.max(from - PAGE_SIZE, 0);
    dispatch({
      type: 'set_search_results',
      results: [],
    });
    history.push({
      ...loc,
      search: `?${new URLSearchParams({ ...Object.fromEntries(q.entries()), from: new_from }).toString()}`,
    });
    load_search_results(q.get('dotaz'), q.get('order_by'), new_from)(dispatch);
  };
}

export function next_page(total, loc, history) {
  const q = Object.fromEntries(new URLSearchParams(loc.search).entries());
  return dispatch => {
    const new_from = +(q.from || 0) + PAGE_SIZE;
    if (new_from >= total) {
      return;
    }
    dispatch({
      type: 'set_search_results',
      results: [],
    });
    history.push({
      ...loc,
      search: `?${new URLSearchParams({ ...q, from: new_from }).toString()}`,
    });
    load_search_results(q.dotaz, q.order_by, new_from)(dispatch);
  };
}

export function set_order_by(order_by, loc, history) {
  const q = Object.fromEntries(new URLSearchParams(loc.search).entries());
  return dispatch => {
    history.push({
      ...loc,
      search: `?${new URLSearchParams({ ...q, order_by, from: 0 }).toString()}`,
    });
    load_search_results(q.dotaz, order_by, 0)(dispatch);
  };
}

export default function reducer(state = initial_state, action) {
  const handler = ACTION_HANDLERS[action.type];
  return handler ? handler(state, action) : state;
}
