import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { fireEvent, screen } from '@testing-library/react';
import EditWindow from './component';
import { renderWithProviders } from '../../../test/renderWithProviders';

function selectedWords(words) {
  return words.map((occurrence, i) => ({
    occurrence,
    timestamp: i,
  }));
}

describe('EditWindow', () => {
  it('autofills textarea from selected words', () => {
    const { rerender } = renderWithProviders(
      <EditWindow
        selected_words={[]}
        edit_window_timespan={{ start: 0, end: 1 }}
        is_playing={false}
        playback_on={vi.fn()}
        playback_off={vi.fn()}
        download_edit_window={vi.fn()}
        onSubmit={vi.fn()}
        stem="abc"
      />
    );

    rerender(
      <EditWindow
        selected_words={selectedWords(['jedna', 'dve'])}
        edit_window_timespan={{ start: 0, end: 1 }}
        is_playing={false}
        playback_on={vi.fn()}
        playback_off={vi.fn()}
        download_edit_window={vi.fn()}
        onSubmit={vi.fn()}
        stem="abc"
      />
    );

    expect(screen.getByRole('textbox')).toHaveValue('jedna dve');
  });

  it('submits edited subtitles', () => {
    const onSubmit = vi.fn();

    renderWithProviders(
      <EditWindow
        selected_words={selectedWords(['jedna', 'dve'])}
        edit_window_timespan={{ start: 0, end: 1 }}
        is_playing={false}
        playback_on={vi.fn()}
        playback_off={vi.fn()}
        download_edit_window={vi.fn()}
        onSubmit={onSubmit}
        stem="abc"
      />
    );

    const textarea = screen.getByRole('textbox');
    fireEvent.change(textarea, { target: { value: 'upraveny text' } });
    fireEvent.click(screen.getByTitle('odeslat'));

    expect(onSubmit).toHaveBeenCalledTimes(1);
    const [values] = onSubmit.mock.calls[0];
    expect(values).toEqual(expect.objectContaining({ edited_subtitles: 'upraveny text' }));
  });
});
