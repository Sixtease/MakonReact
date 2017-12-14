/* global AUDIO_FORMATS */
/* global window */
/* global EventTarget */

export const fetching_audio_event = 'fetching-audio';
export const fetched_audio_event = 'fetched-audio';
export const decoded_audio_event = 'decoded-audio';
export const ac = new AudioContext({sampleRate:24000});
export const format = (audio_el => AUDIO_FORMATS.find(f => audio_el.canPlayType(f.mime)))(new Audio());
if (!format) {
    console.log('no supported format, no audio');
}

let stub;
let audio;
let timeupdate_interval = null;

class MAudio {
    constructor(stub) {
        if (!format) {
            console.log('no supported format, no audio');
            return null;
        }
        this.stub = stub;
        this.buffer = null;
        this.time = 0;
        this.is_playing = false;
        this.playing_source = null;
    }

    load() {
        const me = this;
        const sound_promise = new Promise(fulfill => {
            const stub = me.stub;
            const src = [stub, format.suffix].join('.');
            fetch(src).then(res => {    // TODO: progress bar
                window.dispatchEvent(new Event(fetched_audio_event));
                res.arrayBuffer().then(encoded_data => {
                    new AudioContext().decodeAudioData(encoded_data, decoded_buffer => {
                        me.buffer = decoded_buffer;
                        window.dispatchEvent(new Event(decoded_audio_event));
                        fulfill(me);
                    });
                });
            });
        });
        this.sound_promise = sound_promise;
        return sound_promise;
    }

    get_source() {
        if (this.buffer === null) { return null }
        const audio_source = ac.createBufferSource();
        this.audio_source = audio_source;
        audio_source.buffer = this.buffer;
        audio_source.connect(ac.destination);
        audio_source.addEventListener('ended', () => audio_source.disconnect());
        return audio_source;
    }

    play() {
        const me = this;
        if (me.buffer === null) { return null }
        if (me.playing_source !== null) {
            playing_source.disconnect();
        }
        me.playing_source = me.get_source();
        me.playing_source.start(0, me.time);
        me.is_playing = true;
        return true;
    }

    pause() {
        if (this.playing_source === null) { return null }
        this.time = ac.currentTime;
        this.playing_source.stop();
        this.playing_source = null;
    }

    get_time() {
        return ac.currentTime;
    }

    set_time(new_time) {
        if (new_time < 0 || isNaN(new_time)) {
            throw 'can only set time to non-negative number, not '+new_time;
        }
        this.time = +new_time;
        if (this.is_playing) {
            this.play();
        }
    }

    play_window(from, to) {
        const me = this;
        if (me.buffer === null) { return null }
        const source = me.get_source();
        source.start(0, from, to - from);
        return source;
    }
}

export default function get_audio() {
    return audio;
};
export function load_audio(new_stub) {
    if (new_stub && new_stub !== stub) {
        stub = new_stub;
        audio = new MAudio(new_stub);
        return audio.load();
    }
    else {
        return Promise.resolve(audio);
    }
};
;;; window.get_audio = get_audio;
