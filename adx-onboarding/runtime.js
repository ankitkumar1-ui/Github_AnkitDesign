/*
 * Tiny runtime for the ADX onboarding prototype.
 *
 * Each screen lives in screens/<name>.html and is written in the same template
 * format the Claude Design canvas uses ("DC" format):
 *   - {{ path.to.value }}     dotted lookups only (no expressions)
 *   - <sc-for list="{{items}}" as="item">  repeats children ({{$index}} available)
 *   - <sc-if value="{{flag}}">              renders children when truthy
 *   - onClick="{{fn}}" / onChange / onKeyDown / onInput   event handlers
 *   - a <script type="text/x-dc"> with `class Component extends DCLogic`
 *     whose renderVals() returns the values the template reads.
 *
 * Navigation: links like href="#/about" switch screens (see ROUTES in app.js).
 */
(function () {
  'use strict';

  class DCLogic {
    constructor(props) { this.props = props || {}; this.state = {}; this.__render = null; }
    setState(patch, cb) {
      var next = typeof patch === 'function' ? patch(this.state, this.props) : patch;
      this.state = Object.assign({}, this.state, next);
      if (this.__render) this.__render();
      if (cb) cb();
    }
    forceUpdate() { if (this.__render) this.__render(); }
    renderVals() { return {}; }
  }

  var SVG_NS = 'http://www.w3.org/2000/svg';
  var HOLE = /\{\{\s*([^}]+?)\s*\}\}/g;
  var WHOLE = /^\{\{\s*([^}]+?)\s*\}\}$/;
  var BOOL_ATTRS = { selected: 1, checked: 1, disabled: 1, readonly: 1, hidden: 1, open: 1, required: 1 };

  function lookup(scope, path) {
    path = path.trim();
    if (path === 'true') return true;
    if (path === 'false') return false;
    if (path === 'null') return null;
    if (/^-?\d+(\.\d+)?$/.test(path)) return Number(path);
    if (/^(['"]).*\1$/.test(path)) return path.slice(1, -1);
    var parts = path.split('.'), v = scope;
    for (var i = 0; i < parts.length; i++) { if (v == null) return undefined; v = v[parts[i]]; }
    return v;
  }
  function interp(str, scope) {
    return str.replace(HOLE, function (m, p) { var v = lookup(scope, p); return v == null || typeof v === 'function' ? '' : String(v); });
  }
  function child(scope, extra) { var s = Object.create(scope); for (var k in extra) s[k] = extra[k]; return s; }

  function build(node, scope, parent, inSvg) {
    if (node.nodeType === 3) { parent.appendChild(document.createTextNode(interp(node.textContent, scope))); return; }
    if (node.nodeType !== 1) return;
    var tag = node.tagName.toLowerCase();
    // <sc-for>/<sc-if> are loaded as <template data-sc="for|if"> so the HTML parser
    // keeps them inside <select>, <table> etc.
    var kind = tag === 'template' && node.getAttribute('data-sc');
    var kids = kind && node.content ? node.content.childNodes : node.childNodes;
    if (kind === 'for' || tag === 'sc-for') {
      var m = (node.getAttribute('list') || '').match(WHOLE);
      var list = m ? lookup(scope, m[1]) : null;
      var as = node.getAttribute('as') || 'item';
      (list || []).forEach(function (it, i) {
        var s = {}; s[as] = it; s.$index = i;
        var sc = child(scope, s);
        kids.forEach(function (c) { build(c, sc, parent, inSvg); });
      });
      return;
    }
    if (kind === 'if' || tag === 'sc-if') {
      var mv = (node.getAttribute('value') || '').match(WHOLE);
      if (mv && lookup(scope, mv[1])) kids.forEach(function (c) { build(c, scope, parent, inSvg); });
      return;
    }
    var svg = inSvg || tag === 'svg';
    var el = svg ? document.createElementNS(SVG_NS, node.tagName) : document.createElement(tag);
    for (var a = 0; a < node.attributes.length; a++) {
      var at = node.attributes[a], name = at.name, val = at.value;
      if (name.indexOf('hint-') === 0) continue;
      var whole = val.match(WHOLE);
      var raw = whole ? lookup(scope, whole[1]) : interp(val, scope);
      var lname = name.toLowerCase();
      if (lname.indexOf('on') === 0 && name.length > 2) {
        if (typeof raw !== 'function') continue;
        // HTML parsing lowercases attribute names: onClick -> onclick. React-style onChange
        // fires on every keystroke for text fields, so map it to "input" there.
        var evt = lname.slice(2);
        if (evt === 'change' && !(tag === 'select' || /^(checkbox|radio)$/.test(node.getAttribute('type') || ''))) evt = 'input';
        el.addEventListener(evt, raw);
        continue;
      }
      if (BOOL_ATTRS[lname] && whole) { if (raw) el.setAttribute(lname, ''); continue; }
      if (lname === 'value' && (tag === 'input' || tag === 'textarea' || tag === 'select')) { el.__value = raw == null ? '' : String(raw); continue; }
      if (raw === false || raw == null) continue;
      el.setAttribute(name === 'classname' ? 'class' : name, typeof raw === 'string' ? raw : String(raw));
    }
    var target = tag === 'template' ? el.content : el;
    node.childNodes.forEach(function (c) { build(c, scope, target, svg); });
    if (el.__value !== undefined) el.value = el.__value;
    parent.appendChild(el);
  }

  // focus / caret preservation across re-renders
  function pathOf(el, root) { var p = []; while (el && el !== root) { var i = 0, s = el; while ((s = s.previousElementSibling)) i++; p.unshift(i); el = el.parentElement; } return el === root ? p : null; }
  function byPath(root, p) { var el = root; for (var i = 0; i < p.length && el; i++) el = el.children[p[i]]; return el; }

  function mount(root, screen, props) {
    var comp = new screen.Component(props || {});
    var raf = 0;
    function render() {
      var active = document.activeElement, p = root.contains(active) ? pathOf(active, root) : null, sel = null;
      if (p && active.selectionStart != null) { try { sel = [active.selectionStart, active.selectionEnd]; } catch (e) {} }
      var vals = comp.renderVals() || {};
      var frag = document.createDocumentFragment();
      screen.template.childNodes.forEach(function (c) { build(c, vals, frag, false); });
      root.replaceChildren(frag);
      if (p) { var el = byPath(root, p); if (el && el.focus) { el.focus({ preventScroll: true }); if (sel && el.setSelectionRange) { try { el.setSelectionRange(sel[0], sel[1]); } catch (e) {} } } }
    }
    comp.__render = function () { if (raf) return; raf = requestAnimationFrame(function () { raf = 0; render(); }); };
    render();
    if (comp.componentDidMount) comp.componentDidMount();
    return { unmount: function () { comp.__render = null; if (comp.componentWillUnmount) comp.componentWillUnmount(); } };
  }

  async function loadScreen(url) {
    var res = await fetch(url, { cache: 'no-store' });
    if (!res.ok) throw new Error('Could not load ' + url + ' (' + res.status + ')');
    var text = (await res.text())
      .replace(/<sc-(for|if)\b/g, '<template data-sc="$1"')
      .replace(/<\/sc-(for|if)>/g, '</template>');
    var doc = new DOMParser().parseFromString(text, 'text/html');
    var tpl = doc.querySelector('template[data-view]');
    var styles = Array.prototype.map.call(doc.querySelectorAll('style'), function (s) { return s.textContent; }).join('\n');
    var scriptEl = doc.querySelector('script[type="text/x-dc"]');
    var code = scriptEl ? scriptEl.textContent : 'class Component extends DCLogic { renderVals() { return {}; } }';
    var Component = new Function('DCLogic', code + '\n;return Component;')(DCLogic);
    return { template: tpl.content, css: styles, Component: Component, title: (doc.querySelector('title') || {}).textContent || '' };
  }

  window.DC = { DCLogic: DCLogic, mount: mount, loadScreen: loadScreen };
})();
