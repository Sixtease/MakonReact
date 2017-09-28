import React from 'react';
export default ({word}) => (
    word ?
    <dl>
        <dt
            title="podoba slova na dané pozici, i s případnou interpunkcí nebo velkým písmenem"
        >výskyt</dt>
        <dd>{word.occurrence}</dd>

        <dt
            title="normalizovaná podoba slova bez interpunkce a malými písmeny"
        >forma</dt>
        <dd>{word.wordform}</dd>

        <dt>výslovnost</dt>
        <dd>{word.fonet}</dd>

        <dt
            title="pozice slova v sekundách od začátku nahrávky"
        >pozice</dt>
        <dd>{word.timestamp}</dd>
    </dl> : null
);
