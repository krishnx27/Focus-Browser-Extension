/**
 * FocusBoard - Settings Management (Phase 3 & Task 4.4)
 */

(function () {
  'use strict';

  const DEFAULT_BLOCKED_SITES = [
    'instagram.com',
    'facebook.com',
    'twitter.com',
    'x.com',
    'reddit.com',
    'youtube.com'
  ];

  // Storage helper
  const storage = {
    async get(keys) {
      if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
        return new Promise((resolve) => {
          chrome.storage.local.get(keys, (res) => resolve(res || {}));
        });
      }
      const result = {};
      const keyList = Array.isArray(keys) ? keys : (typeof keys === 'string' ? [keys] : Object.keys(keys || {}));
      keyList.forEach((k) => {
        try {
          const val = localStorage.getItem(k);
          if (val !== null) result[k] = JSON.parse(val);
        } catch {
          result[k] = localStorage.getItem(k);
        }
      });
      return result;
    },

    async set(items) {
      if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
        return new Promise((resolve) => {
          chrome.storage.local.set(items, () => resolve());
        });
      }
      Object.entries(items).forEach(([k, v]) => {
        localStorage.setItem(k, JSON.stringify(v));
      });
    },

    async remove(keys) {
      if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
        return new Promise((resolve) => {
          chrome.storage.local.remove(keys, () => resolve());
        });
      }
      const keyList = Array.isArray(keys) ? keys : [keys];
      keyList.forEach((k) => localStorage.removeItem(k));
    }
  };

  // DOM Elements
  const settingsOpenBtn = document.getElementById('settings-open-btn');
  const settingsCloseBtn = document.getElementById('settings-close-btn');
  const settingsModal = document.getElementById('settings-modal');
  const modalDialog = settingsModal ? settingsModal.querySelector('.modal-dialog') : null;

  const settingsNameInput = document.getElementById('settings-name-input');
  const clockFmt12hBtn = document.getElementById('clock-fmt-12h');
  const clockFmt24hBtn = document.getElementById('clock-fmt-24h');

  const wallpaperFileInput = document.getElementById('wallpaper-file-input');
  const uploadWallpaperBtn = document.getElementById('upload-wallpaper-btn');
  const resetWallpaperBtn = document.getElementById('reset-wallpaper-btn');
  const wallpaperStatusMsg = document.getElementById('wallpaper-status-msg');
  const wallpaperBg = document.getElementById('wallpaper-background');

  const addSiteForm = document.getElementById('add-site-form');
  const blockedSiteInput = document.getElementById('blocked-site-input');
  const blockedSitesList = document.getElementById('blocked-sites-list');

  let currentBlockedSites = [];

  // ==========================================================================
  // Task 3.1: Settings Modal Base (Open, Close, Click Outside, Escape)
  // ==========================================================================
  function openSettings() {
    if (!settingsModal) return;
    settingsModal.classList.remove('hidden');
    settingsModal.setAttribute('aria-hidden', 'false');
    loadSettingsData();
  }

  function closeSettings() {
    if (!settingsModal) return;
    settingsModal.classList.add('hidden');
    settingsModal.setAttribute('aria-hidden', 'true');
    if (wallpaperStatusMsg) {
      wallpaperStatusMsg.textContent = '';
      wallpaperStatusMsg.className = 'wallpaper-status-msg';
    }
  }

  if (settingsOpenBtn) settingsOpenBtn.addEventListener('click', openSettings);
  if (settingsCloseBtn) settingsCloseBtn.addEventListener('click', closeSettings);

  // Click outside to close
  if (settingsModal) {
    settingsModal.addEventListener('click', (e) => {
      if (modalDialog && !modalDialog.contains(e.target)) {
        closeSettings();
      }
    });
  }

  // Escape key to close
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && settingsModal && !settingsModal.classList.contains('hidden')) {
      closeSettings();
    }
  });

  // ==========================================================================
  // Task 3.2: Name & Clock Modifications
  // ==========================================================================
  if (settingsNameInput) {
    settingsNameInput.addEventListener('input', async (e) => {
      const name = e.target.value;
      await storage.set({ userName: name });
    });
  }

  function setClockFormatUI(format) {
    if (!clockFmt12hBtn || !clockFmt24hBtn) return;
    if (format === '24h') {
      clockFmt24hBtn.classList.add('active');
      clockFmt24hBtn.setAttribute('aria-checked', 'true');
      clockFmt12hBtn.classList.remove('active');
      clockFmt12hBtn.setAttribute('aria-checked', 'false');
    } else {
      clockFmt12hBtn.classList.add('active');
      clockFmt12hBtn.setAttribute('aria-checked', 'true');
      clockFmt24hBtn.classList.remove('active');
      clockFmt24hBtn.setAttribute('aria-checked', 'false');
    }
  }

  if (clockFmt12hBtn) {
    clockFmt12hBtn.addEventListener('click', async () => {
      setClockFormatUI('12h');
      await storage.set({ clockFormat: '12h' });
    });
  }

  if (clockFmt24hBtn) {
    clockFmt24hBtn.addEventListener('click', async () => {
      setClockFormatUI('24h');
      await storage.set({ clockFormat: '24h' });
    });
  }

  // ==========================================================================
  // Task 3.3: Custom Wallpaper Setup (FileReader, 5MB Check, Revert)
  // ==========================================================================
  if (uploadWallpaperBtn && wallpaperFileInput) {
    uploadWallpaperBtn.addEventListener('click', () => {
      wallpaperFileInput.value = '';
      wallpaperFileInput.click();
    });
  }

  if (wallpaperFileInput) {
    wallpaperFileInput.addEventListener('change', (e) => {
      const file = e.target.files && e.target.files[0];
      if (!file) return;

      const MAX_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB
      if (file.size >= MAX_SIZE_BYTES) {
        if (wallpaperStatusMsg) {
          wallpaperStatusMsg.textContent = 'Image must be under 5MB. Please choose a smaller file.';
          wallpaperStatusMsg.className = 'wallpaper-status-msg error';
        }
        return;
      }

      const reader = new FileReader();
      reader.onload = async (loadEvt) => {
        const dataUrl = loadEvt.target.result;
        // Swap dynamically in DOM
        if (wallpaperBg) {
          wallpaperBg.style.backgroundImage = `url("${dataUrl}")`;
        }
        // Save to storage
        await storage.set({ customWallpaper: dataUrl });

        if (wallpaperStatusMsg) {
          wallpaperStatusMsg.textContent = 'Wallpaper updated successfully!';
          wallpaperStatusMsg.className = 'wallpaper-status-msg success';
        }
      };

      reader.onerror = () => {
        if (wallpaperStatusMsg) {
          wallpaperStatusMsg.textContent = 'Error reading the image file.';
          wallpaperStatusMsg.className = 'wallpaper-status-msg error';
        }
      };

      reader.readAsDataURL(file);
    });
  }

  if (resetWallpaperBtn) {
    resetWallpaperBtn.addEventListener('click', async () => {
      await storage.remove('customWallpaper');
      if (wallpaperBg) {
        wallpaperBg.style.backgroundImage = "url('assets/default-wallpaper.jpg')";
      }
      if (wallpaperStatusMsg) {
        wallpaperStatusMsg.textContent = 'Wallpaper reset to default.';
        wallpaperStatusMsg.className = 'wallpaper-status-msg success';
      }
    });
  }

  // ==========================================================================
  // Tasks 3.4 & 4.4: Dynamic Blocking Sites Array & Permission Runtime
  // ==========================================================================
  function normalizeDomain(input) {
    let d = (input || '').trim().toLowerCase();
    d = d.replace(/^https?:\/\//i, '');
    d = d.replace(/\/.*$/, '');
    d = d.replace(/\.$/, '');
    return d;
  }

  function renderBlockedChips() {
    if (!blockedSitesList) return;
    blockedSitesList.innerHTML = '';

    currentBlockedSites.forEach((domain) => {
      const li = document.createElement('li');
      li.className = 'blocked-chip';

      const span = document.createElement('span');
      span.textContent = domain;

      const removeBtn = document.createElement('button');
      removeBtn.className = 'blocked-chip-remove-btn';
      removeBtn.type = 'button';
      removeBtn.title = `Remove ${domain}`;
      removeBtn.setAttribute('aria-label', `Remove ${domain}`);
      removeBtn.innerHTML = `
        <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
      `;

      removeBtn.addEventListener('click', async () => {
        currentBlockedSites = currentBlockedSites.filter((d) => d !== domain);
        await storage.set({ blockedSites: currentBlockedSites });
        renderBlockedChips();
      });

      li.appendChild(span);
      li.appendChild(removeBtn);
      blockedSitesList.appendChild(li);
    });
  }

  if (addSiteForm && blockedSiteInput) {
    addSiteForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const raw = blockedSiteInput.value;
      const domain = normalizeDomain(raw);

      if (!domain) return;

      // Reject duplication
      if (currentBlockedSites.includes(domain)) {
        blockedSiteInput.value = '';
        return;
      }

      // Task 4.4: Runtime host permissions check
      if (typeof chrome !== 'undefined' && chrome.permissions && chrome.permissions.request) {
        try {
          await chrome.permissions.request({
            origins: [`*://*.${domain}/*`]
          });
        } catch (err) {
          // Safely swallow rejected paths instead of killing standard workflows
          console.warn('FocusBoard: Optional host permission request bypassed:', err);
        }
      }

      currentBlockedSites.push(domain);
      await storage.set({ blockedSites: currentBlockedSites });
      renderBlockedChips();
      blockedSiteInput.value = '';
    });
  }

  // ==========================================================================
  // Load Settings on Modal Open / Init
  // ==========================================================================
  const settingsFocusStatusBadge = document.getElementById('settings-focus-status-badge');

  function updateFocusBadge(enabled) {
    if (!settingsFocusStatusBadge) return;
    if (enabled) {
      settingsFocusStatusBadge.textContent = 'Focus Mode: ON';
      settingsFocusStatusBadge.classList.add('active');
    } else {
      settingsFocusStatusBadge.textContent = 'Focus Mode: OFF';
      settingsFocusStatusBadge.classList.remove('active');
    }
  }

  async function loadSettingsData() {
    const data = await storage.get(['userName', 'clockFormat', 'blockedSites', 'customWallpaper', 'focusModeEnabled']);

    if (settingsNameInput) {
      settingsNameInput.value = data.userName || '';
    }

    setClockFormatUI(data.clockFormat || '12h');
    updateFocusBadge(Boolean(data.focusModeEnabled));

    if (Array.isArray(data.blockedSites) && data.blockedSites.length > 0) {
      currentBlockedSites = data.blockedSites;
    } else {
      currentBlockedSites = [...DEFAULT_BLOCKED_SITES];
      await storage.set({ blockedSites: currentBlockedSites });
    }
    renderBlockedChips();

    // Check custom wallpaper
    if (data.customWallpaper && wallpaperBg) {
      wallpaperBg.style.backgroundImage = `url("${data.customWallpaper}")`;
    }
  }

  // Storage listener for settings
  if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.onChanged) {
    chrome.storage.onChanged.addListener((changes, namespace) => {
      if (namespace === 'local') {
        if (changes.focusModeEnabled) {
          updateFocusBadge(Boolean(changes.focusModeEnabled.newValue));
        }
        if (changes.blockedSites && Array.isArray(changes.blockedSites.newValue)) {
          currentBlockedSites = changes.blockedSites.newValue;
          renderBlockedChips();
        }
      }
    });
  }

  // Initial load
  loadSettingsData();
})();
