import React from 'react';
import './TrackList.scss';
import TrackDirCategory from './TrackDirCategory';
import stemdir from '../../store/stemdir.json';
import stemsec from '../../store/stemsec.json';

export const TrackList = (props, context) => {console.log('context',context); return (
    <div className='row tracklist'>

        <div
            className='col-md-4 tracklist-directory'
        >
        <ul>
            { stemdir.map((cat1) => (
                <TrackDirCategory cat={cat1} />
            ))}
        </ul></div>

        <div className='col-md-8 tracklist-sections'>
            { stemsec.map( (sec) => (
                <section id={sec.section}>
                    { sec.items.map( (item) => (
                        <a href={item}>{item}</a>
                    ))}
                </section>
            )) }
        </div>

    </div>
)};

export default TrackList;
