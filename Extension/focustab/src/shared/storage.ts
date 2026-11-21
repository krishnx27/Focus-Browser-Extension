import { AppSettings, SettingsKey } from './schema';
import { getDefaults } from './defaults';

export async function getSetting<K extends SettingsKey>(key: K): Promise<AppSettings[K]> {
  try {
    const result = await chrome.storage.local.get(key);
    if (result[key] !== undefined) return result[key] as AppSettings[K];
    return getDefaults()[key];
  } catch {
    return getDefaults()[key];
  }
}

export async function setSetting<K extends SettingsKey>(key: K, value: AppSettings[K]): Promise<void> {
  await chrome.storage.local.set({ [key]: value });
}

export async function getAllSettings(): Promise<AppSettings> {
  try {
    const result = await chrome.storage.local.get(null);
    return { ...getDefaults(), ...result } as AppSettings;
  } catch {
    return getDefaults();
  }
}

export function migrateSchema(data: Partial<AppSettings>): AppSettings {
  const defaults = getDefaults();
  const merged = { ...defaults, ...data };
  if (!merged.schemaVersion || merged.schemaVersion < 1) merged.schemaVersion = 1;
  if (!Array.isArray(merged.tasks)) merged.tasks = [];
  if (!Array.isArray(merged.blockList)) merged.blockList = [...defaults.blockList];
  if (!merged.profile || typeof merged.profile !== 'object') merged.profile = { ...defaults.profile };
  if (!merged.wallpaper || typeof merged.wallpaper !== 'object') merged.wallpaper = { ...defaults.wallpaper };
  if (!merged.ui || typeof merged.ui !== 'object') merged.ui = { ...defaults.ui };
  if (!merged.focusMode || typeof merged.focusMode !== 'object') merged.focusMode = { ...defaults.focusMode };
  return merged;
}

export function onSettingsChanged(
  callback: (changes: { [key: string]: chrome.storage.StorageChange }) => void
): () => void {
  const listener = (changes: { [key: string]: chrome.storage.StorageChange }, area: string) => {
    if (area === 'local') callback(changes);
  };
  chrome.storage.onChanged.addListener(listener);
  return () => chrome.storage.onChanged.removeListener(listener);
}
