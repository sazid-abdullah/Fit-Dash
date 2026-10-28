// ══ GEAR SELECTOR & EXPRESS WORKOUT BUILDER ══════════════════
// Tap the gear you have: Training exercises adapt instantly (offline) and the builder
// generates a time-boxed workout that can be started or saved as a routine.

const EQUIPMENT_CHIPS = [
  ['bodyweight', '🧘 Bodyweight Only'], ['dumbbells', '🏋️ Dumbbells'], ['bench', '🛋️ Flat / Adjustable Bench'],
  ['pullup_bar', '🧗 Pull-Up Bar'], ['bands', '➰ Resistance Bands'], ['backpack', '🎒 Loaded Backpack (Books / Water Bottles)'],
  ['chair', '🪑 Sturdy Chair / Step / Stairs'], ['barbell', '🏋️ Barbell & Plates'], ['kettlebell', '🔔 Kettlebell'],
  ['machines', '⚙️ Gym Cables & Machines'],
];
const SESSION_MODES = {
  '15': { label: '⚡ 15-Min Busy Day Express (Superset / High-Density)', short: '15-Min Express', blocks: [2, 2], level: 'beginner',
          types: ['Superset', 'Superset'], restCap: 30, info: 'Back-to-back pair, 30 s rest between sets. 2 rounds.' },
  '30': { label: '🔥 30-Min Time-Saver', short: '30-Min Time-Saver', blocks: [2, 2, 2], level: 'amateur',
          types: ['Superset', 'Superset', 'Superset'], restCap: 45, info: 'Alternate the pair, 45 s rest between sets. 3 rounds.' },
  '60': { label: '💪 45–60 Min Full Session', short: '45–60 Min Session', blocks: [2, 3, 4], level: null,
          types: ['Superset', 'Giant Set', 'Circuit'], info: 'Move through the block, then rest 1–2 min.' },
};
const TARGET_SPLITS = {
  full:  { label: 'Full Body', slots: [['squat','lunge'], ['hpush'], ['vpull','hpull'], ['hinge','bridge'], ['vpush'], ['hpull'], ['lunge'], ['core'], ['curl'], ['triceps']] },
  upper: { label: 'Upper Body', slots: [['hpush'], ['vpull','hpull'], ['vpush'], ['hpull'], ['lateral'], ['reardelt'], ['curl'], ['triceps'], ['hpush'], ['core']] },
  lower: { label: 'Lower Body & Core', slots: [['squat'], ['hinge'], ['lunge'], ['core'], ['bridge'], ['calf'], ['core'], ['squat','lunge'], ['hinge']] },
  push:  { label: 'Push', slots: [['hpush'], ['vpush'], ['lateral'], ['triceps'], ['hpush'], ['core'], ['triceps'], ['vpush'], ['lateral']] },
  pull:  { label: 'Pull', slots: [['vpull','hpull'], ['hpull'], ['reardelt'], ['curl'], ['hinge'], ['core'], ['curl'], ['hpull'], ['reardelt']] },
  legs:  { label: 'Legs', slots: [['squat'], ['hinge'], ['lunge'], ['bridge'], ['calf'], ['squat','lunge'], ['hinge'], ['calf'], ['core']] },
};

function lib(name, pattern, equip, score, muscle, tips) { return { name, pattern, equip, score, muscle, tips }; }
const EXPRESS_LIBRARY = [
  lib('Barbell Back Squat', 'squat', ['barbell'], 9, 'Quads · Glutes · Core', 'Brace hard, bar over mid-foot, hit depth you control.'),
  lib('Dumbbell Goblet Squat', 'squat', ['dumbbells'], 8, 'Quads · Glutes · Core', 'Chest tall, elbows inside the knees at the bottom.'),
  lib('Kettlebell Goblet Squat', 'squat', ['kettlebell'], 8, 'Quads · Glutes · Core', 'Bell at the chest, sit between the heels.'),
  lib('Leg Press', 'squat', ['machines'], 8, 'Quads · Glutes', 'Lower until the hips start to tuck, push through the heels.'),
  lib('Backpack Goblet Squat', 'squat', ['backpack'], 6, 'Quads · Glutes · Core', 'Hug the loaded backpack, 3 s down, drive up.'),
  lib('Banded Squat', 'squat', ['bands'], 5, 'Quads · Glutes', 'Stand on the band, push the knees out.'),
  lib('Tempo Bodyweight Squat', 'squat', [], 3, 'Quads · Glutes', '3 s down, 1 s pause, drive up.'),
  lib('Dumbbell Bulgarian Split Squat', 'lunge', ['dumbbells', 'bench|chair'], 8, 'Quads · Glutes', 'Rear foot elevated, drop the back knee straight down.'),
  lib('Backpack Chair Bulgarian Split Squat', 'lunge', ['backpack', 'chair'], 7, 'Quads · Glutes', 'Rear foot on a sturdy chair, backpack on.'),
  lib('Dumbbell Reverse Lunge', 'lunge', ['dumbbells'], 7, 'Quads · Glutes', 'Step back long, front heel stays down.'),
  lib('Kettlebell Reverse Lunge', 'lunge', ['kettlebell'], 6, 'Quads · Glutes', 'Bell in the goblet position, step back long.'),
  lib('Step-Up onto Chair / Stairs', 'lunge', ['chair'], 5, 'Quads · Glutes', 'Whole foot on the step, drive through the top heel.'),
  lib('Bodyweight Reverse Lunge', 'lunge', [], 3, 'Quads · Glutes', 'Slow lowering, knee kisses the floor.'),
  lib('Barbell Romanian Deadlift', 'hinge', ['barbell'], 9, 'Hamstrings · Glutes · Lower Back', 'Bar slides down the thighs, flat back.'),
  lib('Dumbbell Romanian Deadlift', 'hinge', ['dumbbells'], 8, 'Hamstrings · Glutes', 'Hips back, deep hamstring stretch.'),
  lib('Kettlebell Swing', 'hinge', ['kettlebell'], 7, 'Glutes · Hamstrings · Core', 'Snap the hips, arms just guide the bell.'),
  lib('Backpack Romanian Deadlift', 'hinge', ['backpack'], 6, 'Hamstrings · Glutes', 'Hold the backpack straps, hinge with a flat back.'),
  lib('Band Good Morning', 'hinge', ['bands'], 5, 'Hamstrings · Glutes', 'Band behind the neck, hinge and stand tall.'),
  lib('Single-Leg Hip Hinge', 'hinge', [], 3, 'Hamstrings · Glutes', 'Reach long, hips square, slow and balanced.'),
  lib('Barbell Hip Thrust', 'bridge', ['barbell', 'bench'], 9, 'Glutes · Hamstrings', 'Upper back on the bench, chin tucked, 1 s squeeze.'),
  lib('Dumbbell Hip Thrust', 'bridge', ['dumbbells', 'bench|chair'], 8, 'Glutes · Hamstrings', 'Dumbbell on the hips, ribs down.'),
  lib('Backpack Hip Thrust', 'bridge', ['backpack', 'chair'], 6, 'Glutes · Hamstrings', 'Upper back on a couch or chair, squeeze 2 s.'),
  lib('Banded Glute Bridge', 'bridge', ['bands'], 5, 'Glutes', 'Band above the knees, push them out.'),
  lib('Single-Leg Glute Bridge', 'bridge', [], 4, 'Glutes · Hamstrings', 'Hips level the whole rep.'),
  lib('Dumbbell Standing Calf Raise', 'calf', ['dumbbells'], 7, 'Calves', 'Full stretch, pause at the top.'),
  lib('Calf Press on Leg Press', 'calf', ['machines'], 7, 'Calves', 'Knees soft, full range.'),
  lib('Backpack Calf Raise on Stairs', 'calf', ['backpack', 'chair'], 6, 'Calves', 'Heels below the step, 1 s pause.'),
  lib('Single-Leg Calf Raise on a Step', 'calf', [], 5, 'Calves', 'Hold the wall, full range.'),
  lib('Dumbbell Bench Press', 'hpush', ['dumbbells', 'bench'], 9, 'Chest · Triceps · Front Delts', 'Shoulder blades pinned, elbows 45–60°.'),
  lib('Barbell Bench Press', 'hpush', ['barbell', 'bench'], 9, 'Chest · Triceps · Front Delts', 'Use safeties, touch mid-chest.'),
  lib('Machine Chest Press', 'hpush', ['machines'], 8, 'Chest · Triceps', 'Handles at mid-chest, shoulders down.'),
  lib('Dumbbell Floor Press', 'hpush', ['dumbbells'], 7, 'Chest · Triceps', 'Pause with the triceps on the floor.'),
  lib('Backpack Push-Up', 'hpush', ['backpack'], 6, 'Chest · Triceps · Core', 'Loaded backpack on, chest to the floor.'),
  lib('Chair Decline Push-Up', 'hpush', ['chair'], 5.5, 'Upper Chest · Front Delts', 'Feet on the chair, body in one line.'),
  lib('Band Chest Press', 'hpush', ['bands'], 5, 'Chest · Triceps', 'Band behind the back, slow return.'),
  lib('Push-Up', 'hpush', [], 5, 'Chest · Triceps · Core', 'Elbows ~45°, full range.'),
  lib('Seated Dumbbell Shoulder Press', 'vpush', ['dumbbells', 'bench'], 9, 'Shoulders · Triceps', 'Back supported, press up and slightly in.'),
  lib('Standing Dumbbell Shoulder Press', 'vpush', ['dumbbells'], 8, 'Shoulders · Triceps · Core', 'Glutes tight, no leaning back.'),
  lib('Barbell Overhead Press', 'vpush', ['barbell'], 8, 'Shoulders · Triceps · Upper Traps', 'Bar path close to the face.'),
  lib('Machine Shoulder Press', 'vpush', ['machines'], 8, 'Shoulders · Triceps', 'Press without shrugging.'),
  lib('Kettlebell Overhead Press', 'vpush', ['kettlebell'], 7, 'Shoulders · Triceps', 'Bell in the rack, press to lockout.'),
  lib('Backpack Overhead Press', 'vpush', ['backpack'], 5, 'Shoulders · Triceps', 'Hold the backpack sides, press straight up.'),
  lib('Band Overhead Press', 'vpush', ['bands'], 5, 'Shoulders · Triceps', 'Stand on the band, brace and press.'),
  lib('Pike Push-Up', 'vpush', [], 5, 'Shoulders · Triceps', 'Hips high, head between the hands.'),
  lib('Pull-Up', 'vpull', ['pullup_bar'], 9, 'Lats · Biceps · Core', 'Dead hang, chest toward the bar.'),
  lib('Chin-Up', 'vpull', ['pullup_bar'], 8.5, 'Lats · Biceps', 'Palms facing you, full hang each rep.'),
  lib('Lat Pulldown', 'vpull', ['machines'], 8, 'Lats · Biceps', 'Elbows to the ribs, chest up.'),
  lib('Band Lat Pulldown', 'vpull', ['bands'], 5, 'Lats', 'Anchor high, pull the elbows down.'),
  lib('Chest-Supported Dumbbell Row', 'hpull', ['dumbbells', 'bench'], 9, 'Mid Back · Lats · Rear Delts', 'Chest on an incline bench, drive the elbows back.'),
  lib('One-Arm Dumbbell Row', 'hpull', ['dumbbells'], 8, 'Lats · Mid Back · Biceps', 'Hand on a support, pull to the hip.'),
  lib('Barbell Bent-Over Row', 'hpull', ['barbell'], 8, 'Mid Back · Lats', 'Hinge to ~45°, pull to the lower ribs.'),
  lib('Seated Cable Row', 'hpull', ['machines'], 8, 'Mid Back · Lats', 'Tall chest, pause at the stomach.'),
  lib('Kettlebell Row', 'hpull', ['kettlebell'], 7, 'Mid Back · Lats', 'Hinge, pull the bell to the hip.'),
  lib('Weighted Backpack One-Arm Row', 'hpull', ['backpack'], 6, 'Lats · Mid Back', 'Hand on a chair, flat back, backpack to the hip.'),
  lib('Band Row', 'hpull', ['bands'], 5, 'Mid Back', 'Anchor at chest height, elbows back.'),
  lib('Inverted Table Row', 'hpull', [], 4, 'Mid Back · Biceps', 'Under a sturdy table, body straight.'),
  lib('Dumbbell Lateral Raise', 'lateral', ['dumbbells'], 8, 'Lateral Delts', 'Lead with the elbows, stop at shoulder height.'),
  lib('Cable Lateral Raise', 'lateral', ['machines'], 8, 'Lateral Delts', 'Cable from the opposite side.'),
  lib('Band Lateral Raise', 'lateral', ['bands'], 6, 'Lateral Delts', 'Slow lowering against the band.'),
  lib('Water-Bottle Lateral Raise', 'lateral', ['backpack'], 5, 'Lateral Delts', 'Full bottles, slow 3 s lowering.'),
  lib('Dumbbell Reverse Fly', 'reardelt', ['dumbbells'], 8, 'Rear Delts · Mid Traps', 'Hinge forward, arc the arms wide.'),
  lib('Cable Face Pull', 'reardelt', ['machines'], 8, 'Rear Delts · Upper Back', 'Pull to the eyes, elbows high.'),
  lib('Band Pull-Apart', 'reardelt', ['bands'], 7, 'Rear Delts', 'Arms straight, band to the chest.'),
  lib('Prone Y-T Raise', 'reardelt', [], 4, 'Rear Delts · Lower Traps', 'Face down, thumbs up, slow holds.'),
  lib('Barbell Curl', 'curl', ['barbell'], 8, 'Biceps', 'Elbows pinned, no hip swing.'),
  lib('Dumbbell Curl', 'curl', ['dumbbells'], 8, 'Biceps · Brachialis', 'Supinate at the top, full extension.'),
  lib('Kettlebell Hammer Curl', 'curl', ['kettlebell'], 6, 'Biceps · Forearms', 'Neutral grip, slow lowering.'),
  lib('Band Curl', 'curl', ['bands'], 6, 'Biceps', 'Stand on the band, squeeze at the top.'),
  lib('Backpack Curl', 'curl', ['backpack'], 5, 'Biceps', 'Both hands on the top handle, elbows pinned.'),
  lib('Towel Isometric Curl', 'curl', [], 2, 'Biceps', 'Curl hard against a towel under the foot, 20–30 s holds.'),
  lib('Dumbbell Overhead Extension', 'triceps', ['dumbbells'], 8, 'Triceps (Long Head)', 'Elbows up, deep stretch behind the head.'),
  lib('Cable Pushdown', 'triceps', ['machines'], 8, 'Triceps', 'Elbows pinned, lock out.'),
  lib('Chair Dips', 'triceps', ['chair'], 6, 'Triceps · Chest', 'Elbows back, lower to ~90°.'),
  lib('Band Pushdown', 'triceps', ['bands'], 6, 'Triceps', 'Anchor high, press to lockout.'),
  lib('Backpack Overhead Extension', 'triceps', ['backpack'], 5, 'Triceps', 'Backpack overhead, elbows forward.'),
  lib('Diamond Push-Up', 'triceps', [], 5, 'Triceps · Chest', 'Hands together, elbows close.'),
  lib('Hanging Knee Raise', 'core', ['pullup_bar'], 7, 'Abs · Hip Flexors', 'No swing, curl the pelvis up.'),
  lib('Band Pallof Press', 'core', ['bands'], 6, 'Obliques · Abs', 'Press out and resist the rotation.'),
  lib('Dead Bug', 'core', [], 5, 'Abs', 'Lower back glued to the floor, slow reach.'),
  lib('Plank with Shoulder Taps', 'core', [], 5, 'Abs · Obliques', 'Feet wide, hips still.'),
];

const CORE_PATTERNS = ['core'];
const ISOLATION_PATTERNS = ['lateral', 'reardelt', 'curl', 'triceps', 'calf'];
let expressSeed = 0;
let currentGenerated = null;

function gearProfile() { return (typeof userProfile !== 'undefined' && userProfile) ? userProfile : {}; }
function selectedGear() { return Array.isArray(gearProfile().equipment) ? gearProfile().equipment : []; }
function gearChipActive(id) {
  const eq = selectedGear();
  return id === 'machines' ? (eq.includes('machines') || eq.includes('cables')) : eq.includes(id);
}

function ownedGearSet() {
  return adaptiveEquipment() || new Set(['bodyweight']);
}

function saveGearProfile(changes) {
  userProfile = { ...gearProfile(), ...changes };
  save('fitdash_profile', userProfile);
}

function toggleGear(id) {
  const extras = selectedGear().filter(x => x === 'cardio');
  let eq = selectedGear().filter(x => x !== 'cardio');
  if(id === 'bodyweight') {
    eq = gearChipActive('bodyweight') && eq.length === 1 ? [] : ['bodyweight'];
  } else {
    const on = gearChipActive(id);
    const ids = id === 'machines' ? ['machines', 'cables'] : [id];
    eq = eq.filter(x => !ids.includes(x) && x !== 'bodyweight');
    if(!on) eq.push(...ids);
  }
  saveGearProfile({ equipment: [...eq, ...extras] });
  _cachedFullPlanDeps = '';
  currentGenerated = null;
  refreshRoutineViews();
  syncEquipmentCheckboxes();
}

function setSessionMode(mode) {
  if(!SESSION_MODES[mode]) return;
  saveGearProfile({ sessionMode: mode });
  currentGenerated = null; expressSeed = 0;
  renderGearStudio();
}

function setTargetSplit(split) {
  if(!TARGET_SPLITS[split]) return;
  saveGearProfile({ targetSplit: split });
  currentGenerated = null; expressSeed = 0;
  renderGearStudio();
}

function currentSessionMode() { return SESSION_MODES[gearProfile().sessionMode] ? gearProfile().sessionMode : '15'; }
function currentTargetSplit() { return TARGET_SPLITS[gearProfile().targetSplit] ? gearProfile().targetSplit : 'full'; }

function repsFor(pattern, mode) {
  if(CORE_PATTERNS.includes(pattern)) return mode === '15' ? '30 s' : '30–45 s';
  if(ISOLATION_PATTERNS.includes(pattern)) return '12–15 reps';
  return mode === '15' ? '10–15 reps' : '8–12 reps';
}

function slotCapacity(category) { return category === 'gym' ? [2, 3, 7] : [2, 3, 6]; }

function generateExpressWorkout(seed = 0) {
  const owned = ownedGearSet();
  const mode = currentSessionMode(), split = currentTargetSplit();
  const cfg = SESSION_MODES[mode], spec = TARGET_SPLITS[split];
  const total = cfg.blocks.reduce((a, b) => a + b, 0);
  const used = new Set(), picks = [];
  spec.slots.forEach((patterns, slotIdx) => {
    if(picks.length >= total) return;
    for(const pattern of patterns) {
      const candidates = EXPRESS_LIBRARY.filter(e => e.pattern === pattern && !used.has(e.name) && equipOk(e.equip, owned))
        .sort((a, b) => b.score - a.score);
      if(!candidates.length) continue;
      const pick = candidates[(seed + slotIdx) % Math.min(2, candidates.length)];
      used.add(pick.name);
      picks.push({ name: pick.name, muscle: pick.muscle, tips: pick.tips, equip: pick.equip, reps: repsFor(pick.pattern, mode) });
      return;
    }
  });
  let i = 0;
  const blocks = cfg.blocks.map((n, bIdx) => ({
    name: `${spec.label} · Block ${'ABC'[bIdx]}`, type: cfg.types[bIdx], info: cfg.info,
    exercises: picks.slice(i, i += n),
  })).filter(b => b.exercises.length);
  return { name: `⚡ ${cfg.short} · ${spec.label}`, source: 'offline', mode, split, blocks };
}

// Fit any workout (offline or AI) into the base program's slots: 3 blocks, capacity per block.
function fitWorkoutToSlots(blocks, category) {
  const cap = slotCapacity(category);
  const defaults = ['Superset', 'Giant Set', 'Circuit'];
  const out = [0, 1, 2].map(i => ({ name: `Block ${'ABC'[i]}`, info: '', ...(blocks[i] || {}), type: (blocks[i] && blocks[i].type) || defaults[i], exercises: [] }));
  let carry = [];
  blocks.forEach((b, i) => {
    const list = [...carry, ...(b.exercises || [])];
    carry = [];
    const target = Math.min(i, 2);
    list.forEach(ex => { if(out[target].exercises.length < cap[target]) out[target].exercises.push(ex); else carry.push(ex); });
  });
  for(let t = 0; t < 3 && carry.length; t++) {
    while(carry.length && out[t].exercises.length < cap[t]) out[t].exercises.push(carry.shift());
  }
  return out.filter(b => b.exercises.length);
}

function workoutCategory() { return ownedGearSet().has('machines') && selectedGear().some(x => x === 'machines' || x === 'cables') ? 'gym' : 'home'; }

function routineFromGenerated(w, id, name) {
  const category = workoutCategory();
  const base = category === 'gym' ? GYM_WORKOUT_PLAN : WORKOUT_PLAN;
  const blocks = fitWorkoutToSlots(w.blocks, category);
  const swaps = {}, skip = [], blockMeta = {};
  base.forEach((block, bIdx) => {
    const gen = blocks[bIdx];
    if(gen) blockMeta[block.id] = { name: gen.name || block.name, type: gen.type || block.type, info: gen.info || block.info };
    block.exercises.forEach((ex, eIdx) => {
      const g = gen && gen.exercises[eIdx];
      if(!g) { skip.push(ex.code); return; }
      if(g.name === ex.name) return;
      swaps[ex.code] = { name: String(g.name).slice(0, 60), muscle: String(g.muscle || ex.muscle || '').slice(0, 100),
        tips: String(g.tips || '').slice(0, 240), ...(g.reps ? { reps: String(g.reps).slice(0, 30) } : {}), ...(g.equip && g.equip.length ? { equip: g.equip } : {}) };
    });
  });
  const mode = SESSION_MODES[w.mode] ? w.mode : currentSessionMode();
  const level = SESSION_MODES[mode].level || trainingLevel;
  return normalizeRoutine({ id, name: String(name || w.name).slice(0, 40), category, level, swaps, skip, blockMeta, restCap: SESSION_MODES[mode].restCap || null });
}

function startGeneratedWorkout(w) {
  if(!w) return;
  if(wo.active) { alert('Finish or exit the current workout first.'); return; }
  const r = routineFromGenerated(w, 'express', '⚡ Express');
  const idx = routines.findIndex(x => x.id === 'express');
  if(idx >= 0) routines[idx] = r; else routines.push(r);
  saveRoutines();
  if(typeof showPage === 'function' && activePageId !== 'training') showPage('training');
  activateRoutine('express');
  openPreWorkout();
}

function saveGeneratedWorkoutAsRoutine(w, btn) {
  if(!w) return;
  const name = (prompt('Name for this routine:', w.name.replace(/^⚡\s*/, '')) || '').trim();
  if(!name) return;
  const r = routineFromGenerated(w, newRoutineId(), name);
  routines.push(r);
  saveRoutines();
  renderRoutinePickers();
  if(btn) { btn.textContent = `✓ Saved "${r.name}"`; btn.disabled = true; }
}

function openFormGuideFromGenerated(bi, ei) {
  const ex = currentGenerated && currentGenerated.blocks[bi] && currentGenerated.blocks[bi].exercises[ei];
  if(ex) openFormGuide(ex);
}

function shuffleExpressWorkout() {
  expressSeed++;
  currentGenerated = generateExpressWorkout(expressSeed);
  renderGearStudio();
}

function generatedWorkoutHtml(w) {
  if(!w || !w.blocks.length) return '<div class="gear-empty">No exercises match this gear yet — tap more equipment.</div>';
  return `<div class="gen-workout">
    <div class="gen-title">${escapeHtml(w.name)} ${w.source === 'ai' ? '<span class="tag tag-blue">✨ AI</span>' : '<span class="tag tag-green">Offline</span>'}</div>
    ${w.blocks.map((b, bi) => `
      <div class="gen-block">
        <div class="gen-block-head"><span class="block-num gen-block-num">${'ABC'[bi] || bi + 1}</span><span>${escapeHtml(b.type || 'Block')}</span><span class="gen-block-info">${escapeHtml(b.info || '')}</span></div>
        ${b.exercises.map((ex, ei) => `
          <div class="gen-ex">
            <div style="min-width:0;flex:1"><div class="gen-ex-name">${escapeHtml(ex.name)}</div>
              <div class="gen-ex-sub">${escapeHtml(ex.reps || '')}${ex.reps && ex.muscle ? ' · ' : ''}${escapeHtml(String(ex.muscle || '').replace(/^🎯\s*/, ''))}</div></div>
            <button class="form-chip-btn" onclick="openFormGuideFromGenerated(${bi}, ${ei})">${formTargetIcon()} Form</button>
          </div>`).join('')}
      </div>`).join('')}
    <div class="gen-actions">
      <button class="btn-red" onclick="startGeneratedWorkout(currentGenerated)">▶ Start This Workout Now</button>
      <button class="btn-ghost" onclick="saveGeneratedWorkoutAsRoutine(currentGenerated, this)">💾 Save to My Routines</button>
      ${w.source === 'ai' ? '<button class="btn-ghost" onclick="currentGenerated=null;renderGearStudio()">↺ Offline version</button>' : '<button class="btn-ghost" onclick="shuffleExpressWorkout()">🔀 Shuffle</button>'}
    </div>
  </div>`;
}

function renderGearStudio() {
  const el = document.getElementById('gear-studio');
  if(!el) return;
  const mode = currentSessionMode(), split = currentTargetSplit();
  if(!currentGenerated) currentGenerated = generateExpressWorkout(expressSeed);
  const planEx = getFullWorkoutPlan().flatMap(b => b.exercises);
  const adapted = planEx.filter(e => e._autoAdapted).length, missing = planEx.filter(e => e._missingGear).length;
  const hasGear = !!adaptiveEquipment();
  const r = getActiveRoutine();
  const status = !hasGear
    ? 'Tap the gear you have right now — your workout below adapts instantly, even offline.'
    : adapted || missing
      ? `↻ ${adapted} exercise${adapted === 1 ? '' : 's'} in “${r.name}” adapted to your gear${missing ? ` · ⚠ ${missing} still need${missing === 1 ? 's' : ''} gear you didn't pick` : ''}.`
      : `✓ Every exercise in “${r.name}” works with your gear.`;
  const openBuilder = r.category !== 'gym' || r.id === 'express';
  el.innerHTML = `
    <div class="gear-head"><div class="section-title" style="margin:0">🧰 My Gear</div><span class="gear-status">${escapeHtml(status)}</span></div>
    <div class="gear-chips" role="group" aria-label="Equipment I have">
      ${EQUIPMENT_CHIPS.map(([id, label]) => `<button class="chip-btn${gearChipActive(id) ? ' active' : ''}" aria-pressed="${gearChipActive(id)}" onclick="toggleGear('${id}')">${escapeHtml(label)}</button>`).join('')}
    </div>
    <details class="gear-builder" ${openBuilder ? 'open' : ''}>
      <summary>⚡ Busy Day / Express Workout Builder</summary>
      <div class="hv-filter-label">⏱ Session Duration</div>
      <div class="gear-chips" role="radiogroup" aria-label="Session duration">
        ${Object.entries(SESSION_MODES).map(([id, m]) => `<button class="chip-btn${mode === id ? ' active' : ''}" role="radio" aria-checked="${mode === id}" onclick="setSessionMode('${id}')">${escapeHtml(m.label)}</button>`).join('')}
      </div>
      <div class="hv-filter-label">${formTargetIcon()} Target Split</div>
      <div class="gear-chips" role="radiogroup" aria-label="Target split">
        ${Object.entries(TARGET_SPLITS).map(([id, s]) => `<button class="chip-btn${split === id ? ' active' : ''}" role="radio" aria-checked="${split === id}" onclick="setTargetSplit('${id}')">${escapeHtml(s.label)}</button>`).join('')}
      </div>
      <div id="gear-generated">${generatedWorkoutHtml(currentGenerated)}</div>
      <button class="btn-ghost gear-ai-btn" id="gear-ai-btn" onclick="aiBuildWorkoutForGear()">✨ AI Build Workout for My Gear</button>
      <div id="gear-ai-status" class="hv-ai-status" aria-live="polite"></div>
    </details>`;
}

function normalizeAIWorkout(raw) {
  if(!raw || typeof raw !== 'object') return null;
  const src = Array.isArray(raw.blocks) ? raw.blocks : Array.isArray(raw.plan) ? raw.plan : null;
  if(!src) return null;
  const blocks = src.map(b => ({
    name: String(b.name || '').slice(0, 60), type: String(b.type || '').slice(0, 30), info: String(b.info || b.notes || '').slice(0, 120),
    exercises: (Array.isArray(b.exercises) ? b.exercises : []).map(e => typeof e === 'string' ? { name: e } : e)
      .filter(e => e && e.name).map(e => ({ name: String(e.name).slice(0, 60), muscle: String(e.muscle || '').slice(0, 100),
        tips: String(e.tips || e.cue || '').slice(0, 200), reps: String(e.reps || (e.sets ? `${e.sets}×${e.reps || ''}` : '')).slice(0, 30) })),
  })).filter(b => b.exercises.length);
  if(!blocks.length) return null;
  const mode = SESSION_MODES[raw.mode] ? raw.mode : currentSessionMode();
  return { name: String(raw.name || 'AI Gear Workout').slice(0, 40), source: 'ai', mode, split: currentTargetSplit(), blocks: fitWorkoutToSlots(blocks, workoutCategory()) };
}

async function aiBuildWorkoutForGear() {
  const status = document.getElementById('gear-ai-status');
  const setStatus = (t, c) => { if(status) { status.textContent = t; status.style.color = c || 'var(--muted)'; } };
  if(providerRequiresApiKey(aiConfig.provider) && !getProviderApiKey(aiConfig.provider)) { setStatus('⚠️ ' + missingApiKeyMessage(), 'var(--orange)'); return; }
  if(aiOfflineBlocked()) { setStatus('📴 Offline — the offline workout above still adapts to your gear.', 'var(--orange)'); return; }
  const owned = [...ownedGearSet()].filter(x => x !== 'cables').map(x => equipLabel(x));
  const mode = SESSION_MODES[currentSessionMode()], split = TARGET_SPLITS[currentTargetSplit()];
  const cap = slotCapacity(workoutCategory());
  const prList = aiConfig.shareHealthData === false ? 'not shared' : (Object.entries(prs || {}).slice(0, 12).map(([k, v]) => `${k}: ${v.weight}kg`).join(', ') || 'none yet');
  const btn = document.getElementById('gear-ai-btn');
  if(btn) btn.disabled = true;
  setStatus('✨ Building a workout for your gear...');
  try {
    const response = await callAI([
      { role:'system', content:`You are FitDash's strength coach. Build one high-intensity, progressive workout that uses ONLY the listed equipment (bodyweight is always allowed). Use at most ${mode.blocks.length} blocks with at most ${mode.blocks.map((n, i) => Math.min(n, cap[i])).join(', ')} exercises respectively. Prefer supersets for short sessions. Reply with one short sentence, then exactly |||FITDASH_PLAN|||{JSON}|||END_PLAN||| where JSON = {"kind":"workout","name":string,"blocks":[{"name":string,"type":"Superset"|"Giant Set"|"Circuit","info":string,"exercises":[{"name":string,"muscle":string,"reps":string,"tips":string}]}]}.` },
      { role:'user', content:`Equipment: ${owned.join(', ')}. Time limit: ${mode.label}. Target split: ${split.label}. Experience level: ${LEVEL_CONFIG[trainingLevel] ? trainingLevel : 'amateur'}. Recent PRs: ${prList}. Limitations: ${gearProfile().limitations || 'none'}.` },
    ]);
    const w = normalizeAIWorkout(extractFitdashPlanJSON(response));
    if(!w) throw new Error('The AI reply did not include a workout. Try again.');
    currentGenerated = w;
    renderGearStudio();
    const s2 = document.getElementById('gear-ai-status');
    if(s2) { s2.textContent = '✅ AI workout ready — start it or save it as a routine.'; s2.style.color = 'var(--green)'; }
  } catch(err) {
    setStatus(typeof friendlyAIError === 'function' ? friendlyAIError(err) : err.message, 'var(--red)');
  } finally {
    const b2 = document.getElementById('gear-ai-btn');
    if(b2) b2.disabled = false;
  }
}

function syncEquipmentCheckboxes() {
  const eq = selectedGear();
  document.querySelectorAll('#equipment-options input').forEach(input => {
    input.checked = input.value === 'machines' ? (eq.includes('machines') || eq.includes('cables')) : eq.includes(input.value);
  });
}

renderGearStudio();
