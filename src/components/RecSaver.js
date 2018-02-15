import React from 'react';
import { connect } from 'react-redux';
import { store_stem } from 'routes/TrackDetail/module/action-creators';

const UnconnectedRecSaver = ({
    stem,
    storable_stem,
    stored_stem,
    store_stem,
    storing_stem,
}) => {
    if (storing_stem) {
        return <div>ukládám...</div>;
    }
    else if (stored_stem === stem) {
        return <div>✓ uloženo v prohlížeči</div>;
    }
    else if (storable_stem) {
        return <div>
            <button onClick={() => store_stem(stem)}>uložit v prohlížeči</button>
        </div>;
    }
    else {
        return null;
    }
};

const map_state_to_props = state => ({
    storable_stem: state.track_detail.storable_stem,
    stored_stem: state.track_detail.stored_stem,
    storing_stem: state.track_detail.storing_stem,
});

const map_dispatch_to_props = {
    store_stem,
};

const RecSaver = connect(map_state_to_props, map_dispatch_to_props)(UnconnectedRecSaver);
export default RecSaver;
