/*
 * Router for the stitched ADX onboarding prototype.
 * Each route maps to a screen file in screens/. Links use href="#/<route>".
 */
(function () {
  'use strict';

  // Order = the onboarding journey. Add or reorder screens here.
  // `nav` = label in the quick-nav switcher (routes without it are reached through the app);
  // `under` = which quick-nav item to highlight for a sub-screen.
  var ROUTES = [
    { path: 'signin',      file: 'screens/signin.html',      label: 'Sign in',                          nav: 'Sign in' },
    { path: 'about',       file: 'screens/about.html',       label: '1 · About you',                    nav: 'About you' },
    { path: 'data',        file: 'screens/data.html',        label: '2 · Connect your data',            nav: 'Connect your data' },
    { path: 'goals',       file: 'screens/goals.html',       label: '3 · Your goals',                   nav: 'Your goals' },
    { path: 'home',        file: 'screens/home.html',        label: 'Home',                             nav: 'Home' },
    { path: 'exp-goals',       file: 'screens/studio.html',      label: 'Goals' },
    { path: 'experiences',     file: 'screens/studio.html',      label: 'Experiences' },
    { path: 'events',          file: 'screens/derived.html',     label: 'Events' },
    { path: 'simulate',        file: 'screens/studio.html',      label: 'Simulate' },
    { path: 'release',         file: 'screens/studio.html',      label: 'Release' },
    { path: 'analytics',       file: 'screens/studio.html',      label: 'Analytics' },
    { path: 'test-management', file: 'screens/studio.html',      label: 'Test Management' },
    { path: 'setup',       file: 'screens/setup.html',       label: 'ADX Setup · Overview' },
    { path: 'profiles',    file: 'screens/profiles.html',    label: 'ADX Setup · Customer Profiles' },
    { path: 'catalog',     file: 'screens/catalog.html',     label: 'ADX Setup · Product Catalog' },
    { path: 'connections', file: 'screens/connections.html', label: 'ADX Setup · Connections',          nav: 'Connections', group: true },
    { path: 'web-signals', file: 'screens/web-signals.html', label: 'ADX Setup · Web Signals',          nav: 'Web Signals' },
    { path: 'signals',     file: 'screens/signals.html',     label: 'ADX Setup · Web Signals · Signals', under: 'web-signals' },
    { path: 'derived',     file: 'screens/derived.html',     label: 'ADX Setup · Derived signals',      under: 'web-signals' },
    { path: 'add-signal',  file: 'screens/add-signal.html',  label: 'ADX Setup · Add signal manually',  under: 'web-signals' }
  ];

  // Prototype versions. V1 is the working version and uses the files above; a later version
  // lists only the screens it changes (route path → file). Add new versions to the end.
  var VERSIONS = [
    { id: 'v1', label: 'V1', note: 'Working version' },
    { id: 'v2', label: 'V2', note: 'Earlier version', files: { data: 'screens/v2/data.html', derived: 'screens/v2/derived.html', signals: 'screens/v2/signals.html', about: 'screens/v2/about.html', goals: 'screens/v2/goals.html', signin: 'screens/v2/signin.html', 'web-signals': 'screens/v2/web-signals.html', 'add-signal': 'screens/v2/add-signal.html' } }
  ];
  var VER_KEY = 'adx-proto-version';
  function verId() {
    var q = (location.search.match(/[?&]ver=(v\d+)/) || [])[1];
    var v; try { v = q || localStorage.getItem(VER_KEY); } catch (e) { v = q; }
    return VERSIONS.some(function (x) { return x.id === v; }) ? v : VERSIONS[0].id;
  }
  function fileFor(route) {
    var v = VERSIONS.filter(function (x) { return x.id === verId(); })[0];
    return (v.files && v.files[route.path]) || route.file;
  }

  var root = document.getElementById('app');
  var styleEl = document.getElementById('screen-style');
  var cache = {}, current = null;

  // ---- Sidebar: one definition for every app screen. Each screen file still carries its own rail markup;
  // its #railNav and #railSetup are replaced with this when the screen loads. The current page is highlighted
  // through #app[data-nav] (CSS below), the counts through CSS variables on #app, so screen re-renders keep both.
  var IC = {
    home: '<path d="M3 11l9-7 9 7"/><path d="M5 10v10h14V10"/><path d="M10 20v-6h4v6"/>',
    exp: '<path d="M12 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.12 2.12 0 0 1 3 3L12 15l-4 1 1-4z"/>',
    goals: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1.4" fill="currentColor" stroke="none"/>',
    events: '<path d="M13 2 3 14h7l-1 8 10-12h-7z"/>',
    aud: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>',
    sim: '<circle cx="12" cy="12" r="10"/><polygon points="10 8 16 12 10 16 10 8"/>',
    deploy: '<path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"/><path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"/><path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0"/><path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"/>',
    analytics: '<path d="M3 3v16a2 2 0 0 0 2 2h16"/><path d="M18 17V9M13 17V5M8 17v-3"/>',
    test: '<path d="M14 2v6a2 2 0 0 0 .245.96l5.51 10.08A2 2 0 0 1 18 22H6a2 2 0 0 1-1.755-2.96l5.51-10.08A2 2 0 0 0 10 8V2"/><path d="M6.453 15h11.094M8.5 2h7"/>',
    overview: '<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>',
    signals: '<path d="M22 12h-4l-3 9L9 3l-3 9H2"/>',
    conn: '<path d="M12 22v-5M9 8V2M15 8V2M18 8v5a4 4 0 0 1-4 4h-4a4 4 0 0 1-4-4V8Z"/>',
    catalog: '<path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="M3.3 7 12 12l8.7-5"/><path d="M12 22V12"/>',
    agents: '<path d="M12 8V4H8"/><rect width="16" height="12" x="4" y="8" rx="2"/><path d="M2 14h2M20 14h2M15 13v2M9 13v2"/>',
    cs: '<path d="M3 14v-2a9 9 0 0 1 18 0v2"/><path d="M21 16a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-2a2 2 0 0 1 2-2h3z"/><path d="M3 16a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-2a2 2 0 0 0-2-2H3z"/>',
    content: '<path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7z"/><path d="M14 2v5h5"/><path d="M8 13h8M8 17h8M8 9h2"/>',
    setup: '<path d="M4 21v-7M4 10V3M12 21v-9M12 8V3M20 21v-5M20 12V3M1 14h6M9 8h6M17 16h6"/>'
  };
  function svg(k, cls) { return '<svg' + (cls ? ' class="' + cls + '"' : '') + ' viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' + IC[k] + '</svg>'; }
  // [route, label, icon, count key]; a route of '' is a page not in the prototype yet
  var NAV_MAIN = [
    [['home', 'Home', 'home']],
    [['experiences', 'Experiences', 'exp', 'exp'], ['exp-goals', 'Goals', 'goals', 'goals'], ['events', 'Events', 'events', 'events'], ['profiles', 'Audiences', 'aud', 'aud']],
    [['simulate', 'Simulate', 'sim'], ['release', 'Deploy', 'deploy'], ['analytics', 'Analytics', 'analytics'], ['test-management', 'Test management', 'test']]
  ];
  var NAV_SETUP = [['setup', 'Overview', 'overview'], ['web-signals', 'Web signals', 'signals'], ['connections', 'Connections', 'conn'], ['catalog', 'Product catalog', 'catalog'],
    ['', 'Agents', 'agents'], ['', 'Customer service integration', 'cs'], ['', 'Content', 'content']];
  function navItem(it) {
    var tag = it[0] ? 'a' : 'button', href = it[0] ? ' href="#/' + it[0] + '" data-nav="' + it[0] + '" style="text-decoration:none"' : '';
    var n = it[3] ? '<span class="nav-n" data-n="' + it[3] + '">' + (it[3] === 'exp' ? '<i class="nav-live"></i>' : '') + '</span>' : '';
    return '<' + tag + ' class="subnav-item"' + href + '><span class="sub-ico">' + svg(it[2]) + '</span><span class="sn-label">' + it[1] + '</span>' + n + '</' + tag + '>';
  }
  var NAV_HTML = NAV_MAIN.map(function (g) { return '<div class="nav-sec">' + g.map(navItem).join('') + '</div>'; }).join('<div class="nav-div" role="separator"></div>');
  var SETUP_HTML = '<div class="nav-cat-wrap setup-wrap" data-catwrap="adx"><button class="nav-cat" data-cat="adx"><span class="nc-ico">' + svg('setup') + '</span><span class="nc-label">ADX Setup</span>' +
    '<svg class="chev" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 15l6-6 6 6"/></svg></button>' +
    '<div class="nav-cat-group" data-catgroup="adx">' + NAV_SETUP.map(navItem).join('') + '</div></div>';
  function withNav(screen) {
    var t = screen.template, a = t.querySelector('#railNav'), b = t.querySelector('#railSetup');
    if (a) a.innerHTML = NAV_HTML; if (b) b.innerHTML = SETUP_HTML;
    return screen;
  }
  // which item is "on" for a route (sub-pages light up their parent)
  var NAV_OF = { signals: 'web-signals', derived: 'web-signals', 'add-signal': 'web-signals' };
  var navOn = document.createElement('style'); document.head.appendChild(navOn);
  function setNavOn(path) {
    var k = NAV_OF[path] || path;
    navOn.textContent = '#app .subnav-item[data-nav="' + k + '"]{background:#f4f4f5;color:#09090b;font-weight:500}#app .subnav-item[data-nav="' + k + '"] .sub-ico{color:#09090b}' +
      '#app .setup-wrap .subnav-item[data-nav="' + k + '"]{background:#fafafa;color:#09090b}';
  }
  // Counts: experiences and goals come from the studio (it writes ADX_NAV while it runs; before that, its starting data),
  // events from the events store, audiences from Customer Profiles' top audiences plus the ones Cortex saved there.
  window.adxNav = function () {
    var s = window.ADX_NAV || { exp: 7, active: 5, goals: 2 };
    var ev = window.adxEvents ? window.adxEvents().length : 0, aud = 5 + (window.ADX_AUDIENCES || []).length;
    [['exp', s.exp], ['goals', s.goals], ['events', ev], ['aud', aud]].forEach(function (x) { root.style.setProperty('--n-' + x[0], '"' + x[1] + '"'); });
    root.style.setProperty('--n-live', s.active ? 'inline-block' : 'none');
  };
  setInterval(window.adxNav, 1500);

  function routeFor(hash) {
    var p = (hash || '').replace(/^#\/?/, '').split('?')[0];
    return ROUTES.filter(function (r) { return r.path === p; })[0] || ROUTES[0];
  }

  async function show() {
    var route = routeFor(location.hash);
    if (current) { current.unmount(); current = null; }
    try {
      var file = fileFor(route);
      var screen = cache[file] || (cache[file] = withNav(await DC.loadScreen(file)));
      styleEl.textContent = screen.css;
      document.title = (screen.title || route.label) + ' · ADX';
      setNavOn(route.path); window.adxNav();
      current = DC.mount(root, screen, {});
      window.scrollTo(0, 0);
      renderJump(route.path);
      renderVer();
    } catch (e) {
      root.innerHTML = '<pre style="padding:24px;color:#b91c1c;white-space:pre-wrap">' + String(e && e.stack || e) + '</pre>';
      console.error(e);
    }
  }

  // Sidebar groups (Start, Experiences, Measure, ADX Setup): clicking a group's header collapses or opens it, like the studio.
  // The state sits on #app (it survives screens re-rendering and moving between screens); CSS in shadcn-app.css hides the group.
  root.addEventListener('click', function (e) {
    var c = e.target.closest('.nav-cat[data-cat]');
    if (!c || !root.contains(c)) return;
    root.classList.toggle('nav-shut-' + c.dataset.cat);
  });

  // Small floating quick nav (bottom-left). It can be minimised to a pill; press "\\" to hide/show it.
  var jump = document.getElementById('jump');
  var MIN_KEY = 'adx-proto-nav-min', lastActive = null;
  var ICON_MIN = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m15 18-6-6 6-6"/></svg>';
  var ICON_MAX = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m9 18 6-6-6-6"/></svg>';
  function isMin() { try { return localStorage.getItem(MIN_KEY) === '1'; } catch (e) { return false; } }
  function setMin(v) { try { localStorage.setItem(MIN_KEY, v ? '1' : '0'); } catch (e) {} renderJump(lastActive); }
  function renderJump(active) {
    lastActive = active;
    var route = ROUTES.filter(function (r) { return r.path === active; })[0] || {};
    var on = route.under || active;
    if (isMin()) {
      jump.classList.add('min');
      jump.innerHTML = '<button type="button" class="jx" data-max title="Expand quick nav" aria-label="Expand quick nav">Quick nav' + ICON_MAX + '</button>';
      return;
    }
    jump.classList.remove('min');
    jump.innerHTML = ROUTES.filter(function (r) { return r.nav; }).map(function (r, i) {
      return (r.group ? '<span class="sep" aria-hidden="true"></span>' : '') +
        '<a href="#/' + r.path + '" class="' + (r.path === on ? 'on' : '') + '">' + (i + 1) + ' · ' + r.nav + '</a>';
    }).join('') + '<button type="button" class="jx" data-min title="Minimise quick nav" aria-label="Minimise quick nav">' + ICON_MIN + '</button>';
  }
  jump.addEventListener('click', function (e) {
    var b = e.target.closest('button');
    if (b) setMin(b.hasAttribute('data-min'));
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === '\\' && !/input|textarea|select/i.test((e.target || {}).tagName || '')) { jump.classList.toggle('hide'); reset.classList.toggle('hide'); ver.classList.toggle('hide'); }
    if (e.key === 'Escape' && ver.classList.contains('open')) setVerOpen(false);
  });

  // Reset button (bottom-right): remounts the current screen with fresh state and clears the demo state
  var reset = document.getElementById('reset');
  // Screen state is rebuilt on remount, but the scan, signals and derived signals live on window so they survive
  // moving between screens. Reset clears those too (and refetches the screen files), so it behaves like a fresh load.
  reset.addEventListener('click', function () {
    if (window.ADX_SCAN) clearInterval(window.ADX_SCAN.timer);
    var toast = document.getElementById('adxScanToast'); if (toast) toast.remove();
    Object.keys(window).forEach(function (k) { if (/^ADX_/.test(k)) delete window[k]; });
    cache = {};
    show();
  });

  // Version switcher (above Reset): the pill shows the current version and grows into a flyout
  var ver = document.getElementById('ver');
  var ICON_CHECK = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 6 9 17l-5-5"/></svg>';
  function renderVer() {
    var cur = verId(), open = ver.classList.contains('open');
    ver.innerHTML = '<div class="vf" role="menu" aria-label="Prototype version"><div class="vt">Prototype version</div>' +
      VERSIONS.map(function (v) {
        return '<button type="button" role="menuitemradio" aria-checked="' + (v.id === cur) + '" class="vi' + (v.id === cur ? ' on' : '') + '" data-ver="' + v.id + '">' +
          '<b>' + v.label + '</b><span>' + v.label + (v.id === VERSIONS[0].id ? ' · Default' : '') + '<em>' + v.note + '</em></span>' + ICON_CHECK + '</button>';
      }).join('') + '</div>' +
      '<button type="button" class="vb" aria-haspopup="menu" aria-expanded="' + open + '" title="Prototype version">' + cur.toUpperCase() + '</button>';
  }
  ver.addEventListener('click', function (e) {
    e.stopPropagation(); // keep the document click below from closing it again
    var item = e.target.closest('[data-ver]');
    if (item) {
      try { localStorage.setItem(VER_KEY, item.getAttribute('data-ver')); } catch (err) {}
      if (/[?&]ver=/.test(location.search)) history.replaceState(null, '', location.pathname + location.hash);
      ver.classList.remove('open'); show(); return;
    }
    if (e.target.closest('.vb')) setVerOpen(!ver.classList.contains('open'));
  });
  // toggle the class on the existing flyout (no redraw) so it animates open and closed
  function setVerOpen(v) { ver.classList.toggle('open', v); var b = ver.querySelector('.vb'); if (b) b.setAttribute('aria-expanded', String(v)); }
  document.addEventListener('click', function () { if (ver.classList.contains('open')) setVerOpen(false); });

  // Links to screens that are not part of this prototype
  document.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('a[href]');
    if (!a) return;
    var href = a.getAttribute('href');
    if (href === '#' || href === '#/missing') { e.preventDefault(); }
  });

  window.addEventListener('hashchange', show);
  if (!location.hash) location.replace('#/signin');
  show();
})();
