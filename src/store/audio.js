/* global AUDIO_FORMATS */
/* global window */

import { slice } from 'audio-buffer-utils';
import CanvasEqualizer from 'canvas-equalizer';
import equalizer_locale_cs from 'lib/canvas-equalizer/locales/cs.json';
import { basename, dirname } from 'lib/Util';
import { load_buffer } from './localsave';
import splits from 'store/splits';
import Chunks from './AudioChunks';

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

export const equalizer = new CanvasEqualizer(2048, ac, {
    language: 'cs',
});
equalizer.loadLocale('cs', equalizer_locale_cs);
const splitter = ac.createChannelSplitter(2);
equalizer.convolver.connect(splitter);
splitter.connect(ac.destination, 0);

function get_source(buffer) {
    const audio_source = ac.createBufferSource();
    audio_source.buffer = buffer;
    audio_source.connect(equalizer.convolver);
    audio_source.addEventListener('ended', () => audio_source.disconnect());
    return audio_source;
}

class MAudio {
    constructor() {
        if (!format) {
            console.log('no supported format, no audio');
            return null;
        }
        this.time = 0;
    }

    init(stem) {
        const previous_stem = this.stem;
        this.stem = stem;
        this.audio_chunks = new Chunks(stem);
        if (previous_stem) {
            this.pause();
            this.time = 0;
        }
        this.audio_chunks.ensure_ahead_window(this.time);
        this.started_at = null;
        this.is_playing = false;
        // this.playing_source = null;
        this.timeupdate_interval = null;
    }

    load() {
        return Promise.resolve(this);
    }

    schedule(chunk) {
        const me = this;
        const start_in = chunk.from - me.time;
        if (start_in <= 0) {
            me.started_at = ac.currentTime;
            chunk.audio_source.start(0, -start_in);
            me.notify_playing();
        }
        else {
            chunk.audio_source.start(start_in + ac.currentTime);
        }
    }

    on_chunk_load(chunk) {
        const me = this;
        chunk.audio_source = get_source(chunk.buffer);
        if (me.is_playing) {
            me.schedule(chunk);
        }
    }

    play() {
        const me = this;
        me.is_playing = true;
        me.audio_chunks.ensure_ahead_window(me.time);
        me.playing_since = ac.currentTime;
        const ahead_window = me.audio_chunks.get_ahead_window(me.time, 'promise');
        for (let i = 0; i < ahead_window.length; i++) {
            const chunk = ahead_window[i];
            chunk.scheduled_for = me.playing_since;
            if (chunk.buffer) {
                chunk.audio_source = get_source(chunk.buffer);
                me.schedule(chunk);
            }
            else {
                chunk.promise.then(() => me.on_chunk_load(chunk));
            }
        }
        return true;
    }

    pause() {
        const me = this;
        if (me.playing_source === null) {
            return null;
        }
        me.time += ac.currentTime - me.started_at;
        me.audio_chunks.get_ahead_window(me.time, 'audio_source').forEach(chunk => {
            chunk.audio_source.stop();
            chunk.audio_source.disconnect();
        });
        me.is_playing = false;
        me.unnotify_playing();
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

    sliding_ensure_ahead_window() {
        const me = this;
        const newly_loading = me.audio_chunks.ensure_ahead_window(me.get_time());
        newly_loading.forEach(chunk => {
            chunk.promise.then(() => me.on_chunk_load(chunk));
        });
    }

    notify_playing() {
        const me = this;
        if (me.timeupdate_interval === null) {
            me.timeupdate_interval = window.setInterval(function () {
                if (typeof me.ontimeupdate === 'function') {
                    me.ontimeupdate();
                }
                me.sliding_ensure_ahead_window();
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
export function load_audio(new_stem) {
    if (new_stem && new_stem !== audio.stem) {
        audio.init(new_stem);
        return audio.load();
    }
    else {
        return Promise.resolve(audio);
    }
};
;;; window.get_audio = get_audio;
;;; window.audio_context = ac;
;;; window.equalizer = equalizer;
