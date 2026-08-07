# Master Task List (Phases 1, 2 & 3)

Below is the complete inventory of all development tasks implemented in **FitDash**, along with pending tasks for Phase 3.

---

## ✅ Phase 1: Core Dashboard & Foundation
- [x] **Settings & Navigation**
  - [x] Build 5th navigation tab for Settings (`page-settings`).
  - [x] Add user profile form (height, weight, age, gender, activity level).
  - [x] Add AI Provider configuration (Groq & OpenRouter API key inputs).
  - [x] Implement Goal Configuration (target weight, target BF%, calories, cuisine).
  - [x] Implement full JSON Data Export and Import backup handlers.
  - [x] Add Theme Toggle (Dark / Light mode).
  - [x] Add Audio & Haptic feedback settings.

- [x] **Body Composition & Navy BF% Calculator**
  - [x] Implement U.S. Navy Body Fat Formula (waist, neck, hip inputs).
  - [x] Calculate and display Lean Mass vs. Fat Mass breakdowns.
  - [x] Build Body Composition trend log and Canvas chart.
  - [x] Add manual BF% direct entry fallback.

- [x] **AI Coach & Calorie Parsing**
  - [x] Build floating chat bubble interface and popup panel.
  - [x] Integrate Groq & OpenRouter API client handlers.
  - [x] Implement `buildSystemPrompt()` to feed user stats into AI context.
  - [x] Implement persistent chat history in `localStorage`.
  - [x] Implement natural language food calorie parser returning `FITDASH_FOOD` JSON blocks.

- [x] **Workout Engine & Stability Fixes**
  - [x] Build structured 3-Block workout plan (Superset A, Giant Set B, Circuit C).
  - [x] Implement training level scaling (*Butter Starter*, *Butter Build*, *Butter Beast*).
  - [x] Fix `renderWorkoutStep` index bound crashes and undefined block errors.
  - [x] Fix Personal Records (PR) Clear All button functionality.
  - [x] Add defensive checks for rest timer skipping and step advancement.

---

## ✅ Phase 2: Media, Recovery & Custom Block Engine

- [x] **YouTube Exercise Demos**
  - [x] Map hardcoded YouTube Video IDs (`ytId`) to all primary exercises in `WORKOUT_PLAN`.
  - [x] Build universal embedded YouTube iframe modal (`openYouTubeDemo()`).

- [x] **Dashboard Rest Day & Active Recovery**
  - [x] Add 7-day training schedule configuration in Settings.
  - [x] Implement automatic detection of completed workouts today to trigger "Enjoy your Rest Day" state.
  - [x] Replace external YouTube links with inline embedded iframe modals for Active Recovery routines.

- [x] **Custom Block & Exercise Movement Engine**
  - [x] Implement `fitdash_overrides` state in `localStorage`.
  - [x] Build permanent Custom Block (`🛠️`) pool view in the Training tab.
  - [x] Add interactive `[ ⇄ Move ]` modal with styled buttons for Block A, Block B, Block C, and Custom Pool.
  - [x] Update `executeMove()` to synchronize global memory (`workoutOverrides`) for zero-latency DOM re-rendering.
  - [x] Add direct exercise creation (`+ Create Unique Exercise`) and deletion (`✕`) within the Custom Block.

- [x] **Body Circumference Tracking**
  - [x] Add measurement input fields for 12 key body parts.
  - [x] Implement logging handler `logCircumference()` and history persistence (`fitdash_circ`).
  - [x] Add history table rendering and history clear function.

---

## 🚀 Phase 3: Health Analytics & Data Visualization
- [ ] **Historical JSON Data Generator**
  - [ ] Write a Node/Python script to generate a rich 30-day mock dataset.
  - [ ] Populate `fitdash_sessions`, `fitdash_pr`, `fitdash_recomp`, and `fitdash_circ` with trending values.
  - [ ] Export as a valid `fitdash_backup.json` for user import.
- [ ] **Dashboard Health Widgets**
  - [ ] Build Daily Water intake tracking widget with UI fill-bar.
  - [ ] Build Sleep tracking widget (hours and quality rating).
- [ ] **Advanced Analytics Charts**
  - [ ] Implement multi-line Canvas chart for Body Circumferences.
  - [ ] Implement line Canvas chart for Volume / PR Progression over time.
