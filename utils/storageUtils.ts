import { DailyEntry, AppSettings, DEFAULT_SYSTEM_PROMPT } from '../types';

const STORAGE_KEY_ENTRIES = 'stoic_diary_entries';
const STORAGE_KEY_SETTINGS = 'stoic_diary_settings';

export const getTodayDateString = (): string => {
  return new Date().toISOString().split('T')[0];
};

export const loadEntries = (): Record<string, DailyEntry> => {
  try {
    const data = localStorage.getItem(STORAGE_KEY_ENTRIES);
    return data ? JSON.parse(data) : {};
  } catch (e) {
    console.error("Failed to load entries", e);
    return {};
  }
};

export const saveEntry = (entry: DailyEntry) => {
  const entries = loadEntries();
  entries[entry.date] = entry;
  localStorage.setItem(STORAGE_KEY_ENTRIES, JSON.stringify(entries));
};

export const getEntry = (date: string): DailyEntry | null => {
  const entries = loadEntries();
  return entries[date] || null;
};

export const loadSettings = (): AppSettings => {
  try {
    const data = localStorage.getItem(STORAGE_KEY_SETTINGS);
    if (data) return JSON.parse(data);
  } catch (e) {
    console.error("Failed to load settings", e);
  }
  return {
    apiKey: '',
    userName: 'Traveler',
    systemPrompt: DEFAULT_SYSTEM_PROMPT,
    obsidianFolderHandle: null
  };
};

export const saveSettings = (settings: AppSettings) => {
  // We cannot stringify FileSystemDirectoryHandle, so we exclude it from local storage persistence
  // In a real app, we'd store the handle in IndexedDB, but for this demo, we'll keep it in memory state mostly
  // or just omit it from LS.
  const { obsidianFolderHandle, ...persistableSettings } = settings; 
  localStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify(persistableSettings));
};
