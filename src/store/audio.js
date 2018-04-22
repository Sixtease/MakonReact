/* global AUDIO_FORMATS */
/* global window */

import { slice } from 'audio-buffer-utils';
import CanvasEqualizer from 'canvas-equalizer';
import equalizer_locale_cs from 'lib/canvas-equalizer/locales/cs.json';
import { basename } from 'lib/Util';
import { load_buffer } from './localsave';

const desired_sample_rate = 24000;
export const fetching_audio_event = 'fetching-audio';
export const fetched_audio_event = 'fetched-audio';
export const decoded_audio_event = 'decoded-audio';
export const ac = new AudioContext({ sampleRate: desired_sample_rate });
export const audio_sample_rate = ac.sampleRate;
export const format = (audio_el => AUDIO_FORMATS.find(f => audio_el.canPlayType(f.mime)))(new Audio());
if (!format) {
    console.log('no supported format, no audio');
}

let _audio_element;
export function audio_element() {
    if (_audio_element === undefined) {
        _audio_element = new Audio();
        _audio_element.crossOrigin = 'anonymous';
    }
    return _audio_element;
}
;;; window.audio_element = audio_element;

export const equalizer = new CanvasEqualizer(2048, ac, {
    language: 'cs',
});
equalizer.loadLocale('cs', equalizer_locale_cs);
const splitter = ac.createChannelSplitter(2);
equalizer.convolver.connect(splitter);
splitter.connect(ac.destination, 0);

const use_oac = false;

const get_src = (stub) => [stub, format.suffix].join('.');

class MAudio {
    constructor() {
        if (!format) {
            console.log('no supported format, no audio');
            return null;
        }
        this.time = 0;
    }

    init(stub) {
        const previous_stub = this.stub;
        this.stub = stub;
        this.buffer = null;
        if (previous_stub) {
            this.pause();
            this.time = 0;
        }
        this.started_at = null;
        this.is_playing = false;
        this.playing_source = null;
        this.timeupdate_interval = null;
    }

    load() {
        const me = this;
        return new Promise(resolve => {
            const stub = me.stub;
            const stem = basename(stub);

            if (use_oac) {
                ;;; console.log('checking for saved buffer');
                load_buffer(stem, ac).then(buffer => {
                    ;;; console.log('restoring from local DB');
                    me.buffer = buffer;
                    ;;; console.log('done');
                    resolve(me);
                }).catch(err => {
                    const src = get_src(stub);
                    ;;; console.log('downloading', err);
                    fetch(src).then(res => {    // TODO: progress bar
                        window.dispatchEvent(new Event(fetched_audio_event));
                        res.arrayBuffer().then(encoded_data => {
                            ;;; console.log('decoding');
                            new AudioContext().decodeAudioData(encoded_data, decoded_buffer => {
                                me.buffer = decoded_buffer;
                                window.dispatchEvent(new Event(decoded_audio_event));
                                ;;; console.log('done');
                                resolve(me);
                                if (me.is_playing) {
                                    me.play();
                                }
                            });
                        });
                    });
                });
            }
            else {
                audio_element().src = get_src(stub);
                me.media_audio_source = ac.createMediaElementSource(audio_element());
                audio_element().addEventListener('loadedmetadata', () => resolve(me));
            }
        });
    }

    get_frame_cnt() {
        if (use_oac) {
            return this.buffer.length;
        }
        else {
            return audio_element().duration * audio_sample_rate;
        }
    }

    get_source() {
        let audio_source;
        if (use_oac) {
            if (this.buffer === null) {
                return null;
            }
            audio_source = ac.createBufferSource();
            audio_source.buffer = this.buffer;
        }
        else {
            audio_source = this.media_audio_source;
        }
        this.audio_source = audio_source;
        audio_source.connect(equalizer.convolver);
        audio_source.addEventListener('ended', () => audio_source.disconnect());
        return audio_source;
    }

    play() {
        const me = this;
        me.is_playing = true;
        if (use_oac) {
            if (me.buffer === null) {
                return null;
            }
        }
        if (me.playing_source !== null) {
            me.playing_source.disconnect();
        }
        me.playing_source = me.get_source();
        me.started_at = ac.currentTime;
        me.playing_source.start(0, me.time);
        me.notify_playing();
        return true;
    }

    pause() {
        if (this.playing_source === null) {
            return null;
        }
        this.time += ac.currentTime - this.started_at;
        this.playing_source.stop();
        this.playing_source = null;
        this.is_playing = false;
        this.unnotify_playing();
    }

    get_time() {
        return this.is_playing ? this.time + ac.currentTime - this.started_at : this.time;
    }

    set_time(new_time) {
        if (new_time < 0 || isNaN(new_time)) {
            throw new Error('can only set time to non-negative number, not ' + new_time);
        }
        this.time = +new_time;
        if (this.is_playing) {
            this.play();
        }
    }

    play_window(from, to, { onended }) {
        const me = this;
        if (me.buffer === null) {
            return null;
        }
        if (me.playing_source !== null) {
            me.playing_source.disconnect();
        }
        me.playing_source = me.get_source();
        me.playing_source.addEventListener('ended', onended);
        me.playing_source.start(0, from, to - from);
        return true;
    }

    get_window(from, to) {
        const me = this;
        if (me.buffer === null) {
            return null;
        }
        return slice(me.buffer, from * ac.sampleRate, to * ac.sampleRate);
    }

    notify_playing() {
        const me = this;
        if (me.timeupdate_interval === null) {
            me.timeupdate_interval = window.setInterval(function () {
                if (typeof me.ontimeupdate === 'function') {
                    me.ontimeupdate();
                }
                if (!me.is_playing) {
                    me.unnotify_playing();
                }
            }, 250);
        }
    }

    unnotify_playing() {
        if (this.timeupdate_interval !== null) {
            window.clearInterval(this.timeupdate_interval);
        }
        this.timeupdate_interval = null;
    }
}

const audio = new MAudio();
export default function get_audio() {
    return audio;
};
export function load_audio(new_stub) {
    if (new_stub && new_stub !== audio.stub) {
        audio.init(new_stub);
        return audio.load();
    }
    else {
        // TODO: return self-promise: we expect we're loaded, which we may not be
        return Promise.resolve(audio);
    }
};
;;; window.get_audio = get_audio;
;;; window.audio_context = ac;
;;; window.equalizer = equalizer;
