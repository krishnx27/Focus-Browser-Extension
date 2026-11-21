/**
 * FocusBoard - Blocked Screen Logic (Task 4.1)
 */

(function () {
  'use strict';

  function getTodayDateKey() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  const wallpaperBg = document.getElementById('wallpaper-background');
  const focusReminderText = document.getElementById('focus-reminder-text');
  const goBackBtn = document.getElementById('go-back-btn');
  const disableFocusBtn = document.getElementById('disable-focus-btn');
  const blockedSubheading = document.querySelector('.blocked-subheading');

  // Display blocked domain name if present in URL query params
  try {
    const urlParams = new URLSearchParams(window.location.search);
    const site = urlParams.get('site');
    if (site && blockedSubheading) {
      blockedSubheading.textContent = `${site} is paused while Focus Mode is active.`;
    }
  } catch (e) {
    // ignore
  }

  async function loadData() {
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
      chrome.storage.local.get(['dailyFocus', 'customWallpaper'], (data) => {
        // Wallpaper
        if (data.customWallpaper) {
          wallpaperBg.style.backgroundImage = `url("${data.customWallpaper}")`;
        }

        // Daily Focus
        const today = getTodayDateKey();
        if (data.dailyFocus && data.dailyFocus.dateKey === today && data.dailyFocus.text && data.dailyFocus.text.trim()) {
          focusReminderText.textContent = `“${data.dailyFocus.text.trim()}”`;
        } else {
          focusReminderText.textContent = '“Stay focused on what matters.”';
        }
      });
    } else {
      // Local testing fallback
      const storedFocus = localStorage.getItem('dailyFocus');
      if (storedFocus) {
        try {
          const parsed = JSON.parse(storedFocus);
          if (parsed && parsed.text) {
            focusReminderText.textContent = `“${parsed.text}”`;
          }
        } catch {
          // ignore
        }
      }
    }
  }

  function navigateToNewTab() {
    if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.getURL) {
      window.location.href = chrome.runtime.getURL('newtab.html');
    } else {
      window.location.href = 'newtab.html';
    }
  }

  goBackBtn.addEventListener('click', () => {
    navigateToNewTab();
  });

  disableFocusBtn.addEventListener('click', () => {
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
      chrome.storage.local.set({ focusModeEnabled: false }, () => {
        navigateToNewTab();
      });
    } else {
      localStorage.setItem('focusModeEnabled', 'false');
      navigateToNewTab();
    }
  });

  document.addEventListener('DOMContentLoaded', loadData);
  if (document.readyState === 'interactive' || document.readyState === 'complete') {
    loadData();
  }
})();
