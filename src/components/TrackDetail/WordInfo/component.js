import React from 'react';
import PropTypes from 'prop-types';
import { Field, reduxForm } from 'redux-form';
import Phonet from 'lib/Phonet';

class WordInfo extends React.Component {
    render() {
        const me = this;
        const { word, stem, save_word } = me.props;
        return (
            word ? <div>
                <h1>Vybrané slovo</h1>

                <dl>
                    <dt
                        title='podoba slova na dané pozici, i s případnou interpunkcí nebo velkým písmenem'
                    >výskyt</dt>
                    <dd>
                        <Field
                            component="input"
                            type="text"
                            name="occurrence"
                            onBlur={(evt, new_value) => {
                                const nv = {
                                    occurrence: new_value,
                                    wordform:   word.wordform,
                                    timestamp:  word.timestamp,
                                    stem,
                                };
                                save_word(nv);
                            }}
                        />
                    </dd>

                    <dt
                        title='normalizovaná podoba slova bez interpunkce a malými písmeny'
                    >forma</dt>
                    <dd>
                        <Field component="input" type="text" name="wordform" />
                    </dd>

                    <dt>výslovnost</dt>
                    <dd>{Phonet.to_human(word.fonet).str}</dd>

                    <dt
                        title='pozice slova v sekundách od začátku nahrávky'
                    >pozice</dt>
                    <dd>{word.timestamp}</dd>
                </dl>
            </div> : null
        );
    }

    componentWillReceiveProps(nextProps) {
        const me = this;
        const ps = me.props .word;
        const ns = nextProps.word;
        if ( !(ps && ps.occurrence) && !(ns && ns.occurrence) ) {
            return;
        }
        if (!ps
            || ps.occurrence !== ns.occurrence
            || ps.timestamp  !== ns.timestamp
            || ps.fonet      !== ns.fonet
        ) {
            me.props.autofill('occurrence', ns.occurrence);
            me.props.autofill('wordform',   ns.wordform  );
        }
    }
};

WordInfo.propTypes = {
    word:       PropTypes.object,
    save_word:  PropTypes.func,
};

const component = reduxForm({
    form: 'word_info',
})(WordInfo);

export default component;
