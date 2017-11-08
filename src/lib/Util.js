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
