(function () {
  const BADGE_ID = "eu-filter-badge";
  const EU_SELLER_MATCH = /amazon\s*eu/i;
  const ANCHOR_SELECTOR =
    "#title_feature_div, #productTitle, #centerCol, #ppd, #tabular-buybox, #merchant-info, #desktop_buybox, #buybox";

  function findSoldByText() {
    const tabularRows = document.querySelectorAll(
      "#tabular-buybox .tabular-buybox-text"
    );
    for (const row of tabularRows) {
      const label = row.getAttribute("tabular-attribute-name") || "";
      if (/sold by/i.test(label) && row.textContent.trim()) {
        return row.textContent.trim();
      }
    }

    const merchantInfo = document.querySelector("#merchant-info");
    if (merchantInfo) {
      const text = merchantInfo.textContent.replace(/\s+/g, " ").trim();
      const match = text.match(/sold by ([^.,]+)/i);
      if (match) return match[1].trim();
    }

    const merchantFeature = document.querySelector(
      "#merchantInfoFeature_feature_div"
    );
    if (merchantFeature) {
      const valueEl = merchantFeature.querySelector(
        ".offer-display-feature-text-message"
      );
      if (valueEl && valueEl.textContent.trim()) {
        return valueEl.textContent.trim();
      }
    }

    const offerLabels = document.querySelectorAll(
      ".offer-display-feature-label"
    );
    for (const label of offerLabels) {
      if (!/sold by/i.test(label.textContent.trim())) continue;
      const container = label.closest('[id$="Feature_feature_div"]');
      if (!container) continue;
      const valueEl = container.querySelector(
        ".offer-display-feature-text-message"
      );
      if (valueEl && valueEl.textContent.trim()) {
        return valueEl.textContent.trim();
      }
    }

    const buybox = document.querySelector(
      "#buybox, #desktop_buybox, #tabular-buybox-container"
    );
    if (buybox) {
      const candidates = buybox.querySelectorAll("label, span, div, td, th");
      for (const el of candidates) {
        if (/^sold by$/i.test(el.textContent.trim())) {
          const value = el.nextElementSibling;
          if (value && value.textContent.trim()) {
            return value.textContent.trim();
          }
        }
      }
    }

    return null;
  }

  function classify(sellerText) {
    if (!sellerText) return null;
    return EU_SELLER_MATCH.test(sellerText) ? "eu" : "non-eu";
  }

  // Amazon often repeats the seller name in adjacent visible/screen-reader
  // spans within the same container, so a naive textContent read doubles it.
  function dedupeRepeatedText(text) {
    if (!text) return text;
    const words = text.trim().split(/\s+/);
    if (words.length % 2 !== 0) return text.trim();
    const mid = words.length / 2;
    const first = words.slice(0, mid).join(" ");
    const second = words.slice(mid).join(" ");
    return first === second ? first : text.trim();
  }

  function ensureBadge(status, sellerText) {
    const existingBadges = Array.from(
      document.querySelectorAll(".eu-filter-badge")
    );

    if (!status) {
      existingBadges.forEach((el) => el.remove());
      return;
    }

    const message =
      status === "eu"
        ? "Sold by Amazon EU — no customs fee"
        : `Sold by ${sellerText} — €3 + VAT customs fee may apply`;

    const upToDate = existingBadges.find(
      (el) => el.dataset.status === status && el.textContent === message
    );
    existingBadges.forEach((el) => {
      if (el !== upToDate) el.remove();
    });
    if (upToDate) return;

    const anchor = document.querySelector(ANCHOR_SELECTOR);
    if (!anchor || !anchor.parentElement) return;

    const badge = document.createElement("div");
    badge.id = BADGE_ID;
    badge.dataset.status = status;
    badge.className = `eu-filter-badge ${
      status === "eu" ? "eu-filter-badge--eu" : "eu-filter-badge--non-eu"
    }`;
    badge.textContent = message;

    anchor.parentElement.insertBefore(badge, anchor);
  }

  async function run() {
    let enabled;
    try {
      ({ enabled } = await chrome.storage.sync.get({ enabled: true }));
    } catch (err) {
      // Extension was reloaded/updated while this page's content script was
      // still running; chrome.* APIs are gone until the page itself reloads.
      observer.disconnect();
      clearInterval(pollTimer);
      return;
    }

    if (!enabled) {
      ensureBadge(null);
      return;
    }

    const sellerText = dedupeRepeatedText(findSoldByText());
    ensureBadge(classify(sellerText), sellerText);
  }

  let debounceTimer;
  const observer = new MutationObserver(() => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(run, 300);
  });
  observer.observe(document.body, { childList: true, subtree: true });

  // The buybox loads its seller info asynchronously, and Amazon's pages
  // mutate near-continuously (ads, recommendation widgets, telemetry), so
  // the debounce above can go a long time without a quiet gap to fire on.
  // Poll on a fixed interval as a fallback; run() is idempotent so this is
  // safe to call repeatedly.
  const pollTimer = setInterval(run, 1000);

  chrome.storage.onChanged.addListener((changes, area) => {
    if (area === "sync" && changes.enabled) run();
  });

  run();
})();
