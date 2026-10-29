/*
 * shadcn Select for every native <select> in the prototype.
 * The <select> stays in the markup (screens keep their onChange handlers); this replaces only the
 * OS menu with a shadcn-style popover (styles: .shpop in shadcn.css). Picking an option sets the
 * select's value and fires input + change, so the runtime's handlers run as before.
 */
(function () {
  'use strict';

  var CHECK = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 6 9 17l-5-5"></path></svg>';
  var pop = null, cur = null, items = [], active = -1;

  function usable(sel) {
    return sel && sel.tagName === 'SELECT' && !sel.multiple && !sel.disabled && sel.closest('#app');
  }

  function close(focusBack) {
    if (!pop) return;
    pop.remove(); pop = null; items = []; active = -1;
    if (focusBack && cur && document.contains(cur)) cur.focus();
    cur = null;
  }

  function setActive(i) {
    if (!items.length) return;
    i = Math.max(0, Math.min(items.length - 1, i));
    if (items[active]) items[active].el.classList.remove('on');
    active = i;
    items[i].el.classList.add('on');
    items[i].el.scrollIntoView({ block: 'nearest' });
  }

  function choose(i) {
    var sel = cur, it = items[i];
    close(true);
    if (!sel || !it || sel.value === it.value) return;
    sel.value = it.value;
    sel.dispatchEvent(new Event('input', { bubbles: true }));
    sel.dispatchEvent(new Event('change', { bubbles: true }));
  }

  function place() {
    if (!pop || !cur) return;
    var r = cur.getBoundingClientRect(), gap = 4, vh = window.innerHeight, vw = window.innerWidth;
    pop.style.minWidth = r.width + 'px';
    pop.style.maxHeight = '';
    var h = pop.offsetHeight, below = vh - r.bottom - gap - 8, above = r.top - gap - 8;
    var up = h > below && above > below;
    pop.style.maxHeight = Math.max(120, Math.min(320, up ? above : below)) + 'px';
    h = pop.offsetHeight;
    pop.style.top = (up ? r.top - gap - h : r.bottom + gap) + 'px';
    pop.style.left = Math.max(8, Math.min(r.left, vw - pop.offsetWidth - 8)) + 'px';
    pop.dataset.side = up ? 'top' : 'bottom';
  }

  function open(sel) {
    close(false);
    cur = sel;
    pop = document.createElement('div');
    pop.className = 'shpop';
    pop.setAttribute('role', 'listbox');
    var label = sel.getAttribute('aria-label');
    if (label) pop.setAttribute('aria-label', label);

    Array.prototype.forEach.call(sel.children, function add(node) {
      if (node.tagName === 'OPTGROUP') {
        var g = document.createElement('div');
        g.className = 'shpop-lbl';
        g.textContent = node.label;
        pop.appendChild(g);
        Array.prototype.forEach.call(node.children, add);
        return;
      }
      if (node.tagName !== 'OPTION' || node.hidden) return;
      var el = document.createElement('div'), picked = node.value === sel.value;
      el.className = 'shpop-item' + (node.disabled ? ' dis' : '');
      el.setAttribute('role', 'option');
      el.setAttribute('aria-selected', picked ? 'true' : 'false');
      el.innerHTML = '<span></span>' + (picked ? CHECK : '');
      el.firstChild.textContent = node.textContent;
      pop.appendChild(el);
      if (node.disabled) return;
      var i = items.length;
      items.push({ el: el, value: node.value, picked: picked });
      el.addEventListener('mousemove', function () { if (active !== i) setActive(i); });
      el.addEventListener('mousedown', function (e) { e.preventDefault(); });
      el.addEventListener('click', function () { choose(i); });
    });

    document.body.appendChild(pop);
    place();
    var at = 0;
    items.forEach(function (it, i) { if (it.picked) at = i; });
    setActive(at);
  }

  // open on press instead of the OS menu
  document.addEventListener('mousedown', function (e) {
    var sel = e.target.closest && e.target.closest('select');
    if (pop && !(e.target.closest && e.target.closest('.shpop'))) {
      var same = sel === cur;
      close(false);
      if (same) { e.preventDefault(); return; }
    }
    if (!usable(sel)) return;
    e.preventDefault();
    sel.focus();
    open(sel);
  }, true);

  document.addEventListener('keydown', function (e) {
    if (pop) {
      if (e.key === 'ArrowDown') { e.preventDefault(); setActive(active + 1); }
      else if (e.key === 'ArrowUp') { e.preventDefault(); setActive(active - 1); }
      else if (e.key === 'Home') { e.preventDefault(); setActive(0); }
      else if (e.key === 'End') { e.preventDefault(); setActive(items.length - 1); }
      else if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); choose(active); }
      else if (e.key === 'Escape') { e.preventDefault(); close(true); }
      else if (e.key === 'Tab') { close(false); }
      else if (e.key.length === 1) {
        // type to jump to an option
        var k = e.key.toLowerCase();
        for (var n = 1; n <= items.length; n++) { var j = (active + n) % items.length; if (items[j].el.textContent.trim().toLowerCase().indexOf(k) === 0) { setActive(j); break; } }
      }
      return;
    }
    var sel = e.target;
    if (usable(sel) && (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown' || e.key === 'ArrowUp')) { e.preventDefault(); open(sel); }
  }, true);

  window.addEventListener('resize', function () { close(false); });
  window.addEventListener('hashchange', function () { close(false); });
  document.addEventListener('scroll', function (e) { if (pop && !pop.contains(e.target)) close(false); }, true);
})();
