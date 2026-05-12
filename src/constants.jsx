const API_BASE_DEV = 'http://localhost:5000';
const API_BASE_PRD = 'https://lindat.mff.cuni.cz/services/aligner/makon';
const AUDIO_BASE_DEV = 'http://localhost:5000/static/audio/';
const AUDIO_BASE_PRD = 'https://commondatastorage.googleapis.com/karel-makon-splits/';
const TEXTY_BASE_DEV = 'http://localhost:5000/texty';
const TEXTY_BASE_PRD = 'https://storage.googleapis.com/karel-makon-texty';
module.exports = {
  AUDIO_FORMATS: [{ mime: 'audio/ogg', suffix: 'ogg' }, { mime: 'audio/mpeg', suffix: 'mp3' }],
  SAMPLE_RATE: 24000,
  ALIGNER_URL: 'https://lindat.mff.cuni.cz/services/aligner/align',
};
if (true) {
  module.exports.API_BASE = API_BASE_PRD;
  module.exports.AUDIO_BASE = AUDIO_BASE_PRD;
  module.exports.TEXTY_BASE = TEXTY_BASE_PRD;
} else {
  module.exports.API_BASE = API_BASE_DEV;
  module.exports.AUDIO_BASE = AUDIO_BASE_DEV;
  module.exports.TEXTY_BASE = TEXTY_BASE_DEV;
}
