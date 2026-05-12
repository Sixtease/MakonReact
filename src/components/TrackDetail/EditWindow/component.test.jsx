import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
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
    renderWithProviders(
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

  it('submits edited subtitles', async () => {
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
    await userEvent.clear(textarea);
    await userEvent.type(textarea, 'upraveny text');
    await userEvent.click(screen.getByTitle('odeslat'));

    expect(onSubmit).toHaveBeenCalledWith({ edited_subtitles: 'upraveny text' });
  });
});
