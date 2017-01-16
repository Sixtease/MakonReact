import React from 'react';
import './TrackList.scss';
import TrackDirCategory from './TrackDirCategory';
import stemdir from '../../store/stemdir.json';
import stemsec from '../../store/stemsec.json';

export class TrackList extends React.Component {
    render() {
        const context = this.context;
        const {is_dir_fixed,set_section_offset} = this.props;
        window.STORE = context.store;
        return (
            <div className='row tracklist'>

                <div
                    className='col-md-4 tracklist-directory'
                >
                    <ul
                        id="tracklist-directory-top-list"
                        className={is_dir_fixed ? 'is-fixed' : ''}
                    >
                        { stemdir.map((cat1) => {
                            return (
                                <TrackDirCategory
                                    cat={cat1}
                                    par={context.store}
                                    key={cat1.name}
                                    context={context}
                                />
                            );
                        })}
                    </ul>
                </div>

                <div className='col-md-8 tracklist-sections'>
                    { stemsec.map( (sec) => (
                        <section
                            id={sec.section}
                            key={sec.section}
                            ref={(el)=>{if (el) set_section_offset(sec.section,el.offsetTop)}}
                        >
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
        const {set_offset,scrolled_to} = this.props;
        if (!window.TRACKLIST_SCROLL_HANDLER) {
            const list = document.getElementById('tracklist-directory-top-list');
            if (list) {
                let offset = -window.scrollY - 55;
                for (let offsetEl = list; offsetEl; offsetEl = offsetEl.offsetParent) {
                    offset += offsetEl.offsetTop;
                }
                set_offset(offset);
                window.TRACKLIST_SCROLL_HANDLER = window.onscroll = function (evt) {
                    scrolled_to(evt.pageY);
                };
            }
        }
    }
};

TrackList.contextTypes = {
    store: React.PropTypes.object,
};

export default TrackList;
