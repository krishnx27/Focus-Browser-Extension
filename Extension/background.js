/**
 * FocusBoard - Background Service Worker (Task 4.3)
 * Handles Declarative Net Request (DNR) dynamic rules AND tabs active interceptor
 * for 100% reliable website blocking during Focus Mode.
 */

const DEFAULT_BLOCKED_SITES = [
  'instagram.com',
  'facebook.com',
  'twitter.com',
  'x.com',
  'reddit.com',
  'youtube.com'
];

function normalizeDomain(domain) {
  return (domain || '')
    .replace(/^https?:\/\//i, '')
    .replace(/\/.*$/, '')
    .replace(/\.$/, '')
    .trim()
    .toLowerCase();
}

function isUrlBlocked(url, blockedSites) {
  if (!url) return null;
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      return null;
    }
    const hostname = parsed.hostname.toLowerCase();
    for (const site of blockedSites) {
      const clean = normalizeDomain(site);
      if (clean && (hostname === clean || hostname.endsWith('.' + clean))) {
        return clean;
      }
    }
  } catch (err) {
    // Ignore invalid URLs
  }
  return null;
}

async function updateBlockingRules() {
  if (typeof chrome === 'undefined' || !chrome.declarativeNetRequest || !chrome.storage) {
    return;
  }

  try {
    const data = await chrome.storage.local.get(['focusModeEnabled', 'blockedSites']);
    const isEnabled = Boolean(data.focusModeEnabled);
    const blockedSites = Array.isArray(data.blockedSites) && data.blockedSites.length > 0
      ? data.blockedSites
      : DEFAULT_BLOCKED_SITES;

    // 1. Remove existing DNR dynamic rules
    const existingRules = await chrome.declarativeNetRequest.getDynamicRules();
    const removeRuleIds = existingRules.map((r) => r.id);

    if (!isEnabled) {
      if (removeRuleIds.length > 0) {
        await chrome.declarativeNetRequest.updateDynamicRules({
          removeRuleIds: removeRuleIds
        });
      }
      return;
    }

    // 2. Build and install new dynamic rules for declarativeNetRequest
    const addRules = [];
    blockedSites.forEach((domain, index) => {
      const clean = normalizeDomain(domain);
      if (!clean) return;

      addRules.push({
        id: index + 1,
        priority: 1,
        action: {
          type: 'redirect',
          redirect: {
            extensionPath: `/blocked.html?site=${encodeURIComponent(clean)}`
          }
        },
        condition: {
          urlFilter: `||${clean}`,
          resourceTypes: ['main_frame']
        }
      });
    });

    await chrome.declarativeNetRequest.updateDynamicRules({
      removeRuleIds: removeRuleIds,
      addRules: addRules
    });

    // 3. Scan and immediately redirect any currently open tabs that match blocked sites
    if (chrome.tabs && chrome.tabs.query) {
      chrome.tabs.query({}, (tabs) => {
        if (!tabs) return;
        tabs.forEach((tab) => {
          if (tab.id && tab.url) {
            const matchedSite = isUrlBlocked(tab.url, blockedSites);
            if (matchedSite) {
              chrome.tabs.update(tab.id, {
                url: chrome.runtime.getURL(`blocked.html?site=${encodeURIComponent(matchedSite)}`)
              });
            }
          }
        });
      });
    }
  } catch (err) {
    console.error('FocusBoard: Error updating rules:', err);
  }
}

// Active Tab navigation interceptor (instant fallback ensuring no navigation slips through)
if (typeof chrome !== 'undefined' && chrome.tabs && chrome.tabs.onUpdated) {
  chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
    const targetUrl = changeInfo.url || tab.url;
    if (!targetUrl) return;

    // Skip extension's own pages
    if (targetUrl.startsWith('chrome-extension://') || targetUrl.startsWith('chrome://')) {
      return;
    }

    const data = await chrome.storage.local.get(['focusModeEnabled', 'blockedSites']);
    if (!data.focusModeEnabled) return;

    const blockedSites = Array.isArray(data.blockedSites) && data.blockedSites.length > 0
      ? data.blockedSites
      : DEFAULT_BLOCKED_SITES;

    const matchedSite = isUrlBlocked(targetUrl, blockedSites);
    if (matchedSite) {
      chrome.tabs.update(tabId, {
        url: chrome.runtime.getURL(`blocked.html?site=${encodeURIComponent(matchedSite)}`)
      });
    }
  });
}

// React to storage updates for focusModeEnabled or blockedSites
chrome.storage.onChanged.addListener((changes, namespace) => {
  if (namespace === 'local' && (changes.focusModeEnabled || changes.blockedSites)) {
    updateBlockingRules();
  }
});

// React to startup and install
chrome.runtime.onInstalled.addListener(async () => {
  const data = await chrome.storage.local.get(['blockedSites']);
  if (!data.blockedSites) {
    await chrome.storage.local.set({ blockedSites: DEFAULT_BLOCKED_SITES });
  }
  updateBlockingRules();
});

chrome.runtime.onStartup.addListener(() => {
  updateBlockingRules();
});
