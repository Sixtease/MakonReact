/* global AUDIO_BASE */

const AHEAD_SIZE = 60;

import splits from './splits';
import { format } from './audio';

export default class AudioChunks {
    constructor(stem) {
        this.stem = stem;
        this.chunks = splits(stem).formats[format];
        if (!this.chunks) {
            throw 'no chunks for stem "' + stem + '" and format "' + format + '"';
        }
    }

    get_floor_chunk(pos) {
        const me = this;
        let floor_chunk;
        let floor_index;
        for (let i = 0; i < me.chunks.length; i++) {
            const chunk = me.chunks[i];
            if (chunk.from < pos) {
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
        return { floor_index, floor_chunk };
    }

    load_from_pos(pos) {
        const me = this;
        return new Promise((fulfill, reject) => {
            const { floor_chunk, floor_index } = me.get_floor_chunk(pos);

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
        if (chunk.promise) {
            return chunk.promise;
        }
        else {
            return me.load_chunk(chunk);
        }
    }

    load_chunk(chunk) {
        chunk.url = AUDIO_BASE + 'splits/' + chunk.basename;
        chunk.promise = new Promise((fulfill, reject) => {
            fetch(chunk.url).then(res => {
                res.arrayBuffer().then(encoded_data => {
                    chunk.encoded_data = encoded_data;
                    new AudioContext().decodeAudioData(encoded_data, decoded_buffer => {
                        chunk.buffer = decoded_buffer;
                        fulfill(chunk);
                    });
                });
            });
        });
        return chunk.promise;
    }

    get_ahead_window(pos, requested) {
        const me = this;
        if (requested !== 'promise' && requested !== 'buffer') {
            throw 'unexpected ahead window attribute ' + requested;
        }
        const { floor_chunk, floor_index } = me.get_floor_chunk(pos);
        if (!floor_chunk.buffer) {
            return { chunk: null, pos: null, len: 0 };
        }
        let ceil_index;
        for (let i = floor_index; me.chunks[i][requested]; i++) {
            ceil_index = i;
        }
        const ceil_chunk = me.chunks[i];
        return {
            chunk: null,
            pos: ceil_chunk.to,
            len: ceil_chunk.to - pos,
        };
    }

    ensure_ahead_window(pos, len = AHEAD_SIZE) {
        const me = this;
        const ahead_window = me.get_ahead_window(pos, 'promise');
        if (ahead_window.len >= len) {
            return;
        }
        let { floor_index, floor_chunk } = me.get_floor_chunk(pos);

        let i = floor_index;
        let c = floor_chunk;
        const target_pos = pos + len;
        while (c.to < target_pos) {
            me.get_chunk_promise(c);
            i++;
            c = me.chunks[i];
        }
    }
}
