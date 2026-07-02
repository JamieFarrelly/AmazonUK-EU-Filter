# Chrome Web Store listing copy

Paste these directly into the Developer Dashboard fields. Character counts
are given because the Store enforces hard limits.

## Title (max 45 characters)

```
Amazon UK EU-Only Filter
```
(25 characters — matches `manifest.json` "name", which the Store requires)

## Summary / short description (max 132 characters)

```
Show only Amazon EU-sold items on amazon.co.uk to skip the new non-EU customs charge on orders under £135/€150.
```
(113 characters)

## Detailed description

```
Since 1 July, orders shipped from outside the EU can attract a €3 + VAT
customs handling fee, even on orders under the €150 threshold. On
amazon.co.uk, some listings are dispatched from the UK/non-EU sellers,
while others are sold by Amazon EU itself — those don't carry the fee.

This extension makes it easy to shop around the charge:

• SEARCH & CATEGORY PAGES — automatically filters results to only show
  items sold by Amazon EU, using Amazon's own seller filter. A banner at
  the top of the page confirms the filter is active.

• PRODUCT PAGES — if you land on a product page directly (a shared link,
  bookmark, or search engine result), a badge shows whether that specific
  listing is sold by Amazon EU (no customs fee) or another seller
  (customs fee may apply), so you're never caught out.

• ONE-CLICK TOGGLE — turn filtering on or off from the toolbar icon at
  any time.

No account, sign-up, or data collection required. The extension only
reads and modifies amazon.co.uk pages you visit — see the privacy policy
for full details.

Not affiliated with or endorsed by Amazon.
```

## Category

```
Shopping
```

## Language

```
English (United Kingdom)
```

## Screenshots

Chrome Web Store requires at least one screenshot, 1280x800 or 640x400,
PNG or JPEG. Three were captured live during development and are
attached in this conversation for you to save — recommended filenames:

1. `store-listing/screenshots/01-search-filter-banner.png` — search
   results page with the "EU-Only Filter: ON" banner and filtered results.
2. `store-listing/screenshots/02-product-non-eu-badge.png` — product page
   showing the red "customs fee may apply" badge.
3. `store-listing/screenshots/03-product-eu-badge.png` — product page
   showing the green "no customs fee" badge.

To save them: right-click each image earlier in this conversation and
"Save Image As...", or drag it out of the chat, into the paths above.

## Promotional images (optional but recommended)

Generated automatically — see `store-listing/promo/`:
- `small_tile.png` (440x280) — used in search results / category browsing
- `marquee.png` (1400x560) — used if Google features the extension

## Permissions justification

The Store review form asks you to justify each permission. Use:

**storage** — "Stores the user's on/off toggle preference (a single
boolean) locally via chrome.storage.sync. No other data is stored."

**declarativeNetRequest** — "Used to redirect amazon.co.uk search and
category URLs to append Amazon's own seller-filter query parameter,
so results show only Amazon EU-sold items. No request content is read
or transmitted anywhere."

**Host permission (`*://www.amazon.co.uk/*`)** — "The extension's entire
purpose is scoped to amazon.co.uk — filtering search/category pages and
badging product pages with seller/customs-fee status. It does not run on
any other site."

## Single purpose description

```
Filters amazon.co.uk search and product pages to highlight items sold by
Amazon EU, helping shoppers avoid the new non-EU customs charge.
```

## Data usage disclosures (Privacy practices tab)

When asked "Does this item collect or use user data?", answer **No** to
all categories — this extension makes no network requests of its own,
sends no data anywhere, and stores only a local on/off boolean. Link to
`PRIVACY.md` (hosted or pasted inline) as the privacy policy.
