// Renderers for the element types the model is allowed to emit. The model
// decides *what* to show (copy, products, colours, layout); this file decides *how*.

export const esc = (s) =>
  String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
export const color = (c) => (/^#[0-9a-f]{3,8}$/i.test(c) ? c : "#ccc");
// Currency comes from the active brand profile.
let currency = "$";
export const setCurrency = (symbol) => (currency = symbol || "$");
export const money = (n) => `${currency}${Number(n).toFixed(2).replace(/\.00$/, "")}`;

/** One recommendation card (eyebrow, title, arrow), as on B2B sites' "Recommended for you" rows. */
export function contentCard(c, style = "outline") {
  const t = color(c.tint || "#0F62FE");
  const art = `<div class="gx-cc-art" style="--t:${t}"><i></i><i></i><i></i></div>`;
  return `<div class="gx-cc-card gx-cc-${esc(style)}" title="${esc(c.summary || "")}">
    ${style === "image-top" ? art : ""}
    <div class="gx-cc-row">${style === "image-top" ? "" : art}
      <div class="gx-cc-tx"><span class="gx-cc-kind">${esc(c.kind)}</span><b>${esc(c.title)}</b></div></div>
    <span class="gx-cc-go">${esc(c.cta || "")}<i>→</i></span></div>`;
}

export const TYPE_LABELS = {
  product_carousel: "Carousel",
  product_card: "Product card",
  micro_elicit: "Micro-elicit",
  promo_banner: "Banner",
  custom: "Custom",
  content_cards: "Recommendation cards",
  spotlight_card: "Spotlight card",
  cta_banner: "Call-to-action banner",
};

// --- Product illustrations (SVG), chosen by the model via `packaging` -------
const shapes = {
  bottle: (t) => `<rect x="38" y="20" width="24" height="14" rx="3" fill="#222"/><rect x="28" y="34" width="44" height="64" rx="8" fill="${t}"/>`,
  jar: (t) => `<rect x="24" y="44" width="52" height="12" rx="4" fill="#222"/><rect x="22" y="56" width="56" height="38" rx="10" fill="${t}"/>`,
  tube: (t) => `<path d="M34 18h32l-4 70H38z" fill="${t}"/><rect x="38" y="88" width="24" height="12" rx="2" fill="#222"/>`,
  dropper: (t) => `<ellipse cx="50" cy="14" rx="7" ry="9" fill="#222"/><rect x="44" y="22" width="12" height="14" fill="#444"/><rect x="30" y="36" width="40" height="60" rx="10" fill="${t}"/>`,
  lipstick: (t) => `<path d="M40 22l20-8v34H40z" fill="${t}"/><rect x="38" y="48" width="24" height="14" fill="#c9a96e"/><rect x="36" y="62" width="28" height="36" rx="3" fill="#222"/>`,
  compact: (t) => `<circle cx="50" cy="58" r="34" fill="#222"/><circle cx="50" cy="58" r="26" fill="${t}"/>`,
  box: (t) => `<rect x="26" y="26" width="48" height="72" rx="3" fill="${t}"/><rect x="26" y="26" width="48" height="12" fill="#000" opacity=".15"/>`,
  perfume: (t) => `<rect x="42" y="14" width="16" height="16" rx="2" fill="#c9a96e"/><rect x="24" y="30" width="52" height="66" rx="6" fill="${t}" opacity=".85"/><rect x="34" y="52" width="32" height="18" fill="#fff" opacity=".7"/>`,
};
export const illustration = (p) =>
  `<svg viewBox="0 0 100 110" aria-hidden="true">${(shapes[p?.packaging] || shapes.bottle)(color(p?.productTint))}</svg>`;

// Real product photo when the brand catalog has one; drawn packaging otherwise.
export const productImage = (p) =>
  p?.imageUrl && /^https?:\/\//.test(p.imageUrl)
    ? `<img class="gx-photo" src="${esc(p.imageUrl)}" alt="${esc(p.name)}" loading="lazy" referrerpolicy="no-referrer" onerror="this.style.visibility='hidden'">`
    : illustration(p);

export const stars = (r) => {
  const rating = Number(r) || 0;
  const pct = Math.max(0, Math.min(100, (rating / 5) * 100));
  return `<span class="stars" style="--pct:${pct}%" aria-label="${rating} out of 5 stars">★★★★★</span>`;
};

export const price = (p) => {
  const onSale = p.salePrice != null && p.salePrice < p.price;
  return `<div class="gx-price">${onSale ? `<s>${money(p.price)}</s><b class="gx-sale">${money(p.salePrice)}</b>` : `<b>${money(p.price)}</b>`}</div>`;
};

const badges = (p) =>
  p.badges?.length ? `<div class="gx-badges">${p.badges.map((b) => `<span class="gx-badge">${esc(b)}</span>`).join("")}</div>` : "";

const swatches = (p) =>
  p.swatches?.length ? `<div class="gx-swatches">${p.swatches.map((s) => `<i style="background:${color(s)}"></i>`).join("")}</div>` : "";

export function productTile(p, { cta = true, reason = true } = {}) {
  return `
    <article class="gx-card">
      <div class="gx-media">${badges(p)}<button class="gx-love" aria-label="Add to loves">♡</button>${productImage(p)}</div>
      <div class="gx-body">
        <div class="gx-brand">${esc(p.brand)}</div>
        <div class="gx-name">${esc(p.name)}</div>
        <div class="gx-rating">${stars(p.rating)}${p.reviewCount > 0 ? `<span>${Number(p.reviewCount).toLocaleString()}</span>` : ""}</div>
        ${price(p)}
        ${swatches(p)}
        ${reason && p.reason ? `<p class="gx-reason">✨ ${esc(p.reason)}</p>` : ""}
        ${cta ? `<button class="gx-cta">${esc(p.cta)}</button>` : ""}
      </div>
    </article>`;
}

// --- Element renderers ------------------------------------------------------
const renderers = {
  product_carousel(el, ctx) {
    const perView = ctx.compact ? 1.25 : el.cardsPerView;
    return `
      <div class="gx-carousel style-${esc(el.cardStyle)}" style="--per-view:${perView}">
        <div class="gx-carousel-head">
          <div><h3>${esc(el.heading)}</h3><p>${esc(el.subheading)}</p></div>
          <div class="gx-nav">
            <button data-dir="-1" aria-label="Previous">‹</button>
            <button data-dir="1" aria-label="Next">›</button>
          </div>
        </div>
        <div class="gx-track">${el.products.map((p) => productTile(p)).join("")}</div>
      </div>`;
  },

  product_card(el, ctx) {
    const p = el.product;
    const layout = ctx.compact ? "vertical" : el.layout;
    return `
      <div class="gx-spot gx-${layout}">
        <div class="gx-spot-media">${badges(p)}${productImage(p)}</div>
        <div class="gx-spot-body">
          <div class="gx-eyebrow">${esc(el.eyebrow)}</div>
          <h3>${esc(el.headline)}</h3>
          <p>${esc(el.body)}</p>
          <ul class="gx-highlights">${el.highlights.map((h) => `<li>${esc(h)}</li>`).join("")}</ul>
          <div class="gx-spot-product"><b>${esc(p.brand)}</b> ${esc(p.name)}</div>
          <div class="gx-rating">${stars(p.rating)}<span>${Number(p.reviewCount).toLocaleString()}</span></div>
          <div class="gx-spot-buy">${price(p)}<button class="gx-cta">${esc(p.cta)}</button></div>
        </div>
      </div>`;
  },

  micro_elicit(el) {
    return `
      <div class="gx-elicit gx-${esc(el.displayAs)}" data-selection="${esc(el.selection)}">
        <button class="gx-dismiss" aria-label="${esc(el.dismissLabel)}" title="${esc(el.dismissLabel)}">×</button>
        <div class="gx-elicit-ask">
          <div class="gx-eyebrow">${esc(el.eyebrow)}</div>
          <h3>${esc(el.question)}</h3>
          <p class="gx-muted">${esc(el.helperText)}${el.selection === "multiple" ? " Pick all that apply." : ""}</p>
          <div class="gx-choices">
            ${el.choices
              .map(
                (c, i) => `<button class="gx-choice" aria-pressed="false" data-i="${i}" data-response="${esc(c.response)}">
                  ${c.emoji ? `<span class="gx-emoji">${esc(c.emoji)}</span>` : ""}<span>${esc(c.label)}</span></button>`
              )
              .join("")}
          </div>
          ${el.incentive ? `<div class="gx-incentive">${el.choices.some((c) => c.emoji) ? "🎁 " : ""}${esc(el.incentive)}</div>` : ""}
          ${el.choices.map((c, i) => (c.next ? `<template class="gx-next" data-i="${i}">${contentCard(c.next, "outline")}</template>` : "")).join("")}
          <div class="gx-elicit-foot">
            <button class="gx-cta gx-submit" disabled>${esc(el.submitLabel)}</button>
            <button class="gx-link gx-dismiss-link">${esc(el.dismissLabel)}</button>
          </div>
        </div>
        <div class="gx-elicit-done" hidden>
          <div class="gx-done-icon">✓</div>
          <p class="gx-response"></p>
          <div class="gx-next-out"></div>
          <p class="gx-muted">${esc(el.thankYouMessage)}</p>
          <button class="gx-link gx-reset">Change answer</button>
        </div>
      </div>`;
  },

  promo_banner(el) {
    return `
      <div class="gx-banner gx-text-${esc(el.textTone)}" style="background:${color(el.backgroundColor)}">
        <div class="gx-banner-copy">
          <div class="gx-eyebrow">${esc(el.eyebrow)}</div>
          <h3>${esc(el.headline)}</h3>
          <p>${esc(el.body)}</p>
          <div class="gx-actions">
            <button class="gx-cta">${esc(el.ctaLabel)}</button>
            ${el.secondaryCtaLabel ? `<button class="gx-link">${esc(el.secondaryCtaLabel)}</button>` : ""}
          </div>
        </div>
        <div class="gx-banner-art">${illustration({ packaging: el.motif, productTint: el.motifTint })}</div>
      </div>`;
  },

  custom(el) {
    return `<div class="gx-custom">${renderNode(el.root)}</div>`;
  },

  content_cards(el, ctx) {
    return `<section class="gx-content-cards">
      ${el.heading ? `<h3 class="gx-cc-h">${esc(el.heading)}</h3>` : ""}
      <div class="gx-cc gx-cc-${esc(el.cardStyle)}${ctx.compact ? " gx-cc-stack" : ""}">${(el.cards || []).map((c) => contentCard(c, el.cardStyle)).join("")}</div>
    </section>`;
  },

  spotlight_card(el) {
    const bg = color(el.backgroundColor), border = color(el.borderColor);
    return `<div class="gx-spot gx-text-${esc(el.textTone)}" style="background:${bg};border-color:${border}">
      <span class="gx-spot-eyebrow">${esc(el.eyebrow)}</span>
      <h3>${esc(el.headline)}</h3>
      <p>${esc(el.body)}</p>
      <span class="gx-spot-cta">${esc(el.ctaLabel || el.item?.cta || "Learn more")}<i>→</i></span>
    </div>`;
  },

  cta_banner(el) {
    return `<div class="gx-ctab gx-text-${esc(el.textTone)}" style="background:${color(el.backgroundColor)}">
      <div>${el.eyebrow ? `<span class="gx-spot-eyebrow">${esc(el.eyebrow)}</span>` : ""}<h3>${esc(el.headline)}</h3><p>${esc(el.body)}</p></div>
      <div class="gx-ctab-acts"><span class="gx-ctab-btn">${esc(el.ctaLabel)}</span>${el.secondaryCtaLabel ? `<span class="gx-ctab-link">${esc(el.secondaryCtaLabel)} →</span>` : ""}</div>
    </div>`;
  },
};

function renderNode(n, depth = 0) {
  if (!n || depth > 8) return "";
  const tone = `gx-tone-${esc(n.tone)}`;
  const kids = () => (n.children || []).map((c) => renderNode(c, depth + 1)).join("");
  switch (n.kind) {
    case "stack": return `<div class="gx-n-stack ${tone}">${kids()}</div>`;
    case "row": return `<div class="gx-n-row ${tone}">${kids()}</div>`;
    case "heading": return `<h3 class="gx-n-heading ${tone}">${esc(n.text)}</h3>`;
    case "text": return `<p class="gx-n-text ${tone}">${esc(n.text)}</p>`;
    case "button": return `<button class="gx-cta ${tone}">${esc(n.text)}</button>`;
    case "badge": return `<span class="gx-n-badge ${tone}">${esc(n.text)}</span>`;
    case "divider": return `<hr class="gx-n-divider">`;
    case "input": return `<input class="gx-n-input" placeholder="${esc(n.text)}">`;
    case "chips":
      return `<div class="gx-choices">${(n.items || []).map((i) => `<button class="gx-chip" aria-pressed="false">${esc(i)}</button>`).join("")}</div>`;
    case "product_tile": return n.product ? productTile(n.product) : "";
    default: return "";
  }
}

export function renderElement(option, ctx = {}) {
  const render = renderers[option.element?.type];
  const inner = render ? render(option.element, ctx) : `<div class="gx-error">Unknown element type: ${esc(option.element?.type)}</div>`;
  return `<div class="gx-root${ctx.compact ? " gx-compact" : ""}" style="--accent:${color(option.accentColor)}">${inner}</div>`;
}

// Interactivity for every rendered element inside `container` (event delegation).
export function hydrate(container) {
  container.addEventListener("click", (e) => {
    const btn = e.target.closest("button");
    if (!btn || !container.contains(btn)) return;

    if (btn.closest(".gx-nav")) {
      const track = btn.closest(".gx-carousel").querySelector(".gx-track");
      track.scrollBy({ left: Number(btn.dataset.dir) * track.clientWidth * 0.9, behavior: "smooth" });
      return;
    }

    const elicit = btn.closest(".gx-elicit");
    if (elicit) {
      const ask = elicit.querySelector(".gx-elicit-ask");
      const done = elicit.querySelector(".gx-elicit-done");
      if (btn.classList.contains("gx-choice")) {
        if (elicit.dataset.selection !== "multiple") {
          elicit.querySelectorAll(".gx-choice").forEach((c) => c !== btn && c.setAttribute("aria-pressed", "false"));
        }
        btn.setAttribute("aria-pressed", String(btn.getAttribute("aria-pressed") !== "true"));
        elicit.querySelector(".gx-submit").disabled = !elicit.querySelector('.gx-choice[aria-pressed="true"]');
      } else if (btn.classList.contains("gx-submit")) {
        const picked = [...elicit.querySelectorAll('.gx-choice[aria-pressed="true"]')];
        done.querySelector(".gx-response").textContent = picked.map((c) => c.dataset.response).join(" ");
        // B2B: the content recommended for each answer.
        const out = done.querySelector(".gx-next-out");
        if (out) out.replaceChildren(...picked.map((c) => elicit.querySelector(`template.gx-next[data-i="${c.dataset.i}"]`)).filter(Boolean).map((t) => t.content.cloneNode(true)));
        ask.hidden = true;
        done.hidden = false;
      } else if (btn.classList.contains("gx-reset")) {
        ask.hidden = false;
        done.hidden = true;
      } else if (btn.classList.contains("gx-dismiss") || btn.classList.contains("gx-dismiss-link")) {
        elicit.closest(".gx-root").classList.add("gx-dismissed");
      }
      return;
    }

    if (btn.classList.contains("gx-chip")) {
      btn.setAttribute("aria-pressed", String(btn.getAttribute("aria-pressed") !== "true"));
    } else if (btn.classList.contains("gx-love")) {
      btn.textContent = btn.classList.toggle("on") ? "♥" : "♡";
    }
  });
}
