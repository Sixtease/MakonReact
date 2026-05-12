import { describe, expect, it } from 'vitest';
import { get_current_word, get_subs_chunks } from './selectors';
import { trackDetailState } from '../../../test/trackDetailFixtures';

describe('track detail selectors', () => {
  it('groups adjacent subtitles by humanic flag', () => {
    const chunks = get_subs_chunks(trackDetailState());

    expect(chunks.chunks).toEqual([
      {
        is_humanic: true,
        str: 'prvni slovo ',
        char_offset: 0,
        word_offset: 0,
      },
      {
        is_humanic: false,
        str: 'druhe slovo ',
        char_offset: 12,
        word_offset: 2,
      },
      {
        is_humanic: true,
        str: 'konec ',
        char_offset: 24,
        word_offset: 4,
      },
    ]);

    expect(chunks.chunk_index_by_word_index).toEqual([0, 0, 1, 1, 2]);
    expect(chunks.icco_by_word_index).toEqual([0, 6, 0, 6, 0]);
  });

  it('selects current word from current_time', () => {
    const current = get_current_word(trackDetailState({ current_time: 1.15 }));

    expect(current.occurrence).toBe('druhe');
    expect(current.timestamp).toBe(1.1);
  });
});
