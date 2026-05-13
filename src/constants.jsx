const API_BASE_DEV = 'http://localhost:5000';
const API_BASE_PRD = 'https://lindat.mff.cuni.cz/services/aligner/makon';
const AUDIO_BASE_DEV = 'http://localhost:5000/static/audio/';
const AUDIO_BASE_PRD = 'https://commondatastorage.googleapis.com/karel-makon-splits/';
const TEXTY_BASE_DEV = 'http://localhost:5000/texty';
const TEXTY_BASE_PRD = 'https://storage.googleapis.com/karel-makon-texty';
export const AUDIO_FORMATS = [{ mime: 'audio/ogg', suffix: 'ogg' }, { mime: 'audio/mpeg', suffix: 'mp3' }];
export const SAMPLE_RATE = 24000;
export const ALIGNER_URL = 'https://lindat.mff.cuni.cz/services/aligner/align';
export const API_BASE = API_BASE_PRD;
export const AUDIO_BASE = AUDIO_BASE_PRD;
export const TEXTY_BASE = TEXTY_BASE_PRD;

export default {
  ALIGNER_URL,
  API_BASE,
  AUDIO_BASE,
  AUDIO_FORMATS,
  SAMPLE_RATE,
  TEXTY_BASE,
};
