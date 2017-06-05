import React from 'react';
import { Link } from 'react-router';
import TrackDirCategory from './TrackDirCategory';
import stemdir from '../../store/stemdir.json';
import stemsec from '../../store/stemsec.json';

export class TrackList extends React.Component {
    render() {
        const context = this.context;
        const {is_dir_fixed,current_section} = this.props;
        return (
            <div className='row tracklist'>

                <div
                    className='col-xs-6 col-sm-4 tracklist-directory'
                >
                    <ul
                        id="tracklist-directory-top-list"
                        className={is_dir_fixed ? 'is-fixed' : ''}
                        ref={ (el) => {
                            this.tracklist_directory_top_list = el;
                        }}
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

                <div className='col-xs-6 col-sm-8 tracklist-sections'>
                    { stemsec.map( (sec) => (
                        <section
                            id={sec.section}
                            key={sec.section}
                            ref={(el)=>{
                                if (el) {
                                    this.section_offsets[sec.section] = el.offsetTop;
                                }
                            }}
                            className={sec.section === current_section ? 'is-current' : ''}
                        >
                            { sec.items.map( (item) => (
                                <Link to={`/zaznam/${item}`} key={item}>
                                    {item}
                                </Link>
                            ))}
                        </section>
                    )) }
                </div>

            </div>
        );
    }

    componentWillMount() {
        this.section_offsets = {};
    }

    componentDidMount() {
        let me = this;
        if (!window.TRACKLIST_SCROLL_HANDLER) {
            const list = me.tracklist_directory_top_list;
            if (list) {
                let offset = -55;
                for (let offsetEl = list; offsetEl; offsetEl = offsetEl.offsetParent) {
                    offset += offsetEl.offsetTop;
                }
                me.initial_offset = offset;
                window.TRACKLIST_SCROLL_HANDLER = window.onscroll = function (evt) {
                    me.scrolled_to(evt.pageY);
                };
            }
        }
    }

    scrolled_to(offset) {
        let me = this;
        let {make_dir_fixed,make_dir_static,set_current_section} = me.props;
        if (offset > me.initial_offset) {
            make_dir_fixed();
        }
        else {
            make_dir_static();
        }
        var current_section = { section: stemsec[0].section, offset: 0 };
        stemsec.some((item) => {
            let section = item.section;
            let section_offset = me.section_offsets[section];
            if (section_offset > offset - 128) {
                return true;
            }
            current_section = { section, offset: section_offset };
            return false;
        });
        set_current_section(current_section.section);
    }
};

TrackList.contextTypes = {
    store: React.PropTypes.object,
};

export default TrackList;
