import axios from 'axios';
import to_wav from 'audiobuffer-to-wav';
import { API_BASE, ALIGNER_URL } from '../../../constants';
import audio from '../../../store/audio';
import { textgrid_to_subs } from '../../../lib/AlignmentFormats';
import {
  get_edit_window_timespan,
  get_selected_words,
  get_subs_chunks
} from '../../../routes/TrackDetail/module/selectors';

const endpoint = API_BASE + '/subsubmit/';

export function send_subs(form_values, dispatch, props) {
  return async (dispatch, get_state) => {
    const state = get_state();
    const selw = get_selected_words(state);
    const subs_chunks = get_subs_chunks(state);
    dispatch({
      type: 'send_subs',
      words: selw,
      subs_chunks
    });
    const timespan = get_edit_window_timespan(state);
    dispatch({
      type: 'force_current_time',
      current_time: timespan.end
    });
    const window_buffer = await audio().get_window(timespan.start, timespan.end);
    const wav = to_wav(window_buffer);
    const blob = new Blob([wav], { type: 'audio/wav' });

    const align_formdata = new FormData();
    align_formdata.append('transcript', form_values.edited_subtitles);
    align_formdata.append('audio', blob);
    const textgrid_response = await axios.request({
      url: ALIGNER_URL,
      method: 'POST',
      data: align_formdata,
      headers: {
        'content-type': 'multipart/form-data',
      },
    });
    if (!textgrid_response) {
      dispatch({
        type: 'failed_submission',
        words: selw,
        subs_chunks,
      });
    }
    const occurrences = form_values.edited_subtitles.trim().split(/\s+/);
    const subs = textgrid_to_subs(textgrid_response.data, timespan.start, props.stem, occurrences);

    const subsub_formdata = new FormData();
    subsub_formdata.append('filestem', props.stem);
    subsub_formdata.append('start', timespan.start);
    subsub_formdata.append('end', timespan.end);
    subsub_formdata.append('trans', form_values.edited_subtitles);
    subsub_formdata.append('author', state.form.username.values.username);
    subsub_formdata.append('session', localStorage.getItem('session'));
    subsub_formdata.append('subs', JSON.stringify(subs));
    let res;
    try {
      res = await axios
        .request({
          url: endpoint,
          method: 'POST',
          data: subsub_formdata,
        });
    } catch (e) {
      dispatch({
        type: 'submission_error',
        words: selw,
      });
    }
    if (res.data && res.data.success) {
      dispatch({
        type: 'accepted_submission',
        replaced_words: selw,
        accepted_words: res.data.data,
      });
    } else {
      dispatch({
        type: 'failed_submission',
        words: selw,
        subs_chunks,
      });
    }
  };
}
