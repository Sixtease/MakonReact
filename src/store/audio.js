/* global AUDIO_FORMATS */
/* global window */

let stub;
let audio_el = new Audio();
;;; window.audio_el = audio_el;
export default function audio(new_stub) {
    if (new_stub && new_stub !== stub) {
        stub = new_stub;
        while (audio_el.hasChildNodes()) {
            audio_el.removeChild(audio_el.lastChild);
        }
        AUDIO_FORMATS.forEach(format => {
            const src = [stub, format.suffix].join('.');
            const source_el = window.document.createElement('source');
            source_el.type = format.mime;
            source_el.src  = src;
            audio_el.appendChild(source_el);
        });
        audio_el.load();
    }
    return audio_el;
};
