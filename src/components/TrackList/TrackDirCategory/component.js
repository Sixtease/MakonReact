import React from 'react';

export class TrackDirCategoryView extends React.Component {
    is_visible() {
        const {cat, visible} = this.props;
        if (!visible[cat.key]) {
            return 'none';
        }
        return visible[cat.key].visible ? 'block' : 'none';
    }
    render() {
        const me = this;
        const {cat, visible, toggle_visible} = me.props;
        return (<li>
            { cat.section
                ? (
                    <a href={'#'+cat.section}>
                        {cat.name}
                    </a>
                )
                : (
                    <div>
                        <label onClick={toggle_visible.bind(me,cat)}>{cat.name}</label>
                        <ul style={{display: me.is_visible()}}>
                            { cat.items.map((subcat) => (
                                <TrackDirCategoryView
                                    cat={subcat}
                                    visible={visible}
                                    toggle_visible={toggle_visible}
                                />
                            ))}
                        </ul>
                    </div>
                )
            }
        </li>);
    }
};

export default TrackDirCategoryView;
