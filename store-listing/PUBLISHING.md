# Publishing checklist

Everything content-related is prepared in this repo. The remaining steps
involve your Google/Chrome Web Store developer account and a payment, so
they need to be done by you directly at
https://chrome.google.com/webstore/devconsole — these aren't things I can
do on your behalf.

## What's already prepared

- [x] `store-listing/amazon-uk-eu-filter.zip` — the upload package
      (manifest, scripts, CSS, icons only — no dev/README files)
- [x] `store-listing/LISTING.md` — title, description, category,
      permission justifications, single-purpose description
- [x] `PRIVACY.md` — privacy policy text (host it somewhere public, e.g.
      as a GitHub Pages page or gist, or paste inline if the dashboard
      allows a text field instead of a URL)
- [x] `icons/icon{16,48,128}.png` — EU-star extension icons
- [x] `store-listing/promo/small_tile.png` (440x280) and `marquee.png`
      (1400x560) — optional promotional images
- [ ] `store-listing/screenshots/*.png` — save the 3 screenshots shared
      earlier in this conversation into this folder (see LISTING.md for
      filenames/order)

## Steps for you to do manually

1. **Create/sign in to a Chrome Web Store developer account** at the
   dashboard link above (one-off $5 registration fee if you haven't
   published before).
2. **New item → upload `store-listing/amazon-uk-eu-filter.zip`.**
3. **Store listing tab**: paste in the title, summary, description, and
   category from `store-listing/LISTING.md`; upload the screenshots and
   (optionally) the promo tile/marquee images.
4. **Privacy practices tab**: paste the permission justifications from
   `LISTING.md`, link to a hosted copy of `PRIVACY.md` (or paste its
   content if a URL isn't required), and answer "No" to the data-collection
   questions.
5. **Distribution**: choose visibility (Public, or Unlisted if you'd
   rather share a direct link only) and region (United Kingdom, or
   worldwide — the extension only functions on amazon.co.uk regardless).
6. **Submit for review.** Google's review typically takes a few hours to
   a few days for a first-time small extension like this.

## Before you submit — worth deciding

- Consider whether "Amazon UK EU-Only Filter" as the public name reads
  clearly to someone who hasn't seen this conversation — it's accurate
  but you may prefer something punchier for the store listing (the
  `manifest.json` `name` field must match whatever you put as the title).
- The extension is UK-specific by design (only runs on amazon.co.uk) —
  no changes needed for that, just flagging it so the store region/
  audience settings match.
