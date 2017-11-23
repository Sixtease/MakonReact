export function to_array(list) {
    if (!list || !list.length) {
        return [];
    }
    const rv = new Array(list.length);
    for (let i = 0; i < list.length; i++) {
        rv[i] = list[i];
    }
    return rv;
}

export function demagicize_rect(rect, x_offset, y_offset) {
    return {
        abs_x:  rect.left + x_offset,
        abs_y:  rect.top  + y_offset,
        top:    rect.top,
        right:  rect.right,
        bottom: rect.bottom,
        left:   rect.left,
        x:      rect.x,
        y:      rect.y,
    };
}

export function demagicize_rects(rects, x_offset, y_offset) {
    return to_array(rects).map(r => demagicize_rect(r, x_offset, y_offset));
}
