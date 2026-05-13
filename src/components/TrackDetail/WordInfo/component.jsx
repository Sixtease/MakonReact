import React from 'react';
import PropTypes from 'prop-types';
import Phonet from '../../../lib/Phonet';

class WordInfo extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      occurrence: props.word?.occurrence || '',
    };
  }

  componentDidUpdate(prevProps) {
    const prevWord = prevProps.word;
    const nextWord = this.props.word;
    if (!(nextWord && nextWord.occurrence)) {
      return;
    }
    if (
      !prevWord ||
      prevWord.occurrence !== nextWord.occurrence ||
      prevWord.timestamp !== nextWord.timestamp ||
      prevWord.fonet !== nextWord.fonet
    ) {
      this.setState({ occurrence: nextWord.occurrence });
    }
  }

  onOccurrenceChange = evt => {
    this.setState({ occurrence: evt.target.value });
  };

  onOccurrenceBlur = () => {
    const { word, stem, save_word } = this.props;
    const { occurrence } = this.state;
    if (!word || occurrence === word.occurrence) {
      return;
    }
    save_word({
      occurrence,
      timestamp: word.timestamp,
      fonet: word.fonet,
      stem,
    });
  };

  render() {
    const { word } = this.props;
    if (word === null) {
      return null;
    }
    return (
      <div className="save-word">
        <h2>Vybrané slovo</h2>

        <dl>
          <dt title="podoba slova na dané pozici, i s případnou interpunkcí nebo velkým písmenem">
            výskyt
          </dt>
          <dd>
            <input
              type="text"
              name="occurrence"
              value={this.state.occurrence}
              onChange={this.onOccurrenceChange}
              onBlur={this.onOccurrenceBlur}
            />
          </dd>

          <dt title="normalizovaná podoba slova bez interpunkce a malými písmeny">
            forma
          </dt>
          <dd>{word.wordform}</dd>

          <dt>výslovnost</dt>
          <dd>{Phonet.to_human(word.fonet).str}</dd>

          <dt title="pozice slova v sekundách od začátku nahrávky">pozice</dt>
          <dd>{word.timestamp}</dd>
        </dl>
      </div>
    );
  }
}

WordInfo.propTypes = {
  word: PropTypes.object,
  save_word: PropTypes.func,
  stem: PropTypes.string,
};

export default WordInfo;
