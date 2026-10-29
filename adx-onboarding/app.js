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

  function routeFor(hash) {
    var p = (hash || '').replace(/^#\/?/, '').split('?')[0];
    return ROUTES.filter(function (r) { return r.path === p; })[0] || ROUTES[0];
  }

  async function show() {
    var route = routeFor(location.hash);
    if (current) { current.unmount(); current = null; }
    try {
      var file = fileFor(route);
      var screen = cache[file] || (cache[file] = await DC.loadScreen(file));
      styleEl.textContent = screen.css;
      document.title = (screen.title || route.label) + ' · ADX';
      current = DC.mount(root, screen, {});
      window.scrollTo(0, 0);
      renderJump(route.path);
      renderVer();
    } catch (e) {
      root.innerHTML = '<pre style="padding:24px;color:#b91c1c;white-space:pre-wrap">' + String(e && e.stack || e) + '</pre>';
      console.error(e);
    }
  }

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
