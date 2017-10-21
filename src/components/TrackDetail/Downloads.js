/* global AUDIO_BASE */

import React from 'react';
import PropTypes from 'prop-types';
import { get_subs_el } from 'routes/TrackDetail/component';

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
                    href={AUDIO_BASE + stem + '.mp3'}
                    target='_blank'
                >{stem}.mp3</a>
            </li>
            <li>
                <a
                    href={AUDIO_BASE + stem + '.ogg'}
                    target='_blank'
                >{stem}.ogg</a>
            </li>
            <li>
                <a onClick={select_transcription}>
                    označit celý přepis
                </a>
            </li>
        </ul>
    </div>
);

component.propTypes = {
    stem: PropTypes.string,
};

export default component;
