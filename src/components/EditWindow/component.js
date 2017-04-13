import React from 'react';

export class EditWindow extends React.Component {
    render() {
        const me = this;
        const selw = me.props.selected_words;
        let cls = 'edit-window';
        if (selw.length > 0) {
            cls += ' is-shown';
        }
        return (<p className={cls}>{selw.map((w)=>[w.occurrence,w.index].join(':')).join(' ')}</p>);
    }
};

export default EditWindow;
