// The UI contract between the model and the frontend. The JSON Schema is built
// per request, so a fixed element type / page / placement chosen in the UI, and
// the brand's real product images, are enforced by Structured Outputs rather
// than just requested in the prompt.
import { str, hex, num, oneOf, arr, obj, enumOrNull } from "./jsonschema.js";

export const ELEMENT_TYPES = ["product_carousel", "product_card", "micro_elicit", "promo_banner", "custom"];

export const SLOTS = {
  product: ["pdp_buy_box", "pdp_below_hero", "pdp_above_reviews", "floating"],
  category: ["plp_top", "plp_in_grid", "plp_sidebar", "floating"],
};

export const PACKAGING = ["bottle", "jar", "tube", "dropper", "lipstick", "compact", "perfume", "box"];

const PRODUCT = { $ref: "#/$defs/product" };
const NODE = { $ref: "#/$defs/node" };

const productDef = (imageUrls) =>
  obj({
    id: str(),
    brand: str(),
    name: str(),
    category: str(),
    price: num("List price"),
    salePrice: { type: ["number", "null"], description: "Sale price, or null if not on sale" },
    rating: num("0-5, one decimal"),
    reviewCount: { type: "integer" },
    badges: arr(str(), "0 to 2 short badge labels"),
    imageUrl: enumOrNull(imageUrls, "Real product image from the catalog, or null for an invented product"),
    packaging: oneOf(PACKAGING, "Shape used to draw the product if there is no image"),
    productTint: hex("Main colour of the product packaging"),
    swatches: arr(hex(), "0 to 5 shade swatches; empty for non-shade products"),
    reason: str("Why this product fits, max 12 words"),
    cta: str("Button label, e.g. the site's add-to-cart label or 'Choose Shade'"),
  });

// Generic building blocks for anything that isn't a predefined component.
const node = obj({
  kind: oneOf(["stack", "row", "heading", "text", "button", "chips", "badge", "divider", "input", "product_tile"]),
  text: str("Heading/text/button/badge label or input placeholder; empty for containers, chips and dividers"),
  tone: oneOf(["default", "muted", "accent", "inverse"]),
  items: arr(str(), "Chip labels (chips only), otherwise empty"),
  product: { anyOf: [PRODUCT, { type: "null" }], description: "product_tile only, otherwise null" },
  children: arr(NODE, "Child nodes (stack and row only), otherwise empty"),
});

const COMPONENTS = {
  product_carousel: obj({
    type: oneOf(["product_carousel"]),
    heading: str("Short merchandising headline, max 6 words"),
    subheading: str("One sentence explaining the curation"),
    cardStyle: oneOf(["minimal", "editorial", "bold"], "minimal = clean/clinical, editorial = luxe, bold = playful"),
    cardsPerView: { type: "integer", enum: [3, 4, 5] },
    products: arr(PRODUCT, "5 to 8 products"),
  }),
  product_card: obj({
    type: oneOf(["product_card"]),
    eyebrow: str("2-4 word kicker, e.g. 'Pairs well with'"),
    headline: str(),
    body: str("1-2 sentences"),
    highlights: arr(str(), "2 to 4 short benefit tags"),
    layout: oneOf(["horizontal", "vertical"]),
    product: PRODUCT,
  }),
  micro_elicit: obj({
    type: oneOf(["micro_elicit"]),
    eyebrow: str(),
    question: str("One short question"),
    helperText: str("Why we ask, max 12 words"),
    selection: oneOf(["single", "multiple"]),
    displayAs: oneOf(["chips", "tiles", "list"]),
    choices: arr(
      obj({ label: str(), emoji: str("Single emoji"), response: str("Personalised reply shown after this pick, max 20 words") }),
      "3 to 6 choices"
    ),
    submitLabel: str(),
    dismissLabel: str(),
    incentive: str("Optional reward for answering, or empty string"),
    thankYouMessage: str(),
  }),
  promo_banner: obj({
    type: oneOf(["promo_banner"]),
    eyebrow: str(),
    headline: str(),
    body: str(),
    ctaLabel: str(),
    secondaryCtaLabel: str("Or empty string"),
    backgroundColor: hex(),
    textTone: oneOf(["dark", "light"], "Text colour that contrasts with backgroundColor"),
    motif: oneOf(PACKAGING),
    motifTint: hex(),
  }),
  custom: obj({ type: oneOf(["custom"]), root: NODE }),
};

/** Shared with the B2B schema. */
export const MICRO_ELICIT = COMPONENTS.micro_elicit;

export function normalizeRequest(body = {}) {
  const instruction = String(body.instruction || "").trim().slice(0, 1000);
  const elementType = ELEMENT_TYPES.includes(body.elementType) ? body.elementType : "auto";
  const placement = [...SLOTS.product, ...SLOTS.category].includes(body.placement) ? body.placement : "auto";
  let pageType = ["product", "category"].includes(body.pageType) ? body.pageType : "auto";
  if (placement.startsWith("pdp_")) pageType = "product";
  if (placement.startsWith("plp_")) pageType = "category";
  const pageTypes = pageType === "auto" ? ["product", "category"] : [pageType];
  const slots = placement !== "auto" ? [placement] : [...new Set(pageTypes.flatMap((t) => SLOTS[t]))];
  const optionCount = Math.min(3, Math.max(1, parseInt(body.optionCount, 10) || 2));
  return { instruction, elementType, pageType, pageTypes, placement, slots, optionCount };
}

export function buildSchema({ elementType, pageTypes, slots, optionCount }, brand) {
  const types = elementType === "auto" ? ELEMENT_TYPES : [elementType];
  const element = types.length === 1 ? COMPONENTS[types[0]] : { anyOf: types.map((t) => COMPONENTS[t]) };
  const imageUrls = [...new Set((brand?.products || []).map((p) => p.imageUrl).filter(Boolean))];

  return {
    type: "object",
    additionalProperties: false,
    required: ["page", "options"],
    $defs: { product: productDef(imageUrls), node },
    properties: {
      page: obj({
        type: oneOf(pageTypes),
        breadcrumb: arr(str(), "2-3 levels, e.g. Skincare > Moisturizers"),
        title: str("Category name on a category page; hero product name on a product page"),
        heroProduct: PRODUCT,
        description: str("2-3 sentence 'About the product' copy for the hero product"),
        highlights: arr(str(), "3-5 short product highlights"),
        gridProducts: arr(PRODUCT, "8 products: the category grid, or 'Similar products' on a product page"),
      }),
      options: {
        type: "array",
        minItems: optionCount,
        maxItems: optionCount,
        items: obj({
          label: str("2-4 word name for this option"),
          rationale: str("One sentence: why this design and placement"),
          placement: oneOf(slots),
          accentColor: hex("Accent colour for this element"),
          element,
        }),
      },
    },
  };
}

const SLOT_GUIDE = `Placement slots:
- pdp_buy_box: narrow column (~360px) under the add-to-cart button on a product page. Compact content only.
- pdp_below_hero: full width directly under the product hero.
- pdp_above_reviews: full width after product details, before reviews.
- plp_top: full width above the product grid on a category page.
- plp_in_grid: full-width row inserted after the first row of the category grid.
- plp_sidebar: narrow column (~220px) under the filters on a category page. Compact content only.
- floating: small overlay card (~340px) in the bottom-right corner. Best for micro-elicits and nudges.
Only use slots that belong to the page type (pdp_* on product pages, plp_* on category pages; floating works on both).

Element types:
- product_carousel: horizontally scrolling product cards, 5-8 products.
- product_card: one highlighted product with eyebrow, headline, short body and 2-4 highlights.
- micro_elicit: a one-question micro-survey that elicits shopper intent or preference. 3-6 choices, each with an emoji and a short personalised response shown after picking it.
- promo_banner: merchandising or promo banner with headline, body and CTA(s).
- custom: anything else, composed from a tree of primitive nodes. Keep trees shallow (max 4 levels) and well structured.`;

const DEFAULT_SYSTEM_PROMPT = `You are a generative-UI engine for BEAUTÉ, a prestige beauty retailer whose storefront looks like a modern prestige beauty site (black and white, clean, product-led).
A merchandiser describes an on-site element they want. You return:

1. "page": the storefront page the element lives on, either a product detail page (type "product") or a category listing page (type "category"). Invent a coherent page context that fits the request: hero product, breadcrumb, title, description, highlights and 8 grid products. Use well-known prestige beauty brands with realistic prices, ratings and review counts.

2. "options": distinct design options for the requested element. Make them meaningfully different (angle, copy, layout, placement, or element type when the type isn't fixed), not cosmetic variants.

${SLOT_GUIDE}

Copy should be concise, warm and confident. The store is called BEAUTÉ; never mention other retailers.`;

const catalogLine = (p) =>
  [p.id, p.brand, p.name, p.category, p.price, p.salePrice ?? "-", p.rating, p.reviewCount, p.badges.join("/") || "-", p.imageUrl ?? "-", p.productTint, p.packaging].join(" | ");

function brandSystemPrompt(b) {
  const { products, ...profile } = b;
  return `You are a generative-UI engine for ${b.name} (${b.domain}). Everything you design is rendered inside a faithful replica of ${b.domain}, styled with the brand profile below, so it must feel native to ${b.name}'s real website.
A merchandiser describes an on-site element they want. You return:

1. "page": the ${b.name} page the element lives on, either a product detail page (type "product") or a category listing page (type "category"). Use ${b.name}'s real category names and breadcrumb structure.

2. "options": distinct design options for the requested element. Make them meaningfully different (angle, copy, layout, placement, or element type when the type isn't fixed), not cosmetic variants.

Brand rules:
- Write in ${b.name}'s tone of voice: ${b.voice}
- Use the site's own terminology: add-to-cart label "${b.commerce.addToCartLabel}"${b.commerce.loyaltyProgram ? `, loyalty programme "${b.commerce.loyaltyProgram}"` : ""}, badge labels like ${b.commerce.badgeLabels.map((l) => `"${l}"`).join(", ") || "the site's own"}.
- Use colours from the brand palette for accentColor and banner backgrounds (primary ${b.colors.primary}, accent ${b.colors.accent}, sale ${b.colors.sale}, surface ${b.colors.surface}).
- Use REAL products from the catalog below wherever they fit, copying id, brand, name, price, salePrice, rating, reviewCount, badges, imageUrl, productTint and packaging exactly. Only invent a product when nothing in the catalog fits; then set imageUrl to null and keep it realistic for ${b.name}.
- Never mention other retailers.

${SLOT_GUIDE}

BRAND PROFILE (JSON):
${JSON.stringify(profile)}

PRODUCT CATALOG (id | brand | name | category | price | salePrice | rating | reviews | badges | imageUrl | tint | packaging):
${products.map(catalogLine).join("\n") || "(no products found on the site; invent realistic ones with imageUrl null)"}`;
}

export const buildSystemPrompt = (brand) => (brand ? brandSystemPrompt(brand) : DEFAULT_SYSTEM_PROMPT);

export function buildUserPrompt({ instruction, elementType, pageType, placement, optionCount }) {
  return [
    `Request: ${instruction}`,
    `Element type: ${elementType === "auto" ? "your choice; pick what fits the request best (options may differ)" : elementType}`,
    `Page: ${pageType === "auto" ? "your choice" : `${pageType} page`}`,
    `Placement: ${placement === "auto" ? "your choice per option" : placement}`,
    `Number of options: ${optionCount}`,
  ].join("\n");
}
