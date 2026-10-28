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
| data | screens/data.html | Onboarding v2 · 2 Connect your data (V1). Web signals, Product catalog and Content each open on a compact "Auto-scan" card (Allow scan, then progress, then result), then "Or connect manually" tools. One scan fills all three; state lives in `window.ADX_SCAN`, progress shows in each card, toast when done. The earlier scan-hero version is frozen as V2 (`screens/v2/data.html`) |
| goals | screens/goals.html | Onboarding v2 · Cortex setting up + 3 Your goals |
| home | screens/home.html | Home (prompt, recommendations, workspace completeness) |
| exp-goals, experiences, simulate, release, analytics, test-management | screens/studio.html | Experiences + Measure pages from the ADX studio, shown in the prototype shell (see below) |
| setup | screens/setup.html | ADX Setup · Overview |
| profiles | screens/profiles.html | ADX Setup · Customer Profiles (data from onboarding + add sources) |
| catalog | screens/catalog.html | ADX Setup · Product Catalog (data from onboarding + add sources) |
| connections | screens/connections.html | ADX Setup · Connections (connect / edit / disconnect sources) |
| web-signals | screens/web-signals.html | ADX Setup · Web Signals (simple · site map) |
| signals | screens/signals.html | ADX Setup · Web Signals · Signals list; `#/signals?id=<signal>` opens the signal detail |
| derived | screens/derived.html | ADX Setup · Web Signals · Derived signals (user-built triggers that combine signals; starts empty, saved ones in `window.ADX_DERIVED`; the six examples follow the project plan sheet's Trigger list) |
| add-signal | screens/add-signal.html | ADX Setup · Web Signals · Add signal manually (from "Add manually") |

## Versions (V1, V2 …)

The round button above Reset (bottom-right) opens a version flyout. **V1 is the default and the working version**: it uses the
files listed in `ROUTES`. Each later version is an entry in `VERSIONS` in `app.js` that lists only the screens it changes
(`files: { <route>: 'screens/v2/<file>.html' }`); every other route falls back to V1. The choice is kept in localStorage
(`adx-proto-version`), and `?ver=v2` in the URL opens a version directly (handy for sharing). Rule: new changes go into the V1 files; before changing a screen that V2 does not already hold, copy its last committed
version into `screens/v2/` and list it in `VERSIONS`, so V2 stays the older version. V2 holds the earlier Connect your data
(auto-scan hero, `screens/v2/data.html`), Derived signals (first examples, `screens/v2/derived.html`) and Signals
(`screens/v2/signals.html`). Edit `screens/data.html` etc. for V1.

## Prototype layer (not shadcn)

The quick nav (bottom-left), the version button (V1, V2…) and the Reset button (bottom-right) are a separate layer for navigating and demoing the prototype.
They live in `index.html` / `app.js`, are styled on their own (dark floating controls) and are **not** part of the shadcn UI; keep them as they are.
Press `\` to hide or show all three together.

## Light mode only

The prototype is light only: `index.html` sets `color-scheme: light`, the theme toggle is removed from the app top bar, and the embedded studio is forced to `data-theme="light"`.
Do not add dark styles or `prefers-color-scheme` rules.

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
- Onboarding screens (signin, about, data, goals) use shadcn components only, defined in `shadcn.css` (loaded from `index.html`):
  `.shb` Button (`pri` `sec` `out` `ghost`, sizes `sm` `lg` `icon`), `.shbadge` Badge (`sec` `out` `pri`), `.shi` Input / native Select (`.shsel` wraps a select),
  `.shig` Input Group, `.shl` Label, `.shtabs` + `.shtab` Tabs, `.shcard` Card, `.shalert` Alert, `.shprog` Progress, `.shav` Avatar,
  `.shck` Checkbox, `.shspin` Spinner, `.shsep` Separator, `.shbc` Breadcrumb (the step nav), `.shdlg` Dialog. Use these instead of inline-styled lookalikes;
  sentence-case labels, 14px body / 12px small, weights 400/500 (600 only for titles). The app screens (Home, ADX Setup, Web Signals) keep their own class names (`.btn`, `.card`, `.dtab`, `.sg-pill` …) but `shadcn-app.css`
  restyles them to the shadcn spec through `#app`-scoped overrides (sidebar, Button, Tabs, Badge, Input, Switch, Alert, Progress). Change a component there, not per screen.
  The faux Sephora site (`.site …`), data-viz bars and the studio iframe pages (Goals → Test Management) are intentionally left as they are.
- Keep each screen self-contained: CSS that only one screen needs goes in that screen's `<style>`.
- After changing the flow, click through it once end to end (sign in → web signals).
