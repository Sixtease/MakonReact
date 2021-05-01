/* eslint-disable jsx-a11y/anchor-is-valid */

import React from 'react';
import PropTypes from 'prop-types';
import { get_subs_el } from '../../routes/TrackDetail/component';

const select_transcription = () => {
  const sel = document.getSelection();
  sel.removeAllRanges();
  const range = document.createRange();
  range.selectNodeContents(get_subs_el());
  sel.addRange(range);
};

const component = ({ stem }) => (
  <div>
    <h1>Stáhnout</h1>
    <ul>
      <li>
        <a
          href={
            'http://commondatastorage.googleapis.com/karel-makon-mp3/' +
            stem +
            '.mp3'
          }
          target="_blank"
          rel="noopener noreferrer"
        >
          {stem}.mp3
        </a>
      </li>
      <li>
        <a onClick={select_transcription}>označit celý přepis</a>
      </li>
    </ul>
  </div>
);

component.propTypes = {
  stem: PropTypes.string
};

export default component;
