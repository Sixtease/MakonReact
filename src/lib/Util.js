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

export function demagicize_rect(rect) {
    return {
        top:    rect.top,
        right:  rect.right,
        bottom: rect.bottom,
        left:   rect.left,
        x:      rect.x,
        y:      rect.y,
    };
}

export function demagicize_rects(rects) {
    return to_array(rects).map(r => demagicize_rect(r));
}
