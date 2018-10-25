/* global AUDIO_FORMATS */
/* global SAMPLE_RATE */
/* global window */

import { concat, slice } from 'audio-buffer-utils';
import CanvasEqualizer from 'canvas-equalizer';
import equalizer_locale_cs from 'lib/canvas-equalizer/locales/cs.json';
import { can_use_equalizer } from 'lib/Util';
import Chunks from './AudioChunks';

export const fetching_audio_event = 'fetching-audio';
export const fetched_audio_event = 'fetched-audio';
export const decoded_audio_event = 'decoded-audio';
export const ac = new AudioContext({ sampleRate: SAMPLE_RATE });
export const audio_sample_rate = ac.sampleRate;
export const format = (audio_el => AUDIO_FORMATS.find(f => audio_el.canPlayType(f.mime)))(new Audio());
if (!format) {
    console.log('no supported format, no audio');
}

let sink;
let eq;

if (can_use_equalizer()) {
    eq = new CanvasEqualizer(2048, ac, {
        language: 'cs',
    });
    eq.loadLocale('cs', equalizer_locale_cs);
    const splitter = ac.createChannelSplitter(2);
    eq.convolver.connect(splitter);
    splitter.connect(ac.destination, 0);
    sink = eq.convolver;
}
else {
    eq = null;
    sink = ac.destination;
}

export const equalizer = eq;

function get_source(buffer) {
    const audio_source = ac.createBufferSource();
    audio_source.buffer = buffer;
    audio_source.connect(sink);
    audio_source.addEventListener('ended', () => audio_source.disconnect());
    return audio_source;
}

class MAudio {
    constructor() {
        if (!format) {
            console.log('no supported format, no audio');
            return null;
        }
        this.chunks_loaded = false;
        this.time = 0;
        this.audio_sources = [];
    }

    init(stem) {
        const previous_stem = this.stem;
        this.stem = stem;
        if (previous_stem) {
            this.pause();
            this.time = 0;
        }
        this.started_at = null;
        this.should_play = false;
        this.is_playing = false;
        this.timeupdate_interval = null;
        this.audio_chunks = new Chunks(stem);
        this.audio_chunks.chunks_promise.then(() => {
            this.chunks_loaded = true;
            this.audio_chunks.ensure_ahead_window(this.time);
        });
    }

    load() {
        const me = this;
        return new Promise(resolve => {
            me.audio_chunks.chunks_promise.then(() => {
                resolve(me);
            });
        });
    }

    schedule(chunk) {
        const me = this;
        const time = me.get_time();
        if (time > chunk.to || (me.stop_pos && me.stop_pos < chunk.from)) {
            return;
        }
        const start_in = chunk.from - time;
        const start_pos = Math.max(time, chunk.from);
        let duration = 0.05 + chunk.to - start_pos;
        if (me.stop_pos && me.stop_pos > chunk.from && me.stop_pos < chunk.to) {
            duration = me.stop_pos - start_pos;
            if (me.stop_callback) {
                chunk.audio_source.addEventListener('ended', me.stop_callback);
            }
        }
        if (start_in <= 0) {
            me.started_at = ac.currentTime;
            chunk.audio_source.start(0, -start_in, duration);
            me.notify_playing();
        }
        else {
            chunk.audio_source.start(start_in + ac.currentTime, 0, duration);
        }
        me.is_playing = true;
        me.audio_sources.push(chunk.audio_source);
    }

    on_chunk_load(chunk) {
        const me = this;
        chunk.audio_source = get_source(chunk.buffer);
        if (me.should_play) {
            me.schedule(chunk);
        }
    }

    play(opt = {}) {
        const me = this;
        if (opt.delete_stop_pos !== false) {
            me.stop_pos = null;
        }
        me.should_play = true;
        me.audio_chunks.chunks_promise.then(() => {
            me.audio_chunks.ensure_ahead_window(me.time);
            const ahead_window = me.audio_chunks.get_ahead_window(me.time, 'promise');
            for (let i = 0; i < ahead_window.length; i++) {
                const chunk = ahead_window[i];
                if (chunk.buffer) {
                    chunk.audio_source = get_source(chunk.buffer);
                    me.schedule(chunk);
                }
                else {
                    chunk.promise.then(() => me.on_chunk_load(chunk));
                }
            }
        });
        return true;
    }

    pause() {
        const me = this;
        me.time += ac.currentTime - me.started_at;
        me.is_playing = false;
        me.should_play = false;
        me.unnotify_playing();
        me.audio_sources.forEach(audio_source => {
            audio_source.stop();
            audio_source.disconnect();
        });
        me.audio_sources.length = 0;
    }

    get_time() {
        return this.is_playing ? this.time + ac.currentTime - this.started_at : this.time;
    }

    set_time(new_time) {
        if (new_time < 0 || isNaN(new_time)) {
            throw new Error('can only set time to non-negative number, not ' + new_time);
        }
        const is_playing = this.is_playing;
        const should_play = this.should_play;
        if (is_playing) {
            this.pause();
        }
        this.time = +new_time;
        if (should_play) {
            this.play();
        }
    }

    play_window(from, to, { onended }) {
        const me = this;
        me.pause();
        me.set_time(from);
        me.stop_pos = to;
        me.stop_callback = onended;
        me.play({ delete_stop_pos: false });
        return true;
    }

    get_window(from, to) {
        const me = this;
        return new Promise((resolve, reject) => {
            const containing_chunks = me.audio_chunks.get_window_chunks(from, to);
            const chunk_promises = containing_chunks.map(c => c.promise);
            Promise.all(chunk_promises).then(() => {
                if (containing_chunks.length === 1) {
                    const chunk = containing_chunks[0];
                    const buf = chunk.buffer;
                    const start = from - chunk.from;
                    const end = to - chunk.from;
                    resolve(slice(buf, start * buf.sampleRate, end * buf.sampleRate));
                }
                else {
                    const first_chunk = containing_chunks.shift();
                    const first_buf = slice(
                        first_chunk.buffer,
                        (from - first_chunk.from) * first_chunk.buffer.sampleRate,
                        first_chunk.duration * first_chunk.buffer.sampleRate
                    );
                    const last_chunk = containing_chunks.pop();
                    const last_buf = slice(
                        last_chunk.buffer,
                        0,
                        (to - last_chunk.from) * last_chunk.buffer.sampleRate
                    );
                    resolve(concat(
                        first_buf,
                        ...containing_chunks.map(c => slice(c.buffer, 0, c.duration * c.buffer.sampleRate)),
                        last_buf
                    ));
                }
            });
        });
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
                if (!me.should_play) {
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
;;; window.equalizer = eq;
