const toggle = document.getElementById("toggle");
const statusLabel = document.getElementById("statusLabel");

function render(enabled) {
  toggle.checked = enabled;
  statusLabel.textContent = enabled ? "On" : "Off";
}

chrome.storage.sync.get({ enabled: true }).then(({ enabled }) => {
  render(enabled);
});

toggle.addEventListener("change", () => {
  const enabled = toggle.checked;
  render(enabled);
  chrome.storage.sync.set({ enabled });
});
