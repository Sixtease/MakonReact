import React from 'react';

export class TrackDirCategoryView extends React.Component {
    is_visible() {
        const {cat, visible} = this.props;
        if (!visible[cat.key]) {
            return 'none';
        }
        return visible[cat.key].visible ? 'block' : 'none';
    }
    section_link() {
        var me = this;
        const {cat,current_section} = me.props;
        const cl = current_section === cat.section ? 'is-current' : '';
        return (<li className={cl}>
            <a href={'#'+cat.section}>
                {cat.name}
            </a>
        </li>);
    }
    directory() {
        const me = this;
        const {cat, visible, toggle_visible, current_section} = me.props;
        return (<li>
            <div>
                <label onClick={toggle_visible.bind(me,cat)}>{cat.name}</label>
                <ul style={{display: me.is_visible()}}>
                    { cat.items.map((subcat) => (
                        <TrackDirCategoryView
                            cat={subcat}
                            key={subcat.key}
                            visible={visible}
                            toggle_visible={toggle_visible}
                            current_section={current_section}
                        />
                    ))}
                </ul>
            </div>
        </li>);
    }
    render() {
        const me = this;
        const {cat, visible, toggle_visible} = me.props;
        if (cat.section) {
            return me.section_link();
        }
        else {
            return me.directory();
        }
    }
};

export default TrackDirCategoryView;
