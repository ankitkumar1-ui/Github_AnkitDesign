# ADX onboarding prototype

A clickable prototype of the ADX first-run experience, stitched from the Claude Design canvas
"ADX Web Signals — shadcn" (Onboarding v2 row + ADX Setup row). No build step and no dependencies.

## Run

```bash
npm run dev            # or: node serve.mjs   → http://localhost:5173
# alternative: python3 -m http.server 5173
```

It must be served over http (screens are loaded with fetch), so opening index.html from Finder will not work.
Press `\` to hide/show the screen switcher in the bottom-left corner.

## Flow

`#/signin` → `#/about` → `#/data` → `#/goals` (opens with Cortex setting up, then the goal list) → `#/home` → `#/setup` (from the side menu or Home's Workspace panel) → `#/connections` → `#/web-signals`

| Route | File | Canvas board |
|---|---|---|
| signin | screens/signin.html | Onboarding v2 · Sign in |
| about | screens/about.html | Onboarding v2 · 1 About you |
| data | screens/data.html | Onboarding v2 · 2 Connect your data. Starts with a website scan (hero with a canvas scan effect → Allow / Skip, ~75s in the background, toast when done); state lives in `window.ADX_SCAN` |
| goals | screens/goals.html | Onboarding v2 · Cortex setting up + 3 Your goals |
| home | screens/home.html | Home (prompt, recommendations, workspace completeness) |
| exp-goals, experiences, simulate, release, analytics, test-management | screens/studio.html | Experiences + Measure pages from the ADX studio, shown in the prototype shell (see below) |
| setup | screens/setup.html | ADX Setup · Overview |
| profiles | screens/profiles.html | ADX Setup · Customer Profiles (data from onboarding + add sources) |
| catalog | screens/catalog.html | ADX Setup · Product Catalog (data from onboarding + add sources) |
| connections | screens/connections.html | ADX Setup · Connections (connect / edit / disconnect sources) |
| web-signals | screens/web-signals.html | ADX Setup · Web Signals (simple · site map) |
| signals | screens/signals.html | ADX Setup · Web Signals · Signals list; `#/signals?id=<signal>` opens the signal detail |
| add-signal | screens/add-signal.html | ADX Setup · Web Signals · Add signal manually (from "Add manually") |

## Studio pages (Goals → Test Management)

`studio/adx-studio.html` is a copy of `Prototypes/adxWebSdk/server/studio/adx-studio.html`, plus two small embed scripts
(one at the top of `<head>`, one before `</body>`). `screens/studio.html` loads it in a frame with `?embed=1&mod=<module>`:
the studio hides its own rail and top bar, skips its onboarding, forces light mode, and asks the prototype to change route
(postMessage `{ adx: 'route' }`) when you click through to a page the prototype owns. To refresh from the studio, copy the
file again and re-add both embed scripts.

## Files

- `index.html` – shell: fonts, the `#app` mount point, the screen switcher.
- `app.js` – hash router. `ROUTES` lists the screens in journey order; add/reorder screens there.
- `runtime.js` – ~150-line template runtime (see syntax below). Rarely needs changes.
- `screens/*.html` – one file per screen: `<style>` (screen-only CSS), `<template data-view>` (markup),
  `<script type="text/x-dc">` (logic).
- `assets/adx-logo.png` – ADX app icon.

## Screen template syntax (same as the Claude Design canvas)

- `{{ path.to.value }}` — dotted lookups only. No expressions (`{{ a + b }}`, `{{ !x }}` do not work):
  compute in `renderVals()` and return the result by name.
- Attributes: `x="{{ v }}"` passes the raw value (function, boolean, number); `x="a {{v}} b"` interpolates a string.
  Boolean attributes (`selected`, `disabled`, `checked`) are dropped when the value is false.
- `<sc-for list="{{ items }}" as="item">…</sc-for>` repeats children; `{{ $index }}` is available.
- `<sc-if value="{{ flag }}">…</sc-if>` renders children when truthy.
- Events: `onClick="{{ fn }}"`, `onChange` (fires on each keystroke for text inputs, like React),
  `onKeyDown`, `onInput`, … — the function comes from `renderVals()`.
- Logic: `class Component extends DCLogic { constructor(props){ super(props); this.state = {…}; } renderVals(){ return {…}; } }`
  with `this.setState({...})`, `componentDidMount()`, `componentWillUnmount()`.
- Navigation: `<a href="#/goals">`. `href="#"` is a dead link (placeholder for screens not in the prototype).
- Inline styles are the house style (they were written for the canvas). The ADX Setup screens also use the
  real ADX app CSS (`.rail`, `.topbar`, `.btn`, `.card`, `.dtabs` …) copied from
  `Prototypes/adxWebSdk/server/studio/adx-studio.html`, at the top of their `<style>` block.

## Conventions

- Look: shadcn/ui-style zinc palette, Geist (onboarding) / Inter (app shell), teal `#3c8c81` for Cortex/AI.
- Keep each screen self-contained: CSS that only one screen needs goes in that screen's `<style>`.
- After changing the flow, click through it once end to end (sign in → web signals).
