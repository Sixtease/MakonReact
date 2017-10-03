import React from 'react';
const component =  ({stem}) => (
    <div>
        <h1>Stáhnout</h1>
        <ul>
            <li>
                <a
                    href={AUDIO_BASE + stem + '.mp3'}
                    target="_blank"
                >{stem}.mp3</a>
            </li>
            <li>
                <a
                    href={AUDIO_BASE + stem + '.ogg'}
                    target="_blank"
                >{stem}.ogg</a>
            </li>
        </ul>
    </div>
);

component.propTypes = {
    stem: React.PropTypes.string,
};

export default component;
