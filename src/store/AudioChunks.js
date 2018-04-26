/* global AUDIO_BASE */

const AHEAD_SIZE = 60;

import splits from './splits';
import { format } from './audio';

let last_floor_index = 0;

export default class AudioChunks {
    constructor(stem) {
        this.stem = stem;
        this.chunks = splits(stem).formats[format.suffix];
        if (!this.chunks) {
            throw 'no chunks for stem "' + stem + '" and format "' + format + '"';
        }
    }

    get_floor_chunk(pos) {
        const me = this;
        let floor_chunk;
        let floor_index;
        const start = me.chunks[last_floor_index].from < pos ? last_floor_index : 0;
        for (let i = start; i < me.chunks.length; i++) {
            const chunk = me.chunks[i];
            if (chunk.from <= pos) {
                floor_chunk = chunk;
                floor_index = i;
            }
            else {
                break;
            }
        }
        if (!floor_chunk) {
            throw "could not find floor chunk for stem " + me.stem + ", position " + pos;
        }
        last_floor_index = floor_index;
        return { floor_index, floor_chunk };
    }

    load_from_pos(pos) {
        const me = this;
        return new Promise((fulfill, reject) => {
            const { floor_chunk, floor_index } = me.get_floor_chunk(pos);
            let containing_chunk;

            if (floor_chunk && floor_chunk.to > pos) {
                containing_chunk = floor_chunk;
            }
            else {
                throw "could not find containing chunk for stem " + me.stem + ", position " + pos;
            }
            me.get_chunk_promise(containing_chunk).catch(reject).then(fulfill);
        });
    }

    get_chunk_promise(chunk) {
        const me = this;
        if (chunk.promise) {
            return chunk.promise;
        }
        else {
            return me.load_chunk(chunk);
        }
    }

    load_chunk(chunk) {
        const me = this;
        chunk.promise = new Promise((fulfill, reject) => {
            me.get_chunk_ea_promise(chunk).then(encoded_audio => {
                new AudioContext().decodeAudioData(encoded_audio, decoded_buffer => {
                    chunk.buffer = decoded_buffer;
                    fulfill(decoded_buffer);
                });
            });
        });
        return chunk.promise;
    }

    get_chunk_ea_promise(chunk) { // ea = encoded audio
        const me = this;
        if (chunk.ea_promise) {
            return chunk.ea_promise;
        }
        else {
            return me.load_chunk_ea(chunk);
        }
    }

    load_chunk_ea(chunk) {
        const me = this;
        chunk.url = AUDIO_BASE + 'splits/' + chunk.basename;
        chunk.ea_promise = new Promise((fulfill, reject) => {
            fetch(chunk.url).then(res => {
                res.arrayBuffer().then(encoded_audio => {
                    // chunk.encoded_audio = encoded_audio;
                    fulfill(encoded_audio);
                }).catch(reject);
            }).catch(reject);
        });
        return chunk.ea_promise;
    }

    /*
    get_ahead_window(pos, requested) {
        const me = this;
        if (requested !== 'promise' && requested !== 'buffer') {
            throw 'unexpected ahead window attribute ' + requested;
        }
        const { floor_chunk, floor_index } = me.get_floor_chunk(pos);
        if (!floor_chunk.buffer) {
            return { pos: null, len: 0 };
        }
        let ceil_index;
        for (let i = floor_index; me.chunks[i][requested]; i++) {
            ceil_index = i;
        }
        const ceil_chunk = me.chunks[i];
        return {
            pos: ceil_chunk.to,
            len: ceil_chunk.to - pos,
        };
    }
    */

    ensure_ahead_window(pos, len = AHEAD_SIZE) {
        const me = this;
        /*
        const ahead_window = me.get_ahead_window(pos, 'promise');
        if (ahead_window.len >= len) {
            return;
        }
        */
        let { floor_index, floor_chunk } = me.get_floor_chunk(pos);

        let i = floor_index;
        let c = floor_chunk;
        const target_pos = pos + len;
        let reached_pos = -1;
        const ahead_chunks = [];
        while (reached_pos < target_pos && i < me.chunks.length) {
            me.get_chunk_promise(c);
            reached_pos = c.to;
            ahead_chunks.push(c);
            i++;
            c = me.chunks[i];
        }
        return ahead_chunks;
    }
}
