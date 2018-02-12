import Dexie from 'dexie';

let _db;

function get_db() {
    if (!_db) {
        _db = new Dexie('MakonFM');
        _db.version(1).stores({
            raw: 'stem',
        });
    }
    return _db;
}

export function save_buffer(buffer, stem) {
    return new Promise((resolve, reject) => {
        const channel_data = buffer.getChannelData(0);
        const db = get_db();
        db.raw.clear().then(() => {
            db.raw.add({
                stem,
                channel_data,
                sample_rate: buffer.sampleRate,
            }).then(resolve).catch(reject);
        }).catch(reject);
    });
}

export function load_buffer(stem, audio_context) {
    return new Promise((resolve, reject) => {
        const db = get_db();
        db.raw.where('stem').equals(stem).first(record => {
            if (!record) {
                reject(new Error(stem + ' not stored'));
            }
            const stored_samples = record.channel_data;
            const sample_rate = record.sample_rate;
            const buffer = audio_context.createBuffer(1, stored_samples.length, sample_rate);
            buffer.copyToChannel(stored_samples, 0);
            resolve(buffer);
        }).catch(e => reject(e));
    });
}

export function list_saved_buffers() {
    return new Promise((resolve, reject) => {
        const db = get_db();
        db.raw.toCollection().uniqueKeys(resolve).catch(reject);
    });
}
