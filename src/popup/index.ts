import { getClosedToday } from "../background/badge";
import { loadSettings, saveSettings } from "../background/settings-store";

function element<T extends HTMLElement>(id: string): T {
  const node = document.getElementById(id);
  if (!node) throw new Error(`Missing element #${id}`);
  return node as T;
}

async function render(): Promise<void> {
  const [tabs, closedToday, settings] = await Promise.all([
    chrome.tabs.query({}),
    getClosedToday(),
    loadSettings(),
  ]);

  element("open-tabs").textContent = String(tabs.length);
  element("closed-today").textContent = String(closedToday);

  const pauseButton = element<HTMLButtonElement>("pause");
  const status = element("status");
  pauseButton.textContent = settings.paused ? "Resume" : "Pause";
  pauseButton.classList.toggle("paused", settings.paused);
  status.classList.toggle("paused", settings.paused);
  status.setAttribute("aria-label", settings.paused ? "Paused" : "Running");

  pauseButton.onclick = async (): Promise<void> => {
    await saveSettings({ ...settings, paused: !settings.paused });
    await render();
  };
}

element<HTMLButtonElement>("settings").onclick = (): void => {
  void chrome.runtime.openOptionsPage();
};

void render();
