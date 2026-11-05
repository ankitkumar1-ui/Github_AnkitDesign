// Demo data, used for the instant preview on page load and when no API key is set.
import { SLOTS } from "./schema.js";

const P = [
  { id: "1", brand: "Glow Recipe", name: "Watermelon Glow Niacinamide Dew Drops", category: "Face Serums", price: 35, salePrice: null, rating: 4.4, reviewCount: 9821, badges: ["BESTSELLER", "CLEAN"], packaging: "dropper", productTint: "#F7A1B5", swatches: [], reason: "Instant dewy glow with niacinamide", cta: "Choose Size" },
  { id: "2", brand: "Rare Beauty", name: "Soft Pinch Liquid Blush", category: "Blush", price: 23, salePrice: null, rating: 4.6, reviewCount: 15302, badges: ["EXCLUSIVE"], packaging: "tube", productTint: "#E8A6A0", swatches: ["#E8798A", "#D9564F", "#C2456B", "#F0A08C"], reason: "Buildable flush that blends like a dream", cta: "Choose Shade" },
  { id: "3", brand: "Drunk Elephant", name: "Protini Polypeptide Cream", category: "Moisturizers", price: 68, salePrice: 54, rating: 4.3, reviewCount: 6120, badges: ["SALE"], packaging: "jar", productTint: "#9EC7E8", swatches: [], reason: "Peptide-rich hydration for bouncy skin", cta: "Add to Basket" },
  { id: "4", brand: "Tatcha", name: "The Dewy Skin Cream", category: "Moisturizers", price: 72, salePrice: null, rating: 4.5, reviewCount: 4870, badges: ["CLEAN"], packaging: "jar", productTint: "#C9B3E3", swatches: [], reason: "Rich, plumping moisture for dry skin", cta: "Choose Size" },
  { id: "5", brand: "Summer Fridays", name: "Jet Lag Mask", category: "Face Masks", price: 49, salePrice: null, rating: 4.4, reviewCount: 3120, badges: ["VEGAN"], packaging: "tube", productTint: "#BFD8D2", swatches: [], reason: "Overnight hydration rescue", cta: "Add to Basket" },
  { id: "6", brand: "Dior", name: "Lip Glow Oil", category: "Lip Oil", price: 40, salePrice: null, rating: 4.5, reviewCount: 4410, badges: ["NEW"], packaging: "lipstick", productTint: "#E9B7C8", swatches: ["#F2B5C4", "#D56D86", "#B23A48"], reason: "Glossy, nourishing cherry-oil shine", cta: "Choose Shade" },
  { id: "7", brand: "Fenty Beauty", name: "Gloss Bomb Universal Lip Luminizer", category: "Lip Gloss", price: 21, salePrice: null, rating: 4.5, reviewCount: 12011, badges: ["BESTSELLER"], packaging: "tube", productTint: "#D9A08B", swatches: ["#D9A08B", "#C77D6E", "#E7B9A5"], reason: "Universally flattering shimmer", cta: "Choose Shade" },
  { id: "8", brand: "YSL Beauty", name: "Libre Eau de Parfum", category: "Perfume", price: 128, salePrice: null, rating: 4.6, reviewCount: 2876, badges: [], packaging: "perfume", productTint: "#E9D3A3", swatches: [], reason: "Warm lavender and orange blossom", cta: "Choose Size" },
];

const n = (kind, text = "", extra = {}) => ({ kind, text, tone: "default", items: [], product: null, children: [], ...extra });

const makeElements = (P, brandName = "BEAUTÉ") => ({
  micro_elicit: {
    type: "micro_elicit",
    eyebrow: "Quick question",
    question: "What's your top skin concern right now?",
    helperText: "We'll tailor the picks on this page to you.",
    selection: "single",
    displayAs: "tiles",
    choices: [
      { label: "Dryness", emoji: "💧", response: "Pair this with a ceramide-rich cream like Protini to lock moisture in." },
      { label: "Dullness", emoji: "✨", response: "Niacinamide drops like these bring back glow in about two weeks." },
      { label: "Breakouts", emoji: "🌿", response: "Stick to lightweight, non-comedogenic layers and add a BHA at night." },
      { label: "Fine lines", emoji: "⏳", response: "Peptides and gentle retinol alternatives will be your best friends." },
    ],
    submitLabel: "Show my picks",
    dismissLabel: "Not now",
    incentive: "Answer to unlock 10% off your first order",
    thankYouMessage: "Thanks! We've updated your recommendations.",
  },
  product_carousel: {
    type: "product_carousel",
    heading: "Glow Getters",
    subheading: "Demo data. Add an API key to generate live options.",
    cardStyle: "minimal",
    cardsPerView: 4,
    products: P,
  },
  product_card: {
    type: "product_card",
    eyebrow: "Pairs well with",
    headline: "Complete the look",
    body: "Shoppers who viewed this item also loved this pick.",
    highlights: ["Customer favourite", "Highly rated", `Only at ${brandName}`],
    layout: "horizontal",
    product: P[2],
  },
  promo_banner: {
    type: "promo_banner",
    eyebrow: "Limited time",
    headline: "Free mini with any skincare purchase",
    body: "Choose a deluxe sample at checkout when you spend $50 or more.",
    ctaLabel: "Shop Skincare",
    secondaryCtaLabel: "See details",
    backgroundColor: "#F6E3E7",
    textTone: "dark",
    motif: "jar",
    motifTint: "#E7A1B0",
  },
  custom: {
    type: "custom",
    root: n("stack", "", {
      children: [
        n("badge", "Bundle & save"),
        n("heading", "Build your 3-step routine"),
        n("text", "Cleanse, treat and moisturize with picks chosen to work together.", { tone: "muted" }),
        n("row", "", { children: [n("product_tile", "", { product: P[0] }), n("product_tile", "", { product: P[2] }), n("product_tile", "", { product: P[4] })] }),
        n("row", "", { children: [n("text", "Bundle and save 15%", { tone: "accent" }), n("button", "Add all 3")] }),
      ],
    }),
  },
});

const LABELS = { micro_elicit: "Skin concern quiz", product_carousel: "Glow carousel", product_card: "Pairing spotlight", promo_banner: "Free mini promo", custom: "Routine builder" };

const DEFAULT_SLOT = {
  product: { micro_elicit: "floating", product_carousel: "pdp_below_hero", product_card: "pdp_buy_box", promo_banner: "pdp_above_reviews", custom: "pdp_below_hero" },
  category: { micro_elicit: "floating", product_carousel: "plp_in_grid", product_card: "plp_sidebar", promo_banner: "plp_top", custom: "plp_top" },
};

const makePages = (P) => ({
  product: {
    type: "product",
    breadcrumb: ["Skincare", "Treatments", "Face Serums"],
    title: P[0].name,
    heroProduct: P[0],
    description: "A lightweight, hydrating serum that gives skin a dewy, glowing finish. Niacinamide evens tone while watermelon and hyaluronic acid deliver lasting moisture.",
    highlights: ["Niacinamide 2%", "Hyaluronic acid", "Fragrance-free", "Clean at BEAUTÉ"],
    gridProducts: P,
  },
  category: {
    type: "category",
    breadcrumb: ["Skincare", "Moisturizers"],
    title: "Moisturizers",
    heroProduct: P[2],
    description: "",
    highlights: [],
    gridProducts: P,
  },
});

export function mockExperience(req, brand) {
  // With an analysed brand, show its real products; the copy stays generic demo text.
  const useBrand = brand?.products?.length >= 4;
  const products = useBrand
    ? brand.products.map((p) => ({ ...p, swatches: [], reason: "Popular right now", cta: brand.commerce.addToCartLabel }))
    : P;
  const ELEMENTS = makeElements(products, brand?.name);
  const PAGES = makePages(products);
  if (useBrand) {
    PAGES.product.breadcrumb = [products[0].category];
    PAGES.product.description = `${products[0].name} by ${products[0].brand}. Demo page: click Generate to create real page copy.`;
    PAGES.product.highlights = [];
    PAGES.category.breadcrumb = [products[2].category];
    PAGES.category.title = products[2].category;
  }
  const pageType = req.pageType === "category" ? "category" : "product";
  const types = req.elementType === "auto" ? ["micro_elicit", "product_carousel", "product_card"] : Array(3).fill(req.elementType);
  const slots = SLOTS[pageType];

  const options = types.slice(0, req.optionCount).map((type, i) => {
    const first = DEFAULT_SLOT[pageType][type];
    const placement = req.placement !== "auto" ? req.placement : slots[(slots.indexOf(first) + (req.elementType === "auto" ? 0 : i)) % slots.length];
    return {
      label: LABELS[type],
      rationale: "Demo data. Add your OpenAI API key and click Generate to create real options for your instruction.",
      placement,
      accentColor: brand?.colors.accent || "#CF112C",
      element: ELEMENTS[type],
    };
  });

  return { page: PAGES[pageType], options };
}
