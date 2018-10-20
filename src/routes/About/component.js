import React from 'react';
import PropTypes from 'prop-types';

export class AboutRouteComponent extends React.Component {
    render() {
        return (<div className='page-about'>
            <h1>O projektu Rádio Makoň</h1>
            <h2>Karel Makoň</h2>
            <p>
                Karel Makoň žil ve dvacátém století v Československu, prožil konec světa
                a znovuzrození z vody a z ducha a pokusil se předat návod na napodobení
                svojí zkušenosti a dosažení věčného života ostatním.
            </p>
            <h2>Cíle</h2>
            <p>
                Cílem projektu je zachování a zužitkování odkazu Karla Makoně.
            </p>

            <h2>Autor</h2>
            <p>
                Autorem tohoto webu,
                zde dostupných automatických přepisů,
                digitálních verzí nahrávek
                a osobou zodpovědnou za obsah je{' '}
                <a href='mailto:jan@sixtease.net'>
                    Jan Evangelista Oldřich Krůza
                </a>{' '}
                (<a _target='blank' href='http://www.sixtease.net/'>sixtease.net</a>).
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
