// ══ WORKOUT ENGINE ══════════════════════════════════════════

const WORKOUT_PLAN = [
  { id:'A', name:'Legs & Calves', type:'Superset',
    info:'A1 → rest → A2 → rest. 3 full rounds before Block B.',
    exercises:[
      { code:'A1', equip:['dumbbells'], name:'Dumbbell Goblet Squat',
        muscle:'Quads · Glutes · Core',
        tips:'Keep chest tall, elbows inside knees at bottom. Drive through heels.' },
      { code:'A2', equip:['dumbbells'], name:'Standing Calf Raises',
        muscle:'Gastrocnemius · Soleus',
        tips:'Full range — heel below platform on stretch, full rise on toes. Pause at top.' },
    ]
  },
  { id:'B', name:'Back · Chest · Back', type:'Giant Set',
    info:'B1 → B2 → B3 back-to-back. Long rest only after B3.',
    exercises:[
      { code:'B1', equip:['dumbbells'], name:'DB Pullover',
        muscle:'Lats · Serratus · Long-head Tricep',
        tips:'Slight elbow bend. Feel the stretch at bottom, squeeze lats at top. Do NOT flare ribs.' },
      { code:'B2', equip:['barbell'], name:'Barbell Floor Press',
        muscle:'Chest · Triceps · Front Delt',
        tips:'Touch triceps to floor each rep — full stop removes stretch reflex. Tuck elbows slightly.' },
      { code:'B3', equip:['dumbbells'], name:'DB Bent-Over Row',
        muscle:'Mid Back · Rhomboids · Biceps',
        tips:'Hinge to ~45°. Drive elbows back — not up. Squeeze for 1s at top. Neutral spine.' },
    ]
  },
  { id:'C', name:'Full Body Finish', type:'Circuit',
    info:'C1→C2→C3→C4→C5→C6 minimal rest between moves. 3 rounds.',
    exercises:[
      { code:'C1', equip:['barbell'], name:'BB Overhead Press',
        muscle:'Shoulders · Triceps · Upper Traps',
        tips:'Bar path slightly back over skull at top. Don\'t lean back. Lock out fully overhead.' },
      { code:'C2', equip:['dumbbells'], name:'DB Lateral Raises',
        muscle:'Lateral Deltoid',
        tips:'Lead with elbows, not wrists. Slight forward lean. Stop at shoulder height — don\'t shrug.' },
      { code:'C3', equip:['barbell'], name:'BB Glute Bridges',
        muscle:'Glutes · Hamstrings',
        tips:'Drive hips to ceiling. Squeeze glutes HARD at top for 1 sec. Bar across hip crease.' },
      { code:'C4', equip:['barbell|dumbbells'], name:'BB / DB Bicep Curls',
        muscle:'Biceps · Brachialis',
        tips:'Elbows pinned to sides. Supinate wrist at top. Full extension at bottom — no cheating.' },
      { code:'C5', equip:['dumbbells'], name:'DB Floor Skullcrushers',
        muscle:'Long Head Tricep',
        tips:'Upper arms vertical, only forearms move. Lower until DBs touch temples — full stretch.' },
      { code:'C6', equip:['dumbbells'], name:'DB Reverse Flyes',
        muscle:'Rear Delts · Mid Traps · Rhomboids',
        tips:'Hinge forward, slight elbow bend. Arc arms out to sides — feel rear delt squeeze at top.' },
    ]
  }
];

const GYM_WORKOUT_PLAN = [
  { id:'A', name:'Legs & Calves', type:'Superset',
    info:'Choose leg press, V-squat, hack squat, belt squat, or alternating leg extension/curl. Train calves between leg sets.',
    exercises:[
      { code:'GA1', equip:['machines'], name:'Leg Press', muscle:'Quads · Glutes', tips:'Use a machine that fits you. Start easy, then progress from 20–25 reps to hard 5–10 rep sets. Keep the range controlled.' },
      { code:'GA2', equip:['machines'], name:'Seated Calf Press', muscle:'Gastrocnemius · Soleus', tips:'Perform between leg sets with little rest. Use a full stretch and full contraction. Skip the first warmup set if experienced.' },
    ]
  },
  { id:'B', name:'Back · Chest · Back', type:'Giant Set',
    info:'Lat pulldown → chest press → machine row. Move between exercises with minimal rest and rest fully after the row.',
    exercises:[
      { code:'GB1', equip:['machines'], name:'Lat Pulldown', muscle:'Vertical Back · Lats', tips:'Choose a pulldown or chin-up option. Use 20–25 reps for the easy warmup, then progress toward hard 5–10 rep sets.' },
      { code:'GB2', equip:['machines'], name:'Machine Chest Press', muscle:'Chest · Triceps', tips:'Prefer a machine. If occupied, use an incline or another chest press that lets you control the full range.' },
      { code:'GB3', equip:['machines'], name:'Machine Row', muscle:'Horizontal Back · Rhomboids', tips:'Use a machine or cable row. Complete the full giant set before taking the longer 1–2 minute rest.' },
    ]
  },
  { id:'C', name:'Finishing Circuit', type:'Circuit',
    info:'Shoulders → adductors → abductors → arms → rear delts. Rest briefly between exercises and fully after each round.',
    exercises:[
      { code:'GC1', equip:['machines'], name:'Machine Shoulder Press', muscle:'Shoulders · Triceps', tips:'Use 15–20 reps for the hard warmup, then 10–15 and 8–10 reps for working rounds.' },
      { code:'GC2', equip:['dumbbells'], name:'Dumbbell Lateral Raise', muscle:'Lateral Delts', tips:'Keep the movement controlled and stop around shoulder height. Use 10–15 reps in the first three rounds.' },
      { code:'GC3', equip:['machines'], name:'Adductor Machine', muscle:'Inner Thighs', tips:'Use at least 8 reps on hard rounds. Choose a load that stays controlled through the full range.' },
      { code:'GC4', equip:['machines'], name:'Abductor Machine', muscle:'Glutes · Outer Hips', tips:'Use at least 8 reps on hard rounds. Avoid bouncing or rushing the range of motion.' },
      { code:'GC5', equip:['dumbbells'], name:'Dumbbell Curls', muscle:'Biceps', tips:'Keep elbows stable. Use 15–20 reps for the warmup, then 10–15 and 5–10 reps.' },
      { code:'GC6', equip:['machines'], name:'Cable Extensions', muscle:'Triceps', tips:'Use any safe cable triceps variation. Keep the upper arm controlled and use the target rep ranges.' },
      { code:'GC7', equip:['machines'], name:'Reverse Pec-Deck Rear Delts', muscle:'Rear Delts · Upper Back', tips:'This is the preference exercise. Substitute another rear-delt or glute exercise if needed.' },
    ]
  }
];

let trainingCategory = getActiveRoutine().category;

function formTargetIcon() {
  return '<svg class="fg-ic" viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M12 3a9 9 0 1 0 0.01 0M12 7a5 5 0 1 0 0.01 0"/><path d="M12 10.5a1.5 1.5 0 1 0 0.01 0Z" fill="currentColor"/></svg>';
}

function switchTrainingCategory(category) {
  const target = category === 'gym' ? 'gym' : 'home';
  if(getActiveRoutine().category === target) { applyTrainingCategory(target); return; }
  let r = routines.find(x => x.category === target);
  if(!r) {
    r = { id: newRoutineId(), name: target === 'gym' ? 'Gym' : 'Home', category: target, level: null, swaps: {}, skip: [] };
    routines.push(r);
  }
  activateRoutine(r.id);
}

function applyTrainingCategory(category) {
  trainingCategory = category === 'gym' ? 'gym' : 'home';
  save('fitdash_training_category', trainingCategory);
  const isGym = trainingCategory === 'gym';
  const tag = document.getElementById('training-category-tag');
  if(tag) tag.textContent = isGym ? 'Full Body · Gym Program' : 'Full Body · Home Gym';
  const warmup = document.getElementById('training-warmup-desc');
  if(warmup) warmup.textContent = isGym
    ? '5–10 min moderate cardio on a machine before weights. Use an incline if using a treadmill.'
    : 'Brisk walk or light jog in place. Moderate pace — break a light sweat, warm the joints before loading.';
  switchLevel(trainingLevel);
  _cachedFullPlanDeps = '';
}

let customExercises = safeLoad('fitdash_custom_ex', []);
let workoutOverrides = safeLoad('fitdash_overrides', {}); // format: { exCode: 'targetBlockId' }

let _cachedFullPlan = null;
let _cachedFullPlanDeps = '';

function getFullWorkoutPlan() {
  const deps = JSON.stringify({ c: trainingCategory, cx: customExercises, wo: workoutOverrides, r: getRoutinePlanDeps() });
  if (_cachedFullPlan && _cachedFullPlanDeps === deps) return _cachedFullPlan;
  _cachedFullPlanDeps = deps;
  const plan = JSON.parse(JSON.stringify(trainingCategory === 'gym' ? GYM_WORKOUT_PLAN : WORKOUT_PLAN));
  applyRoutineToPlan(plan);
  
  // Create the dedicated Custom Block pool
  let customBlock = {
    id: '🛠️',
    name: 'Custom Block',
    type: 'Custom Pool',
    info: 'Your library of extra exercises.',
    exercises: []
  };
  
  // Load custom exercises directly into the custom block pool
  customExercises.forEach(cx => {
    customBlock.exercises.push({
      code: cx.code, name: cx.name, muscle: cx.muscle, tips: cx.tips, _isCustom: true, _id: cx.id
    });
  });

  plan.push(customBlock);

  // Apply overrides to move exercises between blocks
  const allEx = [];
  plan.forEach(b => {
    b.exercises.forEach(e => {
      e._originalBlock = b.id;
      allEx.push({ ex: e, currentBlock: workoutOverrides[e.code] || b.id });
    });
  });

  // Re-distribute exercises into their target blocks
  plan.forEach(b => b.exercises = []); 
  allEx.forEach(item => {
    let target = plan.find(b => b.id === item.currentBlock);
    if (!target) target = customBlock; // Fallback to Custom Block
    target.exercises.push(item.ex);
  });

  // Ensure blocks are sorted alphabetically, but keep Custom Block at the bottom
  plan.sort((a,b) => {
    if (a.id === '🛠️') return 1;
    if (b.id === '🛠️') return -1;
    return a.id.localeCompare(b.id);
  });
  
  _cachedFullPlan = plan;
  return plan;
}

// Built-in, offline guided recovery flows. Each move is timed in seconds.
const RECOVERY_ROUTINES = {
  mobility: [
    { title: '5 Min Morning Mobility', subtitle: 'Wake up the spine, hips and shoulders', moves: [
      { name: 'Cat-Cow', secs: 45, cue: 'On all fours, round then arch the spine slowly with the breath.' },
      { name: 'World\'s Greatest Stretch', secs: 60, cue: 'Lunge, elbow to instep, then rotate the arm to the ceiling. 30 s per side.' },
      { name: 'Thoracic Open Book', secs: 60, cue: 'Lie on your side, knees bent, open the top arm across. 30 s per side.' },
      { name: 'Deep Squat Hold', secs: 45, cue: 'Heels down, elbows pushing knees out, chest tall.' },
      { name: 'Arm Circles', secs: 30, cue: 'Big slow circles forwards, then backwards.' },
      { name: 'Child\'s Pose Breathing', secs: 60, cue: 'Sink the hips back, breathe into the lower back.' } ] },
    { title: '10 Min Joint Warm-Up', subtitle: 'Head-to-toe joint circles', moves: [
      { name: 'Neck Half-Circles', secs: 45, cue: 'Ear to shoulder, chin to chest, other ear. Never force the end range.' },
      { name: 'Shoulder Rolls + Circles', secs: 60, cue: 'Roll up, back and down; then full arm circles.' },
      { name: 'Wrist & Elbow Circles', secs: 45, cue: 'Interlace fingers and draw figure-eights.' },
      { name: 'Hip Circles', secs: 60, cue: 'Hands on hips, big slow circles both ways.' },
      { name: 'Leg Swings', secs: 90, cue: 'Front-to-back then side-to-side, 45 s per leg, hold a wall.' },
      { name: 'Knee & Ankle Circles', secs: 60, cue: 'Feet together, small knee circles, then roll each ankle.' },
      { name: 'Bodyweight Good Morning', secs: 60, cue: 'Soft knees, hinge at the hips, flat back.' },
      { name: 'Slow Bodyweight Squat', secs: 60, cue: '3 s down, 1 s up, full range.' } ] },
  ],
  stretch: [
    { title: '8 Min Hips & Hamstrings', subtitle: 'Lower-body tightness relief', moves: [
      { name: 'Half-Kneeling Hip Flexor Stretch', secs: 90, cue: 'Squeeze the back glute, tuck the pelvis. 45 s per side.' },
      { name: 'Seated Hamstring Reach', secs: 60, cue: 'Long spine, hinge forward from the hips, not the back.' },
      { name: 'Figure-4 Glute Stretch', secs: 90, cue: 'Ankle over the opposite knee, pull the thigh in. 45 s per side.' },
      { name: 'Frog Stretch', secs: 60, cue: 'Knees wide, rock gently back toward the heels.' },
      { name: 'Supine Spinal Twist', secs: 60, cue: 'Knees to one side, shoulders flat. 30 s per side.' } ] },
    { title: '6 Min Calf & Ankle Release', subtitle: 'For runners and long standing days', moves: [
      { name: 'Wall Calf Stretch (straight knee)', secs: 60, cue: 'Back heel down, lean into the wall. 30 s per side.' },
      { name: 'Wall Calf Stretch (bent knee)', secs: 60, cue: 'Bend the back knee to target the soleus. 30 s per side.' },
      { name: 'Knee-to-Wall Ankle Rocks', secs: 60, cue: 'Drive the knee over the toes, heel stays down.' },
      { name: 'Toe Squat', secs: 45, cue: 'Kneel on bent toes, sit back gently.' },
      { name: 'Downward Dog Pedal', secs: 60, cue: 'Alternate pressing each heel toward the floor.' } ] },
  ],
  relief: [
    { title: '8 Min Neck, Shoulders & Upper Back', subtitle: 'Desk and phone posture reset', moves: [
      { name: 'Chin Tucks', secs: 45, cue: 'Glide the head straight back, make a double chin, hold 2 s.' },
      { name: 'Upper Trap Stretch', secs: 60, cue: 'Ear to shoulder, opposite hand reaches down. 30 s per side.' },
      { name: 'Doorway Chest Stretch', secs: 60, cue: 'Forearms on the frame, step through gently.' },
      { name: 'Wall Angels', secs: 60, cue: 'Back to the wall, slide the arms up and down slowly.' },
      { name: 'Thread the Needle', secs: 60, cue: 'On all fours, slide one arm under and rotate. 30 s per side.' },
      { name: 'Prone Y-T Hold', secs: 45, cue: 'Face down, lift the arms into a Y, then a T, thumbs up.' } ] },
    { title: '5 Min Shoulder Reset', subtitle: 'Gentle mobility for stiff shoulders', moves: [
      { name: 'Pendulum Swings', secs: 60, cue: 'Lean on a table, let the arm hang and draw small circles. 30 s per side.' },
      { name: 'Cross-Body Stretch', secs: 60, cue: 'Pull the arm across the chest, shoulder down. 30 s per side.' },
      { name: 'Sleeper Stretch', secs: 60, cue: 'Lie on your side, gently press the forearm down. 30 s per side.' },
      { name: 'Scapular Wall Slides', secs: 60, cue: 'Forearms on the wall, slide up while keeping shoulders down.' },
      { name: 'Deep Breathing', secs: 60, cue: 'In through the nose 4 s, out through the mouth 6 s.' } ] },
  ],
};

let recoveryTimer = null;

function recoveryMinutes(routine) {
  return Math.round(routine.moves.reduce((s, m) => s + m.secs, 0) / 60);
}

function selectRecoveryTab(tab, openIdx) {
  stopRecoveryTimer();
  const validTab = ['mobility','stretch','relief'].includes(tab) ? tab : 'mobility';
  document.getElementById('recovery-tab-mobility').classList.toggle('active', validTab === 'mobility');
  document.getElementById('recovery-tab-stretch').classList.toggle('active', validTab === 'stretch');
  document.getElementById('recovery-tab-relief').classList.toggle('active', validTab === 'relief');

  const container = document.getElementById('recovery-content');
  const list = RECOVERY_ROUTINES[validTab] || [];
  container.innerHTML = list.map((routine, idx) => `
    <details class="recovery-routine" ${idx === openIdx ? 'open' : ''}>
      <summary>
        <span class="recovery-icon">🧘</span>
        <span style="flex:1;min-width:0"><strong>${escapeHtml(routine.title)}</strong><br><span class="recovery-sub">${escapeHtml(routine.subtitle)} · ${routine.moves.length} moves · ~${recoveryMinutes(routine)} min</span></span>
      </summary>
      <ol class="recovery-moves">${routine.moves.map(m => `<li><strong>${escapeHtml(m.name)}</strong> <span class="recovery-sub">${m.secs}s</span><div class="recovery-sub">${escapeHtml(m.cue)}</div></li>`).join('')}</ol>
      <div class="recovery-player" id="recovery-player-${validTab}-${idx}"></div>
      <button class="btn-red" style="width:100%;margin-top:8px" onclick="startRecoveryTimer('${validTab}', ${idx})">▶ Start guided timer</button>
    </details>`).join('');
}

function startRecoveryTimer(tab, idx) {
  stopRecoveryTimer();
  const routine = (RECOVERY_ROUTINES[tab] || [])[idx];
  const el = document.getElementById(`recovery-player-${tab}-${idx}`);
  if(!routine || !el) return;
  let move = 0, left = routine.moves[0].secs;
  const draw = () => {
    const m = routine.moves[move];
    el.innerHTML = `<div class="recovery-now">Move ${move + 1}/${routine.moves.length}: <strong>${escapeHtml(m.name)}</strong></div>
      <div class="recovery-count">${left}s</div><div class="recovery-sub">${escapeHtml(m.cue)}</div>
      <div style="display:flex;gap:8px;margin-top:8px"><button class="btn-ghost" onclick="skipRecoveryMove()">⏭ Next</button><button class="btn-ghost" onclick="stopRecoveryTimer()">■ Stop</button></div>`;
  };
  const next = () => {
    move++;
    if(move >= routine.moves.length) { stopRecoveryTimer(); el.innerHTML = '<div class="recovery-now">✅ Routine complete — nice work.</div>'; return; }
    left = routine.moves[move].secs;
    if(navigator.vibrate) navigator.vibrate(150);
    draw();
  };
  recoveryTimer = { el, next, interval: setInterval(() => { left--; if(left <= 0) next(); else draw(); }, 1000) };
  draw();
}

function skipRecoveryMove() { if(recoveryTimer) recoveryTimer.next(); }

function stopRecoveryTimer() {
  if(!recoveryTimer) return;
  clearInterval(recoveryTimer.interval);
  if(recoveryTimer.el) recoveryTimer.el.innerHTML = '';
  recoveryTimer = null;
}

function openRecoveryRoutine(tab, idx) {
  const modal = document.getElementById('recovery-modal');
  if(!modal) return;
  modal.classList.add('open');
  selectRecoveryTab(tab, idx);
}

function showRecoveryModal() {
  const modal = document.getElementById('recovery-modal');
  if(!modal) return;
  modal.classList.add('open');
  selectRecoveryTab('mobility');
}

function closeRecoveryModal() {
  const modal = document.getElementById('recovery-modal');
  if(!modal) return;
  stopRecoveryTimer();
  modal.classList.remove('open');
}

function escapeHtml(text) {
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function promptMoveExercise(code) {
  let modal = document.getElementById('move-modal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'move-modal';
    modal.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.8);z-index:9999;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:20px;backdrop-filter:blur(5px);';
    document.body.appendChild(modal);
  }
  
  modal.innerHTML = `
    <div style="width:100%;max-width:350px;background:var(--card);border-radius:var(--radius);padding:24px;position:relative;box-shadow:0 25px 50px rgba(0,0,0,0.5);">
      <button onclick="document.getElementById('move-modal').style.display='none'" style="position:absolute;top:10px;right:10px;background:none;color:var(--muted);border:none;font-size:20px;cursor:pointer;padding:8px;">✕</button>
      <h3 style="margin-top:0;margin-bottom:16px;text-align:center;">Move Exercise</h3>
      <p style="font-size:13px;color:var(--muted);margin-bottom:20px;text-align:center;">Where do you want to move <strong>${code}</strong>?</p>
      
      <div style="display:grid;grid-template-columns:1fr;gap:10px;">
        <button class="btn-secondary" style="padding:12px;font-size:14px;background:#111118;color:#ffffff;border:1px solid #353548;border-radius:8px;cursor:pointer;" onclick="executeMove('${code}', 'A')">Block A (Legs & Calves)</button>
        <button class="btn-secondary" style="padding:12px;font-size:14px;background:#111118;color:#ffffff;border:1px solid #353548;border-radius:8px;cursor:pointer;" onclick="executeMove('${code}', 'B')">Block B (Back & Chest)</button>
        <button class="btn-secondary" style="padding:12px;font-size:14px;background:#111118;color:#ffffff;border:1px solid #353548;border-radius:8px;cursor:pointer;" onclick="executeMove('${code}', 'C')">Block C (Full Body Circuit)</button>
        <button class="btn-secondary" style="padding:12px;font-size:14px;background:#111118;color:#ff6b35;border:1px solid #ff6b35;border-radius:8px;cursor:pointer;" onclick="executeMove('${code}', '🛠️')">Custom Pool 🛠️</button>
      </div>
    </div>
  `;
  modal.style.display = 'flex';
}

function executeMove(code, target) {
  let overrides = safeLoad('fitdash_overrides', {});
  overrides[code] = target;
  save('fitdash_overrides', overrides);
  workoutOverrides = overrides;
  _cachedFullPlanDeps = '';
  document.getElementById('move-modal').style.display = 'none';
  renderTrainingBlocks(LEVEL_CONFIG[trainingLevel]);
}

/**
 * Maps each WORKOUT_PLAN exercise name → the matching EXERCISES dropdown label.
 * Without this, autoDetectPRs would store "Dumbbell Goblet Squat" while the manual
 * PR form stores "Goblet Squat (A1)", creating two separate PR records for the same lift.
 */
const PR_KEY_MAP = (() => {
  const map = {};
  getFullWorkoutPlan().forEach(block => {
    block.exercises.forEach(ex => {
      // Find the EXERCISES entry whose code suffix matches, e.g. "(A1)"
      const match = EXERCISES.find(e => e.endsWith(`(${ex.code})`));
      map[ex.name] = match || ex.name;  // fall back to full name if no match
    });
  });
  return map;
})();

// ── Level system ──────────────────────────────────────────────
const LEVEL_CONFIG = {
  beginner: {
    sessionsPerWeek:'2×', duration:'~40 min', setsLabel:'2 Sets per Block',
    sets:[
      { label:'Set 1 — Easy Warmup', badge:'s1', reps:'20–25', restSec:60,
        tip:'Very light load. Go easy — just learn the movement. No grinding. You should feel almost nothing.' },
      { label:'Set 2 — Working Set', badge:'s2', reps:'10–15', restSec:120,
        tip:'Add weight. Work hard but stay 2–5 reps from failure. Form always beats weight.' },
    ],
    legendHTML:`
      <div class="legend-item"><div class="legend-num s1">Set 1</div><div class="legend-desc">Easy Warmup<br>20–25 reps · light</div></div>
      <div class="legend-item"><div class="legend-num s2">Set 2</div><div class="legend-desc">Working Set<br>10–15 reps</div></div>`,
    gridHTML:(isCircuit)=>`
      <div class="set-item">
        <div class="set-num-label s1">${isCircuit?'Round 1':'Set 1'} · Warmup</div>
        <div class="set-reps">20–25</div>
        <div class="set-desc-s">reps · very light</div>
        <div class="set-desc-s" style="margin-top:4px;color:var(--blue)">Rest 1 min</div>
      </div>
      <div class="set-item">
        <div class="set-num-label s2">${isCircuit?'Round 2':'Set 2'} · Working</div>
        <div class="set-reps">10–15</div>
        <div class="set-desc-s">reps · controlled</div>
        <div class="set-desc-s" style="margin-top:4px;color:var(--yellow)">Rest 2 min</div>
      </div>`,
    note:(id)=>id==='A'
      ?'🌱 Butter Starter — 2 sets only. Learn the movement pattern. Form over everything.'
      :'🌱 Take your time. Build the habit. No failure sets — stay 2–5 reps shy of your limit.'
  },
  amateur: {
    sessionsPerWeek:'2–3×', duration:'~55–70 min', setsLabel:'3 Sets per Block',
    sets:[
      { label:'Set 1 — Warmup',      badge:'s1', reps:'20–25', restSec:90,
        tip:'Very light load — full range of motion focus. Could you do 50 reps? Good.' },
      { label:'Set 2 — Form & TUT',   badge:'s2', reps:'12–15', restSec:90,
        tip:'Tempo 3-1-1. 3s down, 1s hold at peak contraction, 1s up. Feel every rep.' },
      { label:'Set 3 — Max Effort',   badge:'s3', reps:'To failure + partials', restSec:180,
        tip:'Heaviest load you can handle. Go to full failure, then squeeze out partial reps.' },
    ],
    legendHTML:`
      <div class="legend-item"><div class="legend-num s1">Set 1</div><div class="legend-desc">Warmup<br>High reps · light</div></div>
      <div class="legend-item"><div class="legend-num s2">Set 2</div><div class="legend-desc">Form + TUT<br>Tempo 3-1-1</div></div>
      <div class="legend-item"><div class="legend-num s3">Set 3</div><div class="legend-desc">Max Effort<br>Failure + partials</div></div>`,
    gridHTML:(isCircuit)=>`
      <div class="set-item">
        <div class="set-num-label s1">${isCircuit?'Round 1':'Set 1'} · Warmup</div>
        <div class="set-reps">20–25</div>
        <div class="set-desc-s">reps · light load</div>
        <div class="set-desc-s" style="margin-top:4px;color:var(--blue)">Rest 1–2 min</div>
      </div>
      <div class="set-item">
        <div class="set-num-label s2">${isCircuit?'Round 2':'Set 2'} · Form</div>
        <div class="set-reps">12–15</div>
        <div class="set-desc-s">reps · tempo 3-1-1</div>
        <div class="set-desc-s" style="margin-top:4px;color:var(--yellow)">~55s TUT · 1–2 min</div>
      </div>
      <div class="set-item">
        <div class="set-num-label s3">${isCircuit?'Round 3':'Set 3'} · Max</div>
        <div class="set-reps">Failure</div>
        <div class="set-desc-s">+ partials · heaviest</div>
        <div class="set-desc-s" style="margin-top:4px;color:var(--red)">Rest 2–3 min</div>
      </div>`,
    note:(id)=>id==='A'
      ?'💡 Move smoothly through full range. Light enough that you could do 50 reps on Set 1 — that\'s the point.'
      :'💡 Squeeze the target muscle. 1-second hold at peak contraction on Set 2.'
  },
  master: {
    sessionsPerWeek:'3×', duration:'~70–90 min', setsLabel:'4 Sets per Block',
    sets:[
      { label:'Set 1 — Warmup',         badge:'s1', reps:'20–25', restSec:90,
        tip:'Light weight. 20–25 reps — could do 50. Warmup only. Full range of motion.' },
      { label:'Set 2 — Hard Warm Up',   badge:'s2', reps:'15–20', restSec:90,
        tip:'15–20 reps leaving 5–10 in the tank. Tempo 3-1-1. Feel every rep.' },
      { label:'Set 3 — Working Set',    badge:'s3', reps:'10–15', restSec:120,
        tip:'Add 20% more weight. 0–2 reps from failure. Squeeze at peak contraction.' },
      { label:'Set 4 — Advanced Set 🔥',badge:'s4', reps:'5–8 + Drop Set', restSec:180,
        tip:'Same weight as Set 3. Go to full failure, then drop 20–30% for partials. TRAIN HARDER THAN LAST TIME!' },
    ],
    legendHTML:`
      <div class="legend-item"><div class="legend-num s1">Set 1</div><div class="legend-desc">Warmup<br>20–25 reps</div></div>
      <div class="legend-item"><div class="legend-num s2">Set 2</div><div class="legend-desc">Hard Warm Up<br>15–20 reps</div></div>
      <div class="legend-item"><div class="legend-num s3">Set 3</div><div class="legend-desc">Working Set<br>10–15 reps</div></div>
      <div class="legend-item"><div class="legend-num s4">Set 4 🔥</div><div class="legend-desc">Advanced<br>5–8 + Drop Set</div></div>`,
    gridHTML:(isCircuit)=>`
      <div class="set-item">
        <div class="set-num-label s1">${isCircuit?'Round 1':'Set 1'} · Warmup</div>
        <div class="set-reps">20–25</div>
        <div class="set-desc-s">reps · very light</div>
        <div class="set-desc-s" style="margin-top:4px;color:var(--blue)">Rest 1–2 min</div>
      </div>
      <div class="set-item">
        <div class="set-num-label s2">${isCircuit?'Round 2':'Set 2'} · Hard WU</div>
        <div class="set-reps">15–20</div>
        <div class="set-desc-s">5–10 in tank</div>
        <div class="set-desc-s" style="margin-top:4px;color:var(--yellow)">Tempo 3-1-1 · 1–2 min</div>
      </div>
      <div class="set-item">
        <div class="set-num-label s3">${isCircuit?'Round 3':'Set 3'} · Working</div>
        <div class="set-reps">10–15</div>
        <div class="set-desc-s">0–2 from failure</div>
        <div class="set-desc-s" style="margin-top:4px;color:var(--red)">Rest 2–3 min</div>
      </div>
      <div class="set-item" style="border-color:var(--orange)">
        <div class="set-num-label s4">${isCircuit?'Round 4':'Set 4'} 🔥 Adv</div>
        <div class="set-reps" style="font-size:13px">5–8 + Drop</div>
        <div class="set-desc-s">failure + partials</div>
        <div class="set-desc-s" style="margin-top:4px;color:var(--orange)">Rest 2–3 min</div>
      </div>`,
    note:(id)=>'⚡ TRAIN HARDER THAN LAST TIME. Set 4: full failure → drop 20–30% → partial reps to absolute failure.'
  }
};

// Validate against the known level set — an unrecognised value (corruption, old
// version, manual localStorage edit) would make LEVEL_CONFIG[trainingLevel]
// undefined, causing getSetConfig() to throw TypeError and crash the workout engine.
const VALID_LEVELS = ['beginner', 'amateur', 'master'];
let trainingLevel = (() => {
  const v = safeLoad('fitdash_level', null);
  return VALID_LEVELS.includes(v) ? v : 'amateur';
})();
function getSetConfig() { return LEVEL_CONFIG[trainingLevel].sets; }

// WO_FLAT / WO_TOTAL_STEPS are computed live so level switches mid-session still work
function computeWoFlat() {
  const cfg = getSetConfig();
  return getFullWorkoutPlan().flatMap(b => 
    b.exercises.flatMap((ex, eIdx) => 
      cfg.map((c, sIdx) => ({ b, eIdx, sIdx, c }))
    )
  );
}

let wo = {
  active:false, startTime:null,
  totalInterval:null, restInterval:null,
  restSecsLeft:0, totalSecs:0,
  blockIdx:0, exIdx:0, setIdx:0,
  log:{},          // "A-A1-0" → {weight, reps}
  setup:{},        // height, age, gender, activity
  finishedData:null,
};

// ── Pre-workout modal ─────────────────────────────────────
function openPreWorkout() {
  // restore saved profile
  const saved = safeLoad('fitdash_profile', {});
  if(saved.height)   document.getElementById('setup-height').value   = saved.height;
  if(saved.age)      document.getElementById('setup-age').value      = saved.age;
  if(saved.gender)   document.getElementById('setup-gender').value   = saved.gender;
  if(saved.activity) document.getElementById('setup-activity').value = saved.activity;

  // pre-fill weight: today's log first, then last saved profile weight
  // use getLocalDateStr() — toDateString() format would miss entries stored in ISO format
  const todayW = weights.find(w => w.date === getLocalDateStr());
  const prefillW = todayW ? todayW.val : (saved.weight || '');
  document.getElementById('setup-weight').value = prefillW;

  // show/hide the estimation note based on whether weight is filled
  // listener attached once at init (bottom of file) — NOT here, to prevent stacking
  // duplicate listeners every time the modal opens
  updateWeightNote();

  document.getElementById('preworkout-modal').classList.add('open');
  document.body.style.overflow = 'hidden';
}

function updateWeightNote() {
  const w   = document.getElementById('setup-weight').value;
  const note = document.getElementById('setup-weight-note');
  note.style.display = (!w || parseFloat(w) <= 0) ? '' : 'none';
}
function closePreWorkout() {
  document.getElementById('preworkout-modal').classList.remove('open');
  document.body.style.overflow = '';
}
function beginWorkout() {
  // Guard: prevent double-start from rapid clicks or duplicate call paths
  if(wo.active) return;

  const height    = parseFloat(document.getElementById('setup-height').value);
  const age       = parseInt(document.getElementById('setup-age').value);
  const gender    = document.getElementById('setup-gender').value;
  const activity  = document.getElementById('setup-activity').value;
  const weightRaw = parseFloat(document.getElementById('setup-weight').value);
  const weightKg  = (!isNaN(weightRaw) && weightRaw >= 30 && weightRaw <= 300)
                    ? weightRaw : null;

  if(!height || height < 100 || height > 250) {
    alert('Please enter a valid height (100–250 cm).'); return;
  }
  if(!age || age < 10 || age > 100) {
    alert('Please enter a valid age.'); return;
  }

  // if weight provided, write it back to today's weight log + dashboard stat
  if(weightKg) {
    const today = getLocalDateStr();   // was toDateString() — inconsistent with ISO format used everywhere else
    weights = weights.filter(w => w.date !== today);
    weights.push({ date: today, val: weightKg });
    save('fitdash_weights', weights);
    const swEl = document.getElementById('stat-weight');
    if(swEl) swEl.textContent = weightKg;
  }

  wo.setup = { height, age, gender, activity, weightKg };
  // Merge, don't replace: the profile also holds gear, limitations and session preferences.
  userProfile = { ...(userProfile || {}), ...safeLoad('fitdash_profile', {}), height, age, gender, activity, weight: weightKg || (userProfile && userProfile.weight) || null };
  save('fitdash_profile', userProfile);
  closePreWorkout();
  startWorkoutSession();
}

// ── Start session ─────────────────────────────────────────
function startWorkoutSession() {
  clearSessionSwaps();
  wo = { ...wo, active:true, sessionBest:{}, startTime:Date.now(), totalSecs:0,
    blockIdx:0, exIdx:0, setIdx:0, log:{}, finishedData:null,
    totalInterval:null, restInterval:null, restSecsLeft:0 };
  document.getElementById('workout-overlay').style.display = 'block';
  document.getElementById('wo-exit-panel').classList.remove('open');
  document.getElementById('wo-end-btn').textContent  = 'End ✕';
  document.getElementById('wo-end-btn').style.color  = '';
  document.getElementById('wo-end-btn').style.borderColor = '';
  document.body.style.overflow = 'hidden';
  requestWorkoutWakeLock();

  // overall timer
  wo.totalInterval = setInterval(() => {
    wo.totalSecs++;
    const m = String(Math.floor(wo.totalSecs/60)).padStart(2,'0');
    const s = String(wo.totalSecs%60).padStart(2,'0');
    document.getElementById('wo-total-time').textContent = m+':'+s;
  }, 1000);

  renderWorkoutStep();
}

// ── Render current step ───────────────────────────────────
function renderWorkoutStep() {
  try {
    const block   = getFullWorkoutPlan()[wo.blockIdx];
    
    // FAILSAFE: If block doesn't exist, workout is done
    if (!block) { finishWorkout(); return; }
    
    let ex = block.exercises[wo.exIdx];
    
    // FAILSAFE: If exercise is undefined (e.g., empty block), skip to next block
    if (!ex) {
      if (wo.blockIdx < getFullWorkoutPlan().length - 1) {
        wo.blockIdx++; wo.exIdx = 0; wo.setIdx = 0;
        renderWorkoutStep();
      } else {
        finishWorkout();
      }
      return;
    }
    
    const cfg     = getSetConfig();
    const set     = cfg[wo.setIdx];
    const woFlat  = computeWoFlat();

    // header progress (with optional chaining to prevent undefined crashes)
    const flatIdx = woFlat.findIndex(f =>
      f.b?.id === block.id && f.e?.code === ex.code && f.s === wo.setIdx);
    const pct = flatIdx>=0 ? Math.round((flatIdx/woFlat.length)*100) : 0;
    document.getElementById('wo-prog-fill').style.width = pct+'%';
    document.getElementById('wo-step-label').textContent =
      `Block ${block.id} · Ex ${wo.exIdx+1}/${block.exercises.length} · Set ${wo.setIdx+1}/${cfg.length}`;

    // block badge
    document.getElementById('wo-block-num').textContent = block.id;
    document.getElementById('wo-block-name').textContent = block.name;
    document.getElementById('wo-block-type').textContent = block.type;
    document.getElementById('wo-block-info').textContent = block.info.split('.')[0];

    // exercise card
    document.getElementById('wo-ex-code').textContent   = ex.code;
    document.getElementById('wo-ex-name').textContent   = ex.name;
    document.getElementById('wo-ex-muscle').innerHTML = `${formTargetIcon()} ${escapeHtml(String(ex.muscle || '').replace(/^[^A-Za-z]+/, ''))}`;

    // tips pill — add/update below muscle line
    let tipsEl = document.getElementById('wo-tips-pill');
    if(!tipsEl) {
      tipsEl = document.createElement('div');
      tipsEl.id = 'wo-tips-pill';
      tipsEl.style.cssText =
        'margin-top:10px;background:var(--card2);border:1px solid var(--border);' +
        'border-radius:var(--radius-sm);padding:8px 12px;font-size:12px;color:var(--muted2);line-height:1.5';
      document.getElementById('wo-ex-code').closest('.wo-ex-body').appendChild(tipsEl);
    }
    tipsEl.innerHTML = `💡 <strong style="color:var(--text)">Cue:</strong> ${ex.tips}`;

    // set card
    const badge = document.getElementById('wo-set-badge');
    badge.textContent  = set.label;
    badge.className    = `wo-set-badge ${set.badge}`;
    document.getElementById('wo-set-tip').textContent  = set.tip;
    // Generated workouts carry their own per-exercise target (e.g. "30 s" holds for core work).
    const timed = /\d\s*s\b|sec/i.test(ex.reps || '');
    document.getElementById('wo-set-reps').textContent = ex.reps ? (timed ? `${ex.reps} hold` : ex.reps) : set.reps;
    const repsLabel = document.getElementById('wo-reps-label');
    if(repsLabel) repsLabel.textContent = timed ? 'Seconds Held' : 'Reps Done';

    // pre-fill this session's entry if revisiting, otherwise the progression suggestion
    const prevKey = logKey(block.id, ex.code, wo.setIdx);
    const prev = wo.log[prevKey];
    const suggestion = suggestNextSet(ex.name, wo.setIdx, set.reps);
    const fill = prev || suggestion;
    document.getElementById('wo-weight').value = fill ? fill.weight : '';
    document.getElementById('wo-reps').value   = fill ? fill.reps   : '';
    const suggestEl = document.getElementById('wo-suggest');
    if(suggestEl) {
      suggestEl.style.display = suggestion ? '' : 'none';
      suggestEl.innerHTML = suggestion
        ? `📈 Last (${escapeHtml(suggestion.lastDate)}): <strong>${formatSet(suggestion.last.weight, suggestion.last.reps)}</strong>` +
          (suggestion.lastE1RM ? ` · e1RM ${suggestion.lastE1RM} kg` : '') +
          `<br>${formTargetIcon()} Suggested: <strong style="color:var(--green)">${formatSet(suggestion.weight, suggestion.reps)}</strong> — ${escapeHtml(suggestion.reason)}`
        : '';
    }

    // show set card, hide rest
    document.getElementById('wo-set-card').style.display  = '';
    document.getElementById('wo-rest-card').style.display = 'none';
    document.getElementById('wo-done-btn').disabled = false;
    document.getElementById('wo-done-btn').textContent = '✓  Set Done — Start Rest';

    // prev button
    document.getElementById('wo-prev-btn').disabled =
      wo.blockIdx===0 && wo.exIdx===0 && wo.setIdx===0;

    // completed log preview
    renderLogPreview();
  } catch(e) {
    alert("RENDER ERROR: " + e.message + "\nStack: " + e.stack);
    throw e; // rethrow so calling function knows it failed
  }
}

function logKey(bId, exCode, setIdx) { return `${bId}-${exCode}-${setIdx}`; }

// ── Complete a set ────────────────────────────────────────
function completeSet() {
  const wt   = parseFloat(document.getElementById('wo-weight').value) || 0;
  const reps = parseInt(document.getElementById('wo-reps').value)    || 0;
  const block = getFullWorkoutPlan()[wo.blockIdx];
  const ex    = block.exercises[wo.exIdx];
  const key   = logKey(block.id, ex.code, wo.setIdx);
  wo.log[key] = { weight:wt, reps, exName:ex.name, setLabel:getSetConfig()[wo.setIdx].label };

  const exKey = PR_KEY_MAP[ex.name] || ex.name;
  const best = Math.max(prs[exKey]?.weight || 0, wo.sessionBest?.[exKey] || 0);
  const isNewPR = wt > 0 && reps > 0 && wt > best;
  if (wt > 0 && reps > 0) wo.sessionBest = { ...(wo.sessionBest || {}), [exKey]: Math.max(best, wt) };

  document.getElementById('wo-done-btn').disabled = true;
  document.getElementById('wo-done-btn').textContent = isNewPR ? '🏆 New PR' : '✓ Logged';
  
  if (soundEnabled) playSound();
  woVibrate(isNewPR ? [120, 60, 120] : [40]);

  const baseRest = getSetConfig()[wo.setIdx].restSec;
  const restCap = getActiveRoutine().restCap;
  beginRest(restCap ? Math.min(restCap, baseRest) : baseRest);
}

// ── Rest timer ────────────────────────────────────────────
function woVibrate(pattern) {
  if (!hapticsEnabled || !navigator.vibrate) return;
  try { navigator.vibrate(pattern); } catch(e) { /* ignore */ }
}

function beginRest(secs) {
  wo.restSecsLeft = secs;
  document.getElementById('wo-set-card').style.display  = 'none';
  document.getElementById('wo-rest-card').style.display = '';
  updateRestDisplay();
  buildNextHint();

  if(wo.restInterval) clearInterval(wo.restInterval);
  wo.restInterval = setInterval(() => {
    wo.restSecsLeft--;
    if(wo.restSecsLeft <= 0) { 
      wo.restSecsLeft = 0;
      updateRestDisplay();
      if (soundEnabled) playSound();
      woVibrate([250, 100, 250, 100, 400]);
      skipRest(); 
      return; 
    }
    updateRestDisplay();
  }, 1000);
}

function updateRestDisplay() {
  const m = String(Math.floor(wo.restSecsLeft/60)).padStart(2,'0');
  const s = String(wo.restSecsLeft%60).padStart(2,'0');
  const el = document.getElementById('wo-rest-time');
  el.textContent = m+':'+s;
  el.className = 'wo-rest-time' + (wo.restSecsLeft<=10 ? ' urgent' : '');
}

function adjustRest(delta) {
  wo.restSecsLeft = Math.max(5, wo.restSecsLeft + delta);
  updateRestDisplay();
}

function skipRest() {
  if(wo.restInterval) { clearInterval(wo.restInterval); wo.restInterval=null; }
  
  try {
    advanceStep();
  } catch(e) {
    if(FITDASH_DEBUG) console.error("Error in advanceStep:", e);
    alert("An error occurred while trying to skip the rest. Resetting the step.");
    // Fallback to forcefully re-render the current step to un-freeze the UI
    renderWorkoutStep(); 
  }
}

function buildNextHint() {
  const el = document.getElementById('wo-next-hint');
  const nextStep = peekNextStep();
  if(!nextStep) { el.textContent = '🏁 Last set! Finish strong.'; return; }
  if(nextStep.type==='set') {
    el.textContent = `Next → ${nextStep.label} of ${nextStep.exName}`;
  } else if(nextStep.type==='block') {
    el.textContent = `Next → Block ${nextStep.blockId}: ${nextStep.blockName}`;
  } else {
    el.textContent = '🏁 Final set — almost done!';
  }
}

function peekNextStep() {
  const block   = getFullWorkoutPlan()[wo.blockIdx];
  const cfg     = getSetConfig();
  const nextSet = wo.setIdx + 1;
  if(nextSet < cfg.length) {
    return { type:'set', label:cfg[nextSet].label,
             exName:block.exercises[wo.exIdx].name };
  }
  const nextEx = wo.exIdx + 1;
  if(nextEx < block.exercises.length) {
    return { type:'set', label:'Set 1 — Warmup',
             exName:block.exercises[nextEx].name };
  }
  const nextBlock = wo.blockIdx + 1;
  if(nextBlock < getFullWorkoutPlan().length) {
    return { type:'block', blockId:getFullWorkoutPlan()[nextBlock].id,
             blockName:getFullWorkoutPlan()[nextBlock].name };
  }
  return null;
}

// ── Advance to next step ──────────────────────────────────
function advanceStep() {
  const block = getFullWorkoutPlan()[wo.blockIdx];

  // try next set
  if(wo.setIdx < getSetConfig().length - 1 && block.exercises.length > 0) { wo.setIdx++; renderWorkoutStep(); return; }

  // try next exercise in block
  if(wo.exIdx < block.exercises.length - 1) {
    wo.exIdx++; wo.setIdx = 0; renderWorkoutStep(); return;
  }

  // try next block
  if(wo.blockIdx < getFullWorkoutPlan().length - 1) {
    wo.blockIdx++; wo.exIdx = 0; wo.setIdx = 0; renderWorkoutStep(); return;
  }

  // all done
  finishWorkout();
}

function woPrev() {
  if(wo.restInterval) { clearInterval(wo.restInterval); wo.restInterval=null; }
  const lastSet = getSetConfig().length - 1;
  if(wo.setIdx > 0) { wo.setIdx--; }
  else if(wo.exIdx > 0) { wo.exIdx--; wo.setIdx=lastSet; }
  else if(wo.blockIdx > 0) { 
    wo.blockIdx--; 
    const prevBlockExCount = getFullWorkoutPlan()[wo.blockIdx].exercises.length;
    wo.exIdx = Math.max(0, prevBlockExCount - 1); 
    wo.setIdx = lastSet; 
  }
  renderWorkoutStep();
}

function woSkipEx() {
  if(wo.restInterval) { clearInterval(wo.restInterval); wo.restInterval=null; }
  const block = getFullWorkoutPlan()[wo.blockIdx];
  if(wo.exIdx < block.exercises.length-1) { wo.exIdx++; wo.setIdx=0; }
  else if(wo.blockIdx < getFullWorkoutPlan().length-1) { wo.blockIdx++; wo.exIdx=0; wo.setIdx=0; }
  else { finishWorkout(); return; }
  renderWorkoutStep();
}

function renderLogPreview() {
  const el = document.getElementById('wo-log-preview');
  const keys = Object.keys(wo.log);
  if(!keys.length) { el.innerHTML=''; return; }
  el.innerHTML = `
    <div style="font-size:10px;font-weight:700;color:var(--muted);text-transform:uppercase;letter-spacing:1.5px;margin-bottom:10px">Logged Sets</div>
    <div style="background:var(--card);border:1px solid var(--border);border-radius:var(--radius);overflow:hidden">
      ${keys.map(k => {
        const d = wo.log[k];
        const vol = d.weight && d.reps ? `${d.weight}kg × ${d.reps}` : '—';
        return `<div style="display:flex;align-items:center;padding:10px 14px;border-bottom:1px solid var(--border);gap:10px">
          <span style="font-size:10px;color:var(--muted);font-family:monospace;width:60px">${k}</span>
          <span style="font-size:13px;font-weight:600;flex:1">${d.exName}</span>
          <span style="font-size:13px;font-weight:700;color:var(--green)">${vol}</span>
        </div>`;
      }).join('')}
    </div>`;
}

// ── Exit panel controls ───────────────────────────────────
function toggleExitPanel() {
  const panel = document.getElementById('wo-exit-panel');
  const btn   = document.getElementById('wo-end-btn');
  const open  = panel.classList.toggle('open');
  btn.textContent = open ? 'Cancel' : 'End ✕';
  btn.style.color = open ? 'var(--green)' : '';
  btn.style.borderColor = open ? 'var(--green)' : '';
}

function discardAndExit() {
  // Immediately stop everything, no summary, no data saved
  if(wo.totalInterval) { clearInterval(wo.totalInterval); wo.totalInterval=null; }
  if(wo.restInterval)  { clearInterval(wo.restInterval);  wo.restInterval=null; }
  document.getElementById('wo-exit-panel').classList.remove('open');
  document.getElementById('workout-overlay').style.display = 'none';
  document.body.style.overflow = '';
  wo.active = false;
  releaseWorkoutWakeLock();
  endSessionSwaps();
}

function saveAndExit() {
  document.getElementById('wo-exit-panel').classList.remove('open');
  finishWorkout();
}

// ── Finish & calorie calc ─────────────────────────────────

function finishWorkout() {
  if(wo.totalInterval) { clearInterval(wo.totalInterval); wo.totalInterval=null; }
  if(wo.restInterval)  { clearInterval(wo.restInterval);  wo.restInterval=null; }
  document.getElementById('workout-overlay').style.display = 'none';
  releaseWorkoutWakeLock();
  // NOTE: body.overflow stays 'hidden' here — the post-workout modal is about to open
  // and needs the background locked. It is released in closePostWorkout() instead.

  const durationSecs = wo.totalSecs;
  const durationMins = durationSecs / 60;

  // collect stats
  const logEntries = Object.values(wo.log);
  const setsCount  = logEntries.length;
  let totalVolume  = 0;
  logEntries.forEach(e => { totalVolume += (e.weight||0) * (e.reps||0); });

  // calorie calculation
  const calData = calcWorkoutCalories(durationMins, setsCount);

  // format duration
  const mm = String(Math.floor(durationSecs/60)).padStart(2,'0');
  const ss = String(durationSecs%60).padStart(2,'0');

  // fill post-workout modal
  document.getElementById('pw-duration').textContent = mm+':'+ss;
  document.getElementById('pw-cals').textContent     = calData.total;
  document.getElementById('pw-sets').textContent     = setsCount;
  document.getElementById('pw-volume').textContent   = Math.round(totalVolume);
  document.getElementById('pw-breakdown').innerHTML  = calData.breakdown;
  document.getElementById('pw-notes').value          = '';

  const lastGuided = [...sessions].reverse().find(s => !s.quick && s.volumeKg > 0);
  const volDelta = lastGuided && totalVolume > 0 ? Math.round((totalVolume - lastGuided.volumeKg) / lastGuided.volumeKg * 100) : null;
  document.getElementById('pw-prs').innerHTML =
    renderSessionPRs(findSessionPRs({ exercises: wo.log })) +
    (volDelta !== null ? `<div style="font-size:12px;color:var(--muted);text-align:center;margin-bottom:12px">Volume vs last workout (${escapeHtml(lastGuided.date)}): <strong style="color:${volDelta >= 0 ? 'var(--green)' : 'var(--yellow)'}">${volDelta >= 0 ? '+' : ''}${volDelta}%</strong></div>` : '');

  wo.finishedData = { durationSecs, setsCount, totalVolume, calData, durationMins };
  document.getElementById('postworkout-modal').classList.add('open');
}

// ── Calorie Algorithm ─────────────────────────────────────
function calcWorkoutCalories(durationMins, setsCompleted) {
  const { height, age, gender, activity, weightKg: setupWeight } = wo.setup;

  // ── Weight resolution (3-tier priority) ──────────────────
  // 1. Weight entered in pre-workout form this session
  // 2. Today's entry in the Progress weight log
  // 3. Estimate from height using healthy BMI reference
  let weightKg, weightSource;

  // Find the most recent weight log entry (any date, not just today).
  // The previous code used weights.find(w => w.date === getLocalDateStr()) which
  // ignored all historically logged weights and fell back to a BMI estimate the
  // moment the user skipped logging weight on workout day.
  const latestW = weights.length
    ? weights.reduce((best, w) => (!best || w.date > best.date) ? w : best, null)
    : null;

  if(setupWeight) {
    weightKg     = setupWeight;
    weightSource = `${weightKg} kg (entered today)`;
  } else if(latestW) {
    weightKg     = latestW.val;
    const isToday  = latestW.date === getLocalDateStr();
    const daysAgo  = Math.round((parseLocalDate(getLocalDateStr()).getTime() - parseLocalDate(latestW.date).getTime()) / 86400000);
    const ageLabel = isToday ? 'today' : `${daysAgo}d ago`;
    weightSource   = `${weightKg} kg (from Progress log — logged ${ageLabel})`;
  } else {
    // Healthy BMI estimate: male → 22.5, female → 21.0
    const bmiRef = (gender === 'male') ? 22.5 : 21.0;
    weightKg     = Math.round(bmiRef * Math.pow(height / 100, 2) * 10) / 10;
    weightSource = `~${weightKg} kg (estimated from height — enter weight for accuracy)`;
  }

  // ── Mifflin–St Jeor BMR ───────────────────────────────────
  let bmr = (10 * weightKg) + (6.25 * height) - (5 * age);
  bmr += (gender === 'male') ? 5 : -161;

  // ── TDEE ─────────────────────────────────────────────────
  const actMap  = { sedentary:1.2, light:1.375, moderate:1.55, active:1.725, veryActive:1.9 };
  const actLabel= { sedentary:'Sedentary', light:'Light', moderate:'Moderate',
                    active:'Active', veryActive:'Very Active' };
  const tdee    = bmr * (actMap[activity] || 1.55);

  // ── MET (scales 3.5–6.5 by completion %) ─────────────────
  const completionPct = setsCompleted / computeWoFlat().length;
  let met = 3.5;
  if     (completionPct >= 0.8)  met = 6.5;
  else if(completionPct >= 0.5)  met = 5.5;
  else if(completionPct >= 0.25) met = 4.5;

  // ── Gross & net calories ──────────────────────────────────
  const grossCals   = met * weightKg * (durationMins / 60);
  const restingCals = (bmr / 1440) * durationMins;
  const netCals     = Math.max(0, grossCals - restingCals);

  // ── Volume load bonus (capped +15%) ──────────────────────
  const totalVol  = Object.values(wo.log)
                      .reduce((s,e) => s + (e.weight||0) * (e.reps||0), 0);
  const volBonus  = Math.min(0.15, (totalVol / 100000) * 0.5);
  const finalCals = Math.round(grossCals * (1 + volBonus));

  // ── Breakdown panel ──────────────────────────────────────
  const weightWarning = !setupWeight && !latestW
    ? `<br><span style="color:var(--yellow)">⚠️ Weight estimated from height — add your weight next time for a better reading.</span>`
    : '';

  // ── TDEE double-dipping note ──────────────────────────────
  // TDEE already includes workout calories via the activity multiplier.
  // "Net above rest" should only be added to a SEDENTARY baseline, not to an active TDEE.
  const tdeeNote = activity !== 'sedentary'
    ? `<br><span style="color:var(--muted);font-size:11px">ℹ️ Your TDEE already accounts for exercise (${actLabel[activity]||activity} multiplier). Add net calories only to a <em>sedentary</em> baseline (~${Math.round(bmr*1.2)} cal) — not to TDEE — or you'll double-count workout calories.</span>`
    : '';

  const breakdown = `
    <strong>Weight:</strong> ${weightSource}<br>
    <strong>Height / Age / Gender:</strong> ${height} cm · ${age} yrs · ${gender}<br>
    <strong>Activity level:</strong> ${actLabel[activity]||activity}<br>
    <strong>BMR:</strong> ${Math.round(bmr)} cal/day &nbsp;·&nbsp;
    <strong>TDEE:</strong> ${Math.round(tdee)} cal/day<br>
    <strong>MET:</strong> ${met} &nbsp;(${Math.round(completionPct*100)}% of workout done)<br>
    <strong>Gross burn:</strong> ${Math.round(grossCals)} cal &nbsp;·&nbsp;
    <strong>Net above rest:</strong> ${Math.round(netCals)} cal<br>
    <strong>Volume load:</strong> ${Math.round(totalVol)} kg &nbsp;·&nbsp;
    <strong>Volume bonus:</strong> +${Math.round(volBonus*100)}%
    ${tdeeNote}${weightWarning}`;

  return { total:finalCals, net:Math.round(netCals),
           bmr:Math.round(bmr), tdee:Math.round(tdee), breakdown };
}

// ── Save / discard ────────────────────────────────────────
function discardWorkout() {
  // A guided session represents 55-70 min of effort — require explicit confirmation
  // before discarding, consistent with deletePR / deleteWeight / clearHistory.
  if(!confirm('Discard this workout? Your sets, volume, and calorie data will not be saved.')) return;
  closePostWorkout();
}

function closePostWorkout() {
  document.getElementById('postworkout-modal').classList.remove('open');
  document.body.style.overflow = '';   // ← restore scroll now that ALL overlays are gone
  wo.active = false;
  endSessionSwaps();
}

function endSessionSwaps() {
  if(!Object.keys(sessionSwaps).length) return;
  clearSessionSwaps();
  refreshRoutineViews();
}

// close log modal on backdrop click (was missing — pre/post workout had this but #modal did not)
document.getElementById('modal').addEventListener('click', e => {
  if(e.target===document.getElementById('modal')) closeModal();
});

// close pre-workout on backdrop click
document.getElementById('preworkout-modal').addEventListener('click', e => {
  if(e.target===document.getElementById('preworkout-modal')) closePreWorkout();
});

// close post-workout on backdrop click
document.getElementById('postworkout-modal').addEventListener('click', e => {
  if(e.target===document.getElementById('postworkout-modal')) closePostWorkout();
});

document.getElementById('recovery-modal').addEventListener('click', e => {
  if(e.target===document.getElementById('recovery-modal')) closeRecoveryModal();
});

// ── Escape key closes the topmost open modal/overlay ────────────────
document.addEventListener('keydown', e => {
  if(e.key !== 'Escape') return;
  // Priority order: exit panel → workout overlay → post-workout → pre-workout → recovery modal → log modal
  const exitPanel = document.getElementById('wo-exit-panel');
  if(exitPanel && exitPanel.classList.contains('open')) { toggleExitPanel(); return; }
  const woOverlay = document.getElementById('workout-overlay');
  if(woOverlay && woOverlay.style.display === 'block') { toggleExitPanel(); return; }
  const postModal = document.getElementById('postworkout-modal');
  if(postModal && postModal.classList.contains('open')) { closePostWorkout(); return; }
  const preModal = document.getElementById('preworkout-modal');
  if(preModal && preModal.classList.contains('open')) { closePreWorkout(); return; }
  const recoveryModal = document.getElementById('recovery-modal');
  if(recoveryModal && recoveryModal.classList.contains('open')) { closeRecoveryModal(); return; }
  const logModal = document.getElementById('modal');
  if(logModal && logModal.classList.contains('open')) { closeModal(); return; }
});

// ── Total calories burned across all sessions (Progress page) ──
function totalCalsBurned() {
  return sessions.reduce((sum, s) => sum + (s.caloriesBurned||0), 0);
}

// ── Auto-detect PRs from workout log entries ──────────────────
function autoDetectPRs() {
  Object.values(wo.log).forEach(entry => {
    if(!entry.weight || !entry.reps || !entry.exName) return;
    // Normalise to the same key used by the manual PR form (EXERCISES display names)
    const exKey = PR_KEY_MAP[entry.exName] || entry.exName;
    if(!prs[exKey] || entry.weight > prs[exKey].weight) {
      prs[exKey] = { weight: entry.weight, date: getLocalDateStr() };
    }
  });
  save('fitdash_prs', prs);
}

// ── Save / discard ────────────────────────────────────────
// saveWorkoutSummary auto-detects PRs then persists the session.
function saveWorkoutSummary() {
  autoDetectPRs();
  const notes = document.getElementById('pw-notes').value;
  const fd    = wo.finishedData;
  if(!fd) { closePostWorkout(); return; }
  const session = {
    date          : getLocalDateStr(),   // toISOString() was UTC — wrong day for UTC+6 morning sessions
    notes,
    durationSecs  : fd.durationSecs,
    caloriesBurned: fd.calData.total,
    setsCompleted : fd.setsCount,
    volumeKg      : Math.round(fd.totalVolume),
    exercises     : wo.log,
    id            : Date.now()
  };
  sessions.push(session);
  save('fitdash_sessions', sessions);
  closePostWorkout();
  renderDashboard();
  renderTrainingHistory();
  if(document.getElementById('page-progress').classList.contains('active')) renderProgress();
}

// ── Weight chart resize handler ───────────────────────────────
// CSS forces canvas { width:100%!important }, so the element stretches to fill
// its container on any window resize or orientation change — but the canvas's
// internal resolution (canvas.width / canvas.height) is only set inside
// renderWeightChart(). Without a resize listener the bitmap stays stale and
// the chart looks blurry/stretched until the user navigates away and back.
let _chartResizeTimer = null;
window.addEventListener('resize', () => {
  clearTimeout(_chartResizeTimer);
  _chartResizeTimer = setTimeout(() => {
    if(document.getElementById('page-progress').classList.contains('active')) {
      renderWeightChart();
      renderCircChart();
      renderPRVolumeChart();
    }
  }, 150);   // 150 ms debounce — fast enough to feel instant, avoids mid-drag thrashing
});

// ── One-time event listener init ────────────────────────────
// Attaching this inside openPreWorkout() would add a new copy every time the
// modal opens. Attached once here instead so updateWeightNote() is never called
// more than once per keystroke regardless of how many times the modal has opened.
document.getElementById('setup-weight').addEventListener('input', updateWeightNote);

// ── Level switcher ────────────────────────────────────────
function switchLevel(level) {
  trainingLevel = level;
  save('fitdash_level', level); // use save() for consistent QuotaExceededError handling
  rememberRoutineLevel(level);
  renderRoutinePickers();

  // update button states
  ['beginner','amateur','master'].forEach(l => {
    const btn = document.getElementById('lvl-btn-' + l);
    if(btn) btn.classList.toggle('active', l === level);
  });

  const cfg = LEVEL_CONFIG[level];

  // update meta pills
  const ms = document.getElementById('tmeta-sessions');
  const md = document.getElementById('tmeta-duration');
  const mt = document.getElementById('tmeta-sets');
  if(ms) ms.textContent = `📅 ${cfg.sessionsPerWeek} per week`;
  if(md) md.textContent = `⏱ ${cfg.duration}`;
  if(mt) mt.textContent = `🔋 ${cfg.setsLabel}`;

  // update set legend
  const legend = document.getElementById('set-legend-static');
  if(legend) legend.innerHTML = cfg.legendHTML;

  // Render the blocks dynamically based on the plan
  renderTrainingBlocks(cfg);
}

function renderTrainingBlocks(cfg) {
  const container = document.getElementById('training-blocks-container');
  if(!container) return;
  
  const plan = getFullWorkoutPlan();
  let html = '';
  
  plan.forEach(block => {
    if(!block.exercises.length && block.id !== '🛠️') return; // every slot skipped (e.g. a 15-min Express routine)
    const isCircuit = block.id === 'C' || block.type === 'Circuit'; // Treat block C and 'Circuit' custom blocks as circuits
    let tagClass = 'tag-blue';
    if(block.id === 'B' || block.type === 'Giant Set') tagClass = 'tag-red';
    else if(block.id === 'C' || block.type === 'Circuit') tagClass = 'tag-green';
    if(block.id === '🛠️') tagClass = 'tag-orange';
    
    html += `
  <div class="block-card">
    <div class="block-header">
      <div class="block-num">${block.id}</div>
      <div class="block-title">
        <div class="block-name">${escapeHtml(block.name)}</div>
        <div class="block-sub">${escapeHtml(block.info)}</div>
      </div>
      <span class="block-type-badge tag ${tagClass}">${escapeHtml(block.type)}</span>
    </div>
    <div class="block-body">
      <div class="exercises-list">
        ${block.exercises.map(ex => `
          <div class="exercise-item" style="display:flex;justify-content:space-between;align-items:center;padding:8px 0;border-bottom:1px solid var(--border);">
            <div style="display:flex;align-items:center;gap:8px;flex:1;">
              <span class="ex-code" ${ex._isCustom ? 'style="background:var(--green)"' : ''}>${ex.code}</span>
              <div style="min-width:0">
                <span class="ex-name">${escapeHtml(ex.name)}</span>
                ${ex._swappedFrom ? `<div class="ex-swapped-note">${ex._autoAdapted ? '↻ adapted to your gear · ' : '⇄ '}instead of ${escapeHtml(ex._swappedFrom)}</div>` : ''}
                ${ex._missingGear ? `<div class="ex-swapped-note" style="color:var(--orange)">⚠ needs ${escapeHtml(ex._missingGear)} — tap ⇄ Swap</div>` : ''}
                ${renderNextSetHint(ex.name, cfg)}
              </div>
            </div>
            <div class="ex-actions">
              <button class="form-chip-btn" onclick="openFormGuideByCode(this.dataset.code)" data-code="${escapeHtml(ex.code)}" aria-label="Form and muscles for ${escapeHtml(ex.name)}">${formTargetIcon()} Form &amp; Muscles</button>
              <button class="btn-ghost" style="padding:4px 8px;font-size:12px;border:1px solid var(--border);color:${isFavoriteExercise(ex.name) ? 'var(--yellow)' : 'var(--muted)'}" onclick="toggleFavoriteExercise(this.dataset.ex)" data-ex="${escapeHtml(ex.name)}" title="Pin to dashboard Quick Log" aria-label="Pin ${escapeHtml(ex.name)} to Quick Log">${isFavoriteExercise(ex.name) ? '★' : '☆'}</button>
              ${ex._isCustom ? '' : `<button class="btn-ghost" style="padding:4px 8px;font-size:12px;color:var(--text);border:1px solid var(--border);" onclick="openSwapModal('${ex.code}')" title="Swap for an alternative (e.g. equipment unavailable)" aria-label="Swap ${escapeHtml(ex.name)}">🔁 Swap</button>`}
              <button class="btn-ghost" style="padding:4px 8px;font-size:12px;color:var(--text);border:1px solid var(--border);" onclick="promptMoveExercise('${ex.code}')">⇄ Move</button>
              ${ex._isCustom && block.id === '🛠️' ? `<button class="btn-ghost" style="padding:4px 8px;font-size:12px;color:var(--red);border:1px solid var(--border);" onclick="deleteCustomExercise(${ex._id})">✕</button>` : ''}
            </div>
          </div>
        `).join('')}
      </div>
      ${block.id === '🛠️' ? `<button class="btn-secondary" style="margin-top:12px;width:100%" onclick="showPage('settings')">+ Create Unique Exercise</button>` : ''}
      <div class="sets-grid" id="sets-grid-${block.id}">${cfg.gridHTML(isCircuit)}</div>
      <div class="rest-note" id="rest-note-${block.id}">${cfg.note(block.id)}</div>
    </div>
  </div>`;
  });
  
  container.innerHTML = html;
}

// ── Init routine, training category and level on page load ─
migrateLegacyTemplates();
activateRoutine(activeRoutineId);

// Populate training history on startup — without this, the Training tab
// shows an empty history list until the user navigates away and back,
// because showPage('training') is the only other caller of renderTrainingHistory().
renderTrainingHistory();

// ══ CUSTOM EXERCISES ════════════════════════════════════════

function saveCustomExercise() {
  const name = document.getElementById('cx-name').value.trim();
  const muscle = document.getElementById('cx-muscle').value.trim();
  const tips = document.getElementById('cx-tips').value.trim();
  const block = document.getElementById('cx-block').value;
  
  if(!name || !muscle || !tips) { alert('Name, Muscle, and Tips are required.'); return; }
  
  // Auto-generate code
  let targetBlock = block;
  if(block === 'NEW') {
    const existingBlocks = new Set(['A','B','C', ...customExercises.map(cx => cx.block)]);
    let nextChar = 'D';
    while(existingBlocks.has(nextChar)) nextChar = String.fromCharCode(nextChar.charCodeAt(0) + 1);
    targetBlock = nextChar;
  }
  
  const existingInBlock = customExercises.filter(cx => cx.block === targetBlock);
  const baseCount = (targetBlock === 'A' ? 2 : targetBlock === 'B' ? 3 : targetBlock === 'C' ? 6 : 0);
  const exCode = targetBlock + (baseCount + existingInBlock.length + 1);
  
  const cx = { id: Date.now(), code: exCode, name, muscle, tips, block: targetBlock };
  customExercises.push(cx);
  save('fitdash_custom_ex', customExercises);
  _cachedFullPlanDeps = '';
  if (document.getElementById('training-blocks-container')) renderTrainingBlocks(LEVEL_CONFIG[trainingLevel]);
}

function deleteCustomExercise(id) {
  const exIndex = customExercises.findIndex(cx => cx.id === id);
  if (exIndex === -1) return;
  const deletedEx = customExercises.splice(exIndex, 1)[0];
  save('fitdash_custom_ex', customExercises);
  _cachedFullPlanDeps = '';
  renderCustomExercises();
  if (document.getElementById('training-blocks-container')) renderTrainingBlocks(LEVEL_CONFIG[trainingLevel]);
  showUndoToast('Deleted ' + deletedEx.name, () => {
    customExercises.splice(exIndex, 0, deletedEx);
    save('fitdash_custom_ex', customExercises);
    _cachedFullPlanDeps = '';
    renderCustomExercises();
    if (document.getElementById('training-blocks-container')) renderTrainingBlocks(LEVEL_CONFIG[trainingLevel]);
  });
}

function renderCustomExercises() {
  const el = document.getElementById('custom-exercises-list');
  if(!el) return;
  const query = (document.getElementById('custom-exercise-search')?.value || '').trim().toLowerCase();
  const visibleExercises = customExercises.filter(cx => !query || `${cx.name} ${cx.muscle} ${cx.block}`.toLowerCase().includes(query));
  if(!visibleExercises.length) {
    el.innerHTML = '<div style="font-size:13px;color:var(--muted);margin-bottom:12px">No custom exercises added yet.</div>';
    return;
  }
  el.innerHTML = visibleExercises.map(cx => `
    <div style="background:var(--card2);border-radius:6px;padding:12px;margin-bottom:8px;display:flex;justify-content:space-between;align-items:center">
      <div>
        <div style="display:flex;align-items:center;gap:8px">
          <span class="ex-code" style="background:var(--blue)">${cx.code}</span>
          <span style="font-size:14px;font-weight:700">${escapeHtml(cx.name)}</span>
          <span class="tag tag-blue" style="font-size:9px">Block ${cx.block}</span>
        </div>
        <div style="font-size:12px;color:var(--muted);margin-top:4px">${escapeHtml(cx.muscle)}</div>
      </div>
      <div style="display:flex;gap:6px;align-items:center"><button class="form-chip-btn" onclick="openFormGuideByCode('${escapeHtml(cx.code)}')">${formTargetIcon()} Form</button><button class="del-btn" onclick="deleteCustomExercise(${cx.id})">×</button></div>
    </div>
  `).join('');
}

// ══ CARDIO ═══════════════════════════════════════════════════
function getWeekKey() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);                        // normalise to midnight — without this,
                                                  // (d - jan1)/86400000 is fractional and
                                                  // Math.ceil rolls the week 24 hrs early
  const jan1 = new Date(d.getFullYear(), 0, 1);
  return d.getFullYear() + '-W' + Math.ceil(((d - jan1) / 86400000 + jan1.getDay() + 1) / 7);
}

function addCardio() {
  const result = readCardioForm();
  if(result.error) { alert(result.error); return; }
  const entry = result.entry;
  if(entry.type !== 'quick') {
    cardioLog.unshift(entry);
    cardioLog = cardioLog.slice(0, CARDIO_LOG_LIMIT);
    save('fitdash_cardio_log', cardioLog);
  }
  addCardioMinutes(entry.mins);
  ['cardio-add','cardio-speed','cardio-incline','cardio-level','cardio-run-time'].forEach(id => { const el = document.getElementById(id); if(el) el.value = ''; });
  if(entry.type !== 'run') { const d = document.getElementById('cardio-distance'); if(d) d.value = ''; }
  updateCardioPreview();
}

function addCardioMinutes(mins) {
  if(!(mins > 0)) return false;
  const wk = getWeekKey();
  if(lastCardioReset !== wk) { cardioMins=0; lastCardioReset=wk; }
  cardioMins += mins;
  save('fitdash_cardio', cardioMins);
  save('fitdash_cardio_week', lastCardioReset);
  renderCardio();
  return true;
}

function resetCardio() {
  cardioMins = 0;
  lastCardioReset = getWeekKey();          // sync week key so auto-reset logic stays consistent
  save('fitdash_cardio', 0);
  save('fitdash_cardio_week', lastCardioReset);
  renderCardio();
}

function renderCardio() {
  // ── Week-reset check (was only in addCardio before this fix) ──────────────
  // If the user opens the dashboard in a new week without logging cardio,
  // the UI must still clear last week's minutes automatically.
  const wk = getWeekKey();
  if (lastCardioReset !== wk) {
    cardioMins      = 0;
    lastCardioReset = wk;
    save('fitdash_cardio',      0);
    save('fitdash_cardio_week', lastCardioReset);
  }
  const target = userProfile.cardioFocus === 'cardio' ? 300 : 150;
  const pct = Math.min(100, Math.round(cardioMins / target * 100));
  document.getElementById('cardio-fill').style.width = pct + '%';
  document.getElementById('cardio-done-label').textContent = cardioMins + ' min done';
  const goalLabel = document.getElementById('cardio-goal-label');
  if(goalLabel) goalLabel.textContent = target + ' min goal';
  renderCardioRecent();
  if(typeof renderQuickLog === 'function') renderQuickLog();
}

function renderTrainingReminder() {
  const el = document.getElementById('training-reminder');
  if(!el) return;
  const day = new Date().getDay();
  const scheduled = (userProfile.schedule || [0,1,2,3,4,5,6]).includes(day);
  if(!scheduled) {
    el.innerHTML = '<div style="font-size:12px;color:var(--muted);text-align:center">Rest or active recovery day. Adjust your weekly schedule in Settings.</div>';
    return;
  }
  const hasReminders = typeof workoutTimeFor === 'function';
  const planned = hasReminders ? scheduledRoutineFor(day) : null;
  const reminder = hasReminders && reminderPrefs.enabled && reminderPrefs.workout.on
    ? `Reminder at ${escapeHtml(workoutTimeFor(day))}.`
    : 'Turn on workout reminders in Settings → Reminders.';
  el.innerHTML = `<div class="card" style="padding:12px 16px;border-color:var(--red)"><strong>Today is a training day${planned ? ` · ${escapeHtml(planned.name)}` : ''}.</strong> ${reminder} Warm up, train with control, and follow your selected routine.</div>`;
}

// ══ PR TRACKER ════════════════════════════════════════════════
function savePR() {
  const ex = document.getElementById('pr-exercise').value.trim();
  const wt = parseFloat(document.getElementById('pr-weight').value);
  if(!ex) {
    alert('Please enter an exercise name.');
    return;
  }
  if(isNaN(wt) || wt <= 0) {
    alert('Please enter a valid weight greater than 0 kg.');
    return;
  }
  // Require strictly higher weight — equal weight doesn't set a new personal record.
  // The previous condition (wt < prs[ex].weight) let equal weight through, updating
  // the PR date silently even though the user tied rather than beat their record.
  if(prs[ex] && wt <= prs[ex].weight) {
    alert(`Your current PR for "${ex}" is ${prs[ex].weight} kg — enter a higher weight to update it.`);
    return;
  }
  prs[ex] = { weight:wt, date:getLocalDateStr() };
  save('fitdash_prs', prs);
  document.getElementById('pr-exercise').value = '';
  document.getElementById('pr-weight').value   = '';
  renderProgress();
}

function deletePR(key) {
  if(!confirm(`Delete PR for "${key}"?`)) return;
  delete prs[key];
  save('fitdash_prs', prs);
  renderPRs();
}

function clearPRHistory() {
  if(!confirm('Clear all Personal Records? This cannot be undone.')) return;
  prs = {};
  save('fitdash_prs', prs);
  renderPRs();
}

function renderPRs() {
  const el = document.getElementById('pr-grid');
  const keys = Object.keys(prs);
  if(!keys.length) {
    el.innerHTML = '<div class="empty-state" style="grid-column:1/-1"><div class="empty-icon">🏆</div><p>No PRs logged yet.<br>Set your first personal record!</p></div>';
    return;
  }
  // Use btoa() to encode exercise names as data attributes — avoids inline onclick breakage
  // from special characters (apostrophes, backticks, quotes) in exercise names.
  el.innerHTML = keys.map(k => `
    <div class="pr-card" style="position:relative" data-pr-key="${btoa(unescape(encodeURIComponent(k)))}">
      <button class="pr-delete-btn del-btn del-btn-sm"
        title="Delete this PR"
        style="position:absolute;top:8px;right:8px">×</button>
      <div class="pr-exname" style="padding-right:22px">${k}</div>
      <div class="pr-value">${prs[k].weight} kg</div>
      <div class="pr-date">${prs[k].date}</div>
    </div>`).join('');

  // Delegated handler assigned via .onclick (not addEventListener) so repeated
  // renderPRs() calls overwrite the previous handler instead of stacking a new
  // copy on top. addEventListener accumulates — after 10 renders, one click
  // would fire 10 confirm() dialogs in sequence.
  el.onclick = e => {
    if(e.target.classList.contains('pr-delete-btn')) {
      const card = e.target.closest('[data-pr-key]');
      if(!card) return;
      const key = decodeURIComponent(escape(atob(card.dataset.prKey)));
      deletePR(key);
    }
  };
}

/**
 * Return the number of sets in a session.
 * Guided sessions store setsCompleted directly.
 * Manual sessions store exercises → { set1, set2, set3 } objects, so we must
 * sum the filled-in set values — not just count the exercise keys.
 */
function countSets(s) {
  if(s.setsCompleted) return s.setsCompleted;
  // Manual sessions: exercises = { "Goblet Squat (A1)": { set1: "50x10", set2: "60x8" }, ... }
  // Guided sessions: exercises = { "A-A1-0": { weight, reps, exName, setLabel }, ... }
  const exValues = Object.values(s.exercises || {});
  if(!exValues.length) return 0;
  // If the first value is an object with 'weight' key, it's a guided log — each key = 1 set
  if(exValues[0] && typeof exValues[0] === 'object' && 'weight' in exValues[0]) {
    return exValues.length;
  }
  // Manual: sum the number of set entries per exercise
  return exValues.reduce((total, sets) => total + Object.keys(sets).length, 0);
}

// ══ SESSION LOG ════════════════════════════════════════════════
function openLogModal() {
  const today = getLocalDateStr();   // toISOString() was UTC — wrong calendar day for UTC+6 mornings
  document.getElementById('log-date').value = today;
  const el = document.getElementById('log-exercises');
  const numSets = getSetConfig().length;
  el.innerHTML = EXERCISES.map(ex => `
    <div style="margin-bottom:10px">
      <div style="font-size:12px;font-weight:600;color:var(--muted);margin-bottom:6px">${ex}</div>
      <div class="exercise-log-row" style="grid-template-columns:${`repeat(${numSets},1fr)`}">
        ${Array.from({length: numSets}, (_, i) => `<input placeholder="Set ${i+1} wt×reps" style="background:var(--card);border:1px solid var(--border);color:var(--text);border-radius:var(--radius-sm);padding:8px 10px;font-size:13px;outline:none" data-ex="${ex}" data-set="${i+1}">`).join('\n        ')}
      </div>
    </div>`).join('');
  document.getElementById('modal').classList.add('open');
  document.body.style.overflow = 'hidden';   // ← prevent background scroll
}

function closeModal() {
  document.getElementById('modal').classList.remove('open');
  document.body.style.overflow = '';          // ← restore scroll
}

/**
 * Extract the leading weight number from a manual set string.
 * Handles common user formats: "100x10", "80 × 12", "100", "80kg×10".
 * Returns null if no leading number is found.
 */
function parseWeightFromSetStr(str) {
  const m = String(str).match(/^(\d+(?:\.\d+)?)/);
  return m ? parseFloat(m[1]) : null;
}

/**
 * Auto-detect PRs from a manually logged session.
 * autoDetectPRs() only runs inside guided workout completion (saveWorkoutSummary).
 * Manual sessions were silently ignored — a PR logged manually was never recorded.
 * This function mirrors that logic for the free-text set strings in manual logs.
 */
function detectManualSessionPRs(exercises) {
  let changed = false;
  Object.entries(exercises).forEach(([exName, sets]) => {
    Object.values(sets).forEach(setStr => {
      const w = parseWeightFromSetStr(setStr);
      if(!w) return;
      if(!prs[exName] || w > prs[exName].weight) {
        prs[exName] = { weight: w, date: getLocalDateStr() };
        changed = true;
      }
    });
  });
  if(changed) save('fitdash_prs', prs);
}

function saveSession() {
  const date = document.getElementById('log-date').value;
  const notes = document.getElementById('log-notes').value;
  const exData = {};
  document.querySelectorAll('#log-exercises input').forEach(inp => {
    if(!inp.value.trim()) return;
    const ex = inp.dataset.ex;
    if(!exData[ex]) exData[ex] = {};
    exData[ex]['set'+inp.dataset.set] = inp.value.trim();
  });
  if(!Object.keys(exData).length && !notes.trim()) {
    alert('Please log at least one set or add a session note before saving.');
    return;
  }
  const session = { date, notes, exercises: exData, id: Date.now() };
  sessions.push(session);
  save('fitdash_sessions', sessions);
  detectManualSessionPRs(exData);
  document.getElementById('log-notes').value = '';
  closeModal();
  renderDashboard();
  renderTrainingHistory();
  if(document.getElementById('page-progress').classList.contains('active')) renderProgress();
}

function deleteSession(id) {
  if(!confirm('Delete this workout session?')) return;
  sessions = sessions.filter(s => s.id !== id);
  save('fitdash_sessions', sessions);
  renderDashboard();
  renderTrainingHistory();
  if(document.getElementById('page-progress').classList.contains('active')) renderProgress();
}

function renderTrainingHistory() {
  const el = document.getElementById('training-history');
  if(!el) return;
  const last5 = sessions.slice(-5).reverse();
  if(!last5.length) {
    el.innerHTML = '<div class="empty-state"><div class="empty-icon">📋</div><p>No sessions yet. Log your first workout!</p></div>';
    return;
  }
  el.innerHTML = last5.map(s => {
    const d        = parseLocalDate(s.date);
    const durLabel = s.durationSecs
      ? `⏱ ${String(Math.floor(s.durationSecs/60)).padStart(2,'0')}:${String(s.durationSecs%60).padStart(2,'0')}`
      : '';
    const calLabel = s.caloriesBurned ? `🔥 ${s.caloriesBurned} cal` : '';
    const volLabel = s.volumeKg       ? `📦 ${s.volumeKg} kg vol`    : `${countSets(s)} sets logged`;
    const chips    = [durLabel, calLabel, volLabel].filter(Boolean).join(' · ');
    return `<div class="history-item">
      <div class="history-date">
        <div class="history-day">${d.toLocaleDateString('en-US',{weekday:'short'})}</div>
        <div class="history-dd">${d.getDate()}</div>
      </div>
      <div class="history-body" style="flex:1">
        <div class="history-title">Full Body Session</div>
        <div class="history-detail" style="color:var(--muted2)">${chips}</div>
        ${s.notes?`<div class="history-detail" style="margin-top:3px;color:var(--muted)">${escapeHtml(s.notes.slice(0,70))}</div>`:''}
      </div>
      <button onclick="openShareCardForSession(${s.id})" title="Share workout card" aria-label="Share workout card" class="hist-share-btn">📤</button>
      <button onclick="deleteSession(${s.id})" title="Delete session" class="del-btn del-btn-md">×</button>
    </div>`;
  }).join('');
}







// ══ SCREEN WAKE LOCK ══════════════════════════════════════════
// Keeps the phone screen on during an active workout (Chrome/Android, Safari 16.4+).
let workoutWakeLock = null;
async function requestWorkoutWakeLock() {
  if(!('wakeLock' in navigator) || !wo.active || workoutWakeLock) return;
  try {
    const lock = await navigator.wakeLock.request('screen');
    if(!wo.active) { lock.release().catch(() => {}); return; }
    workoutWakeLock = lock;
    lock.addEventListener('release', () => { if(workoutWakeLock === lock) workoutWakeLock = null; });
  } catch(_) { workoutWakeLock = null; }  // denied (battery saver / not visible) — non-fatal
}
function releaseWorkoutWakeLock() {
  const lock = workoutWakeLock;
  workoutWakeLock = null;
  if(lock) lock.release().catch(() => {});
}
// The browser drops the lock when the tab is hidden; re-acquire it on return.
document.addEventListener('visibilitychange', () => {
  if(document.visibilityState === 'visible' && wo.active
     && document.getElementById('workout-overlay').style.display === 'block') requestWorkoutWakeLock();
});

// ══ STRUCTURED CARDIO ═════════════════════════════════════════
// fitdash_cardio stays the weekly minute total; fitdash_cardio_log adds per-session detail.
const CARDIO_LOG_LIMIT = 100;
const CARDIO_TYPES = {
  quick:     { icon:'⏱', label:'Cardio' },
  treadmill: { icon:'🚶', label:'Incline Treadmill' },
  cycle:     { icon:'🚴', label:'Stationary Cycle' },
  run:       { icon:'🏃', label:'Road Run' },
};
let cardioLog = safeLoad('fitdash_cardio_log', []);
if(!Array.isArray(cardioLog)) cardioLog = [];

// "28:30" → 1710 s, "1:02:30" → 3750 s, "28" → 28 min.
function parseDurationInput(text) {
  const t = String(text || '').trim();
  if(!t) return NaN;
  if(!t.includes(':')) { const m = Number(t); return Number.isFinite(m) && m > 0 ? Math.round(m * 60) : NaN; }
  const parts = t.split(':').map(Number);
  if(parts.length > 3 || parts.some(n => !Number.isFinite(n) || n < 0)) return NaN;
  if(parts.slice(1).some(n => n >= 60)) return NaN;
  return parts.reduce((acc, n) => acc * 60 + n, 0) || NaN;
}
function formatClock(totalSecs) {
  const secs = Math.round(totalSecs);
  const h = Math.floor(secs / 3600), m = Math.floor((secs % 3600) / 60), sec = secs % 60;
  const pad = n => String(n).padStart(2, '0');
  return h ? `${h}:${pad(m)}:${pad(sec)}` : `${m}:${pad(sec)}`;
}
function formatPace(secPerKm) {
  return Number.isFinite(secPerKm) && secPerKm > 0 ? `${formatClock(secPerKm)} /km` : '—';
}

function cardioFormType() {
  const el = document.getElementById('cardio-type');
  return el && CARDIO_TYPES[el.value] ? el.value : 'quick';
}
function onCardioTypeChange() {
  const type = cardioFormType();
  document.getElementById('cardio-log-form').dataset.type = type;
  if(type === 'run') onCardioRunPresetChange();
  updateCardioPreview();
}
function onCardioRunPresetChange() {
  const preset = document.getElementById('cardio-run-preset').value;
  const dist = document.getElementById('cardio-distance');
  if(preset !== 'custom') dist.value = preset;
  else if(['5','10'].includes(dist.value)) dist.value = '';
  updateCardioPreview();
}

function readCardioForm() {
  const type = cardioFormType();
  const num = id => { const el = document.getElementById(id); return el && el.value !== '' ? Number(el.value) : NaN; };
  const entry = { id: Date.now(), date: getLocalDateStr(), type };
  if(type === 'run') {
    const km = num('cardio-distance');
    const secs = parseDurationInput(document.getElementById('cardio-run-time').value);
    if(!(km > 0) || km > 200) return { error: 'Enter your run distance in km (e.g. 5).' };
    if(!(secs > 0)) return { error: 'Enter your run time as mm:ss (e.g. 28:30) or h:mm:ss.' };
    if(secs > 300 * 60) return { error: 'Please enter a realistic run time (up to 5 hours).' };
    Object.assign(entry, { distanceKm: Math.round(km * 100) / 100, durationSecs: secs, paceSecPerKm: Math.round(secs / km) });
    entry.mins = Math.max(1, Math.round(secs / 60));
    return { entry };
  }
  const mins = num('cardio-add');
  // Number() rejects "10abc" that parseInt would accept as 10
  if(!Number.isFinite(mins) || mins <= 0) return { error: 'Please enter a positive number of minutes.' };
  if(mins > 300) return { error: 'Please enter a realistic session duration (1–300 min).' };
  entry.mins = Math.round(mins); // integer minutes prevents floating-point drift
  if(type === 'treadmill') {
    const speed = num('cardio-speed'), incline = num('cardio-incline');
    if(Number.isFinite(speed)) { if(speed <= 0 || speed > 25) return { error: 'Treadmill speed should be between 0.5 and 25 km/h.' }; entry.speedKmh = speed; }
    if(Number.isFinite(incline)) { if(incline < 0 || incline > 40) return { error: 'Incline should be between 0 and 40%.' }; entry.inclinePct = incline; }
    if(entry.speedKmh) entry.distanceKm = Math.round(entry.speedKmh * entry.mins / 60 * 100) / 100;
  } else if(type === 'cycle') {
    const km = num('cardio-distance'), level = num('cardio-level');
    if(Number.isFinite(km)) { if(km <= 0 || km > 200) return { error: 'Cycle distance should be between 0.1 and 200 km.' }; entry.distanceKm = km; }
    if(Number.isFinite(level)) { if(level < 1 || level > 40) return { error: 'Resistance level should be between 1 and 40.' }; entry.level = Math.round(level); }
  }
  return { entry };
}

function updateCardioPreview() {
  const el = document.getElementById('cardio-preview');
  if(!el) return;
  const type = cardioFormType();
  let text = '';
  if(type === 'run') {
    const km = Number(document.getElementById('cardio-distance').value);
    const secs = parseDurationInput(document.getElementById('cardio-run-time').value);
    if(km > 0 && secs > 0) text = `Pace: <strong>${formatPace(secs / km)}</strong> · ${km} km in ${formatClock(secs)}`;
  } else if(type === 'treadmill') {
    const speed = Number(document.getElementById('cardio-speed').value), mins = Number(document.getElementById('cardio-add').value);
    if(speed > 0 && mins > 0) text = `≈ ${(speed * mins / 60).toFixed(2)} km · pace ${formatPace(3600 / speed)}`;
  }
  el.innerHTML = text;
}

function cardioEntrySummary(e) {
  if(e.type === 'run') return `${e.distanceKm} km · ${formatClock(e.durationSecs)} · ${formatPace(e.paceSecPerKm)}`;
  const bits = [`${e.mins} min`];
  if(e.type === 'treadmill') { if(e.speedKmh) bits.push(`${e.speedKmh} km/h`); if(e.inclinePct !== undefined) bits.push(`${e.inclinePct}% incline`); }
  if(e.type === 'cycle') { if(e.distanceKm) bits.push(`${e.distanceKm} km`); if(e.level) bits.push(`level ${e.level}`); }
  return bits.join(' · ');
}

function renderCardioRecent() {
  const el = document.getElementById('cardio-recent');
  if(!el) return;
  const recent = cardioLog.slice(0, 4);
  if(!recent.length) { el.innerHTML = ''; return; }
  el.innerHTML = recent.map(e => {
    const t = CARDIO_TYPES[e.type] || CARDIO_TYPES.quick;
    return `<div class="cardio-recent-row"><span class="cardio-recent-ico">${t.icon}</span><span class="cardio-recent-main"><strong>${t.label}</strong><span>${escapeHtml(cardioEntrySummary(e))}</span></span><span class="cardio-recent-date">${escapeHtml(e.date || '')}</span><button class="del-btn del-btn-sm" title="Delete" aria-label="Delete cardio session" onclick="deleteCardioEntry(${Number(e.id)})">×</button></div>`;
  }).join('');
}

function deleteCardioEntry(id) {
  const e = cardioLog.find(x => x.id === id);
  if(!e || !confirm('Delete this cardio session?')) return;
  cardioLog = cardioLog.filter(x => x.id !== id);
  save('fitdash_cardio_log', cardioLog);
  // Only this week's sessions count towards the weekly total.
  const entryWeek = (() => { const d = parseLocalDate(e.date); const jan1 = new Date(d.getFullYear(),0,1); return d.getFullYear() + '-W' + Math.ceil(((d - jan1) / 86400000 + jan1.getDay() + 1) / 7); })();
  if(entryWeek === getWeekKey()) { cardioMins = Math.max(0, cardioMins - (e.mins || 0)); save('fitdash_cardio', cardioMins); }
  renderCardio();
}

// ══ SHAREABLE WORKOUT CARD (1080×1350 PNG) ═════════════════════
let shareCardBlob = null, shareCardUrl = null, shareCardName = 'fitdash-workout.png';

function buildShareCardData(session, priorSessions) {
  const bests = getExerciseBests([session]);
  const top = Object.entries(bests)
    .map(([name, b]) => ({ name, weight: b.weight, volume: b.volume, sets: setsFromSession(session).filter(x => x.exName === name).length }))
    .sort((a, b) => b.volume - a.volume || b.sets - a.sets)
    .slice(0, 5);
  let volume = session.volumeKg;
  if(!(volume > 0)) volume = Math.round(setsFromSession(session).reduce((sum, x) => sum + x.weight * x.reps, 0));
  return {
    title: session.title || (session.quick ? 'Quick Workout' : 'Full Body Session'),
    date: session.date,
    durationSecs: session.durationSecs || 0,
    volumeKg: volume || 0,
    sets: countSets(session),
    calories: session.caloriesBurned || 0,
    prs: findSessionPRs(session, priorSessions),
    top,
  };
}

function shareCardEllipsize(ctx, text, maxW) {
  if(ctx.measureText(text).width <= maxW) return text;
  let t = text;
  while(t.length > 1 && ctx.measureText(t + '…').width > maxW) t = t.slice(0, -1);
  return t + '…';
}

function shareCardRoundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function drawShareCard(canvas, d) {
  const ctx = canvas.getContext('2d');
  const W = canvas.width, H = canvas.height, P = 80;
  const font = (weight, size) => `${weight} ${size}px Inter, "Segoe UI", Roboto, system-ui, sans-serif`;
  const bg = ctx.createLinearGradient(0, 0, W, H);
  bg.addColorStop(0, '#08080e'); bg.addColorStop(0.6, '#111120'); bg.addColorStop(1, '#2a0b12');
  ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H);
  const glow = ctx.createRadialGradient(W - 120, 120, 0, W - 120, 120, 520);
  glow.addColorStop(0, 'rgba(230,57,70,0.35)'); glow.addColorStop(1, 'rgba(230,57,70,0)');
  ctx.fillStyle = glow; ctx.fillRect(0, 0, W, H);

  // Brand
  ctx.textBaseline = 'alphabetic';
  shareCardRoundRect(ctx, P, 78, 64, 64, 16); ctx.fillStyle = '#e63946'; ctx.fill();
  ctx.fillStyle = '#fff'; ctx.font = font(900, 40); ctx.textAlign = 'center'; ctx.fillText('F', P + 32, 125);
  ctx.textAlign = 'left'; ctx.font = font(800, 40);
  ctx.fillStyle = '#e63946'; ctx.fillText('FIT', P + 88, 124);
  ctx.fillStyle = '#ffffff'; ctx.fillText('DASH', P + 88 + ctx.measureText('FIT').width, 124);

  // Title + date
  const dateLabel = d.date ? parseLocalDate(d.date).toLocaleDateString('en-US', { weekday:'long', month:'long', day:'numeric', year:'numeric' }) : '';
  ctx.fillStyle = '#9ca3af'; ctx.font = font(600, 34); ctx.fillText(dateLabel, P, 250);
  ctx.fillStyle = '#ffffff'; ctx.font = font(900, 84); ctx.fillText(shareCardEllipsize(ctx, d.title, W - 2 * P), P, 345);
  ctx.fillStyle = '#e63946'; ctx.fillRect(P, 380, 120, 8);

  // Stat tiles
  const stats = [
    { label: 'DURATION', value: d.durationSecs ? formatClock(d.durationSecs) : '—' },
    { label: 'VOLUME', value: d.volumeKg ? `${Math.round(d.volumeKg).toLocaleString('en-US')} kg` : '—' },
    { label: 'PRs HIT', value: String(new Set(d.prs.map(pr => pr.exName)).size) },
  ];
  const gap = 24, tileW = (W - 2 * P - 2 * gap) / 3, tileY = 440, tileH = 200;
  stats.forEach((st, i) => {
    const x = P + i * (tileW + gap);
    shareCardRoundRect(ctx, x, tileY, tileW, tileH, 28);
    ctx.fillStyle = 'rgba(255,255,255,0.06)'; ctx.fill();
    ctx.strokeStyle = i === 2 && d.prs.length ? 'rgba(74,222,128,0.6)' : 'rgba(255,255,255,0.12)'; ctx.lineWidth = 2; ctx.stroke();
    ctx.fillStyle = '#9ca3af'; ctx.font = font(700, 26); ctx.fillText(st.label, x + 30, tileY + 62);
    ctx.fillStyle = i === 2 && d.prs.length ? '#4ade80' : '#ffffff';
    let size = 58;
    do { ctx.font = font(800, size); size -= 2; } while(size > 30 && ctx.measureText(st.value).width > tileW - 60);
    ctx.fillText(shareCardEllipsize(ctx, st.value, tileW - 60), x + 30, tileY + 150);
  });
  const sub = [d.sets ? `${d.sets} sets` : '', d.calories ? `${d.calories} kcal` : ''].filter(Boolean).join('  ·  ');
  if(sub) { ctx.fillStyle = '#9ca3af'; ctx.font = font(600, 30); ctx.fillText(sub, P, tileY + tileH + 60); }

  // Top exercises (+ PR badges)
  let y = 800;
  ctx.fillStyle = '#ffffff'; ctx.font = font(800, 38); ctx.fillText('Top exercises', P, y);
  y += 30;
  const prNames = new Set(d.prs.map(pr => pr.exName));
  if(!d.top.length) {
    ctx.fillStyle = '#6b7280'; ctx.font = font(600, 30); ctx.fillText('No weighted sets logged', P, y + 50);
  }
  d.top.forEach(ex => {
    y += 72;
    const isPR = prNames.has(ex.name);
    const right = `${ex.sets} set${ex.sets === 1 ? '' : 's'}${ex.weight ? ` · best ${ex.weight} kg` : ''}`;
    ctx.font = font(600, 30);
    const rightW = ctx.measureText(right).width;
    ctx.fillStyle = isPR ? '#4ade80' : '#e63946'; ctx.beginPath(); ctx.arc(P + 10, y - 10, 9, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#e5e7eb'; ctx.font = font(700, 34);
    const name = shareCardEllipsize(ctx, ex.name, W - 2 * P - rightW - (isPR ? 190 : 100));
    ctx.fillText(name, P + 40, y);
    if(isPR) {
      // Drawn badge instead of an emoji so it renders on devices without colour-emoji fonts.
      const bx = P + 40 + ctx.measureText(name).width + 16;
      shareCardRoundRect(ctx, bx, y - 32, 70, 40, 20); ctx.fillStyle = 'rgba(74,222,128,0.18)'; ctx.fill();
      ctx.fillStyle = '#4ade80'; ctx.font = font(800, 24); ctx.fillText('PR', bx + 19, y - 4);
    }
    ctx.fillStyle = '#9ca3af'; ctx.font = font(600, 30); ctx.textAlign = 'right'; ctx.fillText(right, W - P, y); ctx.textAlign = 'left';
  });

  // Watermark
  ctx.fillStyle = 'rgba(255,255,255,0.12)'; ctx.fillRect(P, H - 150, W - 2 * P, 2);
  ctx.fillStyle = '#9ca3af'; ctx.font = font(600, 28); ctx.fillText('Tracked with FitDash', P, H - 92);
  ctx.textAlign = 'right'; ctx.fillStyle = '#e63946'; ctx.font = font(800, 28); ctx.fillText('#FitDash', W - P, H - 92); ctx.textAlign = 'left';
}

function openShareCard(session, priorSessions) {
  const canvas = document.getElementById('share-card-canvas');
  const data = buildShareCardData(session, priorSessions);
  drawShareCard(canvas, data);
  shareCardName = `fitdash-workout-${data.date || getLocalDateStr()}.png`;
  const status = document.getElementById('share-card-status');
  status.textContent = '';
  document.getElementById('share-card-native-btn').style.display = navigator.share ? '' : 'none';
  canvas.toBlob(blob => {
    shareCardBlob = blob;
    if(shareCardUrl) URL.revokeObjectURL(shareCardUrl);
    shareCardUrl = blob ? URL.createObjectURL(blob) : canvas.toDataURL('image/png');
    document.getElementById('share-card-img').src = shareCardUrl;
  }, 'image/png');
  document.getElementById('share-modal').classList.add('open');
  document.body.style.overflow = 'hidden';
}

function openShareCardForCurrentWorkout() {
  const fd = wo.finishedData;
  if(!fd) return;
  openShareCard({ date: getLocalDateStr(), durationSecs: fd.durationSecs, volumeKg: Math.round(fd.totalVolume),
    caloriesBurned: fd.calData.total, setsCompleted: fd.setsCount, exercises: wo.log }, sessions);
}

function openShareCardForSession(id) {
  const s = sessions.find(x => x.id === id);
  if(!s) return;
  const prior = sessions.filter(x => x !== s && (x.date < s.date || (x.date === s.date && (x.id || 0) < (s.id || 0))));
  openShareCard(s, prior);
}

function closeShareCard() {
  document.getElementById('share-modal').classList.remove('open');
  if(!document.querySelector('.modal-backdrop.open') && document.getElementById('workout-overlay').style.display !== 'block') document.body.style.overflow = '';
}

function downloadShareCard() {
  if(!shareCardUrl) return;
  const a = document.createElement('a');
  a.href = shareCardUrl; a.download = shareCardName;
  document.body.appendChild(a); a.click(); a.remove();
  document.getElementById('share-card-status').textContent = '✓ Saved ' + shareCardName;
}

async function shareShareCard() {
  const status = document.getElementById('share-card-status');
  if(!shareCardBlob) { downloadShareCard(); return; }
  const file = new File([shareCardBlob], shareCardName, { type: 'image/png' });
  const payload = { files: [file], title: 'My FitDash workout', text: 'Just finished a workout 💪 #FitDash' };
  if(!navigator.share || (navigator.canShare && !navigator.canShare(payload))) {
    downloadShareCard();
    status.textContent = 'Sharing images isn\u2019t supported here — downloaded the PNG instead.';
    return;
  }
  try { await navigator.share(payload); status.textContent = '✓ Shared'; }
  catch(err) { if(err && err.name !== 'AbortError') status.textContent = 'Could not share: ' + (err.message || err); }
}

document.getElementById('share-modal').addEventListener('click', e => { if(e.target.id === 'share-modal') closeShareCard(); });
