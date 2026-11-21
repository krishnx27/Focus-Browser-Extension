export interface Profile {
  displayName: string;
  linkedinUrl: string;
  showLinkedInShortcut: boolean;
}

export interface DailyFocus {
  dateKey: string;
  text: string;
}

export interface Task {
  id: string;
  text: string;
  completed: boolean;
  createdAt: string;
  completedAt: string | null;
}

export interface FocusModeState {
  enabled: boolean;
}

export interface WallpaperSettings {
  kind: 'remote-default' | 'uploaded' | 'builtin';
  url: string | null;
  indexedDbKey: string | null;
}

export interface UISettings {
  overlayStrength: number;
  clockFormat: '12h' | '24h';
}

export interface AppSettings {
  schemaVersion: number;
  profile: Profile;
  dailyFocus: DailyFocus | null;
  tasks: Task[];
  focusMode: FocusModeState;
  blockList: string[];
  wallpaper: WallpaperSettings;
  ui: UISettings;
  onboardingComplete: boolean;
}

export type SettingsKey = keyof AppSettings;
