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
    { path: 'setup',       file: 'screens/setup.html',       label: 'ADX Setup · Overview' },
    { path: 'profiles',    file: 'screens/profiles.html',    label: 'ADX Setup · Customer Profiles' },
    { path: 'catalog',     file: 'screens/catalog.html',     label: 'ADX Setup · Product Catalog' },
    { path: 'connections', file: 'screens/connections.html', label: 'ADX Setup · Connections',          nav: 'Connections', group: true },
    { path: 'web-signals', file: 'screens/web-signals.html', label: 'ADX Setup · Web Signals',          nav: 'Web Signals' },
    { path: 'signals',     file: 'screens/signals.html',     label: 'ADX Setup · Web Signals · Signals', under: 'web-signals' },
    { path: 'add-signal',  file: 'screens/add-signal.html',  label: 'ADX Setup · Add signal manually',  under: 'web-signals' }
  ];

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
      var screen = cache[route.file] || (cache[route.file] = await DC.loadScreen(route.file));
      styleEl.textContent = screen.css;
      document.title = (screen.title || route.label) + ' · ADX';
      current = DC.mount(root, screen, {});
      window.scrollTo(0, 0);
      renderJump(route.path);
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
    if (e.key === '\\' && !/input|textarea|select/i.test((e.target || {}).tagName || '')) { jump.classList.toggle('hide'); reset.classList.toggle('hide'); }
  });

  // Reset button (bottom-right): remounts the current screen with fresh state
  var reset = document.getElementById('reset');
  reset.addEventListener('click', show);

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
