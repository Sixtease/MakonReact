# Test Safety Net Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a focused regression test set that protects the modernization work, including the app's core audio playback and subtitle sync behavior.

**Architecture:** Use Vitest and React Testing Library for fast unit/component tests, and Playwright for one deterministic browser-level smoke test. Keep tests narrow and behavior-focused so they survive the CRA to Vite migration and the `redux-form` removal.

**Tech Stack:** Vitest, React Testing Library, jsdom, Playwright, Vite-compatible test config, npm scripts.

---

## Scope

This plan creates a balanced test set, not blanket coverage. It should catch regressions in the modernization work without turning the upgrade into a large testing project.

The test set covers:

- Pure subtitle/time behavior.
- Lightweight form behavior around `redux-form` removal.
- Route/component rendering basics.
- One browser E2E test for audio playback with subtitles moving in sync.

## File Structure

Create:

- `src/test/setup.js`: shared test setup for jsdom, localStorage cleanup, and DOM mocks.
- `src/test/renderWithProviders.js`: helper to render React components with Redux and router providers.
- `src/test/trackDetailFixtures.js`: small deterministic subtitle and audio metadata fixtures shared by component and E2E tests.
- `src/routes/TrackDetail/module/selectors.test.js`: tests subtitle chunking and current-word selection by time.
- `src/components/UsernameInput/component.test.js`: tests username persistence behavior.
- `src/components/TrackDetail/WordInfo/component.test.js`: tests save-on-blur behavior.
- `src/components/TrackDetail/EditWindow/component.test.js`: tests selected-word autofill and submit payload.
- `src/routes/TrackDetail/component.test.js`: verifies basic track detail rendering with fixture props.
- `e2e/audio-subtitle-sync.spec.js`: Playwright test for playback causing visible subtitle/current-word progression.
- `playwright.config.js`: browser test configuration.

Modify:

- `package.json`: add test dependencies and scripts.
- `docs/modernization-plan.md`: add this plan as the test execution reference.

## Dependencies and Scripts

Add dev dependencies:

```bash
npm install --save-dev vitest @testing-library/react @testing-library/jest-dom @testing-library/user-event jsdom @vitejs/plugin-react playwright
```

Update `package.json` scripts:

```json
{
  "test": "vitest run",
  "test:watch": "vitest",
  "test:e2e": "playwright test",
  "test:all": "npm run test && npm run test:e2e"
}
```

During the pre-Vite CRA phase, use a separate `vitest.config.js`. After Vite migration, merge the test config into `vite.config.js`.

Create `vitest.config.js`:

```js
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: './src/test/setup.js',
    globals: true,
  },
});
```

## Task 1: Test Harness

**Files:**

- Create: `vitest.config.js`
- Create: `src/test/setup.js`
- Create: `src/test/renderWithProviders.js`
- Modify: `package.json`

- [ ] **Step 1: Add dependencies**

Run:

```bash
npm install --save-dev vitest @testing-library/react @testing-library/jest-dom @testing-library/user-event jsdom @vitejs/plugin-react playwright
```

Expected: `package.json` and `package-lock.json` contain the new dev dependencies.

- [ ] **Step 2: Add Vitest config**

Create `vitest.config.js` with:

```js
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: './src/test/setup.js',
    globals: true,
  },
});
```

- [ ] **Step 3: Add shared jsdom setup**

Create `src/test/setup.js` with:

```js
import '@testing-library/jest-dom/vitest';

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
```

- [ ] **Step 4: Add provider render helper**

Create `src/test/renderWithProviders.js` with:

```js
import React from 'react';
import { Provider } from 'react-redux';
import { MemoryRouter, Route } from 'react-router-dom';
import { applyMiddleware, createStore } from 'redux';
import thunk from 'redux-thunk';
import { render } from '@testing-library/react';
import { rootReducer } from '../store/reducers';

export function createTestStore(preloadedState) {
  return createStore(rootReducer, preloadedState, applyMiddleware(thunk));
}

export function renderWithProviders(
  ui,
  {
    route = '/',
    path = '/',
    store = createTestStore(),
  } = {}
) {
  return {
    store,
    ...render(
      <Provider store={store}>
        <MemoryRouter initialEntries={[route]}>
          <Route path={path}>{ui}</Route>
        </MemoryRouter>
      </Provider>
    ),
  };
}
```

- [ ] **Step 5: Update scripts**

Modify `package.json` scripts to include:

```json
{
  "test": "vitest run",
  "test:watch": "vitest",
  "test:e2e": "playwright test",
  "test:all": "npm run test && npm run test:e2e"
}
```

Keep `build` and `start` as they are until the Vite migration task changes them.

- [ ] **Step 6: Run empty suite**

Run:

```bash
npm run test
```

Expected: Vitest starts successfully and reports no test files found or passes once the first tests are added.

- [ ] **Step 7: Commit**

Run:

```bash
git add package.json package-lock.json vitest.config.js src/test/setup.js src/test/renderWithProviders.js
git commit -m "test: add frontend test harness"
```

## Task 2: Subtitle and Time Unit Tests

**Files:**

- Create: `src/test/trackDetailFixtures.js`
- Create: `src/routes/TrackDetail/module/selectors.test.js`

- [ ] **Step 1: Add deterministic subtitle fixtures**

Create `src/test/trackDetailFixtures.js` with:

```js
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
```

- [ ] **Step 2: Test subtitle chunk grouping**

Create `src/routes/TrackDetail/module/selectors.test.js` with:

```js
import { describe, expect, it } from 'vitest';
import { get_current_word, get_subs_chunks } from './selectors';
import { trackDetailState } from '../../../test/trackDetailFixtures';

describe('track detail selectors', () => {
  it('groups adjacent subtitles by humanic flag', () => {
    const chunks = get_subs_chunks(trackDetailState());

    expect(chunks.chunks).toEqual([
      {
        is_humanic: true,
        str: 'prvni slovo',
        char_offset: 0,
        word_offset: 0,
      },
      {
        is_humanic: false,
        str: 'druhe slovo',
        char_offset: 11,
        word_offset: 2,
      },
      {
        is_humanic: true,
        str: 'konec',
        char_offset: 22,
        word_offset: 4,
      },
    ]);

    expect(chunks.chunk_index_by_word_index).toEqual([0, 0, 1, 1, 2]);
    expect(chunks.icco_by_word_index).toEqual([0, 6, 0, 6, 0]);
  });

  it('selects current word from current_time', () => {
    const current = get_current_word(trackDetailState({ current_time: 1.15 }));

    expect(current.occurrence).toBe('druhe');
    expect(current.timestamp).toBe(1.1);
  });
});
```

- [ ] **Step 3: Run selector tests**

Run:

```bash
npm run test -- src/routes/TrackDetail/module/selectors.test.js
```

Expected: both tests pass.

- [ ] **Step 4: Commit**

Run:

```bash
git add src/test/trackDetailFixtures.js src/routes/TrackDetail/module/selectors.test.js
git commit -m "test: cover subtitle timing selectors"
```

## Task 3: Form Behavior Component Tests

**Files:**

- Create: `src/components/UsernameInput/component.test.js`
- Create: `src/components/TrackDetail/WordInfo/component.test.js`
- Create: `src/components/TrackDetail/EditWindow/component.test.js`

- [ ] **Step 1: Test username persistence**

Create `src/components/UsernameInput/component.test.js` with:

```js
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
```

- [ ] **Step 2: Test word save on blur**

Create `src/components/TrackDetail/WordInfo/component.test.js` with:

```js
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
```

- [ ] **Step 3: Test edit window autofill and submit payload**

Create `src/components/TrackDetail/EditWindow/component.test.js` with:

```js
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
```

- [ ] **Step 4: Run form tests**

Run:

```bash
npm run test -- src/components/UsernameInput/component.test.js src/components/TrackDetail/WordInfo/component.test.js src/components/TrackDetail/EditWindow/component.test.js
```

Expected: tests pass after `redux-form` is removed. Before that migration, these tests may fail because the current components rely on `Field`, `reduxForm`, and `autofill`; keep them as the target behavior for the form migration.

- [ ] **Step 5: Commit**

Run:

```bash
git add src/components/UsernameInput/component.test.js src/components/TrackDetail/WordInfo/component.test.js src/components/TrackDetail/EditWindow/component.test.js
git commit -m "test: cover lightweight form behavior"
```

## Task 4: Track Detail Rendering Smoke Test

**Files:**

- Create: `src/routes/TrackDetail/component.test.js`

- [ ] **Step 1: Add rendering smoke test**

Create `src/routes/TrackDetail/component.test.js` with:

```js
import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { screen } from '@testing-library/react';
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
});
```

- [ ] **Step 2: Run smoke test**

Run:

```bash
npm run test -- src/routes/TrackDetail/component.test.js
```

Expected: track heading and subtitle text render.

- [ ] **Step 3: Commit**

Run:

```bash
git add src/routes/TrackDetail/component.test.js
git commit -m "test: cover track detail render smoke"
```

## Task 5: E2E Harness for Audio and Subtitle Sync

**Files:**

- Create: `playwright.config.js`
- Create: `e2e/audio-subtitle-sync.spec.js`
- Modify: `package.json`

### Design

The E2E test should verify user-visible behavior, not acoustic output. It should assert:

- The app starts on a track detail route.
- Fixture subtitles are visible.
- Clicking play changes playback state.
- Current time advances.
- Current subtitle highlight moves from the first fixture word to a later fixture word.
- URL hash reflects playback time.

The test should control network responses for subtitle metadata and audio metadata. The app uses Web Audio directly, not an `<audio>` element, so install a deterministic fake `AudioContext` with Playwright before the app loads. That keeps the production UI path intact: the user clicks play, `audio().play()` schedules a buffer source, the app's `ontimeupdate` interval dispatches `sync_current_time`, the URL hash updates, and the subtitle highlight moves.

- [ ] **Step 1: Add Playwright config**

Create `playwright.config.js` with:

```js
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  timeout: 30000,
  fullyParallel: false,
  use: {
    baseURL: 'http://127.0.0.1:3000',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  webServer: {
    command: 'npm start',
    url: 'http://127.0.0.1:3000',
    reuseExistingServer: true,
    timeout: 120000,
  },
  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        launchOptions: {
          args: ['--autoplay-policy=no-user-gesture-required'],
        },
      },
    },
  ],
});
```

After Vite migration, change `baseURL` and `webServer.url` to the Vite port if the project does not use port 3000.

- [ ] **Step 2: Add E2E route interception**

Create `e2e/audio-subtitle-sync.spec.js` with the initial routing skeleton:

```js
import { expect, test } from '@playwright/test';

const subtitles = [
  { occurrence: 'prvni', wordform: 'prvni', timestamp: 0.0, humanic: true },
  { occurrence: 'slovo', wordform: 'slovo', timestamp: 0.5, humanic: true },
  { occurrence: 'druhe', wordform: 'druhe', timestamp: 1.1, humanic: false },
  { occurrence: 'slovo', wordform: 'slovo', timestamp: 1.7, humanic: false },
  { occurrence: 'konec', wordform: 'konec', timestamp: 2.4, humanic: true },
];

test('audio playback advances visible subtitle highlight', async ({ page }) => {
  await page.addInitScript(() => {
    class FakeAudioContext {
      constructor() {
        this.sampleRate = 24000;
        this.destination = {};
        this._startedAt = Date.now();
      }

      get currentTime() {
        return (Date.now() - this._startedAt) / 1000;
      }

      createBufferSource() {
        return {
          buffer: null,
          connect() {},
          disconnect() {},
          start() {},
          stop() {},
          addEventListener() {},
        };
      }

      createChannelSplitter() {
        return {
          connect() {},
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

  await expect(page.getByRole('heading', { name: 'e2e-track' })).toBeVisible();
  await expect(page.locator('.subs')).toContainText('prvni slovo druhe slovo konec');
});
```

- [ ] **Step 3: Explain the fake Web Audio contract**

Keep this note in `e2e/audio-subtitle-sync.spec.js` above the `addInitScript` block:

```js
// The app uses Web Audio directly. The fake context makes browser timing
// deterministic while preserving the production click-to-play and sync path.
```

Expected: the test does not need a real encoded audio file. It only needs `decodeAudioData` to resolve and `currentTime` to advance after playback starts.

- [ ] **Step 4: Assert visible subtitle progression**

Add assertions to `e2e/audio-subtitle-sync.spec.js`:

```js
const firstRect = page.locator('.sub-rect').first();
await expect(firstRect).toBeVisible();
const firstBox = await firstRect.boundingBox();

await page.getByRole('button').first().click();
await expect(page.locator('.control-bar')).toContainText('0:00');

await expect.poll(async () => page.evaluate(() => window.location.hash), {
  message: 'playback should reflect current time in URL hash',
}).not.toBe('');

const moved = await page.waitForFunction(([x, y]) => {
  const rect = document.querySelector('.sub-rect');
  if (!rect) return false;
  const box = rect.getBoundingClientRect();
  return Math.abs(box.x - x) > 1 || Math.abs(box.y - y) > 1;
}, [firstBox.x, firstBox.y]);
expect(moved).toBeTruthy();
```

- [ ] **Step 5: Run E2E test**

Run:

```bash
npm run test:e2e -- e2e/audio-subtitle-sync.spec.js
```

Expected: Chromium opens the app, route fixtures are served, subtitles render, playback starts, current time changes, and the `.sub-rect` highlight moves.

- [ ] **Step 6: Commit**

Run:

```bash
git add playwright.config.js e2e/audio-subtitle-sync.spec.js package.json package-lock.json
git commit -m "test: add audio subtitle sync e2e"
```

## Task 6: Wire Tests Into Modernization Workflow

**Files:**

- Modify: `docs/modernization-plan.md`
- Modify: `README.md`

- [ ] **Step 1: Update modernization plan verification**

In `docs/modernization-plan.md`, update the verification checklist to include:

```markdown
- `npm run test` passes.
- `npm run test:e2e` passes in Chromium.
- Audio subtitle sync E2E verifies visible current-word progression during playback.
```

- [ ] **Step 2: Document test commands**

Add to `README.md`:

```markdown
### Tests

Run unit and component tests:

```bash
npm run test
```

Run browser E2E tests:

```bash
npm run test:e2e
```

Run the full regression set:

```bash
npm run test:all
```
```

- [ ] **Step 3: Run full verification**

Run:

```bash
npm run test
npm run test:e2e
npm run build
```

Expected: all tests pass and the production build succeeds.

- [ ] **Step 4: Commit**

Run:

```bash
git add docs/modernization-plan.md README.md
git commit -m "docs: document modernization test workflow"
```

## Implementation Notes

The component test snippets describe the desired post-`redux-form` behavior. They may fail before the form migration. That is acceptable if the implementation order is:

1. Add harness and selector tests.
2. Remove `redux-form` while adding the form tests.
3. Add track detail smoke test.
4. Add E2E audio/subtitle sync.

The E2E test should avoid asserting exact milliseconds. Use visible state changes and tolerance-based timing. The core assertion is that playback causes the same UI a user relies on, the subtitle highlight, to advance from an earlier word to a later word.

## Completion Criteria

This plan is complete when:

- `npm run test` passes.
- `npm run test:e2e` passes in Chromium.
- `npm run build` passes.
- The audio/subtitle E2E test proves that playback advances visible subtitle highlighting.
- The modernization checklist references this test suite as a required gate.
