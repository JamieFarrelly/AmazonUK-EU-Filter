(function () {
  const SELLER_FACET = "p_6:A30DC7701CXIBH";
  const GUARD_KEY = "euFilterCorrectionAttempts";
  const MAX_ATTEMPTS = 2;
  const STATUS_BOX_ID = "eu-filter-status";

  function isFilterablePage(href) {
    const url = new URL(href);
    return (
      url.hostname === "www.amazon.co.uk" &&
      (url.pathname === "/s" || url.pathname === "/b")
    );
  }

  function computeCorrectedUrl(href) {
    const url = new URL(href);
    if (url.hostname !== "www.amazon.co.uk") return null;
    if (url.pathname !== "/s" && url.pathname !== "/b") return null;

    const rh = url.searchParams.get("rh");
    const facets = rh ? rh.split(",") : [];
    if (facets.includes(SELLER_FACET)) return null;

    facets.push(SELLER_FACET);
    url.searchParams.set("rh", facets.join(","));
    return url.toString();
  }

  // Identifies the underlying query regardless of our own facet or Amazon's
  // volatile tracking params, so repeated corrections of the "same" search
  // are recognised even across a forced reload.
  function queryIdentity(href) {
    const url = new URL(href);
    const rh = url.searchParams.get("rh");
    if (rh) {
      const kept = rh.split(",").filter((f) => f !== SELLER_FACET);
      if (kept.length) url.searchParams.set("rh", kept.join(","));
      else url.searchParams.delete("rh");
    }
    for (const param of ["qid", "crid", "sprefix", "ref"]) {
      url.searchParams.delete(param);
    }
    return url.pathname + "?" + url.searchParams.toString();
  }

  function readGuard() {
    try {
      return JSON.parse(sessionStorage.getItem(GUARD_KEY) || "{}");
    } catch {
      return {};
    }
  }

  function writeGuard(guard) {
    sessionStorage.setItem(GUARD_KEY, JSON.stringify(guard));
  }

  const RESULTS_ANCHOR_SELECTORS = [
    ".s-main-slot",
    '[data-component-type="s-search-results"]',
  ];

  function findResultsAnchor() {
    for (const selector of RESULTS_ANCHOR_SELECTORS) {
      const el = document.querySelector(selector);
      if (el) return el;
    }
    return null;
  }

  const STAR_POLYGONS = [
    "50.0,11.5 51.53,15.9 56.18,15.99 52.47,18.8 53.82,23.26 50.0,20.6 46.18,23.26 47.53,18.8 43.82,15.99 48.47,15.9",
    "66.0,15.79 67.53,20.18 72.18,20.28 68.47,23.09 69.82,27.55 66.0,24.89 62.18,27.55 63.53,23.09 59.82,20.28 64.47,20.18",
    "77.71,27.5 79.24,31.9 83.89,31.99 80.19,34.8 81.53,39.26 77.71,36.6 73.89,39.26 75.24,34.8 71.53,31.99 76.18,31.9",
    "82.0,43.5 83.53,47.9 88.18,47.99 84.47,50.8 85.82,55.26 82.0,52.6 78.18,55.26 79.53,50.8 75.82,47.99 80.47,47.9",
    "77.71,59.5 79.24,63.9 83.89,63.99 80.19,66.8 81.53,71.26 77.71,68.6 73.89,71.26 75.24,66.8 71.53,63.99 76.18,63.9",
    "66.0,71.21 67.53,75.61 72.18,75.7 68.47,78.52 69.82,82.97 66.0,80.31 62.18,82.97 63.53,78.52 59.82,75.7 64.47,75.61",
    "50.0,75.5 51.53,79.9 56.18,79.99 52.47,82.8 53.82,87.26 50.0,84.6 46.18,87.26 47.53,82.8 43.82,79.99 48.47,79.9",
    "34.0,71.21 35.53,75.61 40.18,75.7 36.47,78.52 37.82,82.97 34.0,80.31 30.18,82.97 31.53,78.52 27.82,75.7 32.47,75.61",
    "22.29,59.5 23.82,63.9 28.47,63.99 24.76,66.8 26.11,71.26 22.29,68.6 18.47,71.26 19.81,66.8 16.11,63.99 20.76,63.9",
    "18.0,43.5 19.53,47.9 24.18,47.99 20.47,50.8 21.82,55.26 18.0,52.6 14.18,55.26 15.53,50.8 11.82,47.99 16.47,47.9",
    "22.29,27.5 23.82,31.9 28.47,31.99 24.76,34.8 26.11,39.26 22.29,36.6 18.47,39.26 19.81,34.8 16.11,31.99 20.76,31.9",
    "34.0,15.79 35.53,20.18 40.18,20.28 36.47,23.09 37.82,27.55 34.0,24.89 30.18,27.55 31.53,23.09 27.82,20.28 32.47,20.18",
  ];

  function euStarRingSvg() {
    const polygons = STAR_POLYGONS.map((p) => `<polygon points="${p}"/>`).join("");
    return `<svg class="eu-filter-status__stars" viewBox="0 0 100 100" aria-hidden="true">${polygons}</svg>`;
  }

  function renderStatusBox(enabled) {
    if (!isFilterablePage(location.href) || !document.body) return;

    let box = document.getElementById(STATUS_BOX_ID);
    if (!box) {
      box = document.createElement("div");
      box.id = STATUS_BOX_ID;
    }

    box.className = `eu-filter-status ${
      enabled ? "eu-filter-status--on" : "eu-filter-status--off"
    }`;
    box.innerHTML = `${euStarRingSvg()}<span class="eu-filter-status__text">${
      enabled ? "EU-Only Filter: ON" : "EU-Only Filter: OFF"
    }</span>`;

    const anchor = findResultsAnchor();
    if (anchor) {
      if (anchor.firstElementChild !== box) {
        anchor.insertBefore(box, anchor.firstChild);
      }
    } else if (!box.parentElement) {
      box.classList.add("eu-filter-status--fallback");
      document.body.appendChild(box);
    }
  }

  async function updateStatusBox() {
    const { enabled } = await chrome.storage.sync.get({ enabled: true });
    if (document.body) {
      renderStatusBox(enabled);
    } else {
      document.addEventListener(
        "DOMContentLoaded",
        () => renderStatusBox(enabled),
        { once: true }
      );
    }
  }

  async function checkAndCorrect() {
    const { enabled } = await chrome.storage.sync.get({ enabled: true });
    if (!enabled) return;

    const corrected = computeCorrectedUrl(location.href);
    if (!corrected || corrected === location.href) return;

    const key = queryIdentity(location.href);
    const guard = readGuard();
    const attempts = guard[key] || 0;
    if (attempts >= MAX_ATTEMPTS) return;

    guard[key] = attempts + 1;
    writeGuard(guard);
    window.location.replace(corrected);
  }

  let lastHref = location.href;
  function onPossibleNavigation() {
    if (location.href === lastHref) return;
    lastHref = location.href;
    checkAndCorrect();
    updateStatusBox();
  }

  window.addEventListener("popstate", onPossibleNavigation);
  // Also re-run on every tick regardless of URL change: the results
  // container often doesn't exist yet when this script first runs.
  setInterval(() => {
    onPossibleNavigation();
    updateStatusBox();
  }, 400);

  chrome.storage.onChanged.addListener((changes, area) => {
    if (area === "sync" && changes.enabled) {
      checkAndCorrect();
      updateStatusBox();
    }
  });

  checkAndCorrect();
  updateStatusBox();
})();
