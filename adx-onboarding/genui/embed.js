// Compact preview for ADX Studio: generates 3 options for one experience and shows each in place
// on the brand's template storefront. Query: ?brand=sephora.com&instruction=…&type=micro_elicit&page=category
import { esc, renderElement, hydrate, setCurrency, TYPE_LABELS } from "./components.js";
import { renderSite, resolvePlacement, pageUrl, themeVars, loadFonts, DEFAULT_BRAND, SLOT_LABELS, NARROW_SLOTS } from "./site.js";
import { mockExperience } from "./lib/mock.js";
import { normalizeRequest } from "./lib/schema.js";

const $ = (id) => document.getElementById(id);
const LETTERS = ["A", "B", "C"];
// Same storage keys as the full GenUI studio, so the key and model are shared with it.
const store = {
  get: (k) => { try { return localStorage.getItem(k) || ""; } catch { return ""; } },
  set: (k, v) => { try { v ? localStorage.setItem(k, v) : localStorage.removeItem(k); } catch { /* ignore */ } },
};
const KEY = "openai_api_key";
const MODEL = "openai_model";

const q = new URLSearchParams(location.search);
const site = q.get("brand") || "sephora.com";
const request = { instruction: q.get("instruction") || "", elementType: q.get("type") || "auto", pageType: q.get("page") || "auto", optionCount: 3 };
const state = { spec: null, active: 0, brand: null };

const frame = $("frame");
const siteEl = $("site");
const floatEl = $("floating");
hydrate(siteEl);
hydrate(floatEl);

// Prototype copy (ADX onboarding): no GenUI server here, so the API runs in the page with the same
// demo data the server returns without an OpenAI key (lib/mock.js) and the cached Sephora brand.
async function api(path, body) {
  if (path === "models") return { models: [], defaultModel: "" };
  if (path === "brand") {
    const res = await fetch(`brands/${String(body.site || "sephora.com").replace(/^https?:\/\//, "").replace(/^www\./, "").split("/")[0]}.json`);
    return { brand: res.ok ? await res.json() : null };
  }
  if (path === "generate") {
    const brand = body.brand ? (await api("brand", { site: body.brand })).brand?.profile : null;
    return { ...mockExperience(normalizeRequest(body), brand), meta: { model: "demo data", ms: 0 } };
  }
  throw new Error(`Unknown request: ${path}`);
}

function busy(text) {
  $("loading").hidden = !text;
  $("loading-text").textContent = text || "";
}

function applyBrand(entry) {
  state.brand = entry?.profile || null;
  const b = state.brand || DEFAULT_BRAND;
  for (const [k, v] of Object.entries(themeVars(b))) frame.style.setProperty(k, v);
  loadFonts(b);
  setCurrency(b.commerce.currencySymbol);
}

async function load({ refresh = false } = {}) {
  $("error").hidden = true;
  $("note").hidden = true;
  const model = store.get(MODEL) || undefined;
  try {
    if (!state.brand) {
      busy(`Loading ${site}…`);
      let entry = (await api("brand", { site, cachedOnly: true })).brand;
      if (!entry && store.get(KEY)) {
        busy(`Reading ${site}’s brand (first time only, about a minute)…`);
        entry = (await api("brand", { site, model }).catch(() => ({}))).brand;
      }
      applyBrand(entry);
    }
    busy(refresh ? "Generating new options…" : "Generating 3 options…");
    state.spec = await api("generate", { ...request, brand: state.brand ? state.brand.domain : undefined, site, siteType: q.get("siteType") || undefined, model, refresh });
    state.active = Math.min(state.active, state.spec.options.length - 1);
    if (/demo data/i.test(state.spec.meta?.model || "")) {
      $("note").hidden = false;
      $("note").textContent = "Showing demo options.";
    }
    render();
  } catch (e) {
    $("error").hidden = false;
    $("error").textContent = e.message;
  } finally {
    busy(null);
  }
}

function render() {
  const { spec } = state;
  if (!spec) return;
  const placementOf = (o) => resolvePlacement(spec.page.type, o.placement);
  $("tabs").innerHTML = spec.options
    .map((o, i) => `
      <button class="tab" role="tab" data-i="${i}" aria-selected="${i === state.active}">
        <span class="tab-letter">${LETTERS[i]}</span>
        <span class="tab-text"><b>${esc(o.label)}</b><small>${esc(TYPE_LABELS[o.element.type] || o.element.type)} · ${esc(SLOT_LABELS[placementOf(o)])}</small></span>
      </button>`)
    .join("");
  const option = spec.options[state.active];
  const placement = placementOf(option);
  const label = `Option ${LETTERS[state.active]} · ${SLOT_LABELS[placement]}`;
  const html = renderElement(option, { compact: NARROW_SLOTS.has(placement) });
  const brand = state.brand || DEFAULT_BRAND;
  $("rationale").textContent = $("note").hidden ? option.rationale : "";
  $("url").textContent = pageUrl(spec.page, brand);
  $("meta").textContent = spec.meta?.model && !/demo/i.test(spec.meta.model) ? spec.meta.model : "";
  siteEl.innerHTML = renderSite(spec.page, placement === "floating" ? null : html, placement, label, brand);
  floatEl.innerHTML = placement === "floating" ? `<div class="slot" data-label="${esc(label)}">${html}</div>` : "";
  // Desktop: scale the 1280px storefront to the width available.
  const zoom = frame.classList.contains("desktop") ? Math.min(1, frame.clientWidth / 1280) : 1;
  frame.style.setProperty("--z", String(zoom));
  requestAnimationFrame(() => {
    const scroller = $("site-scroll");
    const slot = siteEl.querySelector(".slot");
    const top = slot ? (slot.getBoundingClientRect().top - scroller.getBoundingClientRect().top) / zoom + scroller.scrollTop - 90 : 0;
    scroller.scrollTo({ top: Math.max(0, top) });
  });
}

$("tabs").addEventListener("click", (e) => {
  const tab = e.target.closest(".tab");
  if (!tab) return;
  state.active = Number(tab.dataset.i);
  render();
});

$("device").addEventListener("click", (e) => {
  const btn = e.target.closest("button");
  if (!btn) return;
  $("device").querySelectorAll("button").forEach((b) => b.classList.toggle("on", b === btn));
  frame.classList.toggle("mobile", btn.dataset.device === "mobile");
  frame.classList.toggle("desktop", btn.dataset.device === "desktop");
  render();
});

$("regen").addEventListener("click", () => load({ refresh: true }));

// ---- OpenAI settings (key + model), stored in this browser
async function openSettings() {
  $("key").value = store.get(KEY);
  await fillModels();
  $("settings").hidden = false;
  $("key").focus();
}
async function fillModels() {
  const select = $("model");
  const current = store.get(MODEL);
  try {
    const data = await api("models");
    const models = data.models.includes(current) || !current ? data.models : [current, ...data.models];
    select.innerHTML = models.map((m) => `<option ${m === (current || data.defaultModel) ? "selected" : ""}>${esc(m)}</option>`).join("");
  } catch {
    select.innerHTML = `<option>${esc(current || "gpt-6-luna")}</option>`;
  }
}
$("settings-btn").addEventListener("click", openSettings);
$("key").addEventListener("change", () => { store.set(KEY, $("key").value.trim()); fillModels(); });
$("settings-cancel").addEventListener("click", () => { $("settings").hidden = true; });
$("settings").addEventListener("click", (e) => { if (e.target === $("settings")) $("settings").hidden = true; });
document.addEventListener("keydown", (e) => { if (e.key === "Escape") $("settings").hidden = true; });
$("settings-form").addEventListener("submit", (e) => {
  e.preventDefault();
  store.set(KEY, $("key").value.trim());
  store.set(MODEL, $("model").value);
  $("settings").hidden = true;
  state.brand = null;
  window.addEventListener("resize", () => { if (frame.classList.contains("desktop")) render(); });

load();
});

// Start in the device the host asks for (?device=desktop when there's room).
if (q.get("device") === "desktop") $("device").querySelector('[data-device="desktop"]').click();

window.addEventListener("resize", () => { if (frame.classList.contains("desktop")) render(); });

load();
