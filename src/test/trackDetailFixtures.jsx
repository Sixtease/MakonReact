export const fixtureStem = 'test-track';

export const fixtureSubs = [
  { occurrence: 'prvni', wordform: 'prvni', timestamp: 0.0, humanic: true },
  { occurrence: 'slovo', wordform: 'slovo', timestamp: 0.5, humanic: true },
  { occurrence: 'druhe', wordform: 'druhe', timestamp: 1.1, humanic: false },
  { occurrence: 'slovo', wordform: 'slovo', timestamp: 1.7, humanic: false },
  { occurrence: 'konec', wordform: 'konec', timestamp: 2.4, humanic: true },
];

export const emptyCurrentWord = {
  is_null: true,
  occurrence: '',
  rects: [],
  start_offset: null,
  end_offset: null,
};

export function trackDetailState(overrides = {}) {
  return {
    track_detail: {
      subs: fixtureSubs,
      frame_cnt: 44100 * 3,
      current_time: 0,
      download_object_url: null,
      forced_time: null,
      is_playing: false,
      selection_start_chunk_index: null,
      selection_end_chunk_index: null,
      selection_start_icco: null,
      selection_end_icco: null,
      sent_word_rectangles: [],
      failed_word_rectangles: [],
      waiting_for_subversions: false,
      ...overrides,
    },
  };
}
