import React from 'react';
import PropTypes from 'prop-types';

export class AboutRouteComponent extends React.Component {
  render() {
    return (
      <div className="page-about">
        <h1>O projektu Rádio Makoň</h1>
        <h2>Karel Makoň</h2>
        <p>
          Karel Makoň žil ve dvacátém století v Československu, prožil konec
          světa a znovuzrození z vody a z ducha a pokusil se předat návod na
          napodobení svojí zkušenosti a dosažení věčného života ostatním.
        </p>
        <p>
          Psané dílo Karla Makoně je k dispozici na stránce <a href="http://makon.cz/">makon.cz</a>.
          K dispozici jsou též kvalifikační práce o Karlu Makoňovi, kde je k nalezení i seznam další literatury k tématu:
          <ul>
            <li><a target="_blank" href="https://dspace.cuni.cz/handle/20.500.11956/174057">Informatická práce o zpracovávání nahrávek na tomto webu</a></li>
            <li><a target="_blank" href="https://dspace.cuni.cz/handle/20.500.11956/177483">Teologická práce o poselství Karla Makoně</a></li>
          </ul>
        </p>

        <h2>Cíle</h2>
        <p>Cílem projektu je zachování a zužitkování odkazu Karla Makoně.</p>

        <h2>Autor</h2>
        <p>
          Autorem tohoto webu, zde dostupných automatických přepisů, digitálních
          verzí nahrávek a osobou zodpovědnou za obsah je{' '}
          <a href="mailto:jan@sixtease.net">Jan Evangelista Oldřich Krůza</a> (
          <a target="_blank" href="https://www.sixtease.net/">
            sixtease.net
          </a>
          ).
        </p>
      </div>
    );
  }
}

AboutRouteComponent.propTypes = {
  results: PropTypes.array,
  load_search_results: PropTypes.func,
  prev_page: PropTypes.func,
  next_page: PropTypes.func,
  total: PropTypes.number,
  location: PropTypes.object,
  history: PropTypes.object
};

export default AboutRouteComponent;
