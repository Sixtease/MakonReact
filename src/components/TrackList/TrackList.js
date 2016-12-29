import React from 'react';
import { Link } from 'react-router';
import './TrackList.scss';

export const TrackList = () => (
    <div className='row'>
        <div className='col-xs-12'>
            track list toť
            <ul><li><Link to='/nahravka/85-05A'>85-05A</Link></li></ul>
        </div>
    </div>
);

export default TrackList;
