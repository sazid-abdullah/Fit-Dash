// ══ ROUTINE TEMPLATES & EXERCISE SWAPS ═══════════════════════
// A routine = base program (home/gym) + optional level + per-slot swaps + skipped slots.

const EQUIPMENT_LABELS = { bodyweight:'Bodyweight', dumbbells:'Dumbbells', barbell:'Barbell', machines:'Machines', cables:'Cables', bands:'Bands',
  bench:'Bench', pullup_bar:'Pull-Up Bar', backpack:'Loaded Backpack', chair:'Chair / Step', kettlebell:'Kettlebell' };

// Requirements are a string or an array (all needed); 'a|b' inside means either one.
function equipList(req) { return (Array.isArray(req) ? req : (req ? [req] : [])).map(String); }
function equipLabel(req) { return equipList(req).map(r => r.split('|').map(x => EQUIPMENT_LABELS[x] || x).join(' or ')).join(' + ') || 'Bodyweight'; }
function equipOk(req, owned) {
  const have = owned instanceof Set ? owned : new Set(owned || []);
  return equipList(req).every(r => r.split('|').some(x => x === 'bodyweight' || have.has(x)));
}
const EQUIP_LOAD_RANK = { barbell:9, dumbbells:9, machines:9, cables:8, kettlebell:8, backpack:6, bands:5, pullup_bar:7, bench:4, chair:3, bodyweight:2 };
function equipRank(req) {
  const parts = equipList(req).flatMap(r => r.split('|'));
  return parts.length ? Math.max(...parts.map(x => EQUIP_LOAD_RANK[x] || 2)) : 2;
}

function swapAlt(name, equip, tips) { return { name, equip, tips }; }

const EXERCISE_ALTERNATIVES = {
  A1: [ swapAlt('Bodyweight Squat', 'bodyweight', 'Sit between the heels, chest tall. Slow 3s lowering to make it harder.'),
        swapAlt('Dumbbell Split Squat', 'dumbbells', 'Long stance, front knee tracks over toes. Drop the back knee straight down.'),
        swapAlt('Barbell Back Squat', 'barbell', 'Brace hard, bar over mid-foot, hit depth you can control.'),
        swapAlt('Leg Press', 'machines', 'Feet shoulder-width, lower until hips start to tuck, push through heels.'),
        swapAlt('Banded Squat', 'bands', 'Stand on the band, handles at shoulders. Push knees out against tension.'),
        swapAlt('Kettlebell Goblet Squat', 'kettlebell', 'Hold the bell by the horns at the chest, sit between the heels.'),
        swapAlt('Backpack Goblet Squat', 'backpack', 'Hug a loaded backpack to the chest, 3 s down, drive up through the heels.'),
        swapAlt('Backpack Chair Bulgarian Split Squat', ['backpack','chair'], 'Rear foot on a sturdy chair, backpack on. Drop the back knee straight down.') ],
  A2: [ swapAlt('Backpack Calf Raise on Stairs', ['backpack','chair'], 'Balls of feet on a stair edge, full stretch at the bottom, 1 s pause on top.'),
        swapAlt('Single-Leg Calf Raise', 'bodyweight', 'Use a step for full stretch. Hold a wall for balance, pause at the top.'),
        swapAlt('Seated Dumbbell Calf Raise', 'dumbbells', 'Dumbbells on knees, balls of feet on a plate. Full stretch, hard squeeze.'),
        swapAlt('Calf Press on Leg Press', 'machines', 'Balls of feet on the sled edge. Do not lock the knees hard.') ],
  B1: [ swapAlt('Pull-Up', 'pullup_bar', 'Dead hang, pull the chest toward the bar, control the way down.'),
        swapAlt('Backpack Pullover', ['backpack','chair'], 'Upper back across a sturdy chair, lower the backpack behind the head with soft elbows.'),
        swapAlt('Inverted Table Row', 'bodyweight', 'Under a sturdy table, body straight, pull chest to the edge.'),
        swapAlt('Band Straight-Arm Pulldown', 'bands', 'Anchor the band high, arms straight, sweep hands to hips with the lats.'),
        swapAlt('Cable Straight-Arm Pulldown', 'cables', 'Slight hinge, arms nearly straight, drive the bar to your thighs.'),
        swapAlt('Lat Pulldown', 'machines', 'Pull elbows down to your ribs, chest up, control the return.') ],
  B2: [ swapAlt('Dumbbell Bench Press', ['dumbbells','bench'], 'Shoulder blades pinned, lower to mid-chest, press up and slightly in.'),
        swapAlt('Dumbbell Floor Press', 'dumbbells', 'Pause with triceps on the floor, press up and slightly in.'),
        swapAlt('Push-Up', 'bodyweight', 'Body in one line, elbows ~45°. Elevate feet or slow down to progress.'),
        swapAlt('Machine Chest Press', 'machines', 'Handles at mid-chest, shoulders down and back.'),
        swapAlt('Cable Chest Press', 'cables', 'Staggered stance, press forward and together.'),
        swapAlt('Band Chest Press', 'bands', 'Band behind the back, press straight out, slow return.'),
        swapAlt('Backpack Push-Up', 'backpack', 'Loaded backpack on, body in one line, chest to the floor.'),
        swapAlt('Chair Decline Push-Up', 'chair', 'Feet on a sturdy chair, hands under the shoulders, elbows ~45°.') ],
  B3: [ swapAlt('Weighted Backpack One-Arm Row', 'backpack', 'Hand on a chair or table, flat back, pull the backpack to the hip.'),
        swapAlt('Kettlebell Row', 'kettlebell', 'Hinge to ~45°, pull the bell to the hip, pause.'),
        swapAlt('Inverted Table Row', 'bodyweight', 'Body straight, squeeze shoulder blades at the top.'),
        swapAlt('Barbell Bent-Over Row', 'barbell', 'Hinge to ~45°, pull to the lower ribs, no jerking.'),
        swapAlt('Seated Cable Row', 'cables', 'Tall chest, pull handle to your stomach, pause.'),
        swapAlt('Machine Row', 'machines', 'Chest on the pad, drive elbows back, controlled return.'),
        swapAlt('Band Row', 'bands', 'Anchor at chest height, pull elbows back past your torso.') ],
  C1: [ swapAlt('Seated Dumbbell Shoulder Press', 'dumbbells', 'Back supported, press up and slightly in, no arching.'),
        swapAlt('Pike Push-Up', 'bodyweight', 'Hips high, lower the head between the hands.'),
        swapAlt('Machine Shoulder Press', 'machines', 'Handles at chin height, press without shrugging.'),
        swapAlt('Band Overhead Press', 'bands', 'Stand on the band, brace and press overhead.'),
        swapAlt('Kettlebell Overhead Press', 'kettlebell', 'Bell in the rack, squeeze glutes, press to lockout.'),
        swapAlt('Backpack Overhead Press', 'backpack', 'Hold the backpack by the sides at the chin, press straight up.') ],
  C2: [ swapAlt('Cable Lateral Raise', 'cables', 'Cable from the opposite side, lead with the elbow.'),
        swapAlt('Band Lateral Raise', 'bands', 'Stand on the band, raise to shoulder height, slow down.'),
        swapAlt('Machine Lateral Raise', 'machines', 'Pads on the outer arm, raise to shoulder height.'),
        swapAlt('Water-Bottle Lateral Raise', 'backpack', 'Full water bottles, lead with the elbows, stop at shoulder height.') ],
  C3: [ swapAlt('Bodyweight Glute Bridge', 'bodyweight', 'Drive through heels, squeeze 2s at the top.'),
        swapAlt('Single-Leg Glute Bridge', 'bodyweight', 'One foot planted, keep hips level the whole rep.'),
        swapAlt('Dumbbell Hip Thrust', 'dumbbells', 'Upper back on a bench, dumbbell on hips, chin tucked.'),
        swapAlt('Banded Glute Bridge', 'bands', 'Band above the knees, push knees out as you bridge.'),
        swapAlt('Backpack Hip Thrust', ['backpack','chair'], 'Upper back on a couch or chair, backpack on the hips, squeeze 2 s on top.'),
        swapAlt('Kettlebell Hip Thrust', ['kettlebell','bench|chair'], 'Bell on the hips, chin tucked, ribs down.') ],
  C4: [ swapAlt('Dumbbell Hammer Curl', 'dumbbells', 'Neutral grip, elbows pinned, no swinging.'),
        swapAlt('Cable Curl', 'cables', 'Elbows at your sides, squeeze at the top.'),
        swapAlt('Band Curl', 'bands', 'Stand on the band, full extension at the bottom.'),
        swapAlt('Kettlebell Hammer Curl', 'kettlebell', 'Hold the handle, elbows pinned, slow lowering.'),
        swapAlt('Backpack Curl', 'backpack', 'Grip the top handle with both hands, elbows pinned.'),
        swapAlt('Towel Isometric Curl', 'bodyweight', 'Stand on a towel, curl up hard against it for 20–30s holds.') ],
  C5: [ swapAlt('Chair Dips', 'chair', 'Hands on a sturdy chair, elbows back, lower to ~90°.'),
        swapAlt('Diamond Push-Up', 'bodyweight', 'Hands together under the chest, elbows close.'),
        swapAlt('Dumbbell Overhead Extension', 'dumbbells', 'Elbows pointed up, lower behind the head for a deep stretch.'),
        swapAlt('Cable Pushdown', 'cables', 'Elbows pinned, fully lock out at the bottom.'),
        swapAlt('Band Pushdown', 'bands', 'Anchor high, elbows pinned, press down to lockout.'),
        swapAlt('Backpack Overhead Extension', 'backpack', 'Hold the backpack overhead, elbows forward, lower behind the head.') ],
  C6: [ swapAlt('Band Pull-Apart', 'bands', 'Arms straight at shoulder height, pull the band to your chest.'),
        swapAlt('Prone Y-T Raise', 'bodyweight', 'Lie face down, lift arms into Y then T, thumbs up.'),
        swapAlt('Cable Face Pull', 'cables', 'Rope at face height, pull to the eyes, elbows high.'),
        swapAlt('Reverse Pec-Deck', 'machines', 'Chest on the pad, sweep arms back with rear delts.'),
        swapAlt('Water-Bottle Reverse Fly', 'backpack', 'Hinge forward, arc the bottles out to the sides, squeeze the rear delts.') ],
  GA1: [ swapAlt('Hack Squat', 'machines', 'Feet mid-platform, go deep with control.'),
         swapAlt('Barbell Back Squat', 'barbell', 'Brace hard, bar over mid-foot, controlled depth.'),
         swapAlt('Dumbbell Goblet Squat', 'dumbbells', 'Chest tall, elbows inside knees at the bottom.'),
         swapAlt('Leg Extension + Leg Curl', 'machines', 'Alternate the two machines with minimal rest.'),
         swapAlt('Backpack Goblet Squat', 'backpack', 'Hug a loaded backpack, 3 s down, drive up.'),
         swapAlt('Bodyweight Squat', 'bodyweight', 'Slow 3 s lowering, full depth.') ],
  GA2: [ swapAlt('Standing Calf Raise Machine', 'machines', 'Full stretch at the bottom, pause at the top.'),
         swapAlt('Calf Press on Leg Press', 'machines', 'Balls of feet on the sled edge, knees soft.'),
         swapAlt('Dumbbell Standing Calf Raise', 'dumbbells', 'Use a step for range, pause at the top.'),
         swapAlt('Single-Leg Calf Raise', 'bodyweight', 'Use a step for full stretch, pause at the top.') ],
  GB1: [ swapAlt('Assisted Pull-Up', 'machines', 'Full hang to chin over bar, reduce assistance over time.'),
         swapAlt('Pull-Up', 'pullup_bar', 'Dead hang start, pull chest toward the bar.'),
         swapAlt('Band Lat Pulldown', 'bands', 'Anchor the band high, pull elbows to the ribs.'),
         swapAlt('Single-Arm Cable Pulldown', 'cables', 'Pull elbow down to your hip, big stretch at the top.'),
         swapAlt('Dumbbell Pullover', 'dumbbells', 'Slight elbow bend, feel the lat stretch.') ],
  GB2: [ swapAlt('Dumbbell Bench Press', 'dumbbells', 'Shoulder blades pinned, lower to mid-chest.'),
         swapAlt('Barbell Bench Press', 'barbell', 'Use a spotter or safeties, touch mid-chest.'),
         swapAlt('Cable Chest Press', 'cables', 'Staggered stance, press forward and together.'),
         swapAlt('Push-Up', 'bodyweight', 'Body in one line, elbows ~45°.') ],
  GB3: [ swapAlt('Seated Cable Row', 'cables', 'Tall chest, pull to your stomach, pause.'),
         swapAlt('Chest-Supported Dumbbell Row', 'dumbbells', 'Chest on an incline bench, drive elbows back.'),
         swapAlt('Barbell Bent-Over Row', 'barbell', 'Hinge to ~45°, pull to the lower ribs.'),
         swapAlt('One-Arm Dumbbell Row', 'dumbbells', 'Hand on a bench, pull the dumbbell to the hip.'),
         swapAlt('Inverted Table Row', 'bodyweight', 'Body straight, squeeze shoulder blades at the top.') ],
  GC1: [ swapAlt('Seated Dumbbell Shoulder Press', 'dumbbells', 'Back supported, press up and slightly in.'),
         swapAlt('Barbell Overhead Press', 'barbell', 'Glutes tight, bar path close to the face.'),
         swapAlt('Pike Push-Up', 'bodyweight', 'Hips high, lower the head between the hands.') ],
  GC2: [ swapAlt('Band Lateral Raise', 'bands', 'Stand on the band, raise to shoulder height.'),
         swapAlt('Cable Lateral Raise', 'cables', 'Cable from the opposite side, lead with the elbow.'),
         swapAlt('Machine Lateral Raise', 'machines', 'Pads on outer arm, raise to shoulder height.') ],
  GC3: [ swapAlt('Cable Hip Adduction', 'cables', 'Ankle strap, sweep the leg across the body.'),
         swapAlt('Sumo Goblet Squat', 'dumbbells', 'Wide stance, toes out, sit straight down.'),
         swapAlt('Copenhagen Plank', 'bodyweight', 'Top leg on a bench, hold the side plank.') ],
  GC4: [ swapAlt('Cable Hip Abduction', 'cables', 'Ankle strap, sweep the leg out to the side.'),
         swapAlt('Banded Lateral Walk', 'bands', 'Band above knees, small steps, stay low.'),
         swapAlt('Side-Lying Leg Raise', 'bodyweight', 'Toes slightly down, lift with the glute.') ],
  GC5: [ swapAlt('Band Curl', 'bands', 'Stand on the band, full extension at the bottom.'),
         swapAlt('Cable Curl', 'cables', 'Elbows at your sides, squeeze at the top.'),
         swapAlt('Barbell Curl', 'barbell', 'Elbows pinned, no hip swing.'),
         swapAlt('Machine Preacher Curl', 'machines', 'Armpits on the pad, full extension at the bottom.') ],
  GC6: [ swapAlt('Dumbbell Overhead Extension', 'dumbbells', 'Elbows up, deep stretch behind the head.'),
         swapAlt('EZ-Bar Skullcrusher', 'barbell', 'Upper arms still, lower to the forehead.'),
         swapAlt('Bench Dips', 'bench|chair', 'Elbows back, lower to ~90°.'),
         swapAlt('Diamond Push-Up', 'bodyweight', 'Hands together under the chest, elbows close.') ],
  GC7: [ swapAlt('Cable Face Pull', 'cables', 'Rope at face height, pull to the eyes, elbows high.'),
         swapAlt('Dumbbell Reverse Fly', 'dumbbells', 'Hinge forward, arc arms out to the sides.'),
         swapAlt('Band Pull-Apart', 'bands', 'Arms straight, pull the band to your chest.'),
         swapAlt('Prone Y-T Raise', 'bodyweight', 'Lie face down, lift arms into Y then T, thumbs up.') ],
};

const DEFAULT_ROUTINES = [
  { id:'home', name:'Home', category:'home', level:null, swaps:{}, skip:[] },
  { id:'gym', name:'Gym', category:'gym', level:null, swaps:{}, skip:[] },
  { id:'busy', name:'Busy Day', category:'home', level:'beginner', swaps:{}, skip:['A2','B1','C2','C4','C5','C6'] },
];

function normalizeRoutine(r) {
  if(!r || typeof r !== 'object' || !r.id) return null;
  return {
    id: String(r.id),
    name: String(r.name || 'Routine').slice(0, 40),
    category: r.category === 'gym' ? 'gym' : 'home',
    level: ['beginner','amateur','master'].includes(r.level) ? r.level : null,
    swaps: (r.swaps && typeof r.swaps === 'object') ? r.swaps : {},
    skip: Array.isArray(r.skip) ? r.skip.map(String) : [],
    ...(r.blockMeta && typeof r.blockMeta === 'object' ? { blockMeta: r.blockMeta } : {}),
  };
}

const _routinesFirstRun = !Array.isArray(safeLoad('fitdash_routines', null));

let routines = (() => {
  const saved = safeLoad('fitdash_routines', null);
  const list = Array.isArray(saved) ? saved.map(normalizeRoutine).filter(Boolean) : [];
  return list.length ? list : JSON.parse(JSON.stringify(DEFAULT_ROUTINES));
})();

let activeRoutineId = (() => {
  const saved = safeLoad('fitdash_active_routine', null);
  if(routines.some(r => r.id === saved)) return saved;
  const legacyCategory = safeLoad('fitdash_training_category', 'home') === 'gym' ? 'gym' : 'home';
  return (routines.find(r => r.category === legacyCategory) || routines[0]).id;
})();

// Swaps made mid-workout that apply to the current session only. `null` = show the original.
let sessionSwaps = {};

function saveRoutines() {
  save('fitdash_routines', routines);
  save('fitdash_active_routine', activeRoutineId);
}

function getActiveRoutine() {
  return routines.find(r => r.id === activeRoutineId) || routines[0];
}

function getRoutinePlanDeps() {
  const r = getActiveRoutine();
  return { id: r.id, s: r.swaps, k: r.skip, ss: sessionSwaps, bm: r.blockMeta || null, eq: adaptiveEquipment() ? [...adaptiveEquipment()] : null };
}

function findBaseExercise(code) {
  for(const plan of [WORKOUT_PLAN, GYM_WORKOUT_PLAN]) {
    for(const block of plan) {
      const ex = block.exercises.find(e => e.code === code);
      if(ex) return ex;
    }
  }
  return null;
}

function swappedExercise(ex, alt) {
  return {
    ...ex,
    name: alt.name,
    muscle: alt.muscle || ex.muscle,
    tips: alt.tips || ex.tips,
    equip: alt.equip || ex.equip,
    _swappedFrom: ex.name,
  };
}

// Gear the user tapped on Training (or in Settings). null = never chosen, so nothing is adapted.
// Reads storage directly when ui.js hasn't run yet (getFullWorkoutPlan runs at load).
function profileEquipment() {
  const p = (typeof userProfile !== 'undefined' && userProfile) ? userProfile : safeLoad('fitdash_profile', {});
  return Array.isArray(p && p.equipment) ? p.equipment : null;
}

function adaptiveEquipment() {
  const eq = profileEquipment();
  if(!eq || !eq.length) return null;
  const set = new Set(['bodyweight', ...eq]);
  if(set.has('cables')) set.add('machines');
  if(set.has('machines')) set.add('cables');
  return set;
}

function bestOwnedAlternative(code, owned) {
  const alts = (EXERCISE_ALTERNATIVES[code] || []).map((a, i) => ({ a, i })).filter(({ a }) => equipOk(a.equip, owned));
  if(!alts.length) return null;
  alts.sort((x, y) => (equipRank(y.a.equip) - equipRank(x.a.equip)) || (x.i - y.i));
  return alts[0].a;
}

// Mutates a freshly cloned base plan in place. Explicit swaps win; untouched slots whose gear
// the user doesn't have are adapted to the best alternative they can do (works offline).
function applyRoutineToPlan(plan) {
  const r = getActiveRoutine();
  const owned = adaptiveEquipment();
  plan.forEach(block => {
    const meta = r.blockMeta && r.blockMeta[block.id];
    if(meta) ['name', 'type', 'info'].forEach(k => { if(meta[k]) block[k] = String(meta[k]).slice(0, 120); });
    block.exercises = block.exercises
      .filter(ex => !r.skip.includes(ex.code))
      .map(ex => {
        const alt = Object.prototype.hasOwnProperty.call(sessionSwaps, ex.code) ? sessionSwaps[ex.code] : r.swaps[ex.code];
        if(alt && alt.keep) return ex;
        if(alt && alt.name) return swappedExercise(ex, alt);
        if(owned && ex.equip && !equipOk(ex.equip, owned)) {
          const best = bestOwnedAlternative(ex.code, owned);
          if(best) return { ...swappedExercise(ex, best), _autoAdapted: true };
          return { ...ex, _missingGear: equipLabel(ex.equip) };
        }
        return ex;
      });
  });
}

function refreshRoutineViews() {
  _cachedFullPlanDeps = '';
  if(document.getElementById('training-blocks-container')) renderTrainingBlocks(LEVEL_CONFIG[trainingLevel]);
  renderRoutinePickers();
  if(typeof renderQuickLog === 'function') renderQuickLog();
}

function activateRoutine(id) {
  const r = routines.find(x => x.id === id);
  if(!r) return;
  activeRoutineId = r.id;
  saveRoutines();
  if(r.level && VALID_LEVELS.includes(r.level)) trainingLevel = r.level;
  applyTrainingCategory(r.category);
  renderRoutinePickers();
}

function rememberRoutineLevel(level) {
  const r = getActiveRoutine();
  if(!r || r.level === level) return;
  r.level = level;
  saveRoutines();
}

let _routineIdSeq = 0;
function newRoutineId() { return 'r' + Date.now().toString(36) + (_routineIdSeq++).toString(36); }

function createRoutineFromActive() {
  const base = getActiveRoutine();
  const name = (prompt('Name for the new routine (copies the current one):', `${base.name} copy`) || '').trim();
  if(!name) return;
  const r = { ...JSON.parse(JSON.stringify(base)), id: newRoutineId(), name: name.slice(0, 40), level: trainingLevel };
  routines.push(r);
  activateRoutine(r.id);
}

function renameActiveRoutine() {
  const r = getActiveRoutine();
  const name = (prompt('Rename routine:', r.name) || '').trim();
  if(!name) return;
  r.name = name.slice(0, 40);
  saveRoutines();
  renderRoutinePickers();
}

function deleteActiveRoutine() {
  if(routines.length <= 1) { alert('Keep at least one routine.'); return; }
  const idx = routines.findIndex(r => r.id === activeRoutineId);
  const removed = routines[idx];
  if(!confirm(`Delete routine "${removed.name}"?`)) return;
  routines.splice(idx, 1);
  activateRoutine((routines.find(r => r.category === removed.category) || routines[0]).id);
  showUndoToast(`Deleted ${removed.name}`, () => {
    routines.splice(idx, 0, removed);
    activateRoutine(removed.id);
  });
}

function resetActiveRoutine() {
  const r = getActiveRoutine();
  if(!Object.keys(r.swaps).length && !r.skip.length) return;
  const prev = { swaps: r.swaps, skip: r.skip };
  r.swaps = {}; r.skip = [];
  saveRoutines();
  refreshRoutineViews();
  showUndoToast(`Reset ${r.name} to the original exercises`, () => {
    r.swaps = prev.swaps; r.skip = prev.skip;
    saveRoutines();
    refreshRoutineViews();
  });
}

function unskipExercise(code) {
  const r = getActiveRoutine();
  r.skip = r.skip.filter(c => c !== code);
  saveRoutines();
  refreshRoutineViews();
}

function routineSummary(r) {
  const plan = r.category === 'gym' ? GYM_WORKOUT_PLAN : WORKOUT_PLAN;
  const total = plan.reduce((n, b) => n + b.exercises.filter(ex => !r.skip.includes(ex.code)).length, 0);
  const swaps = Object.keys(r.swaps).length;
  const level = LEVEL_CONFIG[r.level || trainingLevel];
  return `${r.category === 'gym' ? '🏋️ Gym' : '🏠 Home'} · ${total} exercises · ${level ? level.setsLabel : ''}${swaps ? ` · ${swaps} swap${swaps > 1 ? 's' : ''}` : ''}`;
}

function routineChipsHtml() {
  return routines.map(r => `<button class="pill-btn${r.id === activeRoutineId ? ' active' : ''}" onclick="activateRoutine(this.dataset.id)" data-id="${escapeHtml(r.id)}" aria-pressed="${r.id === activeRoutineId}">${escapeHtml(r.name)}</button>`).join('');
}

function routineTabsHtml() {
  const icon = category => category === 'gym' ? '🏋️' : '🏠';
  const tabs = routines.map(r => `<button class="${r.id === activeRoutineId ? 'btn-red' : 'btn-ghost'}" onclick="activateRoutine(this.dataset.id)" data-id="${escapeHtml(r.id)}" aria-pressed="${r.id === activeRoutineId}">${icon(r.category)} ${escapeHtml(r.name)}</button>`);
  // Keep both programs reachable even if every routine of one category was deleted.
  ['home', 'gym'].filter(c => !routines.some(r => r.category === c)).forEach(c => {
    tabs.push(`<button class="btn-ghost" onclick="switchTrainingCategory('${c}')">${icon(c)} ${c === 'gym' ? 'Gym' : 'Home'}</button>`);
  });
  tabs.push('<button class="btn-ghost routine-tab-new" onclick="createRoutineFromActive()" title="Save the current setup as a new routine">+ New</button>');
  return tabs.join('');
}

function renderRoutinePickers() {
  const r = getActiveRoutine();
  const tabs = document.getElementById('training-routine-tabs');
  if(tabs) tabs.innerHTML = routineTabsHtml();
  const card = document.getElementById('routine-picker');
  if(card) {
    const plan = r.category === 'gym' ? GYM_WORKOUT_PLAN : WORKOUT_PLAN;
    const skipped = plan.flatMap(b => b.exercises).filter(ex => r.skip.includes(ex.code));
    const hasChanges = Object.keys(r.swaps).length || r.skip.length;
    card.innerHTML = `
      <div class="routine-meta" style="margin-top:0">${escapeHtml(routineSummary(r))}</div>
      ${skipped.length ? `<div class="routine-skipped">Skipped: ${skipped.map(ex => `<button class="pill-btn routine-skip-pill" onclick="unskipExercise('${ex.code}')" title="Add back" aria-label="Add ${escapeHtml(ex.name)} back">${escapeHtml(ex.name)} ↩</button>`).join('')}</div>` : ''}
      <div class="routine-actions">
        <button class="btn-ghost" onclick="renameActiveRoutine()">✏️ Rename</button>
        ${hasChanges ? '<button class="btn-ghost" onclick="resetActiveRoutine()">↺ Reset swaps</button>' : ''}
        ${routines.length > 1 ? '<button class="btn-ghost" style="color:var(--red)" onclick="deleteActiveRoutine()">🗑 Delete</button>' : ''}
      </div>`;
  }
  const dash = document.getElementById('dash-routine-picker');
  if(dash) dash.innerHTML = routines.length > 1 ? `<div class="routine-chips">${routineChipsHtml()}</div>` : '';
  const dashTitle = document.getElementById('dash-quick-training-title');
  if(dashTitle) dashTitle.textContent = `${r.name} Routine`;
  const dashSub = document.getElementById('dash-quick-training-sub');
  if(dashSub) dashSub.textContent = routineSummary(r);
  if(typeof renderGearStudio === 'function') renderGearStudio();
}

// ── Swap modal ───────────────────────────────────────────────
function userEquipment() {
  const eq = (typeof userProfile !== 'undefined' && Array.isArray(userProfile.equipment)) ? userProfile.equipment : [];
  return ['bodyweight', ...eq];
}

function currentSlotExercise(code) {
  for(const block of getFullWorkoutPlan()) {
    const ex = block.exercises.find(e => e.code === code);
    if(ex) return ex;
  }
  return findBaseExercise(code);
}

let _swapCtx = null;

function openSwapModal(code, inWorkout) {
  const original = findBaseExercise(code);
  if(!original) return;
  const current = currentSlotExercise(code) || original;
  _swapCtx = { code, inWorkout: !!inWorkout };
  const have = userEquipment();
  const hasProfileEquipment = have.length > 1;
  const haveSet = adaptiveEquipment() || new Set(have);
  const alts = (EXERCISE_ALTERNATIVES[code] || [])
    .filter(a => a.name !== current.name)
    .map((a, i) => ({ ...a, i, owned: equipOk(a.equip, haveSet) }))
    .sort((a, b) => (b.owned - a.owned));
  const customs = (typeof customExercises !== 'undefined' ? customExercises : []).filter(cx => cx.name !== current.name);
  const r = getActiveRoutine();

  let modal = document.getElementById('swap-modal');
  if(!modal) {
    modal = document.createElement('div');
    modal.id = 'swap-modal';
    modal.className = 'swap-modal';
    modal.addEventListener('click', e => { if(e.target === modal) closeSwapModal(); });
    document.body.appendChild(modal);
  }
  modal.innerHTML = `
    <div class="swap-dialog" role="dialog" aria-modal="true" aria-labelledby="swap-title">
      <button class="swap-close" onclick="closeSwapModal()" aria-label="Close">✕</button>
      <h3 id="swap-title" style="margin:0 0 4px">Swap ${escapeHtml(current.name)}</h3>
      <div style="font-size:12px;color:var(--muted);margin-bottom:14px">${escapeHtml(code)} · ${escapeHtml(original.muscle || '')}${current._swappedFrom ? ` · originally ${escapeHtml(original.name)}` : ''}</div>
      ${current._swappedFrom ? `<button class="btn-ghost swap-option" onclick="applySwapChoice('original')">↩ Back to ${escapeHtml(original.name)}</button>` : ''}
      ${alts.length ? `<div class="swap-section-title">Alternatives${hasProfileEquipment ? '' : ' <span style="font-weight:400">· tap your gear on the Training tab to highlight matches</span>'}</div>` : ''}
      ${alts.map(a => `<button class="btn-ghost swap-option" onclick="applySwapChoice('alt', ${a.i})"><span>${escapeHtml(a.name)}</span><span class="tag ${a.owned && hasProfileEquipment ? 'tag-green' : 'tag-gray'}">${escapeHtml(equipLabel(a.equip))}</span></button>`).join('')}
      ${customs.length ? `<div class="swap-section-title">Your custom exercises</div>${customs.map(cx => `<button class="btn-ghost swap-option" onclick="applySwapChoice('custom', ${cx.id})"><span>${escapeHtml(cx.name)}</span><span class="tag tag-blue">Custom</span></button>`).join('')}` : ''}
      <div class="swap-section-title">Something else</div>
      <div style="display:flex;gap:8px">
        <input class="settings-input" id="swap-custom-name" placeholder="Exercise name" maxlength="60" onkeydown="if(event.key==='Enter') applySwapChoice('typed')">
        <button class="btn-ghost" onclick="applySwapChoice('typed')">Use</button>
      </div>
      ${inWorkout
        ? `<label class="swap-save-toggle"><input type="checkbox" id="swap-save-routine"> Also save to “${escapeHtml(r.name)}” routine</label>`
        : `<div style="font-size:12px;color:var(--muted);margin-top:12px">Saved to the “${escapeHtml(r.name)}” routine.</div>
           <button class="btn-ghost swap-option" style="margin-top:8px;color:var(--muted)" onclick="applySwapChoice('skip')">⏭ Skip this exercise in ${escapeHtml(r.name)}</button>`}
    </div>`;
  modal.style.display = 'flex';
}

function closeSwapModal() {
  const modal = document.getElementById('swap-modal');
  if(modal) modal.style.display = 'none';
  _swapCtx = null;
}

function applySwapChoice(kind, ref) {
  if(!_swapCtx) return;
  const { code, inWorkout } = _swapCtx;
  const r = getActiveRoutine();
  let alt = null;
  if(kind === 'alt') alt = (EXERCISE_ALTERNATIVES[code] || [])[ref] || null;
  else if(kind === 'custom') {
    const cx = customExercises.find(c => c.id === ref);
    if(cx) alt = { name: cx.name, muscle: cx.muscle, tips: cx.tips };
  } else if(kind === 'typed') {
    const name = (document.getElementById('swap-custom-name')?.value || '').trim().slice(0, 60);
    if(!name) return;
    alt = { name };
  }
  if(kind !== 'original' && kind !== 'skip' && !alt) return;

  const original = findBaseExercise(code);
  if(alt && original && alt.name === original.name) alt = null;
  let stored = alt ? Object.fromEntries(['name','muscle','tips','equip'].filter(k => alt[k]).map(k => [k, alt[k]])) : null;
  // "Back to original" on a slot the gear filter adapted must pin the original, or it re-adapts.
  if(!stored && kind === 'original' && currentSlotExercise(code)?._autoAdapted) stored = { keep: true, name: original.name };

  if(kind === 'skip') {
    if(!r.skip.includes(code)) r.skip.push(code);
    delete r.swaps[code];
    saveRoutines();
  } else if(inWorkout) {
    sessionSwaps[code] = stored;
    if(document.getElementById('swap-save-routine')?.checked) {
      if(stored) r.swaps[code] = stored; else delete r.swaps[code];
      saveRoutines();
    }
  } else {
    if(stored) r.swaps[code] = stored; else delete r.swaps[code];
    saveRoutines();
  }
  closeSwapModal();
  refreshRoutineViews();
  if(inWorkout && wo.active) renderWorkoutStep();
}

function swapCurrentWorkoutExercise() {
  const ex = getFullWorkoutPlan()[wo.blockIdx]?.exercises[wo.exIdx];
  if(ex && findBaseExercise(ex.code)) openSwapModal(ex.code, true);
  else alert('Custom exercises cannot be swapped. Use Skip Exercise instead.');
}

function clearSessionSwaps() {
  if(!Object.keys(sessionSwaps).length) return;
  sessionSwaps = {};
  _cachedFullPlanDeps = '';
}

// AI templates are { name, plan:[{ name, exercises:[exerciseName] }] }. Map them slot-by-slot
// onto the current program: differing names become swaps, uncovered slots are skipped.
function routineFromTemplate(template, category) {
  const plan = category === 'gym' ? GYM_WORKOUT_PLAN : WORKOUT_PLAN;
  const swaps = {}; const skip = [];
  plan.forEach((block, bIdx) => {
    const names = (template.plan[bIdx] && Array.isArray(template.plan[bIdx].exercises)) ? template.plan[bIdx].exercises : [];
    block.exercises.forEach((ex, eIdx) => {
      const raw = names[eIdx];
      const name = String((raw && typeof raw === 'object') ? (raw.name || '') : (raw || '')).trim().slice(0, 60);
      if(!name) skip.push(ex.code);
      else if(name !== ex.name) swaps[ex.code] = { name };
    });
  });
  return normalizeRoutine({ id: newRoutineId(), name: String(template.name || 'AI Routine'), category, level: null, swaps, skip });
}

function saveTemplateAsRoutine(template) {
  const r = routineFromTemplate(template, trainingCategory);
  if(!r) return null;
  routines.push(r);
  saveRoutines();
  renderRoutinePickers();
  return r;
}

// One-time import of templates saved before routines existed (requires the plans in workout.js).
function migrateLegacyTemplates() {
  if(!_routinesFirstRun) return;
  const legacy = safeLoad('fitdash_workout_templates', []);
  if(!Array.isArray(legacy)) return;
  legacy.forEach(t => {
    if(!t || !Array.isArray(t.plan)) return;
    const r = routineFromTemplate(t, t.category === 'gym' ? 'gym' : 'home');
    if(r) routines.push(r);
  });
  saveRoutines();
}
