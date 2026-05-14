import { expect, test } from '@playwright/test';

const subtitles = [
  { occurrence: 'prvni', wordform: 'prvni', timestamp: 0.0, humanic: true },
  { occurrence: 'slovo', wordform: 'slovo', timestamp: 0.5, humanic: true },
  { occurrence: 'druhe', wordform: 'druhe', timestamp: 1.1, humanic: false },
  { occurrence: 'slovo', wordform: 'slovo', timestamp: 1.7, humanic: false },
  { occurrence: 'konec', wordform: 'konec', timestamp: 2.4, humanic: true },
];

test('audio playback advances visible subtitle highlight', async ({ page }) => {
  // The app uses Web Audio directly. The fake context makes browser timing
  // deterministic while preserving the production click-to-play and sync path.
  await page.addInitScript(() => {
    class FakeAudioContext {
      constructor() {
        this.sampleRate = 24000;
        this.destination = {};
        this._startedAt = null;
      }

      get currentTime() {
        if (!this._startedAt) return 0;
        return (Date.now() - this._startedAt) / 1000;
      }

      createBufferSource() {
        const self = this;
        return {
          buffer: null,
          connect() {},
          disconnect() {},
          start() {
            if (!self._startedAt) self._startedAt = Date.now();
          },
          stop() {},
          addEventListener() {},
        };
      }

      createChannelSplitter() {
        return {
          connect() {},
        };
      }

      createConvolver() {
        return {
          connect() {},
          buffer: null,
        };
      }

      createBuffer() {
        const channels = new Map();
        return {
          getChannelData(channelIndex) {
            if (!channels.has(channelIndex)) {
              channels.set(channelIndex, new Float32Array(2048));
            }
            return channels.get(channelIndex);
          },
        };
      }

      decodeAudioData(_encodedAudio, callback) {
        callback({
          sampleRate: this.sampleRate,
          duration: 3,
          length: this.sampleRate * 3,
          numberOfChannels: 1,
        });
      }
    }

    window.AudioContext = FakeAudioContext;
    window.webkitAudioContext = FakeAudioContext;
  });

  await page.route('**/init**', async route => {
    await route.fulfill({
      contentType: 'application/javascript',
      body: `jsonp_init(${JSON.stringify({ subversions: { 'e2e-track': 'e2e' } })});`,
    });
  });

  await page.route('**/static/subs/e2e-track.sub.js**', async route => {
    await route.fulfill({
      contentType: 'application/javascript',
      body: `jsonp_subtitles(${JSON.stringify({ data: subtitles })});`,
    });
  });

  await page.route('**/split-meta/e2e-track.jsonp**', async route => {
    const chunks = [
      {
        basename: 'e2e-audio',
        from: 0,
        to: 3,
        duration: 3,
      },
    ];

    await route.fulfill({
      contentType: 'application/javascript',
      body: `jsonp_splits(${JSON.stringify({
        'e2e-track': {
          formats: {
            ogg: chunks,
            mp3: chunks,
          },
        },
      })});`,
    });
  });

  await page.route('**/splits/e2e-track/*/e2e-audio', async route => {
    await route.fulfill({
      contentType: 'application/octet-stream',
      body: Buffer.from([0, 1, 2, 3]),
    });
  });

  await page.goto('/zaznam/e2e-track');
  await expect(page.getByRole('heading', { name: 'e2e-track' })).toBeVisible({
    timeout: 10000
  });

  await expect(page.locator('.subs')).toContainText('prvni slovo druhe slovo konec', {
    timeout: 10000
  });

  // Start playback
  await page.locator('.control-bar button').first().click();
  
  // Wait for control bar to show time starting
  await expect(page.locator('.control-bar')).toContainText('00.');

  const firstRect = page.locator('.sub-rect').first();
  await expect(firstRect).toBeVisible({ timeout: 10000 });
  const firstBox = await firstRect.boundingBox();

  await expect.poll(async () => page.evaluate(() => window.location.hash), {
    message: 'playback should reflect current time in URL hash',
  }).not.toBe('');

  const moved = await page.waitForFunction(([x, y]) => {
    const rect = document.querySelector('.sub-rect');
    if (!rect) return false;
    const box = rect.getBoundingClientRect();
    return Math.abs(box.x - x) > 1 || Math.abs(box.y - y) > 1;
  }, [firstBox.x, firstBox.y], { timeout: 15000 });
  expect(moved).toBeTruthy();
});
