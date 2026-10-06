# FitDash 🏋️

A fully offline, single-file fitness dashboard built on the Greg Doucette Circle Diet and HTLT training principles. No account, no server, no installation — open the HTML file in any browser and start tracking.

---

## What it does

FitDash covers four areas in one file:

**Dashboard** — daily greeting, session count, current streak, today's weight, weekly cardio progress bar, and a five-item habit checklist that resets each morning.

**Quick Log** — one-tap logging from the dashboard: water (+250 ml / +500 ml / +1 L), weight, sleep ("same as last night"), cardio (+10/20/30 min), pinned and frequently eaten foods, and single sets for pinned or frequently trained exercises. Every quick action shows an undo toast. Pin foods with ☆ in today's food log and exercises with ☆ in the Training blocks.

**Personalized progression** — each exercise gets a next weight/reps suggestion from your last session using double progression (add reps until the top of the level's rep range, then add 2.5 kg, or 1 kg under 20 kg). The guided workout pre-fills the suggestion and shows your last set and estimated 1-rep max (Epley). If you miss the bottom of the rep range at the same weight two sessions running, it suggests dropping ~10% and building back up. Set a fixed weight step (0.5–5 kg) in Settings → Progression. Finishing a guided workout lists new e1RM, top-weight, and per-exercise volume PRs plus volume versus your last workout; Quick Log flags e1RM PRs in the toast. Progress → Exercise Progression shows best e1RM, total volume, 4-week e1RM change, and per-session e1RM/volume bars; Progress → Weekly Training Volume charts total kg lifted per week for the last 8 weeks.

**Routine templates** — keep several routines (Home, Gym, and a short Busy Day by default) and switch with one tap from the dashboard or Training page. Each routine remembers its Home/Gym program, level, exercise swaps, and skipped exercises. Tap 🔁 Swap on any exercise to pick an equipment-based alternative (matches for your Settings → Equipment are highlighted), one of your custom exercises, or any name you type; swaps keep their own progression history. Mid-workout, 🔁 Swap replaces the current exercise for that session only, with an option to save it to the routine. "+ New" copies the current routine; AI-generated workout templates are saved as routines.

**Weekly schedule & reminders** — Settings → Weekly Schedule plans each weekday as a rest day or a training day with a routine (e.g. Mon Gym, Wed Home, Fri Busy Day) and an optional workout time; FitDash switches to that day's routine the first time you open it that day, and the dashboard's "This Week" strip shows planned, done (✓), and rest days. Settings → Reminders turns on browser reminders for workouts (training days only), water (every 30 min–3 h within a time window), meals, weigh-ins (chosen weekdays), and bedtime. Reminders are skipped when the thing is already logged (session today, water goal hit, weight logged, enough foods logged), can be snoozed 15 min, and missed ones fire once when you reopen the app (up to 3 h late). They appear as an in-app banner with a one-tap action (+250 ml, Log weight, …) and as a system notification when FitDash is in the background. Browsers can't schedule notifications for a closed web app, so "Add to calendar (.ics)" exports the same reminders as recurring calendar events with alerts.

**Training** — a structured Full Body Protocol (Legs & Calves superset → Back/Chest/Back giant set → Full Body Circuit) with three difficulty levels. The guided workout overlay walks you set by set, runs a rest timer, logs weight and reps, auto-detects personal records, and calculates calories burned using the Mifflin–St Jeor BMR formula with a MET/volume-load adjustment. Sessions can also be logged manually from a free-form entry modal.

**Nutrition** — Greg Doucette's Circle Diet meal plans rendered as expandable cards. Six plans are included: International 1500 / 2000 / 2500 kcal and Bangladesh-localised 1500 / 2000 / 2500 kcal (BD plans use locally available foods and brands — Agora, Arong, Meena Bazaar, etc.). Each plan shows three meals and a snack section with calorie counts.

**Progress** — 7-day weight trend chart (custom canvas, no library), weight log with per-entry deletion, weekly streak dots, personal records tracker, full session history (last 20 sessions), and CSV export.

---

## Files

```
fitdash.html    — the entire app; open directly in a browser
README.md       — this file
```

Everything — HTML, CSS, JavaScript, and all meal/workout data — lives in `fitdash.html`. There are no dependencies, no build step, and no network requests at runtime.

---

## How to use

1. Download `fitdash.html`
2. Open it in Chrome, Firefox, Safari, or Edge
3. All data is saved automatically to your browser's `localStorage`

That's it. No sign-up, no internet connection required after download.

---

## Training levels

| Level | Name | Sets | Style |
|---|---|---|---|
| 🌱 Beginner | Butter Starter | 2 sets | Learn movement, no failure |
| 🔥 Amateur | Butter Burner | 3 sets | Tempo 3-1-1, max effort Set 3 |
| ⚡ Master | Better Butter Burner | 4 sets | Drop sets, failure every working set |

Switch levels any time from the Training page. Your selection persists across sessions.

---

## Workout protocol

**Block A — Legs & Calves (Superset)**
A1 Dumbbell Goblet Squat → A2 Standing Calf Raises. Complete all sets of the superset before moving to Block B.

**Block B — Back · Chest · Back (Giant Set)**
B1 DB Pullover → B2 Barbell Floor Press → B3 DB Bent-Over Row back-to-back. Long rest only after B3.

**Block C — Full Body Finish (Circuit)**
C1 BB Overhead Press → C2 DB Lateral Raises → C3 BB Glute Bridges → C4 Bicep Curls → C5 DB Floor Skullcrushers → C6 DB Reverse Flyes. Minimal rest between moves.

**Progression rule:** aim for one extra rep at the same load, or add a small weight increment at the same reps. Always harder than last time.

---

## Nutrition plans

All plans follow Greg Doucette's Circle Diet: low calorie-density, high protein, high volume.

| Plan | Target | Notes |
|---|---|---|
| International 1500 | 1300–1700 cal | 3 meals + 1–2 snacks up to 225 cal |
| International 2000 | 1750–2250 cal | 3 meals + 1–2 snacks up to 250 cal |
| International 2500 | 2250–2750 cal | 3 meals + 1–2 snacks up to 300 cal |
| BD 1500 🇧🇩 | 1300–1700 cal | Bangladeshi foods, local brands |
| BD 2000 🇧🇩 | 1750–2250 cal | Bangladeshi foods, local brands |
| BD 2500 🇧🇩 | 2300–2700 cal | Bangladeshi foods, local brands |

All meal data is from Greg Doucette's published diet plans and the Ultimate Anabolic Cookbook 2.0. The Bangladesh plans use recipes and ingredients available at Agora, Meena Bazaar, Shwapno, and Unimart.

The **🤖 My Plan** tab is the personalized path. The user enters preferences once — goal, calorie target, meal structure, foods to include, foods to avoid, budget, cuisine, equipment, and preparation limits. FitDash sends one structured request to the configured AI provider. The AI resolves targets, builds the meals, checks calories and protein, and returns JSON that FitDash validates and saves immediately. The example plans remain available in their existing tabs.

---

## Calorie calculation

Calories burned during guided workouts are estimated as follows:

1. **Weight** — taken from the pre-workout form, falling back to the most recent Progress log entry, and finally estimated from height using a healthy BMI reference (22.5 for male, 21.0 for female)
2. **BMR** — Mifflin–St Jeor formula using weight, height, age, and gender
3. **MET** — scales from 3.5 to 6.5 depending on how much of the workout was completed (25 / 50 / 80 / 100%)
4. **Gross calories** — `MET × weight × (duration / 60)`
5. **Volume bonus** — up to +15% for high total tonnage (kg × reps across all sets)

The breakdown is shown in the post-workout modal so you can see exactly how the number was calculated.

---

## Data storage

All data is stored in the browser's `localStorage` under these keys:

| Key | Contents |
|---|---|
| `fitdash_sessions` | Array of workout sessions (guided + manual) |
| `fitdash_weights` | Array of `{ date, val }` weight entries |
| `fitdash_prs` | Object of personal records by exercise name |
| `fitdash_check` | Today's checklist state |
| `fitdash_cardio` | This week's cardio minutes |
| `fitdash_cardio_week` | Week key for auto-resetting cardio |
| `fitdash_plan` | Selected nutrition plan |
| `fitdash_level` | Selected training level |
| `fitdash_profile` | Height, age, gender, activity level |
| `fitdash_fav_foods` | Foods pinned to the dashboard Quick Log |
| `fitdash_fav_exercises` | Exercises pinned to the dashboard Quick Log |
| `fitdash_progression_prefs` | Progression settings (weight step) |
| `fitdash_routines` | Routine templates (program, level, swaps, skipped exercises) |
| `fitdash_active_routine` | ID of the selected routine |
| `fitdash_week_plan` | Weekly schedule: per weekday `rest`/`any`/routine ID and optional workout time |
| `fitdash_schedule_applied` | Date the day's scheduled routine was last auto-selected |
| `fitdash_reminders` | Reminder settings (on/off, times, water interval, weigh-in days) |
| `fitdash_reminder_log` | Today's fired and snoozed reminders |

Data is never sent anywhere. Clearing your browser's site data will erase all history. Use **Progress → ⬇ CSV** to export a backup before clearing.

---

## Browser support

Works in any modern browser. Requires JavaScript enabled and localStorage available (not blocked by private browsing in some configurations).

| Browser | Supported |
|---|---|
| Chrome / Edge 90+ | ✅ |
| Firefox 88+ | ✅ |
| Safari 14+ | ✅ |
| Mobile Chrome / Safari | ✅ |

---

## Known limits

- **localStorage quota** — typically 5–10 MB per origin. The app shows an alert if the quota is exceeded and suggests exporting then clearing old sessions.
- **No sync** — data lives in one browser on one device. There is no cloud backup or cross-device sync.
- **Calories are estimates** — the MET-based formula gives a reasonable ballpark but is not a medical measurement.

---

## Credits

Training protocol and nutrition plans based on the work of **Greg Doucette** (IFBB Pro) — *The Ultimate Anabolic Cookbook 2.0*, *The Circle Diet*, and the HTLT coaching methodology.

Bangladesh meal plans designed around locally available foods and brands for users in Dhaka and across Bangladesh.

---

## Getting started (developer)

Clone or download this folder and open `fitdash.html` in your browser. For developer testing there are two options:

- Native browser tests: open `test.html` in the same folder (file://) and click "Run tests". This runs vanilla JS checks against the app iframe and reports PASS/FAIL in the page.
- Node-based tests (optional): a Jest + jsdom scaffold is provided in `package.json` and `tests/`. To run:

```bash
npm install
npm test
```

## Contributing

1. File an issue for bugs or feature requests.
2. Create a branch `feature/whatever` and open a pull request when ready.
3. Keep changes focused to one area (UI, storage, tests, data).

## License

This project is released under the MIT License — see `LICENSE`.

## Security & Privacy

- API keys: The app includes an opt-in flag to store API keys locally. Exported backups redact API keys unless explicitly opted-in.
- Data is stored only in browser `localStorage` under `fitdash_*` keys and is not transmitted anywhere by default.

