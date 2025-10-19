import React from 'react';
import TrackList from '../../../components/TrackList';
import './HomeView.scss';

export const HomeView = () => (
  <div className="home-view">
    <h1>Seznam nahrávek Karla Makoně</h1>
    <TrackList />
  </div>
);
