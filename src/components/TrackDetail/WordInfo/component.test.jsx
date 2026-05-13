import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { fireEvent, screen } from '@testing-library/react';
import WordInfo from './component';
import { renderWithProviders } from '../../../test/renderWithProviders';

describe('WordInfo', () => {
  it('saves changed occurrence on blur', () => {
    const save_word = vi.fn();
    const word = {
      occurrence: 'puvodni',
      wordform: 'puvodni',
      fonet: '',
      timestamp: 1.2,
    };

    const { rerender } = renderWithProviders(
      <WordInfo word={null} stem="abc" save_word={save_word} />
    );

    rerender(<WordInfo word={word} stem="abc" save_word={save_word} />);

    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: 'nove' } });
    fireEvent.blur(input);

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

    const { rerender } = renderWithProviders(
      <WordInfo word={null} stem="abc" save_word={save_word} />
    );
    rerender(<WordInfo word={word} stem="abc" save_word={save_word} />);

    fireEvent.blur(screen.getByRole('textbox'));

    expect(save_word).not.toHaveBeenCalled();
  });
});
