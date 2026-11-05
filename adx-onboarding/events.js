/* Events: the triggers experiences run on (combinations of web signals). One store for the whole prototype:
   window.ADX_DERIVED, read through adxEvents(). It starts with the events the studio's live experiences use,
   so every experience has its trigger here. Cortex adds to it (studio frame, through window.parent) and reuses
   an event that already exists instead of making a copy. Reset clears ADX_* and the seed comes back. */
(function () {
  var TODAY = '2026-11-05';
  var EMMA = 'Emma C.';
  // [id, what it means, page, conds (builder keys), window, by, created, updated, [experience id, name, status]]
  var SEED = [
    ['add_hover_no_add', 'Hovers Add to Basket, no add', 'Product detail page',
      [{ what: 'basket_hover', op: 'gt', val: '3' }, { what: 'add_to_cart', op: 'not', val: '' }, { what: 'variant_selected', op: 'did', val: '' }],
      'page', 'both', '2026-09-08', '2026-10-14', ['sephora-rec', 'Clarify before add · Foundation page', 'Active']],
    ['shade_grid_no_pick', 'Shade grid open, none selected', 'Product detail page',
      [{ what: 'swatches_hovered', op: 'gte', val: '5' }, { what: 'variant_selected', op: 'not', val: '' }],
      'page', 'both', '2026-09-08', '2026-09-30', ['laptop', 'Shortlist the right variant · Foundation page', 'Active']],
    ['shade_not_color_iq', 'Last ordered shade differs from Color IQ', 'Home page',
      [{ what: 'visit_number', op: 'gt', val: '1' }, { what: 'profile.shade_vs_coloriq', op: 'is', val: 'Different' }],
      'session', 'emma', '2026-09-11', '2026-09-11', ['running', 'Welcome back with shade history · Home', 'Active']],
    ['shade_no_brush', 'Shade chosen, no brush in past orders', 'Product detail page',
      [{ what: 'variant_selected', op: 'did', val: '' }, { what: 'profile.past_categories', op: 'isnot', val: 'Brushes' }],
      'session', 'both', '2026-09-15', '2026-10-21', ['price', 'Complete the routine · Foundation page', 'Active']],
    ['basket_under_offer', 'Basket just under the offer threshold', 'Basket',
      [{ what: 'cart_viewed.cart_value', op: 'lt', val: '75' }, { what: 'cart_viewed.gap_to_offer', op: 'lt', val: '30' }],
      'page', 'emma', '2026-09-18', '2026-10-03', ['loyalty', 'Offer threshold nudge · Basket', 'Active']],
    ['reviews_tone_known', 'Reading reviews, skin tone known', 'Product detail page',
      [{ what: 'review_read', op: 'did', val: '' }, { what: 'profile.skin_tone', op: 'isnot', val: 'Unknown' }],
      'page', 'both', '2026-09-22', '2026-09-22', ['abandon', 'Reviews matched to her · Product page', 'Active']],
    ['due_to_rebuy', 'Due for a product she rebuys', 'Home page',
      [{ what: 'profile.days_since_order', op: 'gte', val: '30' }],
      'session', 'emma', '2026-10-01', '2026-10-09', ['newvisitor', 'Rebuy what she uses · Home', 'Active']]
  ];
  function seed() {
    return SEED.map(function (s) {
      return { id: s[0], desc: s[1], page: s[2], conds: s[3], mode: 'all', win: s[4], freq: 'once', by: s[5], author: EMMA,
        created: s[6], updated: s[7], usedBy: [{ id: s[8][0], name: s[8][1], status: s[8][2] }] };
    });
  }
  window.adxEvents = function () {
    if (!window.ADX_DERIVED) window.ADX_DERIVED = seed();
    window.ADX_DERIVED.forEach(function (e) { // older records kept the experience as text
      if (!e.usedBy) e.usedBy = e.usedIn ? [{ id: '', name: e.usedIn, status: 'Draft' }] : [];
      if (!e.created) e.created = TODAY; if (!e.updated) e.updated = e.created;
      if (!e.author) e.author = EMMA; if (!e.by) e.by = 'emma';
    });
    return window.ADX_DERIVED;
  };
  window.adxEventFind = function (id) { return window.adxEvents().filter(function (e) { return e.id === id; })[0] || null; };
  // An experience uses an event: add the event if it is new, and list the experience under Used by (no duplicates).
  window.adxEventUse = function (ev, exp) {
    var D = window.adxEvents(), cur = window.adxEventFind(ev.id);
    if (!cur) { cur = Object.assign({ mode: 'all', freq: 'once', win: 'session', conds: [], by: 'both', author: EMMA, created: TODAY, updated: TODAY, usedBy: [], fresh: true }, ev); D.unshift(cur); }
    if (exp && exp.name) {
      var u = cur.usedBy.filter(function (x) { return exp.id && x.id ? x.id === exp.id : x.name === exp.name; })[0];
      if (u) { u.name = exp.name; u.status = exp.status || u.status; if (exp.id) u.id = exp.id; }
      else cur.usedBy.push({ id: exp.id || '', name: exp.name, status: exp.status || 'Draft' });
    }
    return cur;
  };
})();
