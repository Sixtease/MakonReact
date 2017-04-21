let src;
let audio_el = new Audio();
;;; window.audio_el = audio_el;
export default function audio(new_src) {
    if (new_src && new_src != src) {
        src = new_src;
        audio_el.src = src;
    }
    return audio_el;
};
