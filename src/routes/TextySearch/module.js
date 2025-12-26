import { API_BASE } from '../../constants';
import { PAGE_SIZE } from '../Search/constants';

const ACTION_HANDLERS = {
  set_texty_results: (state, action) => ({
    ...state,
    results: action.results,
    total: action.total >= 0 ? action.total : state.total,
  }),
};

const initial_state = {
  results: [],
  total: null,
};

const endpoint = API_BASE + '/search/texty';

export function load_texty_results(query, ordering = '', from = 0) {
  const order_by = ordering ? ordering.split(/ /) : [];
  return dispatch => {
    fetch(`${endpoint}?query=${encodeURIComponent(query)}&from=${from}&order_by=${order_by}&size=${PAGE_SIZE}`)
      .then(response => response.json())
      .then(res => {
        if (res && res.hits && res.hits.hits) {
          const hitlist = res.hits.hits;
          const results = hitlist.map(hit => {
            const source = hit._source || {};
            const anchor = source.web_anchor || '';
            const normalized_anchor = anchor.startsWith('/') ? anchor : `/${anchor}`;
            const [pathPart, hashPart] = normalized_anchor.split('#');
            const docSlug = pathPart ? pathPart.replace(/^\//, '') : '';
            const url = docSlug ? `/texty/${docSlug}${hashPart ? `?p=${hashPart}` : ''}` : normalized_anchor;
            const snip =
              hit.highlight && hit.highlight.body && hit.highlight.body.length > 0
                ? hit.highlight.body[0]
                : source.body;
            return {
              id: hit._id,
              url,
              snip,
              title: source.title_hint || source.book_id,
              book: source.book_id,
            };
          });
          dispatch({
            type: 'set_texty_results',
            results,
            total: res.hits.total.value,
          });
        } else {
          dispatch({
            type: 'set_texty_results',
            results: [],
            total: 0,
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
      type: 'set_texty_results',
      results: [],
    });
    history.push({
      ...loc,
      search: `?${new URLSearchParams({ ...Object.fromEntries(q.entries()), from: new_from }).toString()}`,
    });
    load_texty_results(q.get('dotaz'), q.get('order_by'), new_from)(dispatch);
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
      type: 'set_texty_results',
      results: [],
    });
    history.push({
      ...loc,
      search: `?${new URLSearchParams({ ...q, from: new_from }).toString()}`,
    });
    load_texty_results(q.dotaz, q.order_by, new_from)(dispatch);
  };
}

export function set_order_by(order_by, loc, history) {
  const q = Object.fromEntries(new URLSearchParams(loc.search).entries());
  return dispatch => {
    history.push({
      ...loc,
      search: `?${new URLSearchParams({ ...q, order_by, from: 0 }).toString()}`,
    });
    load_texty_results(q.dotaz, order_by, 0)(dispatch);
  };
}

export default function reducer(state = initial_state, action) {
  const handler = ACTION_HANDLERS[action.type];
  return handler ? handler(state, action) : state;
}
