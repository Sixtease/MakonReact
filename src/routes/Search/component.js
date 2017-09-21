import React from 'react';
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
        return (<div className="search-results">
            dotaz: <code>{query}</code>
            <ol>{
                results.map(result => <li key={result.id}>
                    <Link to={`/zaznam/${result.stem}#ts=${result.time}`}>
                        <ReactMarkdown source={result.snip} />
                    </Link>
                </li>)
            }</ol>
            { results && results.length ?
            <div className="pager">
                <a onClick={() => prev_page(       loc, browserHistory)}>předchozí</a>{' '}
                {+from+1} - {to} / {total}{' '}
                <a onClick={() => next_page(total, loc, browserHistory)}>další</a>
            </div> : null }
        </div>);
    }

    componentWillMount() {
        const me = this;
        const q = me.props.location.query;
        this.props.load_search_results(q.dotaz, q.from);
    }
};

Search.contextTypes = {
    store: React.PropTypes.object,
};

Search.propTypes = {
    results: React.PropTypes.array,
    load_search_results: React.PropTypes.func,
    prev_page: React.PropTypes.func,
    next_page: React.PropTypes.func,
    total: React.PropTypes.number,
};

export default Search;
