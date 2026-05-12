import React from 'react';
import { describe, expect, it } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { UsernameInput } from './component';
import { renderWithProviders } from '../../test/renderWithProviders';

describe('UsernameInput', () => {
  it('initializes from localStorage and persists changes', async () => {
    localStorage.setItem('username', 'Jan');
    renderWithProviders(<UsernameInput />);

    const input = screen.getByRole('textbox');
    expect(input).toHaveValue('Jan');

    await userEvent.clear(input);
    await userEvent.type(input, 'Karel');

    expect(localStorage.getItem('username')).toBe('Karel');
  });
});
