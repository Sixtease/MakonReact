# MakonReact Modernization Plan

Date: 2026-05-12

## Goal

Modernize the repository enough to keep the app maintainable for the coming years, clear the current GitHub security noise, and avoid unnecessary behavior changes. The goal is a stable, boring stack, not the newest possible React ecosystem.

## Current State

The app is a Create React App project using `react-scripts@5.0.1`. The production build currently succeeds, but `npm audit` reports many transitive vulnerabilities. The open Dependabot PRs are mostly lockfile-only updates for packages under the CRA toolchain, including Webpack, Workbox, SVGO, Jest, PostCSS-related packages, `follow-redirects`, `node-forge`, `lodash`, and similar transitive dependencies.

The important conclusion is that the individual Dependabot PRs are symptoms. The main obsolete package is `react-scripts`, and there is no newer CRA line to upgrade to. Merging those PRs one by one would reduce some audit output temporarily, but would leave the app on an unsupported build stack.

## Recommended Direction

Replace Create React App with Vite, keep React 18 for the first pass, and remove `redux-form` during the same modernization wave.

This is now preferable to keeping `redux-form` temporarily because it is used very lightly:

- `src/components/UsernameInput/component.js`: one username input backed by `localStorage`.
- `src/components/TrackDetail/WordInfo/component.js`: one editable occurrence field saved on blur.
- `src/components/TrackDetail/EditWindow/component.js`: one textarea submitted by button or Ctrl+Enter.
- `src/store/reducers.js`: includes the `redux-form` reducer only to support those components.

Removing `redux-form` unlocks straightforward upgrades to modern Redux packages and avoids pinning the app to old `react-redux` and `redux` versions just for three simple inputs.

## Target Stack

Use this as the first modernization target:

```json
{
  "engines": {
    "node": ">=22.12 <25"
  },
  "dependencies": {
    "audiobuffer-to-wav": "^1.0.0",
    "canvas-equalizer": "^0.2.0",
    "fetch-jsonp": "^1.4.0",
    "lucide-react": "^0.x",
    "normalize.css": "^8.0.1",
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "react-markdown": "^10.1.0",
    "react-redux": "^9.2.0",
    "react-router": "^5.3.4",
    "react-router-dom": "^5.3.4",
    "redux": "^5.0.1",
    "redux-thunk": "^3.1.0",
    "reselect": "^5.1.1"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^5.1.2",
    "sass": "^1.99.0",
    "vite": "^7.3.3"
  }
}
```

Keep React Router 5 initially. The app uses `withRouter`, v5 `Route component=`, and a custom `Router.prototype` patch, so a router migration should be a separate behavior-sensitive step.

Keep React 18 initially. React 19 can be evaluated after the build and state stack are stable.

## Concrete Migration Steps

### 0. Add a Focused Test Safety Net

Before changing the build stack or removing `redux-form`, implement the test plan in `docs/superpowers/plans/2026-05-12-test-safety-net.md`.

The test set should cover subtitle/time selectors, the lightweight form behaviors affected by `redux-form` removal, track detail rendering, and one Playwright E2E test proving that playback advances visible subtitle highlighting.

### 1. Replace CRA With Vite

- Remove `react-scripts`.
- Add `vite` and `@vitejs/plugin-react`.
- Move `public/index.html` to `index.html`.
- Replace CRA `%PUBLIC_URL%` placeholders with normal root-relative paths:
  - `/favicon.ico`
  - `/manifest.json`
- Add `<script type="module" src="/src/index.js"></script>` to `index.html`.
- Add `vite.config.js`.
- Update scripts:

```json
{
  "start": "vite",
  "build": "vite build",
  "preview": "vite preview",
  "lint": "eslint src/"
}
```

- Remove the `eject` script.

### 2. Remove CRA-Specific Store Loading

Replace `src/store/configureStore.js`, which currently switches between CommonJS `require()` calls based on `process.env.NODE_ENV`.

The dev and production store files are effectively identical, so collapse them into one ESM implementation:

- Keep one `configureStore.js`.
- Remove `configureStore.dev.js` and `configureStore.prod.js` if no longer needed.
- Do not rely on CRA's `process.env` replacement.

### 3. Fix Style Imports for Vite

CRA/Webpack accepts Sass imports like:

```scss
@import '~normalize.css/normalize';
```

Vite does not use the Webpack `~` convention.

Recommended change:

- Import normalize from `src/index.js`:

```js
import 'normalize.css/normalize.css';
```

- Remove the normalize import from `src/styles/core.scss`.
- Keep the vendored Bootstrap 3 SCSS for now. Replacing Bootstrap is visual and behavioral work, not required for the security goal.

### 4. Remove `redux-form`

Use plain controlled components rather than adding a new form library. These forms are too small for `react-hook-form` or another dependency.

Add a tiny username helper, for example `src/lib/username.js`:

- `get_username()`
- `set_username(value)`
- backed by `localStorage`

Rewrite `UsernameInput`:

- Use local component state.
- Initialize from `get_username()`.
- On change, update state and `localStorage`.

Rewrite `WordInfo`:

- Keep local `occurrence` state.
- When `word` changes, sync local state from `word.occurrence`.
- On blur, compare against the original `word.occurrence`.
- Call `save_word(...)` only when the value changed.

Rewrite `EditWindow`:

- Keep `edited_subtitles` in local component state.
- When `selected_words` changes, set the textarea to selected occurrences joined by spaces.
- Submit button and Ctrl+Enter call an explicit submit prop with `{ edited_subtitles }`.

Adjust `EditWindow/index.js` and `EditWindow/module.js`:

- Stop relying on `redux-form`'s `onSubmit(values, dispatch, props)` convention.
- Use an explicit prop-aware dispatch wrapper.
- Replace `state.form.username.values.username` with `get_username()`.

Remove `redux-form` from:

- `package.json`
- `package-lock.json`
- `src/store/reducers.js`

Remove the `form` reducer from `combineReducers`.

### 5. Upgrade Redux Packages

After `redux-form` is gone:

- Upgrade `redux` to `^5.0.1`.
- Upgrade `react-redux` to `^9.2.0`.
- Upgrade `redux-thunk` to `^3.1.0`.
- Upgrade `reselect` to `^5.1.1`.

Check the thunk import shape during implementation; `redux-thunk` v3 may require using its named export depending on bundler interop.

### 6. Remove Obsolete `glyphicons`

The `glyphicons` package is old and only used for a few button icons.

Replace it with `lucide-react` icons in:

- `src/components/TrackDetail/ControlBar.js`
- `src/components/TrackDetail/EditWindow/component.js`

This changes icon rendering, but not app behavior.

### 7. Patch Other Direct Dependencies

- Update `fetch-jsonp` to `^1.4.0`.
- Keep `react` and `react-dom` at React 18 for now.
- Move `sass` to `devDependencies`.
- Keep `canvas-equalizer` and `audiobuffer-to-wav` initially. They are old, but replacing audio behavior should be a separate, tested task.

### 8. Regenerate and Verify the Lockfile

After package and code changes:

```bash
npm install
npm audit
npm run build
```

Expected result:

- The CRA-related audit chain should disappear because `react-scripts` is gone.
- The Vite production build should succeed.
- Remaining audit findings, if any, should be evaluated individually.

### 9. Add Dependency Maintenance Configuration

After the lockfile is clean, add `.github/dependabot.yml`.

Suggested grouping:

- Build tooling weekly.
- React/runtime dependencies monthly.
- Security updates immediately.

Do this after modernization, not before, otherwise Dependabot will keep opening noisy transitive PRs against the old CRA dependency graph.

## Deliberately Deferred

Do not bundle these into the first pass:

- React 19 upgrade.
- React Router 6 or 7 migration.
- Bootstrap replacement.
- `canvas-equalizer` replacement.
- `audiobuffer-to-wav` replacement.
- Large class-component-to-hooks rewrite.

Those may be worthwhile later, but each increases behavioral risk and is not needed to clear the main security and maintenance problem.

## Verification Checklist

At minimum, verify:

- `npm run build` succeeds.
- `npm run test` succeeds.
- `npm run test:e2e` succeeds in Chromium.
- Audio/subtitle sync E2E verifies visible current-word progression during playback.
- `npm audit` is materially reduced and no longer dominated by `react-scripts`.
- App starts under Vite.
- Header search still submits to the correct search route.
- Username input persists through reload via `localStorage`.
- Track detail route still loads.
- Word occurrence edit still saves on blur.
- Edit window textarea still autofills from selected words.
- Edit window submit still works by button and Ctrl+Enter.
- Audio playback and selected audio download still work.
