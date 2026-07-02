const SELLER_FACET_ENCODED = "p_6%3AA30DC7701CXIBH";

const RULE_ID_ALLOW = 1;
const RULE_ID_MERGE_RH = 2;
const RULE_ID_APPEND_RH = 3;

function buildRules() {
  return [
    // Already filtered: stop lower-priority redirect rules from firing again.
    {
      id: RULE_ID_ALLOW,
      priority: 3,
      action: { type: "allow" },
      condition: {
        regexFilter: "^https://www\\.amazon\\.co\\.uk/[sb]\\?.*p_6(%3A|:)A30DC7701CXIBH",
        resourceTypes: ["main_frame"],
      },
    },
    // Has an existing rh= facet list: append ours to it.
    {
      id: RULE_ID_MERGE_RH,
      priority: 2,
      action: {
        type: "redirect",
        redirect: {
          regexSubstitution: "\\1\\2," + SELLER_FACET_ENCODED + "\\3",
        },
      },
      condition: {
        regexFilter: "^(https://www\\.amazon\\.co\\.uk/[sb]\\?.*[?&]rh=)([^&]+)(.*)$",
        resourceTypes: ["main_frame"],
      },
    },
    // No rh= param at all: add one.
    {
      id: RULE_ID_APPEND_RH,
      priority: 1,
      action: {
        type: "redirect",
        redirect: {
          regexSubstitution: "\\1&rh=" + SELLER_FACET_ENCODED,
        },
      },
      condition: {
        regexFilter: "^(https://www\\.amazon\\.co\\.uk/[sb]\\?[^#]*)$",
        resourceTypes: ["main_frame"],
      },
    },
  ];
}

async function applyState() {
  const { enabled } = await chrome.storage.sync.get({ enabled: true });
  const existing = await chrome.declarativeNetRequest.getDynamicRules();
  await chrome.declarativeNetRequest.updateDynamicRules({
    removeRuleIds: existing.map((rule) => rule.id),
    addRules: enabled ? buildRules() : [],
  });
  chrome.action.setBadgeText({ text: enabled ? "ON" : "" });
  chrome.action.setBadgeBackgroundColor({ color: "#003399" });
}

async function reloadAmazonTabs() {
  const tabs = await chrome.tabs.query({ url: "*://www.amazon.co.uk/*" });
  for (const tab of tabs) {
    if (tab.id !== undefined) chrome.tabs.reload(tab.id);
  }
}

chrome.runtime.onInstalled.addListener(applyState);
chrome.runtime.onStartup.addListener(applyState);
chrome.storage.onChanged.addListener(async (changes, area) => {
  if (area === "sync" && changes.enabled) {
    await applyState();
    reloadAmazonTabs();
  }
});
