import { vi } from 'vitest';
import '@testing-library/jest-dom/vitest';
import React from 'react';

vi.mock('canvas-equalizer', () => {
  class CanvasEqualizerMock {
    constructor() {
      this.convolver = {
        connect: vi.fn(),
      };
    }

    loadLocale() {}

    createControl() {}

    destroyControl() {}
  }

  return {
    default: CanvasEqualizerMock,
  };
});

vi.mock(
  'lucide-react',
  () => {
    const Icon = ({ children, ...props }) =>
      React.createElement('svg', props, children);
    return {
      Check: Icon,
      Download: Icon,
      Play: Icon,
      Square: Icon,
    };
  },
  { virtual: true }
);

beforeEach(() => {
  localStorage.clear();
  window.KEY_PLAYBACK_CTRL = null;
  window.KEY_SEND_SUBS_CTRL = null;
});

window.scrollTo = vi.fn();

if (!window.AudioContext) {
  window.AudioContext = class AudioContextMock {
    constructor() {
      this.sampleRate = 44100;
      this.currentTime = 0;
      this.destination = {};
    }

    createBufferSource() {
      return {
        connect: vi.fn(),
        disconnect: vi.fn(),
        start: vi.fn(),
        stop: vi.fn(),
        addEventListener: vi.fn(),
      };
    }

    createChannelSplitter() {
      return {
        connect: vi.fn(),
      };
    }

    decodeAudioData(_buffer, callback) {
      callback({});
    }
  };
}

if (!window.document.createRange) {
  window.document.createRange = () => ({
    setStart: vi.fn(),
    setEnd: vi.fn(),
    getClientRects: () => [],
  });
}
