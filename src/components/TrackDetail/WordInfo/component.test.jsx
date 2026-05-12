import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import WordInfo from './component';
import { renderWithProviders } from '../../../test/renderWithProviders';

describe('WordInfo', () => {
  it('saves changed occurrence on blur', async () => {
    const save_word = vi.fn();
    const word = {
      occurrence: 'puvodni',
      wordform: 'puvodni',
      fonet: '',
      timestamp: 1.2,
    };

    renderWithProviders(<WordInfo word={word} stem="abc" save_word={save_word} />);

    const input = screen.getByRole('textbox');
    await userEvent.clear(input);
    await userEvent.type(input, 'nove');
    input.blur();

    expect(save_word).toHaveBeenCalledWith({
      occurrence: 'nove',
      timestamp: 1.2,
      fonet: '',
      stem: 'abc',
    });
  });

  it('does not save unchanged occurrence on blur', () => {
    const save_word = vi.fn();
    const word = {
      occurrence: 'stejne',
      wordform: 'stejne',
      fonet: '',
      timestamp: 1.2,
    };

    renderWithProviders(<WordInfo word={word} stem="abc" save_word={save_word} />);

    screen.getByRole('textbox').blur();

    expect(save_word).not.toHaveBeenCalled();
  });
});
