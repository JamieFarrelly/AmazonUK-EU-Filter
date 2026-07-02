# Amazon UK EU-Only Filter

A Chrome (Manifest V3) extension that filters amazon.co.uk to show only items
sold by Amazon EU, avoiding the customs charge (€3 + VAT) that applies to
non-EU-sold items on orders under €150, in effect since 1 July.

It works by appending Amazon's own seller facet (`p_6:A30DC7701CXIBH`,
the "Amazon EU S.à r.l." seller ID) to search/category URLs, and by
badging product pages that don't go through search (e.g. shared links)
with the seller's EU/non-EU status.

## What it does

- **Search & category pages** (`/s`, `/b`): redirects the URL to include the
  Amazon EU seller facet, so only EU-sold items appear. Shows a blue,
  EU-flag-styled banner at the top of results confirming filter status
  (or a grey one when disabled).
- **Product pages** (`/dp/*`, `/gp/product/*`): reads the "Sold by" field in
  the buybox and shows a green ("no customs fee") or red ("customs fee may
  apply") badge above it.
- **Popup toggle**: turn filtering on/off; toggling reloads any open
  amazon.co.uk tabs so the change takes effect immediately.

## Why it's built this way

Amazon UK has (at least) two different navigation paths that need separate
handling:

1. **Real network navigation** (typed URL, bookmark, external link) — handled
   by `background.js` using `declarativeNetRequest` dynamic rules to redirect
   at the network layer before the page loads.
2. **Client-side navigation** (Amazon's search box, filters, pagination use
   `fetch` + `history.pushState` and never fire a fresh `main_frame`
   request) — `declarativeNetRequest` never sees these, so `search-filter.js`
   polls `location.href` (on `popstate` and a 400ms interval) and forces a
   real navigation via `window.location.replace()` when the seller facet is
   missing.

A `sessionStorage` guard (`euFilterCorrectionAttempts`, max 2 per distinct
query) caps how many times `search-filter.js` will force-correct the same
search, so a query Amazon genuinely won't filter (e.g. zero EU-sold results)
doesn't reload forever.

Product pages are handled entirely separately (`content.js`) because they
aren't reachable via the facet redirect — a shared/bookmarked product link
goes straight to `/dp/...` with no search step to intercept.

## File overview

| File | Runs on | Purpose |
|---|---|---|
| `manifest.json` | — | MV3 manifest: permissions, content script matches |
| `background.js` | service worker | `declarativeNetRequest` rules that redirect `/s` and `/b` URLs to include the EU seller facet; sets the toolbar badge; reloads Amazon tabs when the toggle changes |
| `search-filter.js` | `/s*`, `/b*` (`document_start`) | Catches SPA-style navigation the network rules miss; renders the "EU-Only Filter: ON/OFF" status banner |
| `content.js` | `/dp/*`, `/gp/product/*` (`document_idle`) | Scrapes the buybox "Sold by" seller name, classifies EU vs non-EU, renders the badge |
| `content.css` | shared | Styles for both the product badge and the search/category status banner (incl. the EU star-ring SVG) |
| `popup.html` / `popup.js` / `popup.css` | extension popup | On/off toggle, backed by `chrome.storage.sync` (`enabled`, default `true`) |
| `icons/gen_icons.py` | — | Regenerates `icons/icon{16,48,128}.png` (pure-Python PNG encoder, no Pillow dependency) — an EU-blue square with a ring of 12 gold five-pointed stars, matching the status banner's star design |

## Development

No build step — load the repo directly as an unpacked extension via
`chrome://extensions` → Developer mode → **Load unpacked**.

**After any code change, click the reload icon for the extension in
`chrome://extensions`.** Chrome does not hot-reload content scripts or the
service worker.

To regenerate the icons after changing `icons/gen_icons.py`:

```sh
cd icons && python3 gen_icons.py
```

## Known limitations

- Only covers `/s`, `/b`, `/dp/*`, and `/gp/product/*` on `www.amazon.co.uk`.
  Personalized feed/recommendation pages (e.g. `/hz/mobile/mission/`) don't
  expose a filterable URL param or per-item seller info in their DOM, so
  they're currently untouched by design.
- Seller detection in `content.js` depends on Amazon's buybox DOM structure
  (currently `#tabular-buybox`, `#merchant-info`,
  `#merchantInfoFeature_feature_div`, and a generic label/value fallback).
  Amazon changes this markup periodically — if the badge stops appearing on
  product pages, check the DOM structure for `#buybox`/`#desktop_buybox`
  first before assuming a logic bug; a new selector strategy will likely
  need to be added alongside the existing ones (don't replace them, other
  layouts may still use the old markup).
- EU-vs-non-EU classification for the product badge is a regex match
  (`/amazon\s*eu/i`) against the seller name text, not the seller ID facet
  used for search filtering — a seller literally named e.g. "Amazon EU
  Wholesale" would be misclassified. Low risk in practice but worth knowing.

## Notes for future AI-assisted changes

- Keep the vanilla-JS, no-build-step, no-dependencies style — this is a
  small unpacked extension, not a bundled app.
- Verify DOM-scraping changes against the live site rather than assumptions;
  Amazon's markup differs between layouts/AB tests and has changed at least
  once during this project's development (see Known limitations above).
- When changing anything in `content.css` or the content scripts, remind
  whoever is testing to reload the unpacked extension in
  `chrome://extensions` — this has been a recurring source of "it's not
  working" reports that were actually stale code.
