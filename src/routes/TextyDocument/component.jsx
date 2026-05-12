import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { Link, withRouter } from 'react-router-dom';
import { TEXTY_BASE } from '../../constants';
import navigationData from '../../store/texty-navigation.json';
import './style.scss';

export function TextyDocument(props) {
  const { match, location } = props;
  const [navigation, setNavigation] = useState({});
  const [hasError, setHasError] = useState(false);
  const doc = match.params.doc;
  const bookId = doc.replace(/\.html$/i, '');
  const anchor = new URLSearchParams(location.search).get('p');
  const base = TEXTY_BASE.replace(/\/$/, '');
  const iframeSrc = `${base}/${doc}${anchor ? `#${anchor}` : ''}`;

  useEffect(() => {
    try {
      setNavigation(navigationData || {});
    } catch (err) {
      setHasError(true);
    }
  }, []);

  const entry = navigation[bookId] || {};
  const prevLink = entry.pred ? `/texty/${entry.pred}.html` : null;
  const nextLink = entry.succ ? `/texty/${entry.succ}.html` : null;

  return (
    <div className="texty-document">
      <h1>{bookId}</h1>
      <div className="texty-document__nav">
        {prevLink ? (
          <Link to={prevLink} className="nav-link prev">
            ← {entry.pred}
          </Link>
        ) : (
          <span />
        )}
        <Link to="/vyhledavani-texty/" className="nav-link">
          Zpět na vyhledávání
        </Link>
        {nextLink ? (
          <Link to={nextLink} className="nav-link next">
            {entry.succ} →
          </Link>
        ) : (
          <span />
        )}
      </div>
      {hasError ? <p className="text-danger">Nelze načíst navigaci mezi knihami.</p> : null}
      <iframe title={doc} src={iframeSrc} className="texty-document__frame" />
    </div>
  );
}

TextyDocument.propTypes = {
  location: PropTypes.object.isRequired,
  match: PropTypes.object.isRequired,
};

export default withRouter(TextyDocument);
