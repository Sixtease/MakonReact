import React from 'react';
import PropTypes from 'prop-types';
import ReactMarkdown from 'react-markdown';
import { Link } from 'react-router-dom';

export class TextySearch extends React.Component {
  render() {
    const me = this;
    const { location: loc, results, total, prev_page, next_page, history } = me.props;
    const q = new URLSearchParams(me.props.location.search);
    const query = q.get('dotaz');
    const from = q.get('from') || 0;
    const to = results && results.length ? +from + results.length : null;
    const ordering = q.get('order_by');

    const query_param = query ? `?dotaz=${encodeURIComponent(query)}` : '';

    return (
      <div className="search-results">
        <div className="search-switch">
          dotaz: <code>{query}</code> |{' '}
          <Link
            to={{
              pathname: '/vyhledavani/',
              search: query_param,
            }}
          >
            Hledat v nahrávkách
          </Link>
        </div>
        <select onChange={(evt) => me.props.set_order_by(evt.target.value, loc, history)} defaultValue={ordering || ''}>
          <option value="">řadit podle relevance</option>
          <option value="_uid">seskupit podle nahrávek</option>
        </select>
        <ol start={+from + 1}>
          {results.map(result => (
            <li key={result.id}>
              <a href={result.url} target="_blank" rel="noopener noreferrer">
                <strong>{result.title || result.book}</strong>
                <ReactMarkdown>{result.snip}</ReactMarkdown>
              </a>
            </li>
          ))}
        </ol>
        {results && results.length ? (
          <div className="pager">
            <a onClick={() => prev_page(loc, history)}>předchozí</a> {+from + 1} - {to} / {total}{' '}
            <a onClick={() => next_page(total, loc, history)}>další</a>
          </div>
        ) : null}
      </div>
    );
  }

  componentDidMount() {
    const q = new URLSearchParams(this.props.location.search);
    this.props.load_texty_results(q.get('dotaz'), q.get('order_by'), q.get('from'));
  }
}

TextySearch.propTypes = {
  history: PropTypes.object,
  load_texty_results: PropTypes.func,
  location: PropTypes.object,
  next_page: PropTypes.func,
  prev_page: PropTypes.func,
  results: PropTypes.array,
  set_order_by: PropTypes.func,
  total: PropTypes.number,
};

export default TextySearch;
