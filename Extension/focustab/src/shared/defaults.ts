import { AppSettings } from './schema';

export const DEFAULT_WALLPAPER_URL =
  'https://media.istockphoto.com/id/1461006686/photo/aerial-view-of-waves-hitting-a-small-rocky-island-with-long-exposure.jpg?s=170667a&w=0&k=20&c=F0wVTyMB0jiy_9ub9cTikVodRwshvYR4D7MgRpU9J2A=';

export const DEFAULT_BLOCK_LIST: string[] = [
  'instagram.com',
  'youtube.com',
  'linkedin.com',
  'facebook.com',
  'x.com',
  'twitter.com',
  'reddit.com',
];

export function getDefaults(): AppSettings {
  return {
    schemaVersion: 1,
    profile: {
      displayName: 'Krishna',
      linkedinUrl: 'https://www.linkedin.com/in/krishnamahajan1/',
      showLinkedInShortcut: true,
    },
    dailyFocus: null,
    tasks: [],
    focusMode: { enabled: false },
    blockList: [...DEFAULT_BLOCK_LIST],
    wallpaper: {
      kind: 'remote-default',
      url: DEFAULT_WALLPAPER_URL,
      indexedDbKey: null,
    },
    ui: {
      overlayStrength: 0.45,
      clockFormat: '12h',
    },
    onboardingComplete: false,
  };
}
