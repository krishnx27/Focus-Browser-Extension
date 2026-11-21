# Product Requirements Document (PRD)
## Personal Productivity New Tab Chrome Extension

**Document status:** Build-ready product specification  
**Version:** 1.0  
**Date:** 19 November 2026  
**Product type:** Google Chrome Extension (Manifest V3)  
**Working name:** FocusTab

### 0.1 User-provided launch defaults

Use these values as the initial configuration for the first working build. They are defaults, not hard-coded restrictions; the user must be able to change them in Settings.

- **Display name:** `Krishna`
- **Default wallpaper URL:** `https://media.istockphoto.com/id/1461006686/photo/aerial-view-of-waves-hitting-a-small-rocky-island-with-long-exposure.jpg?s=170667a&w=0&k=20&c=F0wVTyMB0jiy_9ub9cTikVodRwshvYR4D7MgRpU9J2A=`
- **LinkedIn profile:** `https://www.linkedin.com/in/krishnamahajan1/`
- **LinkedIn shortcut label:** `LinkedIn`

The dashboard should show a small LinkedIn quick-access shortcut using the supplied profile URL. It should open the profile in a new tab. The shortcut must not expose credentials or attempt to read LinkedIn account data. When Focus Mode is enabled and `linkedin.com` is in the block list, opening this shortcut may be redirected to the FocusTab block page; when Focus Mode is disabled, it should open the supplied profile normally. The user can remove LinkedIn from the block list in Settings if they want it available during Focus Mode.

The supplied wallpaper is an externally hosted iStock image. Use the URL as the initial wallpaper source, but handle network failure, hotlink restrictions, or an unavailable image by falling back to the built-in default wallpaper. Do not assume that providing the URL grants a commercial or redistribution licence. For a distributable release, confirm that the user has the appropriate rights or let the user upload a locally licensed image. Do not download, rehost, or package the image without authorization.

---

## 1. Product overview

FocusTab replaces Chrome's default New Tab page with a personal productivity dashboard. It gives the user a calm, personalized starting point for each browsing session, makes the day's main priority visible, provides a lightweight task list, and offers an optional Focus Mode that blocks distracting websites.

The experience should feel personal and minimal rather than like a full project-management application. The dashboard should load quickly, work offline after installation, preserve user data locally, and require very little setup.

### 1.1 Problem statement

People often open a new browser tab and immediately encounter distractions. They may also lose track of their main priority or keep tasks in separate apps. FocusTab puts the user's daily intention and a short task list directly in the browser, with an optional mechanism to discourage access to selected distracting sites.

### 1.2 Product vision

Turn every new tab into a clear reminder of what matters today.

### 1.3 Goals

1. Replace Chrome's New Tab page with a full-screen, personalized dashboard.
2. Let users set one main focus for the day and keep it visible throughout that day.
3. Provide a fast task list with add, complete, and delete actions.
4. Let users enable Focus Mode to block user-selected websites.
5. Show a friendly, branded block page containing the user's focus message.
6. Give users straightforward settings for their name, wallpaper, and blocked websites.
7. Store preferences and dashboard data locally, with no account or backend required for the first release.

### 1.4 Non-goals for the first release

- User accounts, sign-in, cloud sync, or cross-device synchronization.
- Team collaboration, shared tasks, comments, or project management.
- Calendar, email, or third-party task integrations.
- AI-generated plans, task suggestions, or focus coaching.
- Website time tracking, usage analytics, or productivity scoring.
- Blocking applications outside Chrome.
- Guaranteed tamper-proof blocking. Users can disable the extension or Focus Mode.
- Mobile browser support.
- A public wallpaper marketplace.

---

## 2. Target users and use cases

### 2.1 Primary user

A student, professional, freelancer, or knowledge worker who spends significant time in Chrome and wants a simple daily reminder to stay on task.

### 2.2 Core user stories

- As a user, I want to see my name and a live clock when I open a new tab so the page feels personal and useful.
- As a user, I want to set my main focus for today so I can keep my priority visible.
- As a user, I want yesterday's focus to reset automatically so each day starts with a fresh intention.
- As a user, I want to add, complete, and delete small tasks without leaving the new tab.
- As a user, I want to switch Focus Mode on and off so I can control when distracting sites are blocked.
- As a user, I want to choose which websites are blocked so the feature matches my own distractions.
- As a user, I want blocked websites to show my own focus message instead of a browser error so the interruption feels intentional.
- As a user, I want to change my name and wallpaper at any time.
- As a user, I want my settings and tasks to remain available after closing and reopening Chrome.

---

## 3. Scope and feature requirements

### 3.1 New Tab dashboard

The extension must override Chrome's New Tab page using the Manifest V3 `chrome_url_overrides` capability.

#### Required elements

1. Full-screen wallpaper/background, initially using the user-provided iStock URL above.
2. Greeting using the saved display name; initial value is `Krishna`.
3. Live local clock.
4. Current date.
5. Main focus prompt and saved focus.
6. Task list.
7. Focus Mode toggle and current status.
8. A small LinkedIn quick-access shortcut pointing to the supplied profile URL.
9. Settings icon.

#### Layout and visual behavior

- Fill the visible browser viewport without requiring scrolling at common desktop sizes.
- Keep the main focus and clock visually prominent.
- Keep tasks compact and easy to interact with.
- Place settings in a predictable corner, preferably top-right.
- Use a readable overlay or gradient over the wallpaper so text remains legible.
- Support responsive layouts for smaller browser windows.
- Avoid visual clutter, unnecessary cards, and excessive animations.
- Provide visible hover, focus, active, disabled, and completed states.
- Respect `prefers-reduced-motion`.
- Ensure keyboard navigation and visible focus indicators.

#### Greeting

- Example: `Good morning, Krishna` or `Good evening, Krishna`.
- Greeting is based on the browser/device's local time.
- Suggested time bands (configurable in code): morning 05:00–11:59, afternoon 12:00–16:59, evening 17:00–20:59, night 21:00–04:59.
- If no name is configured, use a neutral greeting such as `Welcome`. The initial configured name for this build is `Krishna`.
- The greeting must update when the page is opened; it does not need to animate between time bands while the tab remains open.

#### Live clock and date

- Display local time in a readable format, preferably `h:mm` with AM/PM.
- Display the local date, e.g. `Thursday, 19 November`.
- Update the clock at least once per minute.
- Use the browser/device locale and timezone.
- Avoid hard-coded timezone assumptions.

### 3.2 Daily main focus

The main focus is one text entry representing the user's most important priority for the current local calendar day.

#### First visit of a day

- If no focus has been saved for the current date, show the prompt: **“What is your main focus today?”**
- Provide a text input and a clear Save/Enter action.
- Allow the user to submit using Enter.
- Trim leading and trailing whitespace.
- Do not save an empty or whitespace-only focus.
- Set a reasonable maximum length, recommended 160 characters.
- After saving, display the focus prominently on the dashboard.

#### After focus is saved

- Keep the focus visible on every new tab for the rest of that local day.
- Provide a small Edit action so the user can revise it.
- Saving an edit updates the focus for the same day.
- Provide a clear action to change or clear the focus, with confirmation only if clearing would discard text.
- The saved focus should also be available to the Focus Mode block page.

#### Daily reset rules

- Store the date associated with the focus as a local date key in `YYYY-MM-DD` format.
- On dashboard load, compare the stored focus date with today's local date.
- If they differ, treat the old focus as expired and show the prompt again.
- Do not rely only on a 24-hour timer. The reset is based on the local calendar date, so it works across browser restarts and timezone changes.
- Do not delete the old value immediately unless needed; it may be overwritten when the new focus is saved.
- If the user leaves the dashboard open across midnight, refresh the focus state at the next local date boundary or on the next minute tick. The prompt should appear for the new day without requiring a browser restart.

### 3.3 Task list

A lightweight task list displayed on the dashboard.

#### Required actions

- Add a task.
- Mark a task complete.
- Reopen a completed task (recommended).
- Delete a task.

#### Task behavior

- Task text is required and trimmed.
- Recommended maximum length: 120 characters.
- Pressing Enter in the add-task input creates the task.
- New tasks appear at the top of the list.
- Completed tasks remain visible with a clear completed style, such as a checkmark and strikethrough.
- Deleting a task removes it from the active list immediately.
- If the list is empty, show a helpful empty state such as `No tasks yet. Add one to get started.`
- Prevent accidental duplicate submissions caused by rapid repeated clicks.
- Use stable unique IDs for tasks.
- Store task creation and completion timestamps where useful.
- Recommended first-release limit: 50 active/incomplete tasks, with a friendly message if the limit is reached. Completed tasks may remain stored, but the UI should not become unwieldy.

#### Task persistence and daily behavior

- Tasks persist across tabs and browser restarts.
- Tasks do not automatically reset each day. The daily reset applies only to the main focus.
- Do not silently delete completed tasks.
- A later version may add archiving, due dates, priorities, and task history; these are out of scope for v1.

### 3.4 Focus Mode and website blocking

Focus Mode is an optional user-controlled feature. When enabled, the extension should prevent navigation to websites in the user's block list and show a custom interruption page containing the current daily focus.

#### User experience

- Dashboard displays a toggle labeled `Focus Mode`.
- Clearly show whether the mode is ON or OFF.
- Enabling or disabling should take effect promptly.
- If the user enables Focus Mode before setting a daily focus, use a fallback message such as `Stay focused on what matters.` The user can still set their daily focus later.
- When a blocked website is opened, redirect to the extension's own block page.
- The block page should show:
  - A short heading such as `Take a moment.`
  - The saved focus for today, if available.
  - A secondary line such as `You chose to stay focused.`
  - A button to return to the previous page or go back.
  - A button/link to open the dashboard/new tab.
  - A way to disable Focus Mode, if the product decision is to allow an override from the block page. If included, make the override explicit and deliberate.

#### Initial default block list

Provide a small editable starter list, with the ability to remove any item. Suggested defaults:

- `instagram.com`
- `www.instagram.com`
- `youtube.com`
- `www.youtube.com`
- `m.youtube.com`
- `linkedin.com`
- `www.linkedin.com`
- `facebook.com`
- `www.facebook.com`
- `x.com`
- `twitter.com`
- `www.twitter.com`
- `reddit.com`
- `www.reddit.com`

The list must be visible and editable in Settings. Do not assume every user wants all defaults; provide a clear way to remove them. Consider showing the starter list during first-run setup and allowing the user to choose whether to keep it.

#### Matching rules

- Normalize entries before saving:
  - Trim whitespace.
  - Convert hostnames to lowercase.
  - Remove URL schemes (`http://`, `https://`) and paths/query strings if a user pastes a full URL.
  - Remove a trailing dot.
  - Reject malformed entries and unsupported values.
- Match exact hostnames and subdomains. For example, a rule for `youtube.com` should block `youtube.com`, `www.youtube.com`, and `m.youtube.com`.
- Do not use unsafe substring matching. A rule for `youtube.com` must not block `notyoutube.com` or `youtube.com.example.org`.
- Do not block the extension's own pages or Chrome internal pages.
- The user should be able to add and remove domains.
- Display domains in a readable form, one per row or chip.
- Prevent duplicate domains after normalization.

#### Technical implementation constraints

- Use Manifest V3 and `chrome.declarativeNetRequest` for blocking rules.
- Use dynamic rules where practical so the user can edit the block list without rebuilding the extension.
- Use a stable, reserved rule ID range for FocusTab-generated rules.
- When Focus Mode is OFF, remove or disable all FocusTab blocking rules.
- When Focus Mode is ON, install rules for the current block list.
- Use redirect actions to an extension-owned page, for example `blocked.html`.
- Preserve the original destination in a safe, encoded query parameter if it is needed for a Back/Continue UX. Validate it before using it; never treat arbitrary query input as trusted HTML or script.
- The extension must not attempt to bypass Chrome's permission model or block Chrome-internal URLs.
- Check the current Chrome limits for dynamic rules and use a conservative number of rules.
- Prefer a small number of rules using domain matching rather than one rule per URL path.
- The block page must be an extension resource and should not load remote scripts.

#### Permissions

Request only the permissions required for the implemented feature. Likely permissions include:
- `storage` for settings and task persistence.
- `declarativeNetRequest` for website blocking.
- `declarativeNetRequestWithHostAccess` or the appropriate host permissions required by the chosen redirect/rule design, after validating current Chrome MV3 requirements.
- Host access for the domains the user chooses to block, if required by the final implementation.

Do not request broad `<all_urls>` access unless it is demonstrably required and justified. Explain blocking permissions clearly in onboarding or Settings. The coding agent must verify the current Chrome Web Store and Manifest V3 permission requirements before implementation.

#### Important technical caveat

Chrome's declarative network rules can redirect a request to an extension page, but the exact permission and redirect behavior must be verified against current Manifest V3 documentation. The implementation must not claim that it can replace Chrome's built-in error page for every navigation scenario. Test direct URL entry, links, redirects, subdomains, and already-open tabs. If an already-open page is not automatically redirected when rules are enabled, document that behavior and ensure subsequent navigations are blocked.

### 3.5 Settings

Open Settings from a gear/settings icon on the dashboard. Use a modal, drawer, or dedicated extension settings page. A modal or side panel is preferred for the first release if it remains accessible and usable on smaller screens.

#### Settings sections

**A. Profile**
- Display name input, initially set to `Krishna`.
- LinkedIn profile URL input, initially set to `https://www.linkedin.com/in/krishnamahajan1/`.
- Allow the user to edit or clear the LinkedIn shortcut URL and optionally hide the shortcut.
- Validate that the profile URL uses HTTPS and points to `linkedin.com` or a LinkedIn subdomain before displaying it as a LinkedIn shortcut.
- Save action.
- Trim whitespace and enforce a reasonable maximum, recommended 40 characters.
- If blank, use the neutral greeting.

**B. Wallpaper**
- Use the user-provided iStock image URL as the initial wallpaper source.
- Upload an image from the user's device.
- Show a preview before or immediately after applying.
- Provide a remove/reset-to-default action.
- Support common formats: JPEG, PNG, and WebP.
- Validate file type and size. Recommended maximum: 5 MB.
- Crop/cover the viewport without stretching the image.
- Add a dark overlay or allow overlay strength to be adjusted if feasible.
- Store the image locally using an appropriate browser storage approach. Do not store a large base64 image in `chrome.storage.sync`.
- Prefer IndexedDB for wallpaper blobs or another reliable local storage mechanism. Store a reference/key in extension settings.
- Handle quota errors gracefully and explain how to choose a smaller image.

**C. Focus Mode**
- Toggle Focus Mode ON/OFF.
- Show current state.
- Explain briefly what it does.
- If blocking permissions are not granted or rules cannot be installed, show a clear error and keep the state consistent with actual blocking behavior.

**D. Block list**
- Add a website/domain.
- Remove a website/domain.
- Show default and user-added domains in the same editable list, optionally label defaults.
- Validate and normalize entries.
- Provide a restore-defaults action with confirmation.
- Explain the matching behavior: a domain also blocks its subdomains.

**E. About / help (optional for v1)**
- Extension name and version.
- Short privacy note: data stays on this device in the first release.
- Link to help or feedback page if one exists. Do not invent a URL.

#### Settings persistence

- Save changes immediately where safe, or use explicit Save buttons for multi-field forms.
- Show a saved/updated confirmation.
- Settings must remain after browser restart and extension update.
- Provide safe defaults when storage is empty or corrupted.

---

## 4. Onboarding and first-run experience

The first run should be short and skippable.

### Recommended flow

1. User installs the extension and opens a new tab.
2. Show a brief welcome state with the prefilled name `Krishna`.
3. Allow the user to keep or change the display name (optional).
4. Offer the starter blocked-site list and explain Focus Mode permissions.
5. Let the user choose whether to enable Focus Mode now or later.
6. Show the dashboard and ask: `What is your main focus today?`

Do not force wallpaper upload or require Focus Mode to be enabled. Users should be able to use the dashboard without granting blocking-related permissions.

---

## 5. UX and visual design direction

### 5.1 Design principles

- Calm, focused, personal, and minimal.
- The wallpaper is the visual foundation; interface elements should remain readable.
- The main focus should be the primary content, not the task list.
- Controls should be obvious without looking like a complex admin panel.
- Avoid unnecessary notifications and gamification.
- Use subtle transitions only where they improve feedback.

### 5.2 Suggested dashboard hierarchy

1. Top area: greeting, LinkedIn shortcut, and settings icon.
2. Center area: live clock, date, and main focus prompt/value.
3. Lower or side area: compact task list.
4. Focus Mode control: visible but secondary.

The coding agent may refine the layout, but must preserve this hierarchy and all required actions.

### 5.3 Accessibility

- Use semantic HTML elements and accessible labels.
- All functions must be usable by keyboard.
- Inputs must have associated labels or accessible names.
- Ensure sufficient text/background contrast across arbitrary wallpapers.
- Do not communicate Focus Mode state by color alone.
- Provide visible focus outlines.
- Use buttons for actions, not clickable non-semantic text.
- Announce important state changes to assistive technology where appropriate.
- Respect reduced-motion preferences.

---

## 6. Data model and local storage

Use `chrome.storage.local` for small structured data and IndexedDB for wallpaper image blobs. Avoid `chrome.storage.sync` for large or frequently changing data.

### 6.1 Suggested data schema

```json
{
  "schemaVersion": 1,
  "profile": {
    "displayName": "Krishna",
    "linkedinUrl": "https://www.linkedin.com/in/krishnamahajan1/",
    "showLinkedInShortcut": true
  },
  "dailyFocus": {
    "dateKey": "2026-11-19",
    "text": "Finish the dashboard MVP"
  },
  "tasks": [
    {
      "id": "uuid",
      "text": "Review project requirements",
      "completed": false,
      "createdAt": "2026-11-19T10:00:00.000Z",
      "completedAt": null
    }
  ],
  "focusMode": {
    "enabled": false
  },
  "blockList": [
    "instagram.com",
    "youtube.com"
  ],
  "wallpaper": {
    "kind": "remote-default",
    "url": "https://media.istockphoto.com/id/1461006686/photo/aerial-view-of-waves-hitting-a-small-rocky-island-with-long-exposure.jpg?s=170667a&w=0&k=20&c=F0wVTyMB0jiy_9ub9cTikVodRwshvYR4D7MgRpU9J2A=",
    "indexedDbKey": null
  },
  "ui": {
    "overlayStrength": 0.45,
    "clockFormat": "12h"
  }
}
```

This is a logical schema, not a requirement to store the entire object as one key. Separate keys may be preferable to reduce write conflicts.

### 6.2 Storage rules

- Use a schema version and migration function for future updates.
- Validate data read from storage; do not assume it is well-formed.
- Handle missing keys by applying defaults.
- Handle storage read/write failures with a visible but non-blocking message.
- Use `chrome.storage.local` change events or a shared state layer so multiple open dashboard tabs remain synchronized.
- Do not store passwords, sensitive personal data, or browsing history.
- Do not send user data to an external server in v1.

### 6.3 Date handling

- Generate the daily focus key using the user's local calendar date.
- Do not use UTC date slicing as a substitute for local date calculation.
- Test around midnight and daylight-saving transitions.
- If the timezone changes, use the current local date on the next dashboard state refresh.

---

## 7. Technical architecture

### 7.1 Recommended stack

- Chrome Extension Manifest V3.
- TypeScript.
- React for the dashboard UI.
- Vite or another Chrome-extension-compatible build tool.
- CSS Modules, plain CSS, or a small utility CSS setup.
- Chrome Extension APIs for storage, tabs, runtime messaging, and declarative network rules.
- IndexedDB for wallpaper image storage.
- Unit tests for date logic, domain normalization, and block-rule generation.
- End-to-end tests in a real Chrome test profile for navigation blocking.

The coding agent may choose an equivalent lightweight stack, but must explain any major deviation.

### 7.2 Suggested project structure

```text
focustab/
├── public/
│   ├── manifest.json
│   ├── icons/
│   └── blocked.html
├── src/
│   ├── background/
│   │   └── service-worker.ts
│   ├── newtab/
│   │   ├── index.html
│   │   ├── main.tsx
│   │   ├── Dashboard.tsx
│   │   ├── components/
│   │   │   ├── Clock.tsx
│   │   │   ├── DailyFocus.tsx
│   │   │   ├── TaskList.tsx
│   │   │   ├── FocusModeToggle.tsx
│   │   │   └── SettingsDialog.tsx
│   │   └── styles/
│   ├── blocked/
│   │   ├── blocked.tsx
│   │   └── blocked.css
│   ├── options/
│   │   └── options.tsx
│   ├── shared/
│   │   ├── storage.ts
│   │   ├── schema.ts
│   │   ├── date.ts
│   │   ├── domains.ts
│   │   ├── rules.ts
│   │   └── messages.ts
│   └── tests/
├── package.json
├── tsconfig.json
└── README.md
```

This is a suggested structure. Keep the code modular and avoid putting all logic in one component.

### 7.3 Manifest requirements

The manifest should include:
- `manifest_version: 3`
- `name`, `version`, `description`
- `chrome_url_overrides.newtab` pointing to the built dashboard page
- A service worker background entry
- Only the permissions and host access needed by the implemented features
- Extension icons in required sizes

The coding agent must produce a valid production build and verify that the unpacked extension loads in Chrome without manifest errors.

### 7.4 Responsibilities

**Dashboard UI**
- Render greeting, clock, date, daily focus, tasks, Focus Mode state, and settings.
- Validate user inputs.
- Display storage and permission errors clearly.

**Service worker**
- Manage Focus Mode rule installation/removal.
- Respond to messages from dashboard and blocked page.
- Reconcile saved Focus Mode state with actual dynamic rules on startup and extension installation/update.
- Avoid relying on in-memory service-worker state because MV3 workers can be suspended.

**Storage layer**
- Read/write profile, focus, tasks, block list, and UI settings.
- Manage schema migrations and defaults.
- Persist wallpaper blobs in IndexedDB.

**Block page**
- Display the user's current focus.
- Provide safe navigation actions.
- Offer a path back to the dashboard.
- Never render untrusted query parameters as HTML.

---

## 8. Functional requirements and acceptance criteria

### FR-01: New Tab override
- Opening a new Chrome tab displays the FocusTab dashboard.
- The page renders without console errors.
- Dashboard works after Chrome is restarted.

### FR-02: Personalized greeting
- Saved name appears in the greeting.
- Greeting changes according to local time bands.
- Empty name falls back to a neutral greeting.

### FR-03: Live clock and date
- Clock displays current local time.
- Clock updates at least once per minute.
- Date matches the device's local date.

### FR-04: Daily focus
- First open on a date shows `What is your main focus today?`
- Saving non-empty text displays it on the dashboard.
- Focus remains visible after opening another tab or restarting Chrome.
- Editing updates the current day's focus.
- On the next local calendar day, the prompt appears again.
- A tab left open across midnight updates to the new day's prompt.

### FR-05: Task list
- User can add a task with Enter or an Add button.
- Empty tasks are rejected.
- User can mark tasks complete and reopen them.
- User can delete tasks.
- Tasks persist after restart.
- Tasks remain when the daily focus resets.

### FR-06: Focus Mode
- Toggle accurately reflects the actual enabled state.
- Turning it ON installs blocking rules for all valid domains in the list.
- Turning it OFF removes FocusTab blocking rules.
- State survives service-worker suspension and browser restart.
- If rule installation fails, the UI must not falsely show Focus Mode as ON.

### FR-07: Website blocking
- A blocked domain redirects to the extension's custom block page.
- Subdomains are blocked according to the documented matching rules.
- Similar but unrelated hostnames are not blocked.
- Non-listed domains continue to work normally.
- Extension pages and Chrome internal pages are not blocked.
- The block page shows today's focus or the fallback message.
- Test direct navigation and link navigation.

### FR-08: Settings
- User can change and save their name.
- User can upload and preview a supported wallpaper.
- User can remove the custom wallpaper and return to default.
- User can add and remove block-list domains.
- Invalid domains and duplicates are rejected.
- Changes persist after restart.

### FR-09: LinkedIn quick-access shortcut
- Dashboard shows a LinkedIn shortcut by default.
- Activating it opens the saved profile URL in a new tab.
- The default URL is the user-provided profile URL.
- User can edit the URL or hide the shortcut in Settings.
- Invalid or non-HTTPS URLs are rejected.
- The extension does not log in to LinkedIn, scrape profile data, or request LinkedIn credentials.

### FR-10: Data integrity and privacy
- No dashboard data is transmitted to a remote server in v1.
- Storage failures are handled without crashing the dashboard.
- Invalid or outdated stored data is safely migrated or reset to defaults.
- No broad browsing-history collection is implemented.

---

## 9. Edge cases and error handling

1. **No name configured:** show `Welcome`.
2. **No focus saved today:** show the focus prompt.
3. **Empty focus submission:** do not save; show inline validation.
4. **Midnight while tab is open:** refresh the daily focus state.
5. **Timezone change:** recompute today's local date key.
6. **Wallpaper too large or unsupported:** reject it with a clear message.
7. **Wallpaper storage quota exceeded:** retain the previous wallpaper and explain the issue.
8. **Malformed domain:** reject it and show an example of a valid domain.
9. **Duplicate domain:** do not add a second copy.
10. **Focus Mode rule update fails:** show an error and reconcile the toggle with actual rules.
11. **Extension service worker restarts:** restore behavior from persisted state and dynamic rules.
12. **User removes all blocked domains:** Focus Mode may remain enabled but should show that the list is empty and no sites are currently blocked.
13. **No network connection:** dashboard, tasks, settings, and local wallpaper continue to work.
14. **Multiple new tabs open:** changes should appear in other tabs without requiring a manual refresh.
15. **Extension is disabled:** blocking stops; do not imply otherwise.
16. **Blocked page opened directly:** render a safe fallback message if no valid destination or focus value is available.

---

## 10. Privacy and security

- Keep all data local in v1.
- Do not collect or transmit browsing history.
- Do not load remote JavaScript.
- Treat all user-entered text and URL parameters as untrusted.
- Render user content as text, never with unsafe HTML injection.
- Validate wallpaper MIME type, extension, and size. Do not trust the filename alone.
- Avoid unnecessary host permissions.
- Explain why website-blocking permissions are needed.
- Do not expose the user's block list or focus text to external services.
- Ensure the block page cannot be used as an open redirect to unsafe destinations.
- Follow Chrome Web Store policies and current Manifest V3 requirements.

---

## 11. Performance requirements

- Dashboard should feel immediate on a typical modern desktop.
- Target first meaningful render within 1 second on a warm local load; treat this as a performance goal, not a guarantee for all devices.
- Avoid large UI libraries unless they materially reduce development time or improve maintainability.
- Optimize uploaded wallpaper display and avoid repeatedly decoding large images.
- Keep clock updates lightweight.
- Do not poll storage continuously; use events and focused refreshes.
- Do not make network calls during normal dashboard use.

---

## 12. Analytics and success metrics

No remote analytics are required for v1. Use manual QA and optional local test instrumentation only.

Success criteria for the first release:
- The extension installs and overrides the New Tab page reliably.
- All core dashboard data persists across browser restarts.
- Daily focus resets correctly on a new local calendar day.
- Task actions work without data loss.
- Focus Mode installs and removes rules reliably.
- The custom block page works for tested blocked domains.
- Settings are understandable without external documentation.
- No critical console errors or data-loss bugs remain.

---

## 13. Build plan: phased implementation

Build and verify each phase before starting the next. Do not attempt all features in one large code-generation step.

### Phase 0 — Project setup and technical validation

**Objective:** Create a valid Chrome MV3 extension skeleton and prove the New Tab override works.

**Tasks**
1. Initialize the project with TypeScript and the chosen UI framework.
2. Configure the build tool to output extension-compatible files.
3. Create `manifest.json` with the New Tab override.
4. Add a minimal dashboard page.
5. Add extension icons and basic metadata.
6. Load the unpacked build in Chrome.
7. Verify that opening a new tab loads the dashboard.
8. Add a README with local development and build instructions.

**Deliverables**
- Working project skeleton.
- Valid MV3 manifest.
- New Tab override visible in Chrome.
- Repeatable development and production build commands.

**Acceptance gate**
- Chrome loads the extension without manifest errors.
- New tabs show the placeholder dashboard.
- Build output contains all referenced extension resources.

**Do not build yet:** tasks, wallpaper upload, blocking, or advanced settings.

### Phase 1 — Dashboard UI foundation

**Objective:** Build the visual dashboard with local-time greeting, date, and clock.

**Tasks**
1. Implement the full-screen responsive layout.
2. Add a default background/wallpaper and readable overlay.
3. Implement the greeting with a placeholder/default name.
4. Implement the live clock and date.
5. Add the settings icon as a working shell that opens a placeholder settings panel.
6. Add responsive behavior and keyboard accessibility.
7. Add reduced-motion support.

**Deliverables**
- Polished dashboard shell.
- Live clock and date.
- Greeting.
- Settings panel shell.

**Acceptance gate**
- Layout works at common desktop sizes and smaller windows.
- Clock updates once per minute.
- Text remains legible over the default background.
- Keyboard users can reach all visible controls.

### Phase 2 — Local storage, profile, and wallpaper

**Objective:** Make the dashboard personal and persistent.

**Tasks**
1. Implement a typed storage layer.
2. Add schema versioning and safe defaults.
3. Add display-name editing in Settings.
4. Persist the display name in `chrome.storage.local`.
5. Implement wallpaper upload, preview, apply, and reset.
6. Store wallpaper blobs in IndexedDB.
7. Handle unsupported files, oversized files, and storage errors.
8. Synchronize updates across open dashboard tabs.

**Deliverables**
- Persistent profile settings.
- Custom wallpaper support.
- Default wallpaper fallback.
- Storage utilities and tests.

**Acceptance gate**
- Name and wallpaper survive Chrome restart.
- Removing the wallpaper restores the default.
- Invalid uploads are rejected safely.
- Existing wallpaper is not lost when a replacement upload fails.

### Phase 3 — Daily focus

**Objective:** Implement the daily intention workflow and reliable local-date reset.

**Tasks**
1. Implement local `YYYY-MM-DD` date-key utilities.
2. Show the exact prompt when no focus exists for today.
3. Add focus input, save, and Enter submission.
4. Display saved focus prominently.
5. Add edit and clear/change actions.
6. Refresh focus state when the local date changes while the tab remains open.
7. Add unit tests for midnight, timezone changes, and date boundaries.

**Deliverables**
- Complete daily focus feature.
- Date utility tests.
- Focus persistence.

**Acceptance gate**
- Focus is visible across tabs and browser restarts for the same local day.
- Next local day shows a fresh prompt.
- A tab kept open across midnight also refreshes.
- Tasks (when added later) are not affected by focus reset logic.

### Phase 4 — Task list

**Objective:** Add a reliable, lightweight task manager.

**Tasks**
1. Define the task data model.
2. Implement add-task input and Enter submission.
3. Implement complete/reopen behavior.
4. Implement delete behavior.
5. Add empty state and input validation.
6. Persist tasks in local storage.
7. Synchronize task changes across open tabs.
8. Add tests for task operations and persistence.

**Deliverables**
- Working task list.
- Persistent task storage.
- Task component tests.

**Acceptance gate**
- Add, complete, reopen, and delete all work.
- Tasks persist across browser restart.
- Daily focus reset does not clear tasks.
- Empty and over-limit inputs are handled clearly.

### Phase 5 — Focus Mode and blocking engine

**Objective:** Implement real website blocking using MV3 APIs.

**Tasks**
1. Verify current Chrome MV3 requirements for `declarativeNetRequest`, redirect rules, host access, and dynamic rule limits.
2. Document the permission model before requesting permissions.
3. Implement domain normalization and validation.
4. Implement safe exact-domain/subdomain matching.
5. Implement dynamic rule generation with a reserved rule ID range.
6. Implement service-worker messages for enabling/disabling Focus Mode and updating the block list.
7. Reconcile persisted settings and actual rules on install, startup, and extension update.
8. Create the extension-owned blocked page.
9. Pass destination context safely where supported.
10. Show the current daily focus or fallback text on the blocked page.
11. Add a dashboard toggle and clear error states.
12. Test direct URL navigation, links, redirects, subdomains, unrelated domains, and already-open tabs.

**Deliverables**
- Focus Mode toggle.
- Dynamic blocking rules.
- Editable domain-matching engine.
- Custom block page.
- Permission explanation.

**Acceptance gate**
- ON installs the expected rules.
- OFF removes only FocusTab's rules.
- Service-worker suspension/restart does not break the saved state.
- Listed domains and subdomains are blocked.
- Similar unrelated domains are not blocked.
- Block page displays the current focus.
- If permissions or rules fail, UI reports the failure honestly.

**Important:** Do not mark this phase complete based only on mocked rules or a UI toggle. Verify actual browser navigation behavior in Chrome.

### Phase 6 — Complete Settings and onboarding

**Objective:** Make the extension understandable and configurable for a first-time user.

**Tasks**
1. Complete Profile, Wallpaper, Focus Mode, and Block List settings sections.
2. Add domain add/remove and restore-defaults actions.
3. Add first-run welcome and optional profile setup.
4. Explain Focus Mode and the permissions it needs.
5. Let users skip optional setup.
6. Add saved-state feedback and confirmation for destructive actions.
7. Add an About/privacy section if time permits.

**Deliverables**
- Complete Settings experience.
- First-run onboarding.
- User-facing permission explanation.

**Acceptance gate**
- All settings work without editing code.
- User can use the dashboard without enabling Focus Mode.
- User can remove all default domains.
- Onboarding is skippable and does not block access to the dashboard.

### Phase 7 — QA, hardening, and release packaging

**Objective:** Stabilize the extension and prepare a release-ready build.

**Tasks**
1. Run unit tests for date, storage, domain, and rule logic.
2. Run end-to-end tests in a clean Chrome profile.
3. Test browser restart and service-worker suspension.
4. Test multiple open dashboard tabs.
5. Test wallpaper storage limits and failure recovery.
6. Test accessibility and responsive layouts.
7. Check permissions against actual feature usage.
8. Remove debug logs and unused permissions.
9. Verify extension icons, version, description, and manifest.
10. Write installation, troubleshooting, privacy, and build instructions.
11. Produce a ZIP of the unpacked extension contents suitable for local sharing or Chrome Web Store preparation.

**Deliverables**
- Release build.
- Test checklist and results.
- README and troubleshooting guide.
- Store-ready assets/metadata where applicable.

**Acceptance gate**
- No known critical or high-severity bugs.
- No data loss in core flows.
- No unhandled runtime errors during normal use.
- Permissions are minimal and accurately explained.
- Clean Chrome profile installation succeeds.

---

## 14. Test plan

### 14.1 Functional test matrix

| Area | Test | Expected result |
|---|---|---|
| New Tab | Open a new tab | FocusTab dashboard appears |
| Greeting | Save a name | Greeting uses saved name |
| Greeting | Clear the name | Neutral greeting appears |
| Clock | Wait one minute | Displayed time updates |
| Focus | First open today | Daily focus prompt appears |
| Focus | Save focus | Focus is displayed |
| Focus | Open another tab | Same focus appears |
| Focus | Advance local date | New focus prompt appears |
| Focus | Keep tab open across midnight | Focus prompt refreshes |
| Tasks | Add a task | Task appears at top |
| Tasks | Complete a task | Completed style appears |
| Tasks | Reopen a task | Active style returns |
| Tasks | Delete a task | Task disappears |
| Tasks | Restart Chrome | Tasks remain |
| Wallpaper | First launch | Supplied wallpaper URL loads, or built-in fallback appears |
| Wallpaper | Upload valid image | Image is applied |
| Wallpaper | Upload invalid/large image | Clear validation error |
| Wallpaper | Reset wallpaper | Default background returns |
| Focus Mode | Enable | Blocking rules are installed |
| Focus Mode | Disable | FocusTab rules are removed |
| Blocking | Visit listed domain | Custom block page appears |
| Blocking | Visit subdomain | Custom block page appears |
| Blocking | Visit lookalike domain | Site is not blocked |
| Blocking | Visit unlisted domain | Site loads normally |
| LinkedIn | Click shortcut with Focus Mode OFF | Supplied profile opens in a new tab |
| LinkedIn | Edit or hide shortcut | Dashboard reflects saved setting |
| Settings | Add/remove domain | List and rules update |
| Persistence | Restart Chrome | Settings and state restore |

### 14.2 Manual browser test cases

Test with a clean Chrome profile and a small controlled block list. Include:
- `example.com` and `sub.example.com` as test targets where safe and available.
- A lookalike such as `notexample.com` to verify boundary matching.
- A blocked domain opened by typing its URL.
- A blocked domain opened by clicking a link.
- A blocked domain opened through a redirect.
- A tab already open before Focus Mode is enabled.
- Focus Mode disabled while a blocked page is visible.
- Extension service worker stopped/restarted.
- Browser closed and reopened with Focus Mode enabled.

Do not rely solely on unit tests for network blocking. The real Chrome API behavior must be verified.

---

## 15. Risks and decisions to resolve during implementation

| Risk / question | Required response |
|---|---|
| MV3 redirect permissions may differ by Chrome version and rule design | Verify official current documentation and test in Chrome before finalizing permissions |
| Chrome may not retroactively redirect already-open tabs | Document behavior and test; ensure future navigations are blocked |
| Broad host permissions can reduce user trust | Request only what the selected rule design requires |
| Large wallpapers may exceed storage quota | Use IndexedDB, enforce a file-size limit, and preserve the previous image on failure |
| Local date behavior can be wrong if UTC is used | Use local date components and test midnight/timezone changes |
| Multiple tabs can overwrite each other's changes | Use storage change events and avoid stale whole-object writes |
| Dynamic rule limits may constrain large block lists | Set a reasonable list limit and show a clear message |
| User can disable the extension | Clearly state that Focus Mode is a self-management aid, not tamper-proof enforcement |

### Recommended v1 limits

- Display name: 40 characters.
- Daily focus: 160 characters.
- Task: 120 characters.
- Wallpaper: 5 MB.
- Block list: 50 domains initially, unless Chrome's verified limits suggest a lower value.
- Tasks: 50 active tasks.

These are product defaults and may be adjusted after implementation testing.

---

## 16. Definition of done

The v1 product is complete when:

1. The extension can be loaded in Chrome and replaces the New Tab page.
2. The dashboard initially greets `Krishna`, shows the local clock and date, and attempts to display the supplied wallpaper URL with a safe fallback.
3. The LinkedIn shortcut opens `https://www.linkedin.com/in/krishnamahajan1/` in a new tab and can be edited or hidden in Settings.
4. The user can set, edit, and reset a daily focus.
5. Daily focus resets based on the local calendar date, including while a tab is open.
6. The user can add, complete, reopen, and delete tasks.
7. The user can enable and disable Focus Mode.
8. The user can edit the block list.
9. Listed domains redirect to a custom extension page that shows the current focus.
10. Name, wallpaper, tasks, focus, LinkedIn shortcut, and settings persist as specified.
11. Data remains local in v1, except the browser requests the supplied external wallpaper image and the user opens LinkedIn when using the shortcut.
12. The extension handles invalid input, storage failures, and rule failures gracefully.
13. The README explains setup, build, installation, permissions, and known limitations.

---

## 17. Instructions for the AI coding tool

Build this project phase by phase. Do not generate the entire extension in one pass.

For each phase:

1. Inspect the existing repository before changing files.
2. State the files you plan to create or modify.
3. Implement only the current phase and avoid unrelated refactoring.
4. Keep TypeScript types explicit and components modular.
5. Add or update tests for the functionality introduced in that phase.
6. Run the build and tests.
7. Fix all errors before reporting completion.
8. Provide a concise summary of what changed, how to run it, and how to verify it manually.
9. Do not claim a Chrome API feature works unless it has been tested in Chrome or clearly label it as unverified.
10. Stop at the phase acceptance gate and wait for approval before moving to the next phase.

### First instruction

Start with **Phase 0 only**. Create the project skeleton, configure Manifest V3, implement the simplest New Tab override, and provide exact commands to install dependencies, build the extension, and load it unpacked in Chrome. Do not implement later phases until Phase 0 is verified.
