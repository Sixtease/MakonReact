import React from 'react';
import './TrackList.scss';
import TrackDirCategory, {attach_reducer} from './TrackDirCategory';
import stemdir from '../../store/stemdir.json';
import stemsec from '../../store/stemsec.json';

export const TrackList = (props, context) => {console.log('context',context);
window.STORE = context.store;
attach_reducer(context.store);
return (
    <div className='row tracklist'>

        <div
            className='col-md-4 tracklist-directory'
        >
        <ul>
            { stemdir.map((cat1) => {
                console.log('cat1', cat1);
                return <TrackDirCategory cat={cat1} par={context.store} key={cat1.name} context={context} />;
            })}
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

TrackList.contextTypes = {
    store: React.PropTypes.object,
};

export default TrackList;
