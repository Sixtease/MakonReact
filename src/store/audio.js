/* global AUDIO_FORMATS */
/* global window */

let stub;
const audio_el = new Audio();
audio_el.crossOrigin = 'anonymous';
const ac = new AudioContext();
let oac;    // OfflineAudioContext;
let audio_data;
;;; window.audio_el = audio_el;
const format = AUDIO_FORMATS.find(f => audio_el.canPlayType(f.mime));
export default function audio(new_stub) {
    if (!format) {
        console.log('no supported format, no audio');
        return;
    }
    if (new_stub && new_stub !== stub) {
        stub = new_stub;
        const src = [stub, format.suffix].join('.');
        fetch(src).then(res => {
            res.arrayBuffer().then(encoded_data => {
                ac.decodeAudioData(encoded_data, decoded_buffer => {
                    audio_data = decoded_buffer;
                    oac = new OfflineAudioContext(
                        audio_data.numberOfChannels,
                        audio_data.length,
                        audio_data.sampleRate
                    );
                    const source = oac.createBufferSource();
                    source.buffer = audio_data;
                    source.connect(oac.destination);
                    source.start(0, 9.64, 14.36 - 9.64);
                    oac.startRendering().then(rendered_buf => {
                        const ac2 = new AudioContext();
                        const cutoff = ac2.createBufferSource();
                        cutoff.buffer = rendered_buf;
                        cutoff.connect(ac2.destination);
                        cutoff.start();
                    });
                });
            });
        });
        audio_el.src = src;
    }
    return audio_el;
};
