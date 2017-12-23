import React from 'react';
import PropTypes from 'prop-types';
import ReactMarkdown from 'react-markdown';
import { browserHistory, Link } from 'lib/react-router';

export class Search extends React.Component {
    render() {
        const me = this;
        const {
            location: loc,
            results,
            total,
            prev_page, next_page,
        } = me.props;
        const query = loc.query.dotaz;
        const from  = loc.query.from || 0;
        const to    = results && results.length ? +from + results.length : null;
        return (<div className='search-results'>
            dotaz: <code>{query}</code>
            <ol start={+from + 1}>{
                results.map(result => <li key={result.id}>
                    <Link to={`/zaznam/${result.stem}#ts=${result.time}`}>
                        <ReactMarkdown source={result.snip} />
                    </Link>
                </li>)
            }</ol>
            {
                results && results.length
                ? <div className='pager'>
                    <a onClick={() => prev_page(       loc, browserHistory)}>předchozí</a>{' '}
                    {+from + 1} - {to} / {total}{' '}
                    <a onClick={() => next_page(total, loc, browserHistory)}>další</a>
                </div>
                : null
            }
        </div>);
    }

    componentWillMount() {
        const me = this;
        const q = me.props.location.query;
        this.props.load_search_results(q.dotaz, q.from);
    }
};

Search.contextTypes = {
    store: PropTypes.object,
};

Search.propTypes = {
    results:                PropTypes.array,
    load_search_results:    PropTypes.func,
    prev_page:              PropTypes.func,
    next_page:              PropTypes.func,
    total:                  PropTypes.number,
};

export default Search;
