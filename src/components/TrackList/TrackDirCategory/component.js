import React from 'react';

export const TrackDirCategoryView = ({cat}) => (
    <li key={cat.name}>
        { cat.section
            ? (
                <a href={'#'+cat.section}>
                    {cat.name}
                </a>
            )
            : (
                <div>
                    <label>{cat.name}</label>
                    <ul>
                        { cat.items.map((subcat) => (
                            <TrackDirCategoryView cat={subcat} />
                        ))}
                    </ul>
                </div>
            )
        }
    </li>
);

TrackDirCategoryView.contextTypes = {
    store: React.PropTypes.object,
};

export default TrackDirCategoryView;
