import React from 'react';
import PropTypes from 'prop-types';
import Phonet from 'lib/Phonet';
const component =  ({ word }) => (
    word ? <div>
        <h1>Vybrané slovo</h1>
        <dl>
            <dt
                title='podoba slova na dané pozici, i s případnou interpunkcí nebo velkým písmenem'
            >výskyt</dt>
            <dd>{word.occurrence}</dd>

            <dt
                title='normalizovaná podoba slova bez interpunkce a malými písmeny'
            >forma</dt>
            <dd>{word.wordform}</dd>

            <dt>výslovnost</dt>
            <dd>{Phonet.to_human(word.fonet).str}</dd>

            <dt
                title='pozice slova v sekundách od začátku nahrávky'
            >pozice</dt>
            <dd>{word.timestamp}</dd>
        </dl>
    </div> : null
);

component.propTypes = {
    word: PropTypes.object,
};

export default component;
