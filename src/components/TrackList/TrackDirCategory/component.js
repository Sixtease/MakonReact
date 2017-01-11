import React from 'react';

const is_visible = (cat, state) => {
    if (!state[cat.key]) {
        return 'none';
    }
    return state[cat.key].visible ? 'block' : 'none';
};

export const TrackDirCategoryView = ({cat, visible, toggle_visible}) => (
    <li>
        { cat.section
            ? (
                <a href={'#'+cat.section}>
                    {cat.name}
                </a>
            )
            : (
                <div>
                    <label onClick={toggle_visible.bind(this,cat)}>{cat.name}</label>
                    <ul style={{display: is_visible(cat, visible)}}>
                        { cat.items.map((subcat) => (
                            <TrackDirCategoryView cat={subcat} visible={visible} toggle_visible={toggle_visible} />
                        ))}
                    </ul>
                </div>
            )
        }
    </li>
);

export default TrackDirCategoryView;
