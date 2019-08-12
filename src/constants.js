const API_BASE_DEV = 'http://localhost:5000';
const API_BASE_PRD = 'http://rock.positron.cz:8080';
const AUDIO_BASE_DEV = 'http://localhost:5000/static/audio/';
const AUDIO_BASE_PRD = 'http://commondatastorage.googleapis.com/karel-makon-splits/';
module.exports = {
  AUDIO_FORMATS: [{ mime: 'audio/ogg', suffix: 'ogg' }, { mime: 'audio/mpeg', suffix: 'mp3' }],
  SAMPLE_RATE: 24000,
};
if (process.env.NODE_ENV === 'production') {
  module.exports.API_BASE = API_BASE_PRD;
  module.exports.AUDIO_BASE = AUDIO_BASE_PRD;
} else {
  module.exports.API_BASE = API_BASE_DEV;
  module.exports.AUDIO_BASE = AUDIO_BASE_DEV;
}
