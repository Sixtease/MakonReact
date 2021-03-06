const S = {
  init: 0,
  globmax: 1,
  before_word: 2,
  in_word: 3,
  before_phone: 4,
  in_phone: 5,
};

function tg_transition(prev_state, line) {
  let match;
  if (prev_state === S.init && (match = /^xmax = (\S+)/.exec(line))) {
    return {
      state: S.globmax,
      payload: { value: parseFloat(match[1]) },
    };
  }
  if (prev_state === S.globmax && /^\s+intervals:/.test(line)) {
    return { state: S.before_word };
  }
  if (prev_state === S.before_word || prev_state === S.in_word) {
    if ((match = /^\s+xmin = (\S+)/.exec(line))) {
      return {
        state: S.in_word,
        payload: { word_start: parseFloat(match[1]) },
      };
    }
    if ((match = /^\s+xmax = (\S+)/.exec(line))) {
      return {
        state: S.in_word,
        payload: { word_end: parseFloat(match[1]) },
      };
    }
    if ((match = /^\s+text = "(.*)"/.exec(line))) {
      return {
        state: S.in_word,
        payload: { wordform: match[1] },
      };
    }
    if (/intervals /.test(line)) {
      return {
        state: S.before_word,
        payload: { word: {} },
      };
    }
    if (/^\s+intervals:/.test(line)) {
      return { state: S.before_phone };
    }
  }
  if (prev_state === S.before_phone || prev_state === S.in_phone) {
    if ((match = /^\s+xmin = (\S+)/.exec(line))) {
      return {
        state: S.in_phone,
        payload: { phone_start: parseFloat(match[1]) },
      };
    }
    if ((match = /^\s+xmax = (\S+)/.exec(line))) {
      return {
        state: S.in_phone,
        payload: { phone_end: parseFloat(match[1]) },
      };
    }
    if ((match = /^\s+text = "(.*)"/.exec(line))) {
      return {
        state: S.in_phone,
        payload: { phoneform: match[1] },
      };
    }
    if (/intervals /.test(line)) {
      return {
        state: S.before_phone,
        payload: { phone: {} },
      };
    }
  }
  return { state: prev_state };
}
export function textgrid_to_subs(textgrid, offset, filestem, occurrences) {
  const words = [];
  const textgrid_lines = textgrid.split(/\n/);
  let state = S.init;
  let payload = null;
  let curword;
  let curword_i = 0;
  let curphone;
  let subs_length;
  textgrid_lines.forEach((line) => {
    const tmp = tg_transition(state, line);
    state = tmp.state;
    payload = tmp.payload;
    if (!payload) return;
    switch (state) {
    case S.globmax:
      subs_length = payload.value;
      break;
    case S.before_word:
      curword = payload.word;
      words.push(curword);
      break;
    case S.in_word:
      if (payload.word_start >= 0) {
        curword.start = payload.word_start;
      }
      if (payload.word_end >= 0) {
        curword.end = payload.word_end;
      }
      if (payload.wordform === '') {
        words.pop();
      }
      if (payload.wordform) {
        curword.wordform = payload.wordform;
      }
      break;
    case S.before_phone:
      if (curphone) {
        if (curphone.end > words[curword_i].end) {
          curword_i++;
          words[curword_i].phones = [];
        }
        if (curphone.start < words[curword_i].start) {
          /* skip */
        } else {
          words[curword_i].phones.push(curphone.form);
        }
      } else {
        words[curword_i].phones = [];
      }
      curphone = payload.phone;
      break;
    case S.in_phone:
      if (payload.phone_start >= 0) {
        curphone.start = payload.phone_start;
      }
      if (payload.phone_end >= 0) {
        curphone.end = payload.phone_end;
      }
      if (payload.phoneform) {
        curphone.form = payload.phoneform;
      }
      break;
    default: // just do nothing
    }
  });
  for (let i = 0; i < words.length; i++) {
    const word = words[i];
    const occurrence = occurrences[i];
    const form = occurrence.replaceAll(/\P{L}+/gu, '').toLowerCase();
    if (word.wordform === form) {
      word.occurrence = occurrence;
    } else {
      word.occurrence = word.wordform;
    }
  }
  return {
    filestem,
    start: offset,
    end: subs_length + offset,
    data: words.map((w) => ({
      timestamp: w.start + offset,
      length: w.end - w.start,
      wordform: w.wordform,
      occurrence: w.occurrence,
      fonet: w.phones.join(' '),
    })),
  };
}
