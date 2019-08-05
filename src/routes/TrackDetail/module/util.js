/* global window */

import fetch_jsonp from "fetch-jsonp";
import query_string from "query-string";
import audio, { audio_sample_rate } from "store/audio";
import { get_edit_window_timespan, get_marked_word } from "./selectors";
import { initial_state } from "./reducer";

export const frame_to_time = frame => frame / audio_sample_rate;
export const time_to_frame = time => time * audio_sample_rate;

function fetch_subs(store, stem) {
  if (!store.getState().global.subversions_arrived) {
    let unsubscribe;
    unsubscribe = store.subscribe(() => {
      if (store.getState().global.subversions_arrived) {
        unsubscribe();
        fetch_subs(store, stem);
      }
    });
    return;
  }
  const subversions = store.getState().global.subversions;
  const v = subversions[stem];
  const v_par = v ? "?v=" + v : "";
  const url = API_BASE + "/static/subs/" + stem + ".sub.js" + v_par;
  fetch_jsonp(url, {
    timeout: 300000,
    jsonpCallback: "jsonp_subtitles",
    jsonpCallbackFunction: "jsonp_subtitles"
  })
    .then(res => res.json())
    .then(sub_data => {
      // calculate_word_positions(sub_data.data);
      store.dispatch({
        type: "set_subs",
        subs: sub_data.data
      });
    });
}

export function reflect_time_in_hash(time) {
  const old_hash = window.location.hash;
  const new_hash = "#ts=" + time;
  if (new_hash !== old_hash) {
    window.location.replace(new_hash);
  }
}

let previous_state;
let previous_marked_word;
const set_audio_controls = store => {
  previous_state = store.getState();
  previous_state.track_detail = initial_state;
  store.subscribe(() => {
    const current_state = store.getState();
    const to_dispatch = [];
    if (
      current_state.track_detail.forced_time &&
      current_state.track_detail.forced_time !==
        previous_state.track_detail.forced_time
    ) {
      audio().set_time(current_state.track_detail.forced_time);
    }
    if (
      current_state.track_detail.is_playing &&
      !previous_state.track_detail.is_playing &&
      !audio().is_playing
    ) {
      const timespan = get_edit_window_timespan(current_state);
      if (timespan.start === null || timespan.end === null) {
        audio().play();
      } else {
        audio().play_window(timespan.start, timespan.end, {
          onended: () =>
            store.dispatch({
              type: "playback_off"
            })
        });
      }
      to_dispatch.push({
        type: "clear_forced_time"
      });
    }
    if (
      !current_state.track_detail.is_playing &&
      previous_state.track_detail.is_playing
    ) {
      audio().pause();
    }
    const marked_word = get_marked_word(current_state);
    if (
      marked_word &&
      (!previous_marked_word ||
        marked_word.timestamp !== previous_marked_word.timestamp)
    ) {
      to_dispatch.push({
        type: "force_current_time",
        current_time: marked_word.timestamp
      });
      reflect_time_in_hash(marked_word.timestamp);
    }
    previous_state = current_state;
    previous_marked_word = marked_word;
    to_dispatch.forEach(action => store.dispatch(action));
  });
};

const apply_hash = (store, hash) => {
  const bare_hash = hash.replace(/^#/, "");
  let query = query_string.parse(bare_hash);
  const requested_time = query.ts;
  if (requested_time) {
    store.dispatch({
      type: "force_current_time",
      current_time: requested_time
    });
  }
};

export const init = (store, stem, hash) => {
  fetch_subs(store, stem);
  set_audio_controls(store);
  apply_hash(store, hash);
};

/*
function calculate_word_positions(subs, start_index = 0, start_position = 0) {
    var pos = start_position;
    subs.forEach((word, i) => {
        word.index = start_index + i;
        word.position = pos;
        pos += word.occurrence.length + 1;
    });
    return subs;
}

function get_word_position(word, subs) {
    if (!word || !subs || subs.length === 0) {
        return null;
    }
    let i = word.index || 0;
    while (subs[i].timestamp < word.timestamp) {
        i++;
    }
    while (subs[i].timestamp > word.timestamp) {
        i--;
    }
    if (    subs[i].timestamp  === word.timestamp
        &&  subs[i].occurrence === word.occurrence
    ) {
        return subs[i].position;
    }
    else {
        return null;
    }
}
*/
