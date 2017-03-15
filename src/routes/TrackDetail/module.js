import fetch_jsonp from 'fetch-jsonp';
const ACTION_HANDLERS = {
    set_subs: (state, action) => ({
        ... state,
        subs: action.subs,
    }),
};
const initial_state = {
    subs: [],
};
export const init = (store, stem) => {
    fetch_jsonp(
        API_BASE + '/static/subs/' + stem + '.sub.js', {
            jsonpCallback: 'jsonp_subtitles',
            jsonpCallbackFunction: 'jsonp_subtitles',
        }
    )
    .then((res) => res.json())
    .then((sub_data) => {
        store.dispatch({
            type: 'set_subs',
            subs: sub_data.data,
        });
    });
};
export default function reducer (state = initial_state, action) {
    const handler = ACTION_HANDLERS[action.type];
    return handler ? handler(state, action) : state;
};
