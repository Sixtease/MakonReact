import { createSelector } from 'reselect';
import get_subs from 'routes/TrackDetail/module/Selectors';
export const get_subs_str = createSelector(
    [get_subs],
    (subs) => return subs.map(sub=>sub.occurrence).join(' '),
);
