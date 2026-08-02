# FitDash 🏋️

A fully offline, single-file fitness dashboard built on the Greg Doucette Circle Diet and HTLT training principles. No account, no server, no installation — open the HTML file in any browser and start tracking.

---

## What it does

FitDash covers four areas in one file:

**Dashboard** — daily greeting, session count, current streak, today's weight, weekly cardio progress bar, and a five-item habit checklist that resets each morning.

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
