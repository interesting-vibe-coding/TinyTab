import { loadSettings, saveSettings } from "../background/settings-store";
import { parseTimeoutMinutes, parseWhitelistText } from "./settings-form";

function element<T extends HTMLElement>(id: string): T {
  const node = document.getElementById(id);
  if (!node) throw new Error(`Missing element #${id}`);
  return node as T;
}

async function initialize(): Promise<void> {
  const settings = await loadSettings();
  element<HTMLInputElement>("timeout").value = String(settings.timeoutMinutes);
  element<HTMLTextAreaElement>("whitelist").value =
    settings.whitelist.join("\n");
  element<HTMLInputElement>("smart-close").checked = settings.smartClose;
  element<HTMLInputElement>("skip-active").checked = settings.skipActive;
  element<HTMLInputElement>("skip-pinned").checked = settings.skipPinned;
}

element<HTMLFormElement>("settings-form").onsubmit = async (
  event,
): Promise<void> => {
  event.preventDefault();
  const status = element("save-status");
  try {
    const current = await loadSettings();
    await saveSettings({
      ...current,
      timeoutMinutes: parseTimeoutMinutes(
        element<HTMLInputElement>("timeout").value,
      ),
      whitelist: parseWhitelistText(
        element<HTMLTextAreaElement>("whitelist").value,
      ),
      smartClose: element<HTMLInputElement>("smart-close").checked,
      skipActive: element<HTMLInputElement>("skip-active").checked,
      skipPinned: element<HTMLInputElement>("skip-pinned").checked,
    });
    status.textContent = "Saved";
  } catch (error) {
    status.textContent =
      error instanceof Error ? error.message : "Could not save settings.";
  }
};

void initialize();
