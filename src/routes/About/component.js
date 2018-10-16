import React from 'react';
import PropTypes from 'prop-types';
import ReactMarkdown from 'react-markdown';
import { Link } from 'react-router-dom';

export class AboutRouteComponent extends React.Component {
    render() {
        const me = this;
        const {
            location: loc,
            results,
            total,
            prev_page, next_page,
            history,
        } = me.props;
        return (<div className='page-about'>
            <h1>O projektu Rádio Makoň</h1>
            <h2>Karel Makoň</h2>
            <h2>Cíle</h2>
            <p>
                
            </p>

            <h2>Manuál</h2>
            <p>
                Zde najdete
                <a href="javascript:void 0">Nápovědu k použití aplikace</a>
            </p>

            <h2>Autor</h2>
            <p>
                Autorem tohoto webu,
                zde dostupných automatických přepisů,
                digitálních verzí nahrávek
                a osobou zodpovědnou za obsah je{' '}
                <a href="mailto:jan@sixtease.net">
                    Jan Evangelista Oldřich Krůza
                </a>{' '}
                (<a _target="blank" href="http://www.sixtease.net/">sixtease.net</a>).
            </p>
        </div>);
    }
};

AboutRouteComponent.contextTypes = {
    store: PropTypes.object,
};

AboutRouteComponent.propTypes = {
    results:                PropTypes.array,
    load_search_results:    PropTypes.func,
    prev_page:              PropTypes.func,
    next_page:              PropTypes.func,
    total:                  PropTypes.number,
    location:               PropTypes.object,
    history:                PropTypes.object,
};

export default AboutRouteComponent;
