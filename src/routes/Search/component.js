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
    const ordering = q.order_by;
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
        <select onChange={(evt) => me.props.set_order_by(evt.target.value, loc, history)} defaultValue={ordering || ''}>
          <option value="">řadit podle relevance</option>
          <option value="_uid">seskupit podle nahrávek</option>
        </select>
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

  componentDidMount() {
    const q = qs.parse(this.props.location.search);
    this.props.load_search_results(q.dotaz, q.order_by, q.from);
  }
}

Search.propTypes = {
  history: PropTypes.object,
  load_search_results: PropTypes.func,
  location: PropTypes.object,
  next_page: PropTypes.func,
  prev_page: PropTypes.func,
  results: PropTypes.array,
  set_order_by: PropTypes.func,
  total: PropTypes.number,
};

export default Search;
