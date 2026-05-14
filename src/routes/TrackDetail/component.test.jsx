import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { fireEvent, screen } from '@testing-library/react';
import { TrackDetail } from './component';
import { fixtureSubs } from '../../test/trackDetailFixtures';
import { renderWithProviders } from '../../test/renderWithProviders';

describe('TrackDetail', () => {
  it('renders track heading and subtitles', () => {
    renderWithProviders(
      <TrackDetail
        init={vi.fn()}
        location={{ hash: '' }}
        match={{ params: { id: 'abc123' } }}
        current_frame={0}
        current_word={{ rects: [] }}
        failed_word_rectangles={[]}
        force_current_frame={vi.fn()}
        frame_cnt={44100 * 3}
        is_playing={false}
        marked_word={null}
        playback_off={vi.fn()}
        playback_on={vi.fn()}
        sending_subs={false}
        sent_word_rectangles={[]}
        set_audio_metadata={vi.fn()}
        sync_current_time={vi.fn()}
        set_selection={vi.fn()}
        subs_chunks={[
          {
            is_humanic: true,
            str: fixtureSubs.map(word => word.occurrence).join(' '),
            char_offset: 0,
            word_offset: 0,
          },
        ]}
      />
    );

    expect(screen.getByRole('heading', { name: 'abc123' })).toBeInTheDocument();
    expect(screen.getByText(/prvni slovo druhe slovo konec/)).toBeInTheDocument();
  });

  it('toggles playback with Ctrl+Space', () => {
    const playback_on = vi.fn();
    const playback_off = vi.fn();

    renderWithProviders(
      <TrackDetail
        init={vi.fn()}
        location={{ hash: '' }}
        match={{ params: { id: 'abc123' } }}
        current_frame={0}
        current_word={{ rects: [] }}
        failed_word_rectangles={[]}
        force_current_frame={vi.fn()}
        frame_cnt={44100 * 3}
        is_playing={false}
        marked_word={null}
        playback_off={playback_off}
        playback_on={playback_on}
        sending_subs={false}
        sent_word_rectangles={[]}
        set_audio_metadata={vi.fn()}
        sync_current_time={vi.fn()}
        set_selection={vi.fn()}
        subs_chunks={[]}
      />
    );

    fireEvent.keyDown(document, { ctrlKey: true, code: 'Space', key: ' ' });
    expect(playback_on).toHaveBeenCalledTimes(1);
    expect(playback_off).not.toHaveBeenCalled();
  });
});
