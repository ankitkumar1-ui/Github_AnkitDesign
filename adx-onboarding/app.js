/*
 * Router for the stitched ADX onboarding prototype.
 * Each route maps to a screen file in screens/. Links use href="#/<route>".
 */
(function () {
  'use strict';

  // Order = the onboarding journey. Add or reorder screens here.
  var ROUTES = [
    { path: 'signin',      file: 'screens/signin.html',      label: 'Sign in' },
    { path: 'about',       file: 'screens/about.html',       label: '1 · About you' },
    { path: 'data',        file: 'screens/data.html',        label: '2 · Connect your data' },
    { path: 'goals',       file: 'screens/goals.html',       label: '3 · Your goals' },
    { path: 'home',        file: 'screens/home.html',        label: 'Home' },
    { path: 'setup',       file: 'screens/setup.html',       label: 'ADX Setup · Overview' },
    { path: 'profiles',    file: 'screens/profiles.html',    label: 'ADX Setup · Customer Profiles' },
    { path: 'catalog',     file: 'screens/catalog.html',     label: 'ADX Setup · Product Catalog' },
    { path: 'connections', file: 'screens/connections.html', label: 'ADX Setup · Connections' },
    { path: 'web-signals', file: 'screens/web-signals.html', label: 'ADX Setup · Web Signals' },
    { path: 'signals',     file: 'screens/signals.html',     label: 'ADX Setup · Web Signals · Signals' },
    { path: 'add-signal',  file: 'screens/add-signal.html',  label: 'ADX Setup · Add signal manually' }
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

  // Small floating screen switcher (bottom-left). Press "\" to hide/show it.
  var jump = document.getElementById('jump');
  function renderJump(active) {
    jump.innerHTML = ROUTES.map(function (r) {
      return '<a href="#/' + r.path + '" class="' + (r.path === active ? 'on' : '') + '">' + r.label + '</a>';
    }).join('');
  }
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
