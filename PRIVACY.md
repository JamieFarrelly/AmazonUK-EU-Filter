# Privacy Policy — Amazon UK EU-Only Filter

Last updated: 2026-07-02

This extension does not collect, store, transmit, or sell any personal
data, browsing history, or user content.

## What the extension does locally

- Stores a single on/off preference (`enabled: true/false`) using Chrome's
  built-in `chrome.storage.sync`, which syncs it across your own signed-in
  Chrome browsers via your Google account — the same way Chrome syncs
  bookmarks. This value never leaves Chrome's own sync infrastructure and
  is never sent to any server operated by this extension's developer.
- Reads the "Sold by" text already visible on amazon.co.uk product pages,
  purely in your browser, to decide whether to show a green or red badge.
  This text is never stored or transmitted anywhere.
- Redirects amazon.co.uk search/category URLs to include Amazon's own
  seller-filter query parameter. This is a local URL rewrite; no separate
  network request or third-party server is involved.

## What the extension does not do

- No analytics, telemetry, or crash reporting.
- No cookies set or read.
- No network requests to any server other than amazon.co.uk itself (which
  your browser was already contacting to load the page).
- No data is shared with or sold to any third party.

## Permissions

- `storage` — to remember your on/off toggle.
- `declarativeNetRequest` — to rewrite amazon.co.uk search/category URLs.
- Host access to `*://www.amazon.co.uk/*` — the extension only runs on
  this domain.

## Contact

Questions about this policy can be raised via the extension's Chrome Web
Store listing support channel.
