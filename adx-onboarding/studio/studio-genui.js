/* ADX Studio × Generative UI: the preview on an experience's page shows 3 generated options for the
 * selected suggestion, on the brand's template storefront (adxGenUI, served at adx-template/).
 * The same preview appears under the suggestions when creating an experience with Cortex.
 * Nothing else in the studio changes. Loaded after the studio's own scripts. */
(function () {
  'use strict';
  if (typeof renderStage !== 'function') return;

  var KEY = 'openai_api_key'; // shared with the GenUI studio and its preview settings
  function key() { try { return localStorage.getItem(KEY) || ''; } catch (e) { return ''; } }
  function brandSite() {
    var w = typeof OB_PROFILE !== 'undefined' && OB_PROFILE && OB_PROFILE.website;
    return String(w || 'sephora.com').trim();
  }

  // What to generate, from the experience: element type from the suggestion's kind, page from the event's layout.
  var TYPE_BY_KIND = {
    elicit: 'micro_elicit', question: 'micro_elicit', branch: 'micro_elicit',
    rec: 'product_carousel', cards: 'product_carousel', upsell: 'product_carousel', reorder: 'product_carousel', variants: 'product_carousel',
    advisory: 'product_card', bundle: 'product_card',
    message: 'promo_banner', grow: 'promo_banner', outcome: 'promo_banner', deflect: 'promo_banner',
  };
  var PAGE_BY_LAYOUT = { grid: 'category', detail: 'product' };

  /** x: { name, about, widget, when, audience, improve, agent, kind, page } → preview URL */
  function genSrc(x) {
    var b2bSite = !!(window.ADX_B2B && ADX_B2B.active());
    var instruction = 'Experience: "' + x.name + '". ' + (x.about || '') +
      ' Shown to the ' + (b2bSite ? 'visitor' : 'shopper') + ' as "' + (x.widget || x.name) + '" when this happens: ' + x.when + '.' +
      (x.audience ? ' Audience: ' + x.audience + '.' : '') +
      (x.improve ? ' It should improve: ' + x.improve + '.' : '') +
      (x.agent ? ' Powered by the ' + x.agent + '.' : '') +
      ' Make the three options clearly different in approach, copy and placement.';
    var b2b = !!(window.ADX_B2B && ADX_B2B.active());
    var p = new URLSearchParams({ device: 'desktop', brand: brandSite(), instruction: instruction, type: TYPE_BY_KIND[x.kind] || 'custom', page: x.page || 'auto' });
    if (b2b) p.set('siteType', 'b2b');
    return '../genui/embed.html?' + p.toString(); // prototype copy: the GenUI preview lives in /genui

  }
  function previewSrc(ev, uc) {
    return genSrc({ name: uc.name, about: uc.blurb, widget: uc.widget, when: ev.ev + ' on the ' + ev.page + ' (' + ev.url + ')', improve: uc.opt, agent: uc.agent, kind: uc.kind, page: window.ADX_B2B && ADX_B2B.active() ? pageOf(ev.page) : PAGE_BY_LAYOUT[ev.layout] });
  }
  function pageOf(text) {
    // B2B pages: homepage, article, product overview (GenUI's B2B templates).
    if (window.ADX_B2B && ADX_B2B.active()) return /article|blog|insight|announcement/i.test(text) ? 'article' : /product|pricing|trial|plan/i.test(text) ? 'overview' : /home/i.test(text) ? 'home' : 'auto';
    return /product page|pdp/i.test(text) ? 'product' : /category|search|list|collection|catalog/i.test(text) ? 'category' : 'auto';
  }

  var css = document.createElement('style');
  // The preview goes below the suggestions (full width) instead of in the narrow right column.
  css.textContent = '.cvs-gx{border-top:1px solid var(--line);padding:14px 18px 6px}.cvs-gx .gx-frame{display:block;width:100%;height:760px;border:0;border-radius:12px;background:transparent}.ms-detail.gx-stack{grid-template-columns:1fr}.ms-detail.gx-stack .uc-preview{border-top:1px solid var(--line);padding-top:14px}.uc-preview .gx-frame{display:block;width:100%;height:760px;border:0;border-radius:12px;background:transparent}';
  document.head.appendChild(css);

  // eslint-disable-next-line no-global-assign
  renderStage = (function (orig) {
    return function () {
      orig.apply(this, arguments);
      var box = document.querySelector('#cxStage .uc-preview');
      var ev = typeof ajoEvent === 'function' && ajoEvent(CXI.event);
      var uc = ev && CXI.usecase ? ucOf(CXI.event, CXI.usecase) : null;
      if (!box || !ev || !uc) return;
      var f = document.createElement('iframe');
      f.className = 'gx-frame';
      f.title = 'Preview: ' + uc.name;
      f.src = previewSrc(ev, uc);
      box.replaceChildren(f);
      var grid = box.closest('.ms-detail');
      if (grid) grid.classList.add('gx-stack');
    };
  })(renderStage);

  function cortexPick() {
    var list = CV.recos || [CV.reco];
    return list[list.findIndex(function (r, n) { return CV.picked ? CV.picked.has(n) : n === 0; })];
  }
  function cortexSrc(r) {
    var trig = (typeof cvTrigObj === 'function' && cvTrigObj()) || {};
    var when = (typeof cvTrigLabel === 'function' ? cvTrigLabel() : '') + (trig.page ? ' on the ' + trig.page : '');
    return genSrc({ name: r.name, about: r.why, widget: r.widget, when: when || 'the shopper browses', audience: typeof cvAudLabel === 'function' ? cvAudLabel() : '', improve: r.q, kind: r.kind, page: pageOf((trig.page || '') + ' ' + when) });
  }
  // Switching a suggestion on/off updates the card in place, so follow it in the preview.
  document.addEventListener('click', function (e) {
    if (!e.target.closest || !e.target.closest('[data-pick]')) return;
    setTimeout(function () {
      var f = document.querySelector('.cvs-gx iframe'), r = typeof CV !== 'undefined' && CV && cortexPick();
      if (!f || !r) return;
      var src = cortexSrc(r), abs = new URL(src, location.href).href;
      if (f.src !== abs) { f.src = src; f.title = 'Preview: ' + r.name; }
    }, 0);
  });

  // Creating an experience with Cortex: preview the first suggestion that's switched on, below the list.
  if (typeof cvSuggestHTML === 'function') {
    // eslint-disable-next-line no-global-assign
    cvSuggestHTML = (function (orig) {
      return function (active) {
        var h = orig.apply(this, arguments);
        try {
          if (!active) return h; // only while choosing; the enabled summary card in the chat stays as it was
          var r = cortexPick();
          if (!r) return h;
          var src = cortexSrc(r);
          var block = '<div class="cvs-gx"><iframe class="gx-frame" title="Preview: ' + r.name.replace(/[<>&"]/g, '') + '" src="' + src.replace(/&/g, '&amp;').replace(/"/g, '&quot;') + '"></iframe></div>';
          var at = h.indexOf('<div class="cv-actions">');
          return at < 0 ? h : h.slice(0, at) + block + h.slice(at);
        } catch (e) {
          return h;
        }
      };
    })(cvSuggestHTML);
  }

  // Read the brand as soon as the website is known, so the first preview doesn't wait for it.
  function prefetch() {
    return; // prototype copy: no GenUI server, the Sephora brand is bundled in /genui/brands
    if (!key()) return; // without a browser key the server analyses it (if it has one) when needed
    fetch('adx-template/api/brand', { method: 'POST', headers: { 'Content-Type': 'application/json', 'X-OpenAI-Key': key() }, body: JSON.stringify({ site: brandSite() }) }).catch(function () { /* best effort */ });
  }
  if (typeof obFinish === 'function') {
    // eslint-disable-next-line no-global-assign
    obFinish = (function (orig) { return function () { var r = orig.apply(this, arguments); prefetch(); return r; }; })(obFinish);
  }
  prefetch();
})();
