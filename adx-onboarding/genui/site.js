// Template storefront (product page + category page) with named slots where a
// generated element can be placed. Everything brand-specific (logo, colours,
// fonts, nav, labels, footer...) comes from a brand profile.
import { esc, color, productImage, stars, price, productTile, contentCard } from "./components.js";

export const SLOT_LABELS = {
  pdp_buy_box: "Product page · Buy box",
  pdp_below_hero: "Product page · Below hero",
  pdp_above_reviews: "Product page · Above reviews",
  plp_top: "Category page · Above grid",
  plp_in_grid: "Category page · In grid",
  plp_sidebar: "Category page · Sidebar",
  floating: "Floating overlay",
  // B2B pages
  home_below_hero: "Homepage · Below hero",
  home_recommended: "Homepage · Recommended row",
  article_inline: "Article · In the article",
  article_sidebar: "Article · Sidebar",
  overview_below_hero: "Product overview · Below hero",
  overview_mid: "Product overview · Mid page",
};

export const NARROW_SLOTS = new Set(["pdp_buy_box", "plp_sidebar", "floating", "article_sidebar"]);

const PAGE_SLOTS = {
  product: ["pdp_buy_box", "pdp_below_hero", "pdp_above_reviews", "floating"],
  category: ["plp_top", "plp_in_grid", "plp_sidebar", "floating"],
  home: ["home_below_hero", "home_recommended", "floating"],
  article: ["article_inline", "article_sidebar", "floating"],
  overview: ["overview_below_hero", "overview_mid", "floating"],
};
const FALLBACK_SLOT = { category: "plp_top", product: "pdp_below_hero", home: "home_recommended", article: "article_inline", overview: "overview_below_hero" };

// If the model picks a slot that doesn't exist on this page type, fall back to a sensible one.
export const resolvePlacement = (pageType, placement) =>
  PAGE_SLOTS[pageType]?.includes(placement) ? placement : FALLBACK_SLOT[pageType] || "pdp_below_hero";

// The built-in demo store, used when no brand website has been analysed.
export const DEFAULT_BRAND = {
  name: "BEAUTÉ",
  domain: "beaute.com",
  logo: { imageUrl: null, text: "BEAUTÉ", letterSpacing: "extra-wide", weight: "700", uppercase: true },
  colors: {
    background: "#ffffff", surface: "#f6f6f6", text: "#000000", mutedText: "#666666", border: "#e6e6e6",
    primary: "#cf112c", primaryText: "#ffffff", secondary: "#000000", accent: "#cf112c", sale: "#cf112c",
    promoBarBackground: "#000000", promoBarText: "#ffffff", footerBackground: "#000000", footerText: "#ffffff", rating: "#000000",
  },
  typography: {
    fontFamily: '"Helvetica Neue", Helvetica, Arial', headingFontFamily: '"Helvetica Neue", Helvetica, Arial',
    fallbackFont: "", headingFallbackFont: "", headingWeight: "700", headingUppercase: false, baseFontSize: 14,
  },
  shape: { buttonShape: "pill", buttonUppercase: false, cardRadius: 8, imageBackground: "#f6f6f6", imageAspect: "square", cardTextAlign: "left" },
  header: {
    layout: "logo-left",
    promoBarText: "Free standard shipping on $35+ orders · Use code GLOW for 15% off",
    searchPlaceholder: "Search",
    navItems: ["New", "Brands", "Makeup", "Skincare", "Hair", "Fragrance", "Tools & Brushes", "Bath & Body", "Mini Size", "Gifts", "Sale & Offers"],
    highlightNavItem: "Sale & Offers",
    utilityItems: ["Stores & Services", "Community", "Sign In"],
  },
  commerce: {
    currencySymbol: "$",
    addToCartLabel: "Add to Basket",
    loyaltyProgram: "",
    badgeLabels: [],
    fulfilmentOptions: [
      { title: "Get It Shipped", detail: "Free standard shipping on $35+" },
      { title: "Buy Online & Pick Up", detail: "Ready within 2 hours" },
      { title: "Same-Day Delivery", detail: "Order in the next 3 hours" },
    ],
    filterGroups: [
      { title: "Pickup & Delivery", options: ["Buy Online & Pick Up", "Same-Day Delivery", "Get It Shipped"] },
      { title: "Price Range", options: ["Under $25", "$25 to $50", "$50 to $100", "$100 and above"] },
    ],
  },
  footer: {
    columns: [
      { title: "About BEAUTÉ", links: ["About Us", "Careers", "Newsroom", "Sustainability"] },
      { title: "My BEAUTÉ", links: ["Order Status", "Purchase History", "Loves"] },
      { title: "Help", links: ["Customer Service", "Returns & Exchanges", "Delivery", "Gift Cards"] },
      { title: "Stay in touch", links: ["Sign up for emails", "Download the app", "Store locator"] },
    ],
    legal: "© 2026 BEAUTÉ. Demo storefront.",
  },
  products: [],
};

// ---------------------------------------------------------------------------
// Theme: brand profile → CSS custom properties (+ web-font fallbacks)
// ---------------------------------------------------------------------------
const cssFont = (family, fallback) =>
  [String(family || "").replace(/[;{}<>]/g, ""), fallback ? `"${fallback}"` : "", '"Helvetica Neue", Helvetica, Arial, sans-serif']
    .filter(Boolean)
    .join(", ");

export function themeVars(b) {
  const c = b.colors;
  const t = b.typography;
  const s = b.shape;
  return {
    "--b-bg": color(c.background), "--b-surface": color(c.surface), "--b-text": color(c.text), "--b-muted": color(c.mutedText),
    "--b-border": color(c.border), "--b-primary": color(c.primary), "--b-primary-text": color(c.primaryText),
    "--b-secondary": color(c.secondary), "--b-accent": color(c.accent), "--b-sale": color(c.sale),
    "--b-promo-bg": color(c.promoBarBackground), "--b-promo-text": color(c.promoBarText),
    "--b-footer-bg": color(c.footerBackground), "--b-footer-text": color(c.footerText), "--b-rating": color(c.rating),
    "--b-font": cssFont(t.fontFamily, t.fallbackFont),
    "--b-heading-font": cssFont(t.headingFontFamily || t.fontFamily, t.headingFallbackFont || t.fallbackFont),
    "--b-heading-weight": t.headingWeight,
    "--b-heading-case": t.headingUppercase ? "uppercase" : "none",
    "--b-size": `${t.baseFontSize || 14}px`,
    "--b-btn-radius": { pill: "999px", rounded: "6px", square: "0px" }[s.buttonShape] || "999px",
    "--b-btn-case": s.buttonUppercase ? "uppercase" : "none",
    "--b-card-radius": `${s.cardRadius}px`,
    "--b-img-bg": color(s.imageBackground),
    "--b-img-aspect": s.imageAspect === "portrait" ? "3 / 4" : "1 / 1",
    "--b-align": s.cardTextAlign === "center" ? "center" : "left",
    "--b-justify": s.cardTextAlign === "center" ? "center" : "flex-start",
  };
}

export function loadFonts(b) {
  for (const family of new Set([b.typography.fallbackFont, b.typography.headingFallbackFont].filter(Boolean))) {
    const id = `font-${family.replace(/\W/g, "")}`;
    if (document.getElementById(id)) continue;
    const link = Object.assign(document.createElement("link"), {
      id,
      rel: "stylesheet",
      href: `https://fonts.googleapis.com/css2?family=${encodeURIComponent(family).replace(/%20/g, "+")}:wght@400;500;600;700;800&display=swap`,
    });
    document.head.append(link);
  }
}

const slug = (s) => String(s).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
export const pageUrl = (page, b) =>
  page.type === "category" ? `${b.domain}/shop/${slug(page.title)}`
    : page.type === "home" ? `${b.domain}/`
    : page.type === "article" ? `${b.domain}/new/announcements/${slug(page.title)}`
    : page.type === "overview" ? `${b.domain}/products/${slug(page.title)}`
    : `${b.domain}/product/${slug(page.heroProduct.name)}`;

// ---------------------------------------------------------------------------
// Page chrome
// ---------------------------------------------------------------------------
const icon = {
  search: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/></svg>`,
  user: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="8" r="4"/><path d="M4 21c1-4 4-6 8-6s7 2 8 6"/></svg>`,
  heart: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M12 20s-7-4.4-9-8.6A4.8 4.8 0 0 1 12 6.5a4.8 4.8 0 0 1 9 4.9C19 15.6 12 20 12 20z"/></svg>`,
  bag: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M5 8h14l-1 13H6z"/><path d="M9 8V6a3 3 0 0 1 6 0v2"/></svg>`,
};

function logo(b) {
  const l = b.logo;
  if (l.imageUrl) return `<img class="s-logo-img" src="${esc(l.imageUrl)}" alt="${esc(b.name)}" referrerpolicy="no-referrer">`;
  const spacing = { normal: "0", wide: ".12em", "extra-wide": ".32em" }[l.letterSpacing] || "0";
  return `<span class="s-logo-text" style="letter-spacing:${spacing};font-weight:${esc(l.weight)};${l.uppercase ? "text-transform:uppercase" : ""}">${esc(l.text || b.name)}</span>`;
}

const B2B_PAGES = new Set(["home", "article", "overview"]);
const b2bHeader = (b) => `
  <header class="s-header s-logo-left s-b2b-header">
    <div class="s-logo">${logo(b)}</div>
    <nav class="s-b2b-nav">${b.header.navItems.slice(0, 6).map((n) => `<span>${esc(n)}</span>`).join("")}</nav>
    <nav class="s-utils">${icon.search}${icon.user}</nav>
  </header>`;

const header = (b) => `
  ${b.header.promoBarText ? `<div class="s-promo">${esc(b.header.promoBarText)}</div>` : ""}
  <header class="s-header s-${esc(b.header.layout)}">
    <div class="s-logo">${logo(b)}</div>
    <div class="s-search">${icon.search}<span>${esc(b.header.searchPlaceholder || "Search")}</span></div>
    <nav class="s-utils">
      ${b.header.utilityItems.map((u, i) => `<span>${i === b.header.utilityItems.length - 1 ? icon.user : ""}<span class="s-util-text">${esc(u)}</span></span>`).join("")}
      <span>${icon.heart}</span>
      <span>${icon.bag}</span>
    </nav>
  </header>
  <nav class="s-nav">
    ${b.header.navItems.map((n) => `<span class="${n === b.header.highlightNavItem ? "s-sale" : ""}">${esc(n)}</span>`).join("")}
  </nav>`;

const footer = (b) => `
  <footer class="s-footer">
    <div class="s-footer-cols">
      ${b.footer.columns.map((c) => `<div><h5>${esc(c.title)}</h5>${c.links.map((l) => `<div>${esc(l)}</div>`).join("")}</div>`).join("")}
    </div>
    ${b.footer.legal ? `<div class="s-legal">${esc(b.footer.legal)}</div>` : ""}
  </footer>`;

const crumbs = (list) => `<nav class="s-crumbs">${list.map(esc).join(` <span>/</span> `)}</nav>`;
const tile = (p) => `<div class="s-tile">${productTile(p, { cta: false, reason: false })}</div>`;

// ---------------------------------------------------------------------------
// Pages
// ---------------------------------------------------------------------------
function productPage(page, slot, b) {
  const p = page.heroProduct;
  const variant = p.swatches?.length
    ? `<div class="s-option-label">Color: <b>Shade 01</b></div>
       <div class="s-swatches">${p.swatches.map((s, i) => `<i class="${i ? "" : "on"}" style="background:${color(s)}"></i>`).join("")}</div>`
    : `<div class="s-option-label">Size: <b>Standard</b></div>
       <div class="s-sizes"><span class="on">Standard</span><span>Mini</span><span>Value Size</span></div>`;
  const loves = `${((p.reviewCount * 9) / 1000).toFixed(1)}K`;

  return `
    <main class="s-main">
      ${crumbs(page.breadcrumb)}
      <section class="s-pdp">
        <div class="s-gallery">
          <div class="s-thumbs">${[0, 1, 2, 3].map((i) => `<div class="s-thumb${i ? "" : " on"}">${productImage(p)}</div>`).join("")}</div>
          <div class="s-hero-img">${productImage(p)}</div>
        </div>
        <div class="s-buy">
          <div class="s-brand">${esc(p.brand)}</div>
          <h1>${esc(p.name)}</h1>
          <div class="s-meta">${stars(p.rating)}${p.reviewCount > 0 ? `<span>${Number(p.reviewCount).toLocaleString()} reviews</span><span>♡ ${loves}</span>` : ""}</div>
          <div class="s-price">${price(p)}</div>
          ${variant}
          ${b.commerce.fulfilmentOptions.length
            ? `<div class="s-fulfil">${b.commerce.fulfilmentOptions.map((f, i) => `<div class="${i ? "" : "on"}"><b>${esc(f.title)}</b><span>${esc(f.detail)}</span></div>`).join("")}</div>`
            : ""}
          <button class="s-add">${esc(b.commerce.addToCartLabel)}</button>
          ${slot("pdp_buy_box")}
        </div>
      </section>
      ${slot("pdp_below_hero")}
      <section class="s-section">
        <h2>About the Product</h2>
        <p>${esc(page.description)}</p>
        ${page.highlights?.length ? `<h4>Highlights</h4><ul class="s-highlights">${page.highlights.map((h) => `<li>${esc(h)}</li>`).join("")}</ul>` : ""}
      </section>
      <section class="s-section">
        <h2>Similar Products</h2>
        <div class="s-grid">${page.gridProducts.slice(0, 4).map(tile).join("")}</div>
      </section>
      ${slot("pdp_above_reviews")}
      <section class="s-section">
        <h2>Ratings &amp; Reviews${p.reviewCount > 0 ? ` (${Number(p.reviewCount).toLocaleString()})` : ""}</h2>
        <div class="s-review-summary">
          <div><div class="s-big-rating">${Number(p.rating).toFixed(1)}</div>${stars(p.rating)}</div>
          <div class="s-bars">${[72, 16, 6, 3, 3].map((w, i) => `<div class="s-bar"><span>${5 - i} ★</span><span class="s-track"><i style="width:${w}%"></i></span></div>`).join("")}</div>
        </div>
      </section>
    </main>`;
}

function categoryPage(page, slot, b) {
  const grid = page.gridProducts;
  const unique = (key) => [...new Set(grid.map((p) => p[key]))].slice(0, 6);
  const check = (label) => `<label><input type="checkbox" tabindex="-1"> ${esc(label)}</label>`;
  const groups = [{ title: "Brand", options: unique("brand") }, ...b.commerce.filterGroups];

  return `
    <main class="s-main">
      ${crumbs(page.breadcrumb)}
      <h1 class="s-plp-title">${esc(page.title)}</h1>
      <div class="s-count">${(grid.length * 37 + 112).toLocaleString()} results</div>
      ${slot("plp_top")}
      <div class="s-plp">
        <aside class="s-filters">
          <div class="s-filter-groups">
            <h4>Category</h4>${unique("category").map((c) => `<div class="s-filter-link">${esc(c)}</div>`).join("")}
            ${groups.map((g) => `<h4>${esc(g.title)}</h4>${g.options.slice(0, 6).map(check).join("")}`).join("")}
          </div>
          ${slot("plp_sidebar")}
        </aside>
        <section class="s-results">
          <div class="s-sortbar">
            <div class="s-chips">${(b.commerce.badgeLabels.length ? b.commerce.badgeLabels : ["Sale", "New"]).slice(0, 4).map((l) => `<span>${esc(l)}</span>`).join("")}</div>
            <div>Sort by: <b>Relevance</b> ▾</div>
          </div>
          <div class="s-grid">${grid.slice(0, 4).map(tile).join("")}${slot("plp_in_grid")}${grid.slice(4).map(tile).join("")}</div>
        </section>
      </div>
    </main>`;
}

// ---------------------------------------------------------------------------
// B2B pages: homepage, article, product overview
// ---------------------------------------------------------------------------
const cta = (label, primary) => (label ? `<span class="s-b2b-btn${primary ? " primary" : ""}">${esc(label)}<i>→</i></span>` : "");

function homePage(page, slot) {
  return `
    <main class="s-main s-b2b">
      <section class="s-b2b-hero">
        <div>
          ${page.eyebrow ? `<div class="s-b2b-eyebrow">${esc(page.eyebrow)}</div>` : ""}
          <h1>${esc(page.title)}</h1>
          <p>${esc(page.intro)}</p>
          <div class="s-b2b-ctas">${cta(page.primaryCta, true)}${cta(page.secondaryCta)}</div>
        </div>
        <div class="s-b2b-hero-art" aria-hidden="true"></div>
      </section>
      ${slot("home_below_hero")}
      ${slot("home_recommended") || `<section class="s-b2b-section"><h3>Recommended for you</h3><div class="gx-cc gx-cc-outline">${(page.related || []).slice(0, 4).map((c) => contentCard(c)).join("")}</div></section>`}
      <section class="s-b2b-section s-b2b-highlights">
        ${(page.features || []).slice(0, 3).map((f) => `<div><h4>${esc(f.title)}</h4><p>${esc(f.body)}</p></div>`).join("")}
      </section>
    </main>`;
}

function articlePage(page, slot) {
  const paras = page.paragraphs || [];
  const mid = Math.min(2, paras.length);
  const p = (t) => `<p>${esc(t)}</p>`;
  return `
    <main class="s-main s-b2b">
      ${crumbs(page.breadcrumb)}
      <div class="s-article">
        <aside class="s-toc">${(page.features || []).slice(0, 3).map((f, i) => `<div class="${i ? "" : "on"}">${esc(f.title)}</div>`).join("") || `<div class="on">${esc(page.title)}</div>`}</aside>
        <article class="s-article-body">
          ${page.eyebrow ? `<div class="s-b2b-eyebrow">${esc(page.eyebrow)}</div>` : ""}
          <h1>${esc(page.title)}</h1>
          <p class="s-lede">${esc(page.intro)}</p>
          ${paras.slice(0, mid).map(p).join("")}
          ${slot("article_inline")}
          ${paras.slice(mid).map(p).join("")}
        </article>
        <aside class="s-article-side">
          <h4>Learn more</h4>
          ${(page.related || []).slice(0, 3).map((c) => `<div class="s-learn">${esc(c.cta || c.title)}<i>→</i></div>`).join("")}
          ${slot("article_sidebar")}
        </aside>
      </div>
    </main>`;
}

function overviewPage(page, slot) {
  return `
    <main class="s-main s-b2b">
      ${crumbs(page.breadcrumb)}
      <section class="s-b2b-hero s-overview-hero">
        <div>
          ${page.eyebrow ? `<div class="s-b2b-eyebrow">${esc(page.eyebrow)}</div>` : ""}
          <h1>${esc(page.title)}</h1>
          <p>${esc(page.intro)}</p>
          <div class="s-b2b-ctas">${cta(page.primaryCta, true)}${cta(page.secondaryCta)}</div>
        </div>
        <div class="s-b2b-hero-art" aria-hidden="true"></div>
      </section>
      ${slot("overview_below_hero")}
      <section class="s-b2b-section">
        <h3>What you can do</h3>
        <div class="s-b2b-features">${(page.features || []).slice(0, 4).map((f) => `<div><h4>${esc(f.title)}</h4><p>${esc(f.body)}</p></div>`).join("")}</div>
        ${(page.paragraphs || []).slice(0, 2).map((t) => `<p class="s-b2b-p">${esc(t)}</p>`).join("")}
      </section>
      ${slot("overview_mid")}
      <section class="s-b2b-section">
        <h3>Resources</h3>
        <div class="gx-cc gx-cc-outline">${(page.related || []).slice(0, 3).map((c) => contentCard(c)).join("")}</div>
      </section>
    </main>`;
}

// `elementHtml` is placed in the slot named by `placement` (floating is handled by the caller).
export function renderSite(page, elementHtml, placement, label, brand = DEFAULT_BRAND) {
  const slot = (name) =>
    elementHtml && placement === name ? `<div class="slot slot-${name}" data-label="${esc(label)}">${elementHtml}</div>` : "";
  if (B2B_PAGES.has(page.type)) {
    const body = page.type === "home" ? homePage(page, slot) : page.type === "article" ? articlePage(page, slot) : overviewPage(page, slot);
    return b2bHeader(brand) + body + footer(brand);
  }
  const body = page.type === "category" ? categoryPage(page, slot, brand) : productPage(page, slot, brand);
  return header(brand) + body + footer(brand);
}
