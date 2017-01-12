import React from 'react';
import './TrackList.scss';
import TrackDirCategory, {attach_reducer} from './TrackDirCategory';
import stemdir from '../../store/stemdir.json';
import stemsec from '../../store/stemsec.json';

export class TrackList extends React.Component {
    render() {
        var props = this.props;
        var context = this.context;
        window.STORE = context.store;
        attach_reducer(context.store);
        return (
            <div className='row tracklist'>

                <div
                    className='col-md-4 tracklist-directory'
                >
                <ul id="tracklist-directory-top-list">
                    { stemdir.map((cat1) => {
                        return <TrackDirCategory cat={cat1} par={context.store} key={cat1.name} context={context} />;
                    })}
                </ul></div>

                <div className='col-md-8 tracklist-sections'>
                    { stemsec.map( (sec) => (
                        <section id={sec.section} key={sec.section}>
                            { sec.items.map( (item) => (
                                <a href={item} key={item}>{item}</a>
                            ))}
                        </section>
                    )) }
                </div>

            </div>
        );
    }

    componentDidMount() {
        if (!window.TRACKLIST_SCROLL_HANDLER) {
            const list = document.getElementById('tracklist-directory-top-list');
            if (list) {
                let offset = -window.scrollY;
                for (let offsetEl = list; offsetEl; offsetEl = offsetEl.offsetParent) {
                    offset += offsetEl.offsetTop;
                }
                window.TRACKLIST_SCROLL_HANDLER = window.onscroll = function (evt) {
                    if (evt.pageY > offset) {
                        list.className = 'is-fixed';
                    }
                    else {
                        list.className = '';
                    }
                };
            }
        }
    }
};

TrackList.contextTypes = {
    store: React.PropTypes.object,
};

export default TrackList;
