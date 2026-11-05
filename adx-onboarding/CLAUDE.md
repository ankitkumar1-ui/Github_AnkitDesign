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
| events | screens/derived.html | Experiences · Events. We say **Events**, never "derived signals" (`derived` stays as the route/file name). One store for the prototype, `events.js` (`adxEvents()`, `adxEventFind(id)`, `adxEventUse(event, experience)`, data in `window.ADX_DERIVED`), seeded with the events the studio's seven live experiences run on, so every experience has its trigger here. List: event, page, created by (Emma C., Cortex or Emma C. + Cortex), used by, updated. Click opens the event: fires when, built from, used by (experiences with Draft / Active / Inactive), details (page, window, frequency, created by, dates) and Edit (the builder; saving keeps creator and used by) |
| setup | screens/setup.html | ADX Setup · Overview |
| profiles | screens/profiles.html | ADX Setup · Customer Profiles (data from onboarding + add sources) |
| catalog | screens/catalog.html | ADX Setup · Product Catalog (data from onboarding + add sources) |
| connections | screens/connections.html | ADX Setup · Connections (connect / edit / disconnect sources) |
| web-signals | screens/web-signals.html | ADX Setup · Web Signals (simple · site map). Edit on a captured event opens app + tag fields in the card and highlights the card, pin and page object in pulsing green; saved edits live in component state (`over`). Add manually switches the left panel to "Add an event": pick a page, click any element on the site (hover outline, teal selection), check the website event and its app + tag, Save adds it to that page's Captured list with a pin (state `manual`) |
| signals | screens/signals.html | ADX Setup · Web Signals · Signals list (source, properties, health, used by); `#/signals?id=<signal>` opens the signal detail: description, sources and pages, source mapping (website event → source and tag → signal; the pencil opens Edit source and tag: switch sources, search and add tags, add a connected app from `SG_CONNECTED`), properties (fields / JSON), experiences using it. Tags, connected apps and used-by are mock data |
| derived | screens/derived.html | ADX Setup · Web Signals · Events tab: the same Events screen under the Web Signals tabs |
| add-signal | screens/add-signal.html | ADX Setup · Web Signals · Add signal, from Signals → "Add signal" or "Add tag" on a missing event in the List view (prefilled via `?from=list&name=&meaning=&method=el&page=`). "Add manually" on Source & mapping still works in place. Laid out like Derived signals: required name, meaning and capture method (SDK call, Data layer key, URL pattern, Element interaction), each with its own settings; "Send to a developer" and "Pick the element" are modals. Create shows the next step for that method (waiting for the first event with a test button, or live at once for URL patterns and matched data layer pushes), then the fields to keep as variables. New signals go into `window.ADX_NEW_SIGNALS` and join the Signals list as Pending first event. V2 keeps the earlier form (`screens/v2/add-signal.html`) |

## Versions (V1, V2 …)

The round button above Reset (bottom-right) opens a version flyout. **V1 is the default and the working version**: it uses the
files listed in `ROUTES`. Each later version is an entry in `VERSIONS` in `app.js` that lists only the screens it changes
(`files: { <route>: 'screens/v2/<file>.html' }`); every other route falls back to V1. The choice is kept in localStorage
(`adx-proto-version`), and `?ver=v2` in the URL opens a version directly (handy for sharing). Rule: new changes go into the V1 files; before changing a screen that V2 does not already hold, copy its last committed
version into `screens/v2/` and list it in `VERSIONS`, so V2 stays the older version. V2 also keeps Source & mapping with pins on every event (`screens/v2/web-signals.html`); V1 shows a pin only once an event is found. V2 holds the earlier Connect your data
(auto-scan hero, `screens/v2/data.html`), Derived signals (first examples, `screens/v2/derived.html`) and Signals
(`screens/v2/signals.html`, the list and detail before the properties/health/used-by rework). Edit `screens/data.html` etc. for V1.

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
(postMessage `{ adx: 'route' }`) when you click through to a page the prototype owns. `#/experiences?signal=<id>` (from "Use in an experience" on a signal) adds `&sig=<id>`: the bottom embed script then opens Cortex's New Experience with that signal as the trigger and the studio's interventions for it (`CV_RECOS`, picked by `KEY` in that script; signal details read from the parent's `ADX_SIGNALS`). `#/experiences?rec=<n>` (from "Build" on Home recommendation card n) adds `&rec=`, and the same script starts Cortex exactly as the studio's own Home card does (`obStartExperience` with that card's request, goal and title from the studio's `HM_SUGG`; keep the prototype's Home cards in the same order). `#/experiences?ask=<text>` opens Cortex with any typed request (`v3Open`). Like the studio server on :8800, the studio also loads `studio/studio-genui.js` (a copy of `adxWebSdk/server/public/studio-genui.js`, pointed at `../genui/`): Cortex's suggestion step shows "Preview · 3 generated options" (A/B/C designs with placement, Mobile / Desktop) on the Sephora storefront. `genui/` is a copy of the adxGenUI embed (`adxGenUI/public` + `lib/mock.js`, `schema.js`, `jsonschema.js` + the cached `sephora.com` brand); its `api()` in `embed.js` runs in the page with the demo options, so no server or OpenAI key is needed. Each choice shows a Preview card (Desktop / Mobile) of the Sephora page with that intervention, using the studio's `v3SephPage`; the suggestion step gets the same card. The bottom embed script also reworks Cortex's trigger step: the trigger cards (`.tg-item`, and `.v3-tg` in the guided builder) get an up/down chevron instead of View, open in place one at a time, and their conditions are editable there (`tgEnhance`; edits change the trigger's own `conds`, and the card shows Edited). Cortex asks for the goal first (it is required), then audience, trigger and suggested action; the Details panel beside it and a built experience's Details (`adxSteps`) follow the same order: Goal, Audience, Trigger, Suggested action, Data. Audience tiles are the Customer Profiles audiences (`PROF_AUDS`, same names and sizes as that page); a Cortex-suggested audience you pick is saved to the parent's `ADX_AUDIENCES` and shows on Customer Profiles (Top audiences, New). A library event whose rule you edit in the trigger card is saved as a new event ("<name> (edited)") in `ADX_DERIVED`; the library event stays as it was. Micro-elicit has three follow-ups (Recommended products, Refined search results, Shade match) and editable shopper copy (question, answer chips, button text) that the preview uses. Experiences are Draft, Active or Inactive only (the studio's live / paused, labelled through `STATUS_LABEL`; Learning counts as Active; two shipped ones start as drafts). The list filters by them. On an experience's page: Draft → Publish; Active → Update and Make inactive; Inactive → Make active (`envSync`). Experiences created in the studio are kept on the parent (`ADX_EXPS`, JSON) so they survive the frame reloading. "New" (a soft teal lozenge, `.adx-new`) marks things made on the fly in a Cortex session: the experience being built (Cortex header, and its page right after Create), and the audience and event Cortex suggests for the request (`CX` in the embed script; shown as "Suggested by Cortex" until picked, then New). On Create, every experience's trigger is linked to an event through the parent's `adxEventUse` (a new Cortex event, an edited library event, a library trigger or an existing event), with the experience as Draft under Used by. No duplicates: `cxSet` adds the existing Events to Cortex's trigger library, and when the event Cortex would suggest already exists it offers that one (tagged In Events) instead of a new one. Editing something that already exists never shows New. To refresh from the studio, copy the
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
- Product pictures are real sephora.com photos (`https://www.sephora.com/productimages/sku/s<sku>-main-zoom.jpg?imwidth=…`), with the product's real name, price and review count from sephora.com search. On the faux site in `screens/web-signals.html` they are `.pimg.ph` / `.hero.ph` / `.th.ph` images. The studio's Sephora previews get them from the embed script at the end of `studio/adx-studio.html` (`PH`, in `V3_SEPH_PRODUCTS` order). Basket item names and prices stay as they are because the subtotals add them up.
- Required fields: a red asterisk (`#dc2626`, weight 600) right after the label, never a "Required" word or badge. Onboarding uses `.req-star`, Add signal `.as-req`; the studio's `.cv-req` / `.dl-req` labels are turned into the asterisk by the embed script.
- Dropdowns: keep using a plain `<select>` with `onChange`. `shadcn-select.js` (loaded from `index.html`) opens every select in `#app` as a shadcn Select popover (`.shpop` in `shadcn.css`) instead of the OS menu, with keyboard support, and fires `change` on pick; `shadcn.css` also gives plain selects the shadcn chevron. Do not build per-screen dropdown menus.
- Keep each screen self-contained: CSS that only one screen needs goes in that screen's `<style>`.
- After changing the flow, click through it once end to end (sign in → web signals).
