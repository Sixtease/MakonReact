import fetch_jsonp from 'fetch-jsonp';
import { API_BASE } from '../../../constants';
import { audio_sample_rate } from '../../../store/audio';
import { hms_to_s, s_to_hms } from '../../../lib/Util';

export const frame_to_time = frame => frame / audio_sample_rate;
export const time_to_frame = time => time * audio_sample_rate;

export function reflect_time_in_hash(time) {
  const hms = s_to_hms(time);
  const old_hash = window.location.hash;
  const new_hash = '#ts=' + hms;
  if (new_hash !== old_hash) {
    window.location.replace(new_hash);
  }
}

export function fetch_subs(stem, dispatch, state) {
  state.global.init_data_promise.then(subversions => {
    const v = subversions[stem];
    const v_par = v ? '?v=' + v : '';
    const url = API_BASE + '/static/subs/' + stem + '.sub.js' + v_par;
    fetch_jsonp(url, {
      timeout: 300000,
      jsonpCallback: 'jsonp_subtitles',
      jsonpCallbackFunction: 'jsonp_subtitles',
    })
      .then(res => res.json())
      .then(sub_data => {
        // calculate_word_positions(sub_data.data);
        dispatch({
          type: 'set_subs',
          subs: sub_data.data,
        });
      });
  });
}

export const apply_hash = (hash, dispatch) => {
  const bare_hash = hash.replace(/^#/, '');
  let query = new URLSearchParams(bare_hash);
  const hms = query.get('ts');
  const requested_time = hms_to_s(hms);
  if (requested_time) {
    dispatch({
      type: 'force_current_time',
      current_time: requested_time,
    });
  }
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
