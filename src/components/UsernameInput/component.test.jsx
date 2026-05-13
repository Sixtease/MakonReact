import React from 'react';
import { describe, expect, it } from 'vitest';
import { fireEvent, screen } from '@testing-library/react';
import { UsernameInput } from './component';
import { renderWithProviders } from '../../test/renderWithProviders';

describe('UsernameInput', () => {
  it('initializes from helper and persists changes', async () => {
    localStorage.setItem('username', 'Jan');
    renderWithProviders(<UsernameInput />);

    const input = screen.getByRole('textbox');
    expect(input).toHaveValue('Jan');
    fireEvent.change(input, { target: { value: 'Karel' } });
    fireEvent.blur(input);

    expect(localStorage.getItem('username')).toBe('Karel');
    expect(input).toHaveValue('Karel');
  });
});
