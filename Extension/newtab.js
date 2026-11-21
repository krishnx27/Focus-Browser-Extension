/**
 * FocusBoard - New Tab Core Logic (Phase 1)
 */

(function () {
  'use strict';

  // --- Storage Helper (safely falls back to localStorage if chrome.storage is unavailable) ---
  const storage = {
    async get(keys) {
      if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
        return new Promise((resolve) => {
          chrome.storage.local.get(keys, (res) => resolve(res || {}));
        });
      }
      // Fallback for direct browser preview
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
      // Fallback for direct browser preview
      Object.entries(items).forEach(([k, v]) => {
        localStorage.setItem(k, JSON.stringify(v));
      });
    }
  };

  // --- Date Helpers ---
  function getTodayDateKey() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  // --- DOM Elements ---
  const clockTimeEl = document.getElementById('clock-time');
  const dateDisplayEl = document.getElementById('date-display');
  const greetingTextEl = document.getElementById('greeting-text');

  const focusInputView = document.getElementById('focus-input-view');
  const focusInput = document.getElementById('focus-input');
  const focusDisplayView = document.getElementById('focus-display-view');
  const focusTextEl = document.getElementById('focus-text');
  const focusEditBtn = document.getElementById('focus-edit-btn');

  // --- DOM Elements: Task Sidebar (Phase 2) ---
  const taskCounterEl = document.getElementById('task-counter');
  const taskEmptyStateEl = document.getElementById('task-empty-state');
  const taskListEl = document.getElementById('task-list');
  const taskFormEl = document.getElementById('task-form');
  const taskInputEl = document.getElementById('task-input');

  // --- DOM Elements: Focus Mode & Wallpaper (Phase 3 & 4) ---
  const focusModeToggleBtn = document.getElementById('focus-mode-toggle-btn');
  const focusModeStatusEl = document.getElementById('focus-mode-status');
  const pulseShockwaveEl = document.getElementById('pulse-shockwave');
  const lockedInToastEl = document.getElementById('locked-in-toast');
  const wallpaperBgEl = document.getElementById('wallpaper-background');

  let currentUserName = 'Friend';
  let clockFormat = '12h'; // Default 12h format
  let tasks = []; // Array of tasks
  let focusModeEnabled = false;

  // --- Task 1.3: Live Clock & Date Implementation ---
  function updateClock() {
    const now = new Date();

    // Time Formatting
    let hours = now.getHours();
    const minutes = String(now.getMinutes()).padStart(2, '0');
    let ampm = '';

    if (clockFormat === '12h') {
      ampm = hours >= 12 ? ' PM' : ' AM';
      hours = hours % 12;
      hours = hours ? hours : 12; // 0 becomes 12
      clockTimeEl.textContent = `${hours}:${minutes}${ampm}`;
    } else {
      const formattedHours = String(hours).padStart(2, '0');
      clockTimeEl.textContent = `${formattedHours}:${minutes}`;
    }

    // Date Formatting (e.g., Saturday, November 21)
    const options = { weekday: 'long', month: 'long', day: 'numeric' };
    dateDisplayEl.textContent = now.toLocaleDateString(undefined, options);
  }

  // --- Task 1.4: Dynamic Greeting Logic ---
  function updateGreeting() {
    const now = new Date();
    const hour = now.getHours();
    let timeGreeting = 'Good evening';

    if (hour >= 5 && hour < 12) {
      timeGreeting = 'Good morning';
    } else if (hour >= 12 && hour < 17) {
      timeGreeting = 'Good afternoon';
    } else {
      timeGreeting = 'Good evening';
    }

    const displayName = (currentUserName && currentUserName.trim()) ? currentUserName.trim() : 'Friend';
    greetingTextEl.textContent = `${timeGreeting}, ${displayName}`;
  }

  // --- Tasks 1.5, 1.6 & 1.7: Daily Focus Logic ---
  async function loadFocus() {
    const data = await storage.get(['dailyFocus', 'userName', 'clockFormat']);

    if (data.userName) {
      currentUserName = data.userName;
    }
    if (data.clockFormat) {
      clockFormat = data.clockFormat;
    }

    updateGreeting();
    updateClock();

    const today = getTodayDateKey();
    const dailyFocus = data.dailyFocus;

    if (dailyFocus && dailyFocus.dateKey === today && dailyFocus.text && dailyFocus.text.trim()) {
      showFocusDisplay(dailyFocus.text.trim());
    } else {
      showFocusInput();
    }
  }

  function showFocusDisplay(text) {
    focusTextEl.textContent = text;
    focusInputView.classList.add('hidden');
    focusDisplayView.classList.remove('hidden');
  }

  function showFocusInput(initialValue = '') {
    focusInput.value = initialValue;
    focusDisplayView.classList.add('hidden');
    focusInputView.classList.remove('hidden');
    setTimeout(() => {
      focusInput.focus();
      if (initialValue) {
        focusInput.select();
      }
    }, 50);
  }

  // Task 1.6: Focus Submission on Enter
  focusInput.addEventListener('keydown', async (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const text = focusInput.value.trim();
      if (!text) return;

      const payload = {
        dateKey: getTodayDateKey(),
        text: text
      };

      await storage.set({ dailyFocus: payload });
      showFocusDisplay(text);
    }
  });

  // Task 1.7: Focus Edit Functionality
  focusEditBtn.addEventListener('click', async () => {
    const previousText = focusTextEl.textContent || '';
    // Nullify / clear the item for today in storage and switch to input
    await storage.set({
      dailyFocus: {
        dateKey: getTodayDateKey(),
        text: ''
      }
    });
    showFocusInput(previousText);
  });

  // ==========================================================================
  // Phase 2: Tasks Management (Tasks 2.1, 2.2, 2.3)
  // ==========================================================================
  function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  function updateTaskCounter() {
    const total = tasks.length;
    const completed = tasks.filter((t) => t.done).length;
    taskCounterEl.textContent = `${completed}/${total} done`;

    if (total === 0) {
      taskEmptyStateEl.style.display = 'block';
    } else {
      taskEmptyStateEl.style.display = 'none';
    }
  }

  function renderTaskElement(task) {
    const li = document.createElement('li');
    li.className = `task-item ${task.done ? 'done' : ''}`;
    li.dataset.id = task.id;

    li.innerHTML = `
      <div class="task-left" role="checkbox" aria-checked="${task.done}" tabindex="0">
        <div class="task-checkbox-custom">
          <svg viewBox="0 0 24 24" width="12" height="12" fill="none">
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
        </div>
        <span class="task-label">${escapeHtml(task.text)}</span>
      </div>
      <button type="button" class="task-delete-btn" title="Delete task" aria-label="Delete task">
        <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M3 6h18"></path>
          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
        </svg>
      </button>
    `;

    // Toggle Done
    const leftEl = li.querySelector('.task-left');
    const toggleDone = async () => {
      task.done = !task.done;
      li.classList.toggle('done', task.done);
      leftEl.setAttribute('aria-checked', task.done);
      await storage.set({ tasks: tasks });
      updateTaskCounter();
    };

    leftEl.addEventListener('click', toggleDone);
    leftEl.addEventListener('keydown', (e) => {
      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        toggleDone();
      }
    });

    // Delete Task with smooth animation
    const deleteBtn = li.querySelector('.task-delete-btn');
    deleteBtn.addEventListener('click', async (e) => {
      e.stopPropagation();
      li.classList.add('deleting');
      setTimeout(async () => {
        tasks = tasks.filter((t) => t.id !== task.id);
        renderAllTasks();
        await storage.set({ tasks: tasks });
      }, 250);
    });

    return li;
  }

  function renderAllTasks() {
    taskListEl.innerHTML = '';
    tasks.forEach((task) => {
      const el = renderTaskElement(task);
      taskListEl.appendChild(el);
    });
    updateTaskCounter();
  }

  async function loadTasks() {
    const data = await storage.get(['tasks']);
    if (Array.isArray(data.tasks)) {
      tasks = data.tasks;
    } else {
      tasks = [];
    }
    renderAllTasks();
  }

  let isSubmittingTask = false;

  // Task 2.2: Add Task Form Submission (single render, prevent duplicates)
  taskFormEl.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (isSubmittingTask) return;

    const text = taskInputEl.value.trim();
    if (!text) return;

    isSubmittingTask = true;

    const newTask = {
      id: 'task_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
      text: text,
      done: false,
      createdAt: new Date().toISOString()
    };

    // Prepend new task to in-memory array and render once
    tasks.unshift(newTask);
    renderAllTasks();
    taskInputEl.value = '';

    await storage.set({ tasks: tasks });
    isSubmittingTask = false;
  });

  // ==========================================================================
  // Task 4.2: Focus Mode Toggle UI & Logic
  // ==========================================================================
  function setFocusModeUI(enabled, triggerEffects = false) {
    if (!focusModeToggleBtn || !focusModeStatusEl) return;

    focusModeToggleBtn.setAttribute('aria-checked', enabled ? 'true' : 'false');
    focusModeStatusEl.textContent = enabled ? 'ON' : 'OFF';

    if (enabled && triggerEffects) {
      // Pulse shockwave radial ring
      if (pulseShockwaveEl) {
        pulseShockwaveEl.classList.remove('active');
        void pulseShockwaveEl.offsetWidth; // force reflow
        pulseShockwaveEl.classList.add('active');
        setTimeout(() => pulseShockwaveEl.classList.remove('active'), 900);
      }

      // "Locked In 🔒" Toast
      if (lockedInToastEl) {
        lockedInToastEl.classList.add('show');
        setTimeout(() => lockedInToastEl.classList.remove('show'), 2200);
      }
    }
  }

  if (focusModeToggleBtn) {
    focusModeToggleBtn.addEventListener('click', async () => {
      const nextState = !focusModeEnabled;
      focusModeEnabled = nextState;
      await storage.set({ focusModeEnabled: nextState });
      setFocusModeUI(nextState, nextState);
    });
  }

  async function loadFocusModeAndWallpaper() {
    const data = await storage.get(['focusModeEnabled', 'customWallpaper']);
    focusModeEnabled = Boolean(data.focusModeEnabled);
    setFocusModeUI(focusModeEnabled, false);

    if (wallpaperBgEl) {
      if (data.customWallpaper) {
        wallpaperBgEl.style.backgroundImage = `url("${data.customWallpaper}")`;
      } else {
        wallpaperBgEl.style.backgroundImage = "url('assets/default-wallpaper.jpg')";
      }
    }
  }

  // Storage listener to sync changes across tabs
  if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.onChanged) {
    chrome.storage.onChanged.addListener((changes, namespace) => {
      if (namespace === 'local') {
        if (changes.userName) {
          currentUserName = changes.userName.newValue || 'Friend';
          updateGreeting();
        }
        if (changes.clockFormat) {
          clockFormat = changes.clockFormat.newValue || '12h';
          updateClock();
        }
        if (changes.dailyFocus) {
          const newFocus = changes.dailyFocus.newValue;
          const today = getTodayDateKey();
          if (newFocus && newFocus.dateKey === today && newFocus.text) {
            showFocusDisplay(newFocus.text);
          } else {
            showFocusInput();
          }
        }
        if (changes.tasks) {
          const incomingTasks = Array.isArray(changes.tasks.newValue) ? changes.tasks.newValue : [];
          const currentSignature = tasks.map((t) => `${t.id}:${t.done}`).join('|');
          const incomingSignature = incomingTasks.map((t) => `${t.id}:${t.done}`).join('|');
          if (currentSignature !== incomingSignature) {
            tasks = incomingTasks;
            renderAllTasks();
          }
        }
        if (changes.focusModeEnabled) {
          focusModeEnabled = Boolean(changes.focusModeEnabled.newValue);
          setFocusModeUI(focusModeEnabled, false);
        }
        if (changes.customWallpaper) {
          if (wallpaperBgEl) {
            if (changes.customWallpaper.newValue) {
              wallpaperBgEl.style.backgroundImage = `url("${changes.customWallpaper.newValue}")`;
            } else {
              wallpaperBgEl.style.backgroundImage = "url('assets/default-wallpaper.jpg')";
            }
          }
        }
      }
    });
  }

  // --- Initialize ---
  let isInitialized = false;
  function init() {
    if (isInitialized) return;
    isInitialized = true;

    updateClock();
    updateGreeting();
    loadFocus();
    loadTasks();
    loadFocusModeAndWallpaper();

    // Tick clock every second
    setInterval(updateClock, 1000);

    // Refresh greeting periodically (every minute)
    setInterval(updateGreeting, 60000);
  }

  document.addEventListener('DOMContentLoaded', init);
  if (document.readyState === 'interactive' || document.readyState === 'complete') {
    init();
  }
})();
