import axios from 'axios';
import { PAGE_SIZE } from './constants.js';
import qs from 'query-string';

const ACTION_HANDLERS = {
    set_search_results: (state, action) => ({
        ...state,
        results: action.results,
        total:   action.total,
    }),
};

const initial_state = {
    results: [],
    total: null,
};

const endpoint = API_BASE + '/search/';

export function load_search_results(query, from = 0) {
    return (dispatch) => {
        axios.request({
            url: endpoint,
            method: 'get',
            params: {
                query,
                from,
            },
        }).then(res => {
            if (res && res.data && res.data.hits && res.data.hits.hits) {
                const hitlist = res.data.hits.hits;
                const results = hitlist.map(hit => {
                    const id = hit._id;
                    const [stem, time] = id.split('--');
                    const snip = (
                        (
                            hit.highlight &&
                            hit.highlight.occurrences &&
                            hit.highlight.occurrences.length > 0
                        )
                            ? hit.highlight.occurrences[0]
                            : hit.occurrences
                    );
                    return {
                        id, stem, time, snip,
                    };
                });
                dispatch({
                    type: 'set_search_results',
                    results,
                    total: res.data.hits.total,
                });
            }
        });
    };
};

export function prev_page(loc, history) {
    const q = qs.parse(loc.search);
    return (dispatch) => {
        const from = +(q.from || 0);
        if (from === 0) {
            return;
        }
        const new_from = Math.max(from - PAGE_SIZE, 0);
        history.push({...loc, search: qs.stringify({...q, from: new_from})});
        load_search_results(loc.query.dotaz, new_from)(dispatch);
    };
};

export function next_page(total, loc, history) {
    const q = qs.parse(loc.search);
    return (dispatch) => {
        const new_from = +(q.from || 0) + PAGE_SIZE;
        if (new_from >= total) {
            return;
        }
        history.push({...loc, search: qs.stringify({...q, from: new_from})});
        load_search_results(loc.query.dotaz, new_from)(dispatch);
    };
}

export default function reducer(state = initial_state, action) {
    const handler = ACTION_HANDLERS[action.type];
    return handler ? handler(state, action) : state;
};
