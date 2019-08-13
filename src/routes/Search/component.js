import React from 'react';
import PropTypes from 'prop-types';
import ReactMarkdown from 'react-markdown';
import { Link } from 'react-router-dom';
import qs from 'query-string';

export class Search extends React.Component {
  render() {
    const me = this;
    const { location: loc, results, total, prev_page, next_page, history } = me.props;
    const q = qs.parse(me.props.location.search);
    const query = q.dotaz;
    const from = q.from || 0;
    const to = results && results.length ? +from + results.length : null;
    let previous_stem;
    function render_stem(current_stem) {
      if (current_stem === previous_stem) {
        return null;
      }
      previous_stem = current_stem;
      return <label>{current_stem}</label>;
    }
    return (
      <div className="search-results">
        dotaz: <code>{query}</code>
        <ol start={+from + 1}>
          {results.map(result => {
            const rendered_stem = render_stem(result.stem);
            const li_class = rendered_stem === null ? '' : 'shows-stem';
            return (
              <li key={result.id} className={li_class}>
                {rendered_stem}
                <Link to={`/zaznam/${result.stem}#ts=${result.time}`}>
                  <ReactMarkdown source={result.snip} />
                </Link>
              </li>
            );
          })}
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

  constructor(props) {
    super(props);
    const q = qs.parse(props.location.search);
    props.load_search_results(q.dotaz, q.from);
  }
}

Search.propTypes = {
  results: PropTypes.array,
  load_search_results: PropTypes.func,
  prev_page: PropTypes.func,
  next_page: PropTypes.func,
  total: PropTypes.number,
  location: PropTypes.object,
  history: PropTypes.object,
};

export default Search;
