// â•â• WORKOUT ENGINE â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

const WORKOUT_PLAN = [
  { id:'A', name:'Legs & Calves', type:'Superset',
    info:'A1 â†’ rest â†’ A2 â†’ rest. 3 full rounds before Block B.',
    exercises:[
      { code:'A1', name:'Dumbbell Goblet Squat',
        muscle:'ðŸŽ¯ Quads Â· Glutes Â· Core',
        tips:'Keep chest tall, elbows inside knees at bottom. Drive through heels.',
        ytQuery:'goblet squat dumbbell full tutorial form', ytId:'gCESNsDsbqk' },
      { code:'A2', name:'Standing Calf Raises',
        muscle:'ðŸŽ¯ Gastrocnemius Â· Soleus',
        tips:'Full range â€” heel below platform on stretch, full rise on toes. Pause at top.',
        ytQuery:'standing calf raise proper form dumbbell', ytId:'k8ipHzKeAkQ' },
    ]
  },
  { id:'B', name:'Back Â· Chest Â· Back', type:'Giant Set',
    info:'B1 â†’ B2 â†’ B3 back-to-back. Long rest only after B3.',
    exercises:[
      { code:'B1', name:'DB Pullover',
        muscle:'ðŸŽ¯ Lats Â· Serratus Â· Long-head Tricep',
        tips:'Slight elbow bend. Feel the stretch at bottom, squeeze lats at top. Do NOT flare ribs.',
        ytQuery:'dumbbell pullover lat technique tutorial', ytId:'5lbvUCXfDU0' },
      { code:'B2', name:'Barbell Floor Press',
        muscle:'ðŸŽ¯ Chest Â· Triceps Â· Front Delt',
        tips:'Touch triceps to floor each rep â€” full stop removes stretch reflex. Tuck elbows slightly.',
        ytQuery:'barbell floor press chest exercise tutorial', ytId:'9vYCwtHkWgI' },
      { code:'B3', name:'DB Bent-Over Row',
        muscle:'ðŸŽ¯ Mid Back Â· Rhomboids Â· Biceps',
        tips:'Hinge to ~45Â°. Drive elbows back â€” not up. Squeeze for 1s at top. Neutral spine.',
        ytQuery:'dumbbell bent over row back form tutorial', ytId:'6gvmcqr226U' },
    ]
  },
  { id:'C', name:'Full Body Finish', type:'Circuit',
    info:'C1â†’C2â†’C3â†’C4â†’C5â†’C6 minimal rest between moves. 3 rounds.',
    exercises:[
      { code:'C1', name:'BB Overhead Press',
        muscle:'ðŸŽ¯ Shoulders Â· Triceps Â· Upper Traps',
        tips:'Bar path slightly back over skull at top. Don\'t lean back. Lock out fully overhead.',
        ytQuery:'overhead press barbell technique form tutorial', ytId:'cGnhixvC8uA' },
      { code:'C2', name:'DB Lateral Raises',
        muscle:'ðŸŽ¯ Lateral Deltoid',
        tips:'Lead with elbows, not wrists. Slight forward lean. Stop at shoulder height â€” don\'t shrug.',
        ytQuery:'dumbbell lateral raise side delt form tutorial', ytId:'XPPfnSEATJA' },
      { code:'C3', name:'BB Glute Bridges',
        muscle:'ðŸŽ¯ Glutes Â· Hamstrings',
        tips:'Drive hips to ceiling. Squeeze glutes HARD at top for 1 sec. Bar across hip crease.',
        ytQuery:'barbell glute bridge hip thrust proper form', ytId:'cirBJ4FrxXQ' },
      { code:'C4', name:'BB / DB Bicep Curls',
        muscle:'ðŸŽ¯ Biceps Â· Brachialis',
        tips:'Elbows pinned to sides. Supinate wrist at top. Full extension at bottom â€” no cheating.',
        ytQuery:'barbell bicep curl perfect form tutorial', ytId:'6DeLZ6cbgWQ' },
      { code:'C5', name:'DB Floor Skullcrushers',
        muscle:'ðŸŽ¯ Long Head Tricep',
        tips:'Upper arms vertical, only forearms move. Lower until DBs touch temples â€” full stretch.',
        ytQuery:'dumbbell floor skullcrusher tricep tutorial form', ytId:'1BDGIcMTSXc' },
      { code:'C6', name:'DB Reverse Flyes',
        muscle:'ðŸŽ¯ Rear Delts Â· Mid Traps Â· Rhomboids',
        tips:'Hinge forward, slight elbow bend. Arc arms out to sides â€” feel rear delt squeeze at top.',
        ytQuery:'dumbbell reverse fly rear delt proper form tutorial', ytId:'evXOlgLTPCw' },
    ]
  }
];

const GYM_WORKOUT_PLAN = [
  { id:'A', name:'Legs & Calves', type:'Superset',
    info:'Choose leg press, V-squat, hack squat, belt squat, or alternating leg extension/curl. Train calves between leg sets.',
    exercises:[
      { code:'GA1', name:'Leg Press', muscle:'ðŸŽ¯ Quads Â· Glutes', tips:'Use a machine that fits you. Start easy, then progress from 20â€“25 reps to hard 5â€“10 rep sets. Keep the range controlled.', ytQuery:'leg press machine proper form tutorial' },
      { code:'GA2', name:'Seated Calf Press', muscle:'ðŸŽ¯ Gastrocnemius Â· Soleus', tips:'Perform between leg sets with little rest. Use a full stretch and full contraction. Skip the first warmup set if experienced.', ytQuery:'seated calf press machine proper form tutorial' },
    ]
  },
  { id:'B', name:'Back Â· Chest Â· Back', type:'Giant Set',
    info:'Lat pulldown â†’ chest press â†’ machine row. Move between exercises with minimal rest and rest fully after the row.',
    exercises:[
      { code:'GB1', name:'Lat Pulldown', muscle:'ðŸŽ¯ Vertical Back Â· Lats', tips:'Choose a pulldown or chin-up option. Use 20â€“25 reps for the easy warmup, then progress toward hard 5â€“10 rep sets.', ytQuery:'lat pulldown proper form tutorial' },
      { code:'GB2', name:'Machine Chest Press', muscle:'ðŸŽ¯ Chest Â· Triceps', tips:'Prefer a machine. If occupied, use an incline or another chest press that lets you control the full range.', ytQuery:'machine chest press proper form tutorial' },
      { code:'GB3', name:'Machine Row', muscle:'ðŸŽ¯ Horizontal Back Â· Rhomboids', tips:'Use a machine or cable row. Complete the full giant set before taking the longer 1â€“2 minute rest.', ytQuery:'seated machine row proper form tutorial' },
    ]
  },
  { id:'C', name:'Finishing Circuit', type:'Circuit',
    info:'Shoulders â†’ adductors â†’ abductors â†’ arms â†’ rear delts. Rest briefly between exercises and fully after each round.',
    exercises:[
      { code:'GC1', name:'Machine Shoulder Press', muscle:'ðŸŽ¯ Shoulders Â· Triceps', tips:'Use 15â€“20 reps for the hard warmup, then 10â€“15 and 8â€“10 reps for working rounds.', ytQuery:'machine shoulder press proper form tutorial' },
      { code:'GC2', name:'Dumbbell Lateral Raise', muscle:'ðŸŽ¯ Lateral Delts', tips:'Keep the movement controlled and stop around shoulder height. Use 10â€“15 reps in the first three rounds.', ytQuery:'dumbbell lateral raise proper form tutorial' },
      { code:'GC3', name:'Adductor Machine', muscle:'ðŸŽ¯ Inner Thighs', tips:'Use at least 8 reps on hard rounds. Choose a load that stays controlled through the full range.', ytQuery:'adductor machine proper form tutorial' },
      { code:'GC4', name:'Abductor Machine', muscle:'ðŸŽ¯ Glutes Â· Outer Hips', tips:'Use at least 8 reps on hard rounds. Avoid bouncing or rushing the range of motion.', ytQuery:'abductor machine proper form tutorial' },
      { code:'GC5', name:'Dumbbell Curls', muscle:'ðŸŽ¯ Biceps', tips:'Keep elbows stable. Use 15â€“20 reps for the warmup, then 10â€“15 and 5â€“10 reps.', ytQuery:'dumbbell bicep curl proper form tutorial' },
      { code:'GC6', name:'Cable Extensions', muscle:'ðŸŽ¯ Triceps', tips:'Use any safe cable triceps variation. Keep the upper arm controlled and use the target rep ranges.', ytQuery:'cable tricep extension proper form tutorial' },
      { code:'GC7', name:'Reverse Pec-Deck Rear Delts', muscle:'ðŸŽ¯ Rear Delts Â· Upper Back', tips:'This is the preference exercise. Substitute another rear-delt or glute exercise if needed.', ytQuery:'reverse pec deck rear delt proper form tutorial' },
    ]
  }
];

let trainingCategory = (() => {
  const saved = safeLoad('fitdash_training_category', 'home');
  return saved === 'gym' ? 'gym' : 'home';
})();

function switchTrainingCategory(category) {
  trainingCategory = category === 'gym' ? 'gym' : 'home';
  save('fitdash_training_category', trainingCategory);
  const isGym = trainingCategory === 'gym';
  const homeBtn = document.getElementById('training-category-home');
  const gymBtn = document.getElementById('training-category-gym');
  if(homeBtn) homeBtn.className = isGym ? 'btn-ghost' : 'btn-red';
  if(gymBtn) gymBtn.className = isGym ? 'btn-red' : 'btn-ghost';
  const tag = document.getElementById('training-category-tag');
  if(tag) tag.textContent = isGym ? 'Full Body Â· Gym Program' : 'Full Body Â· Home Gym';
  const warmup = document.getElementById('training-warmup-desc');
  if(warmup) warmup.textContent = isGym
    ? '5â€“10 min moderate cardio on a machine before weights. Use an incline if using a treadmill.'
    : 'Brisk walk or light jog in place. Moderate pace â€” break a light sweat, warm the joints before loading.';
  switchLevel(trainingLevel);
  _cachedFullPlanDeps = '';
}

let _cachedFullPlan = null;
let _cachedFullPlanDeps = '';

function getFullWorkoutPlan() {
  const deps = JSON.stringify({ c: trainingCategory, cx: customExercises, wo: workoutOverrides });
  if (_cachedFullPlan && _cachedFullPlanDeps === deps) return _cachedFullPlan;
  _cachedFullPlanDeps = deps;
  const plan = JSON.parse(JSON.stringify(trainingCategory === 'gym' ? GYM_WORKOUT_PLAN : WORKOUT_PLAN));
  
  // Create the dedicated Custom Block pool
  let customBlock = {
    id: 'ðŸ› ï¸',
    name: 'Custom Block',
    type: 'Custom Pool',
    info: 'Your library of extra exercises.',
    exercises: []
  };
  
  // Load custom exercises directly into the custom block pool
  customExercises.forEach(cx => {
    customBlock.exercises.push({
      code: cx.code, name: cx.name, muscle: cx.muscle, tips: cx.tips, ytId: getSavedVideoId(`custom:${cx.id}`, cx.ytId || cx.ytQuery || ''), _isCustom: true, _id: cx.id
    });
  });

  plan.push(customBlock);

  // Apply overrides to move exercises between blocks
  const allEx = [];
  plan.forEach(b => {
    b.exercises.forEach(e => {
      e._originalBlock = b.id;
      e.ytId = getSavedVideoId(e.code, e.ytId || '');
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
    if (a.id === 'ðŸ› ï¸') return 1;
    if (b.id === 'ðŸ› ï¸') return -1;
    return a.id.localeCompare(b.id);
  });
  
  _cachedFullPlan = plan;
  return plan;
}

const RECOVERY_ROUTINES = {
  mobility: [
    { title: '5 Min Morning Yoga', subtitle: 'Yoga with Adriene', ytId: 'Qtg7v1QG0PM' },
    { title: '15 Min Full Body Mobility', subtitle: 'Tom Merrick', ytId: 'TFSYNWPYujQ' },
    { title: '10 Min Joint Warm-Up', subtitle: 'Mobility Flow', ytId: 'yIOrimclYDc' },
    { title: '12 Min Spine & Shoulders', subtitle: 'Gentle Mobility', ytId: '0jqR4zVIs4I' }
  ],
  stretch: [
    { title: '10 Min Lower Body Stretch', subtitle: 'Hamstrings & Glutes', ytId: 'CKnlEt5n3Sk' },
    { title: '15 Min Hips & Hamstrings', subtitle: 'Mobility for Runners', ytId: 'jj2AAH6jbHk' },
    { title: '8 Min Calf Release', subtitle: 'Stretch Routine', ytId: 'ppYyoqmSXfs' }
  ],
  relief: [
    { title: '10 Min Upper Body Relief', subtitle: 'Neck, Shoulders & Upper Back', ytId: 'OcDhmXXgi8Q' },
    { title: '8 Min Shoulder Reset', subtitle: 'Tension Release', ytId: 'iY7BrTIXVkk' }
  ]
};

function selectRecoveryTab(tab) {
  const validTab = ['mobility','stretch','relief'].includes(tab) ? tab : 'mobility';
  document.getElementById('recovery-tab-mobility').classList.toggle('active', validTab === 'mobility');
  document.getElementById('recovery-tab-stretch').classList.toggle('active', validTab === 'stretch');
  document.getElementById('recovery-tab-relief').classList.toggle('active', validTab === 'relief');

  const container = document.getElementById('recovery-content');
  const routines = RECOVERY_ROUTINES[validTab] || [];
  container.innerHTML = routines.map((routine, idx) => {
    const key = `recovery:${validTab}:${idx}`;
    const ytId = getSavedVideoId(key, routine.ytId || '');
    const query = `${routine.title} ${routine.subtitle || ''}`.trim();
    return `
    <div class="dash-quick" style="cursor:pointer;display:flex;align-items:center;gap:12px;margin-bottom:10px;padding:12px;border:1px solid var(--border);border-radius:12px;background:var(--card);" onclick="openYouTubeDemo('${ytId}', '${encodeURIComponent(query)}')">
      <div class="dash-quick-icon" style="background:#ff6b35;color:#fff;min-width:44px;min-height:44px;display:flex;align-items:center;justify-content:center;border-radius:12px;font-size:18px">â–¶</div>
      <div style="flex:1;min-width:0;">
        <div style="font-size:14px;font-weight:700;color:var(--text);">${escapeHtml(routine.title)}</div>
        <div style="font-size:12px;color:var(--muted);margin-top:4px;">${escapeHtml(routine.subtitle)}</div>
      </div>
    </div>
  `;
  }).join('');
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
      <button onclick="document.getElementById('move-modal').style.display='none'" style="position:absolute;top:10px;right:10px;background:none;color:var(--muted);border:none;font-size:20px;cursor:pointer;padding:8px;">âœ•</button>
      <h3 style="margin-top:0;margin-bottom:16px;text-align:center;">Move Exercise</h3>
      <p style="font-size:13px;color:var(--muted);margin-bottom:20px;text-align:center;">Where do you want to move <strong>${code}</strong>?</p>
      
      <div style="display:grid;grid-template-columns:1fr;gap:10px;">
        <button class="btn-secondary" style="padding:12px;font-size:14px;background:#111118;color:#ffffff;border:1px solid #353548;border-radius:8px;cursor:pointer;" onclick="executeMove('${code}', 'A')">Block A (Legs & Calves)</button>
        <button class="btn-secondary" style="padding:12px;font-size:14px;background:#111118;color:#ffffff;border:1px solid #353548;border-radius:8px;cursor:pointer;" onclick="executeMove('${code}', 'B')">Block B (Back & Chest)</button>
        <button class="btn-secondary" style="padding:12px;font-size:14px;background:#111118;color:#ffffff;border:1px solid #353548;border-radius:8px;cursor:pointer;" onclick="executeMove('${code}', 'C')">Block C (Full Body Circuit)</button>
        <button class="btn-secondary" style="padding:12px;font-size:14px;background:#111118;color:#ff6b35;border:1px solid #ff6b35;border-radius:8px;cursor:pointer;" onclick="executeMove('${code}', 'ðŸ› ï¸')">Custom Pool ðŸ› ï¸</button>
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
 * Maps each WORKOUT_PLAN exercise name â†’ the matching EXERCISES dropdown label.
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

// â”€â”€ Level system (based on Greg Doucette's training plan) â”€â”€â”€â”€â”€
const LEVEL_CONFIG = {
  beginner: {
    sessionsPerWeek:'2Ã—', duration:'~40 min', setsLabel:'2 Sets per Block',
    sets:[
      { label:'Set 1 â€” Easy Warmup', badge:'s1', reps:'20â€“25', restSec:60,
        tip:'Very light load. Go easy â€” just learn the movement. No grinding. You should feel almost nothing.' },
      { label:'Set 2 â€” Working Set', badge:'s2', reps:'10â€“15', restSec:120,
        tip:'Add weight. Work hard but stay 2â€“5 reps from failure. Form always beats weight.' },
    ],
    legendHTML:`
      <div class="legend-item"><div class="legend-num s1">Set 1</div><div class="legend-desc">Easy Warmup<br>20â€“25 reps Â· light</div></div>
      <div class="legend-item"><div class="legend-num s2">Set 2</div><div class="legend-desc">Working Set<br>10â€“15 reps</div></div>`,
    gridHTML:(isCircuit)=>`
      <div class="set-item">
        <div class="set-num-label s1">${isCircuit?'Round 1':'Set 1'} Â· Warmup</div>
        <div class="set-reps">20â€“25</div>
        <div class="set-desc-s">reps Â· very light</div>
        <div class="set-desc-s" style="margin-top:4px;color:var(--blue)">Rest 1 min</div>
      </div>
      <div class="set-item">
        <div class="set-num-label s2">${isCircuit?'Round 2':'Set 2'} Â· Working</div>
        <div class="set-reps">10â€“15</div>
        <div class="set-desc-s">reps Â· controlled</div>
        <div class="set-desc-s" style="margin-top:4px;color:var(--yellow)">Rest 2 min</div>
      </div>`,
    note:(id)=>id==='A'
      ?'ðŸŒ± Butter Starter â€” 2 sets only. Learn the movement pattern. Form over everything.'
      :'ðŸŒ± Take your time. Build the habit. No failure sets â€” stay 2â€“5 reps shy of your limit.'
  },
  amateur: {
    sessionsPerWeek:'2â€“3Ã—', duration:'~55â€“70 min', setsLabel:'3 Sets per Block',
    sets:[
      { label:'Set 1 â€” Warmup',      badge:'s1', reps:'20â€“25', restSec:90,
        tip:'Very light load â€” full range of motion focus. Could you do 50 reps? Good.' },
      { label:'Set 2 â€” Form & TUT',   badge:'s2', reps:'12â€“15', restSec:90,
        tip:'Tempo 3-1-1. 3s down, 1s hold at peak contraction, 1s up. Feel every rep.' },
      { label:'Set 3 â€” Max Effort',   badge:'s3', reps:'To failure + partials', restSec:180,
        tip:'Heaviest load you can handle. Go to full failure, then squeeze out partial reps.' },
    ],
    legendHTML:`
      <div class="legend-item"><div class="legend-num s1">Set 1</div><div class="legend-desc">Warmup<br>High reps Â· light</div></div>
      <div class="legend-item"><div class="legend-num s2">Set 2</div><div class="legend-desc">Form + TUT<br>Tempo 3-1-1</div></div>
      <div class="legend-item"><div class="legend-num s3">Set 3</div><div class="legend-desc">Max Effort<br>Failure + partials</div></div>`,
    gridHTML:(isCircuit)=>`
      <div class="set-item">
        <div class="set-num-label s1">${isCircuit?'Round 1':'Set 1'} Â· Warmup</div>
        <div class="set-reps">20â€“25</div>
        <div class="set-desc-s">reps Â· light load</div>
        <div class="set-desc-s" style="margin-top:4px;color:var(--blue)">Rest 1â€“2 min</div>
      </div>
      <div class="set-item">
        <div class="set-num-label s2">${isCircuit?'Round 2':'Set 2'} Â· Form</div>
        <div class="set-reps">12â€“15</div>
        <div class="set-desc-s">reps Â· tempo 3-1-1</div>
        <div class="set-desc-s" style="margin-top:4px;color:var(--yellow)">~55s TUT Â· 1â€“2 min</div>
      </div>
      <div class="set-item">
        <div class="set-num-label s3">${isCircuit?'Round 3':'Set 3'} Â· Max</div>
        <div class="set-reps">Failure</div>
        <div class="set-desc-s">+ partials Â· heaviest</div>
        <div class="set-desc-s" style="margin-top:4px;color:var(--red)">Rest 2â€“3 min</div>
      </div>`,
    note:(id)=>id==='A'
      ?'ðŸ’¡ Move smoothly through full range. Light enough that you could do 50 reps on Set 1 â€” that\'s the point.'
      :'ðŸ’¡ Squeeze the target muscle. 1-second hold at peak contraction on Set 2.'
  },
  master: {
    sessionsPerWeek:'3Ã—', duration:'~70â€“90 min', setsLabel:'4 Sets per Block',
    sets:[
      { label:'Set 1 â€” Warmup',         badge:'s1', reps:'20â€“25', restSec:90,
        tip:'Light weight. 20â€“25 reps â€” could do 50. Warmup only. Full range of motion.' },
      { label:'Set 2 â€” Hard Warm Up',   badge:'s2', reps:'15â€“20', restSec:90,
        tip:'15â€“20 reps leaving 5â€“10 in the tank. Tempo 3-1-1. Feel every rep.' },
      { label:'Set 3 â€” Working Set',    badge:'s3', reps:'10â€“15', restSec:120,
        tip:'Add 20% more weight. 0â€“2 reps from failure. Squeeze at peak contraction.' },
      { label:'Set 4 â€” Advanced Set ðŸ”¥',badge:'s4', reps:'5â€“8 + Drop Set', restSec:180,
        tip:'Same weight as Set 3. Go to full failure, then drop 20â€“30% for partials. TRAIN HARDER THAN LAST TIME!' },
    ],
    legendHTML:`
      <div class="legend-item"><div class="legend-num s1">Set 1</div><div class="legend-desc">Warmup<br>20â€“25 reps</div></div>
      <div class="legend-item"><div class="legend-num s2">Set 2</div><div class="legend-desc">Hard Warm Up<br>15â€“20 reps</div></div>
      <div class="legend-item"><div class="legend-num s3">Set 3</div><div class="legend-desc">Working Set<br>10â€“15 reps</div></div>
      <div class="legend-item"><div class="legend-num s4">Set 4 ðŸ”¥</div><div class="legend-desc">Advanced<br>5â€“8 + Drop Set</div></div>`,
    gridHTML:(isCircuit)=>`
      <div class="set-item">
        <div class="set-num-label s1">${isCircuit?'Round 1':'Set 1'} Â· Warmup</div>
        <div class="set-reps">20â€“25</div>
        <div class="set-desc-s">reps Â· very light</div>
        <div class="set-desc-s" style="margin-top:4px;color:var(--blue)">Rest 1â€“2 min</div>
      </div>
      <div class="set-item">
        <div class="set-num-label s2">${isCircuit?'Round 2':'Set 2'} Â· Hard WU</div>
        <div class="set-reps">15â€“20</div>
        <div class="set-desc-s">5â€“10 in tank</div>
        <div class="set-desc-s" style="margin-top:4px;color:var(--yellow)">Tempo 3-1-1 Â· 1â€“2 min</div>
      </div>
      <div class="set-item">
        <div class="set-num-label s3">${isCircuit?'Round 3':'Set 3'} Â· Working</div>
        <div class="set-reps">10â€“15</div>
        <div class="set-desc-s">0â€“2 from failure</div>
        <div class="set-desc-s" style="margin-top:4px;color:var(--red)">Rest 2â€“3 min</div>
      </div>
      <div class="set-item" style="border-color:var(--orange)">
        <div class="set-num-label s4">${isCircuit?'Round 4':'Set 4'} ðŸ”¥ Adv</div>
        <div class="set-reps" style="font-size:13px">5â€“8 + Drop</div>
        <div class="set-desc-s">failure + partials</div>
        <div class="set-desc-s" style="margin-top:4px;color:var(--orange)">Rest 2â€“3 min</div>
      </div>`,
    note:(id)=>'âš¡ TRAIN HARDER THAN LAST TIME. Set 4: full failure â†’ drop 20â€“30% â†’ partial reps to absolute failure.'
  }
};

// Validate against the known level set â€” an unrecognised value (corruption, old
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
  log:{},          // "A-A1-0" â†’ {weight, reps}
  setup:{},        // height, age, gender, activity
  finishedData:null,
};

// â”€â”€ Pre-workout modal â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function openPreWorkout() {
  // restore saved profile
  const saved = safeLoad('fitdash_profile', {});
  if(saved.height)   document.getElementById('setup-height').value   = saved.height;
  if(saved.age)      document.getElementById('setup-age').value      = saved.age;
  if(saved.gender)   document.getElementById('setup-gender').value   = saved.gender;
  if(saved.activity) document.getElementById('setup-activity').value = saved.activity;

  // pre-fill weight: today's log first, then last saved profile weight
  // use getLocalDateStr() â€” toDateString() format would miss entries stored in ISO format
  const todayW = weights.find(w => w.date === getLocalDateStr());
  const prefillW = todayW ? todayW.val : (saved.weight || '');
  document.getElementById('setup-weight').value = prefillW;

  // show/hide the estimation note based on whether weight is filled
  // listener attached once at init (bottom of file) â€” NOT here, to prevent stacking
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
    alert('Please enter a valid height (100â€“250 cm).'); return;
  }
  if(!age || age < 10 || age > 100) {
    alert('Please enter a valid age.'); return;
  }

  // if weight provided, write it back to today's weight log + dashboard stat
  if(weightKg) {
    const today = getLocalDateStr();   // was toDateString() â€” inconsistent with ISO format used everywhere else
    weights = weights.filter(w => w.date !== today);
    weights.push({ date: today, val: weightKg });
    save('fitdash_weights', weights);
    const swEl = document.getElementById('stat-weight');
    if(swEl) swEl.textContent = weightKg;
  }

  wo.setup = { height, age, gender, activity, weightKg };
  save('fitdash_profile', { height, age, gender, activity, weight: weightKg });
  closePreWorkout();
  startWorkoutSession();
}

// â”€â”€ Start session â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function startWorkoutSession() {
  wo = { ...wo, active:true, startTime:Date.now(), totalSecs:0,
    blockIdx:0, exIdx:0, setIdx:0, log:{}, finishedData:null,
    totalInterval:null, restInterval:null, restSecsLeft:0 };
  document.getElementById('workout-overlay').style.display = 'block';
  document.getElementById('wo-exit-panel').classList.remove('open');
  document.getElementById('wo-end-btn').textContent  = 'End âœ•';
  document.getElementById('wo-end-btn').style.color  = '';
  document.getElementById('wo-end-btn').style.borderColor = '';
  document.body.style.overflow = 'hidden';

  // overall timer
  wo.totalInterval = setInterval(() => {
    wo.totalSecs++;
    const m = String(Math.floor(wo.totalSecs/60)).padStart(2,'0');
    const s = String(wo.totalSecs%60).padStart(2,'0');
    document.getElementById('wo-total-time').textContent = m+':'+s;
  }, 1000);

  renderWorkoutStep();
}

// â”€â”€ Render current step â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
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
      `Block ${block.id} Â· Ex ${wo.exIdx+1}/${block.exercises.length} Â· Set ${wo.setIdx+1}/${cfg.length}`;

    // block badge
    document.getElementById('wo-block-num').textContent = block.id;
    document.getElementById('wo-block-name').textContent = block.name;
    document.getElementById('wo-block-type').textContent = block.type;
    document.getElementById('wo-block-info').textContent = block.info.split('.')[0];

    // exercise card
    document.getElementById('wo-ex-code').textContent   = ex.code;
    document.getElementById('wo-ex-name').textContent   = ex.name;
    document.getElementById('wo-ex-muscle').textContent = ex.muscle;
    document.getElementById('wo-yt-btn').dataset.query  = ex.ytQuery;
    document.getElementById('wo-yt-btn').dataset.ytid   = ex.ytId || '';

    // tips pill â€” add/update below muscle line
    let tipsEl = document.getElementById('wo-tips-pill');
    if(!tipsEl) {
      tipsEl = document.createElement('div');
      tipsEl.id = 'wo-tips-pill';
      tipsEl.style.cssText =
        'margin-top:10px;background:var(--card2);border:1px solid var(--border);' +
        'border-radius:var(--radius-sm);padding:8px 12px;font-size:12px;color:var(--muted2);line-height:1.5';
      document.getElementById('wo-ex-code').closest('.wo-ex-body').appendChild(tipsEl);
    }
    tipsEl.innerHTML = `ðŸ’¡ <strong style="color:var(--text)">Cue:</strong> ${ex.tips}`;

    // set card
    const badge = document.getElementById('wo-set-badge');
    badge.textContent  = set.label;
    badge.className    = `wo-set-badge ${set.badge}`;
    document.getElementById('wo-set-tip').textContent  = set.tip;
    document.getElementById('wo-set-reps').textContent = set.reps;

    // pre-fill last logged weight for this exercise if available
    const prevKey = logKey(block.id, ex.code, wo.setIdx);
    const prev = wo.log[prevKey];
    document.getElementById('wo-weight').value = prev ? prev.weight : '';
    document.getElementById('wo-reps').value   = prev ? prev.reps   : '';

    // show set card, hide rest
    document.getElementById('wo-set-card').style.display  = '';
    document.getElementById('wo-rest-card').style.display = 'none';
    document.getElementById('wo-done-btn').disabled = false;
    document.getElementById('wo-done-btn').textContent = 'âœ“  Set Done â€” Start Rest';

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

// â”€â”€ Complete a set â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function completeSet() {
  const wt   = parseFloat(document.getElementById('wo-weight').value) || 0;
  const reps = parseInt(document.getElementById('wo-reps').value)    || 0;
  const block = getFullWorkoutPlan()[wo.blockIdx];
  const ex    = block.exercises[wo.exIdx];
  const key   = logKey(block.id, ex.code, wo.setIdx);
  wo.log[key] = { weight:wt, reps, exName:ex.name, setLabel:getSetConfig()[wo.setIdx].label };

  document.getElementById('wo-done-btn').disabled = true;
  document.getElementById('wo-done-btn').textContent = 'âœ“ Logged';
  
  if (soundEnabled) playSound();
  if (hapticsEnabled) playHaptic();

  const restSecs = getSetConfig()[wo.setIdx].restSec;
  beginRest(restSecs);
}

// â”€â”€ Rest timer â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
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
      if (soundEnabled) playSound();
      if (hapticsEnabled) playHaptic();
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
  if(!nextStep) { el.textContent = 'ðŸ Last set! Finish strong.'; return; }
  if(nextStep.type==='set') {
    el.textContent = `Next â†’ ${nextStep.label} of ${nextStep.exName}`;
  } else if(nextStep.type==='block') {
    el.textContent = `Next â†’ Block ${nextStep.blockId}: ${nextStep.blockName}`;
  } else {
    el.textContent = 'ðŸ Final set â€” almost done!';
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
    return { type:'set', label:'Set 1 â€” Warmup',
             exName:block.exercises[nextEx].name };
  }
  const nextBlock = wo.blockIdx + 1;
  if(nextBlock < getFullWorkoutPlan().length) {
    return { type:'block', blockId:getFullWorkoutPlan()[nextBlock].id,
             blockName:getFullWorkoutPlan()[nextBlock].name };
  }
  return null;
}

// â”€â”€ Advance to next step â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
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

// â”€â”€ YouTube demo â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function openYouTubeDemo(explicitYtId, explicitQuery) {
  let ytId = explicitYtId;
  let q = '';
  
  if (!ytId) {
    const btn = document.getElementById('wo-yt-btn');
    if(btn) {
      ytId = btn.dataset.ytid;
      q = explicitQuery || btn.dataset.query || '';
    } else {
      q = explicitQuery || '';
    }
  } else {
    q = explicitQuery || '';
  }

  if(q) {
    try { q = decodeURIComponent(q); }
    catch(_) { /* keep raw query */ }
  }

  const targetUrl = ytId
    ? `https://www.youtube.com/watch?v=${ytId}`
    : 'https://duckduckgo.com/?q=!ducky+site%3Ayoutube.com+' + encodeURIComponent(q);
  const canEmbed = location.protocol !== 'file:' && location.origin && location.origin !== 'null';

  if (ytId && canEmbed) {
    let modal = document.getElementById('yt-modal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'yt-modal';
      modal.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.9);z-index:9999;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:20px;backdrop-filter:blur(10px);';
      modal.innerHTML = `
        <div style="width:100%;max-width:600px;background:var(--card);border-radius:var(--radius);overflow:hidden;position:relative;box-shadow:0 25px 50px rgba(0,0,0,0.5);">
          <button onclick="document.getElementById('yt-modal').style.display='none'; document.getElementById('yt-iframe').src='';" style="position:absolute;top:10px;right:10px;background:rgba(255,50,50,0.9);color:#fff;border:none;border-radius:50%;width:32px;height:32px;font-weight:bold;cursor:pointer;z-index:10;display:flex;align-items:center;justify-content:center;transition:0.2s;">âœ•</button>
          <div style="position:relative;padding-bottom:56.25%;height:0;overflow:hidden;background:#000;">
            <iframe id="yt-iframe" style="position:absolute;top:0;left:0;width:100%;height:100%;border:none;" allowfullscreen></iframe>
          </div>
          <div style="padding:16px;text-align:center;background:var(--bg);">
            <a id="yt-external-link" href="#" target="_blank" style="color:var(--blue);text-decoration:none;font-weight:700;font-size:14px;display:inline-block;padding:10px 20px;background:var(--card);border-radius:24px;border:1px solid var(--border);transition:0.2s;">â–¶ Open in YouTube App/Tab</a>
          </div>
        </div>
      `;
      document.body.appendChild(modal);
    }
    
    const embedOrigin = location.origin && location.origin !== 'null' ? `&origin=${encodeURIComponent(location.origin)}` : '';
    document.getElementById('yt-iframe').src = `https://www.youtube-nocookie.com/embed/${ytId}?autoplay=1&rel=0&enablejsapi=1${embedOrigin}`;
    document.getElementById('yt-external-link').href = targetUrl;
    modal.style.display = 'flex';
  } else {
    let modal = document.getElementById('yt-modal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'yt-modal';
      modal.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.9);z-index:9999;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:20px;backdrop-filter:blur(10px);';
      modal.innerHTML = `
        <div style="width:100%;max-width:520px;background:var(--card);border-radius:var(--radius);overflow:hidden;position:relative;box-shadow:0 25px 50px rgba(0,0,0,0.5);padding:24px;text-align:center;">
          <button onclick="document.getElementById('yt-modal').style.display='none'" style="position:absolute;top:10px;right:10px;background:rgba(255,50,50,0.9);color:#fff;border:none;border-radius:50%;width:32px;height:32px;font-weight:bold;cursor:pointer;z-index:10;display:flex;align-items:center;justify-content:center;transition:0.2s;">âœ•</button>
          <div style="font-size:15px;font-weight:800;margin-bottom:10px;color:var(--text)">Embedded playback is blocked in the local preview</div>
          <div style="font-size:13px;line-height:1.5;color:var(--muted);margin-bottom:18px">Use the button below if you want to open the video in YouTube.</div>
          <a id="yt-external-link" href="#" target="_blank" style="color:var(--blue);text-decoration:none;font-weight:700;font-size:14px;display:inline-block;padding:10px 20px;background:var(--card2);border-radius:24px;border:1px solid var(--border);transition:0.2s;">â–¶ Open in YouTube App/Tab</a>
        </div>
      `;
      document.body.appendChild(modal);
    }
    document.getElementById('yt-external-link').href = targetUrl;
    modal.style.display = 'flex';
  }
}

// â”€â”€ Log preview inside workout â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function renderLogPreview() {
  const el = document.getElementById('wo-log-preview');
  const keys = Object.keys(wo.log);
  if(!keys.length) { el.innerHTML=''; return; }
  el.innerHTML = `
    <div style="font-size:10px;font-weight:700;color:var(--muted);text-transform:uppercase;letter-spacing:1.5px;margin-bottom:10px">Logged Sets</div>
    <div style="background:var(--card);border:1px solid var(--border);border-radius:var(--radius);overflow:hidden">
      ${keys.map(k => {
        const d = wo.log[k];
        const vol = d.weight && d.reps ? `${d.weight}kg Ã— ${d.reps}` : 'â€”';
        return `<div style="display:flex;align-items:center;padding:10px 14px;border-bottom:1px solid var(--border);gap:10px">
          <span style="font-size:10px;color:var(--muted);font-family:monospace;width:60px">${k}</span>
          <span style="font-size:13px;font-weight:600;flex:1">${d.exName}</span>
          <span style="font-size:13px;font-weight:700;color:var(--green)">${vol}</span>
        </div>`;
      }).join('')}
    </div>`;
}

// â”€â”€ Exit panel controls â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function toggleExitPanel() {
  const panel = document.getElementById('wo-exit-panel');
  const btn   = document.getElementById('wo-end-btn');
  const open  = panel.classList.toggle('open');
  btn.textContent = open ? 'Cancel' : 'End âœ•';
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
}

function saveAndExit() {
  document.getElementById('wo-exit-panel').classList.remove('open');
  finishWorkout();
}

// â”€â”€ Finish & calorie calc â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

function finishWorkout() {
  if(wo.totalInterval) { clearInterval(wo.totalInterval); wo.totalInterval=null; }
  if(wo.restInterval)  { clearInterval(wo.restInterval);  wo.restInterval=null; }
  document.getElementById('workout-overlay').style.display = 'none';
  // NOTE: body.overflow stays 'hidden' here â€” the post-workout modal is about to open
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

  wo.finishedData = { durationSecs, setsCount, totalVolume, calData, durationMins };
  document.getElementById('postworkout-modal').classList.add('open');
}

// â”€â”€ Calorie Algorithm â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function calcWorkoutCalories(durationMins, setsCompleted) {
  const { height, age, gender, activity, weightKg: setupWeight } = wo.setup;

  // â”€â”€ Weight resolution (3-tier priority) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
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
    weightSource   = `${weightKg} kg (from Progress log â€” logged ${ageLabel})`;
  } else {
    // Healthy BMI estimate: male â†’ 22.5, female â†’ 21.0
    const bmiRef = (gender === 'male') ? 22.5 : 21.0;
    weightKg     = Math.round(bmiRef * Math.pow(height / 100, 2) * 10) / 10;
    weightSource = `~${weightKg} kg (estimated from height â€” enter weight for accuracy)`;
  }

  // â”€â”€ Mifflinâ€“St Jeor BMR â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  let bmr = (10 * weightKg) + (6.25 * height) - (5 * age);
  bmr += (gender === 'male') ? 5 : -161;

  // â”€â”€ TDEE â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const actMap  = { sedentary:1.2, light:1.375, moderate:1.55, active:1.725, veryActive:1.9 };
  const actLabel= { sedentary:'Sedentary', light:'Light', moderate:'Moderate',
                    active:'Active', veryActive:'Very Active' };
  const tdee    = bmr * (actMap[activity] || 1.55);

  // â”€â”€ MET (scales 3.5â€“6.5 by completion %) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const completionPct = setsCompleted / computeWoFlat().length;
  let met = 3.5;
  if     (completionPct >= 0.8)  met = 6.5;
  else if(completionPct >= 0.5)  met = 5.5;
  else if(completionPct >= 0.25) met = 4.5;

  // â”€â”€ Gross & net calories â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const grossCals   = met * weightKg * (durationMins / 60);
  const restingCals = (bmr / 1440) * durationMins;
  const netCals     = Math.max(0, grossCals - restingCals);

  // â”€â”€ Volume load bonus (capped +15%) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const totalVol  = Object.values(wo.log)
                      .reduce((s,e) => s + (e.weight||0) * (e.reps||0), 0);
  const volBonus  = Math.min(0.15, (totalVol / 100000) * 0.5);
  const finalCals = Math.round(grossCals * (1 + volBonus));

  // â”€â”€ Breakdown panel â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const weightWarning = !setupWeight && !latestW
    ? `<br><span style="color:var(--yellow)">âš ï¸ Weight estimated from height â€” add your weight next time for a better reading.</span>`
    : '';

  // â”€â”€ TDEE double-dipping note â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  // TDEE already includes workout calories via the activity multiplier.
  // "Net above rest" should only be added to a SEDENTARY baseline, not to an active TDEE.
  const tdeeNote = activity !== 'sedentary'
    ? `<br><span style="color:var(--muted);font-size:11px">â„¹ï¸ Your TDEE already accounts for exercise (${actLabel[activity]||activity} multiplier). Add net calories only to a <em>sedentary</em> baseline (~${Math.round(bmr*1.2)} cal) â€” not to TDEE â€” or you'll double-count workout calories.</span>`
    : '';

  const breakdown = `
    <strong>Weight:</strong> ${weightSource}<br>
    <strong>Height / Age / Gender:</strong> ${height} cm Â· ${age} yrs Â· ${gender}<br>
    <strong>Activity level:</strong> ${actLabel[activity]||activity}<br>
    <strong>BMR:</strong> ${Math.round(bmr)} cal/day &nbsp;Â·&nbsp;
    <strong>TDEE:</strong> ${Math.round(tdee)} cal/day<br>
    <strong>MET:</strong> ${met} &nbsp;(${Math.round(completionPct*100)}% of workout done)<br>
    <strong>Gross burn:</strong> ${Math.round(grossCals)} cal &nbsp;Â·&nbsp;
    <strong>Net above rest:</strong> ${Math.round(netCals)} cal<br>
    <strong>Volume load:</strong> ${Math.round(totalVol)} kg &nbsp;Â·&nbsp;
    <strong>Volume bonus:</strong> +${Math.round(volBonus*100)}%
    ${tdeeNote}${weightWarning}`;

  return { total:finalCals, net:Math.round(netCals),
           bmr:Math.round(bmr), tdee:Math.round(tdee), breakdown };
}

// â”€â”€ Save / discard â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function discardWorkout() {
  // A guided session represents 55-70 min of effort â€” require explicit confirmation
  // before discarding, consistent with deletePR / deleteWeight / clearHistory.
  if(!confirm('Discard this workout? Your sets, volume, and calorie data will not be saved.')) return;
  closePostWorkout();
}

function closePostWorkout() {
  document.getElementById('postworkout-modal').classList.remove('open');
  document.body.style.overflow = '';   // â† restore scroll now that ALL overlays are gone
  wo.active = false;
}

// close log modal on backdrop click (was missing â€” pre/post workout had this but #modal did not)
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

// â”€â”€ Escape key closes the topmost open modal/overlay â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
document.addEventListener('keydown', e => {
  if(e.key !== 'Escape') return;
  // Priority order: exit panel â†’ workout overlay â†’ post-workout â†’ pre-workout â†’ recovery modal â†’ log modal
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

// â”€â”€ Total calories burned across all sessions (Progress page) â”€â”€
function totalCalsBurned() {
  return sessions.reduce((sum, s) => sum + (s.caloriesBurned||0), 0);
}

// â”€â”€ Auto-detect PRs from workout log entries â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
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

// â”€â”€ Save / discard â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// saveWorkoutSummary auto-detects PRs then persists the session.
function saveWorkoutSummary() {
  autoDetectPRs();
  const notes = document.getElementById('pw-notes').value;
  const fd    = wo.finishedData;
  if(!fd) { closePostWorkout(); return; }
  const session = {
    date          : getLocalDateStr(),   // toISOString() was UTC â€” wrong day for UTC+6 morning sessions
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

// â”€â”€ Weight chart resize handler â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// CSS forces canvas { width:100%!important }, so the element stretches to fill
// its container on any window resize or orientation change â€” but the canvas's
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
  }, 150);   // 150 ms debounce â€” fast enough to feel instant, avoids mid-drag thrashing
});

// â”€â”€ One-time event listener init â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// Attaching this inside openPreWorkout() would add a new copy every time the
// modal opens. Attached once here instead so updateWeightNote() is never called
// more than once per keystroke regardless of how many times the modal has opened.
document.getElementById('setup-weight').addEventListener('input', updateWeightNote);

// â”€â”€ Level switcher â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function switchLevel(level) {
  trainingLevel = level;
  save('fitdash_level', level); // use save() for consistent QuotaExceededError handling

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
  if(ms) ms.textContent = `ðŸ“… ${cfg.sessionsPerWeek} per week`;
  if(md) md.textContent = `â± ${cfg.duration}`;
  if(mt) mt.textContent = `ðŸ”‹ ${cfg.setsLabel}`;

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
    const isCircuit = block.id === 'C' || block.type === 'Circuit'; // Treat block C and 'Circuit' custom blocks as circuits
    let tagClass = 'tag-blue';
    if(block.id === 'B' || block.type === 'Giant Set') tagClass = 'tag-red';
    else if(block.id === 'C' || block.type === 'Circuit') tagClass = 'tag-green';
    if(block.id === 'ðŸ› ï¸') tagClass = 'tag-orange';
    
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
              <span class="ex-name">${escapeHtml(ex.name)}</span>
            </div>
            <div style="display:flex;gap:4px;">
              <button class="btn-ghost" style="padding:4px 8px;font-size:12px;color:var(--text);border:1px solid var(--border);" onclick="promptMoveExercise('${ex.code}')">â‡„ Move</button>
              ${ex._isCustom && block.id === 'ðŸ› ï¸' ? `<button class="btn-ghost" style="padding:4px 8px;font-size:12px;color:var(--red);border:1px solid var(--border);" onclick="deleteCustomExercise(${ex._id})">âœ•</button>` : ''}
            </div>
          </div>
        `).join('')}
      </div>
      ${block.id === 'ðŸ› ï¸' ? `<button class="btn-secondary" style="margin-top:12px;width:100%" onclick="showPage('settings')">+ Create Unique Exercise</button>` : ''}
      <div class="sets-grid" id="sets-grid-${block.id}">${cfg.gridHTML(isCircuit)}</div>
      <div class="rest-note" id="rest-note-${block.id}">${cfg.note(block.id)}</div>
    </div>
  </div>`;
  });
  
  container.innerHTML = html;
}

// â”€â”€ Init training category and level on page load â”€â”€â”€â”€â”€â”€â”€â”€â”€
switchTrainingCategory(trainingCategory);

// Populate training history on startup â€” without this, the Training tab
// shows an empty history list until the user navigates away and back,
// because showPage('training') is the only other caller of renderTrainingHistory().
renderTrainingHistory();

// â•â• CUSTOM EXERCISES â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
let customExercises = safeLoad('fitdash_custom_ex', []);
let workoutOverrides = safeLoad('fitdash_overrides', {}); // format: { exCode: 'targetBlockId' }
let exerciseVideoOverrides = safeLoad('fitdash_video_codes', {}); // format: { videoKey: 'youtubeId' }

function normalizeYouTubeId(value) {
  const input = String(value || '').trim();
  if(!input) return '';
  const match = input.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/|live\/))([A-Za-z0-9_-]{6,})/i);
  if(match) return match[1];
  return input;
}

function getSavedVideoId(key, fallback) {
  return exerciseVideoOverrides[key] || fallback || '';
}

function saveVideoCode(key, inputId, refreshKind) {
  const input = document.getElementById(inputId);
  if(!input) return;
  const ytId = normalizeYouTubeId(input.value);
  if(ytId) exerciseVideoOverrides[key] = ytId;
  else delete exerciseVideoOverrides[key];
  save('fitdash_video_codes', exerciseVideoOverrides);
  if(refreshKind === 'settings') renderVideoCodeLibrary();
  else if(refreshKind === 'training') renderTrainingBlocks(LEVEL_CONFIG[trainingLevel]);
  alert(ytId ? 'Video code saved.' : 'Video code cleared.');
}

function saveCustomExercise() {
  const name = document.getElementById('cx-name').value.trim();
  const muscle = document.getElementById('cx-muscle').value.trim();
  const tips = document.getElementById('cx-tips').value.trim();
  const ytId = normalizeYouTubeId(document.getElementById('cx-yt').value.trim());
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
  
  const cx = { id: Date.now(), code: exCode, name, muscle, tips, ytId, block: targetBlock };
  customExercises.push(cx);
  save('fitdash_custom_ex', customExercises);
  _cachedFullPlanDeps = ''; (document.getElementById('training-blocks-container')) renderTrainingBlocks(LEVEL_CONFIG[trainingLevel]);
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
        ${(cx.ytId || cx.ytQuery) ? `<div style="font-size:11px;color:var(--muted2);margin-top:3px">Video: ${escapeHtml(cx.ytId || cx.ytQuery)}</div>` : ''}
      </div>
      <button class="del-btn" onclick="deleteCustomExercise(${cx.id})">Ã—</button>
    </div>
  `).join('');
}

function saveCurrentWorkoutTemplate() {
  const templates = safeLoad('fitdash_workout_templates', []);
  const plan = getFullWorkoutPlan().filter(block => block.id !== 'ðŸ› ï¸').map(block => ({ name:block.name, type:block.type, exercises:block.exercises.map(ex => ex.name) }));
  templates.unshift({ name:`${trainingCategory === 'gym' ? 'Gym' : 'Home'} Template ${new Date().toLocaleDateString()}`, category:trainingCategory, plan });
  save('fitdash_workout_templates', templates.slice(0,10));
  alert('Workout template saved.');
}

function renderVideoCodeLibrary() {
  const el = document.getElementById('exercise-video-library');
  if(!el) return;

  const sections = [];
  sections.push('<div style="font-size:13px;color:var(--muted);margin-bottom:12px;line-height:1.5">Paste a YouTube video code or full URL for each exercise. These values control the demo button across training and rest-day routines.</div>');

  WORKOUT_PLAN.forEach(block => {
    sections.push(`<div style="margin-bottom:18px"><div style="font-size:14px;font-weight:800;margin-bottom:8px">Block ${escapeHtml(block.id)} Â· ${escapeHtml(block.name)}</div>`);
    block.exercises.forEach(ex => {
      const inputId = `video-${ex.code}`;
      const saved = getSavedVideoId(ex.code, ex.ytId || '');
      sections.push(`
        <div style="display:flex;gap:8px;align-items:flex-end;margin-bottom:8px;flex-wrap:wrap">
          <div style="flex:1;min-width:220px">
            <label class="settings-label">${escapeHtml(ex.code)} Â· ${escapeHtml(ex.name)}</label>
            <input type="text" class="settings-input" id="${inputId}" placeholder="YouTube video ID or URL" value="${escapeHtml(saved)}">
          </div>
          <button class="btn-ghost" style="min-width:88px" onclick="saveVideoCode('${ex.code}', '${inputId}', 'settings')">Save</button>
        </div>`);
    });
    sections.push('</div>');
  });

  sections.push('<div style="border-top:1px solid var(--border);padding-top:18px;margin-bottom:18px"><div style="font-size:15px;font-weight:800;margin-bottom:6px">ðŸ‹ï¸ Gym Program Videos</div><div style="font-size:12px;color:var(--muted);margin-bottom:12px">Gym exercise video codes are stored separately from the Home program.</div>');
  GYM_WORKOUT_PLAN.forEach(block => {
    sections.push(`<div style="margin-bottom:18px"><div style="font-size:14px;font-weight:800;margin-bottom:8px">Block ${escapeHtml(block.id)} Â· ${escapeHtml(block.name)}</div>`);
    block.exercises.forEach(ex => {
      const inputId = `video-gym-${ex.code}`;
      const saved = getSavedVideoId(ex.code, ex.ytId || '');
      sections.push(`
        <div style="display:flex;gap:8px;align-items:flex-end;margin-bottom:8px;flex-wrap:wrap">
          <div style="flex:1;min-width:220px">
            <label class="settings-label">${escapeHtml(ex.code)} Â· ${escapeHtml(ex.name)}</label>
            <input type="text" class="settings-input" id="${inputId}" placeholder="YouTube video ID or URL" value="${escapeHtml(saved)}">
          </div>
          <button class="btn-ghost" style="min-width:88px" onclick="saveVideoCode('${ex.code}', '${inputId}', 'settings')">Save</button>
        </div>`);
    });
    sections.push('</div>');
  });
  sections.push('</div>');

  if(customExercises.length) {
    sections.push('<div style="border-top:1px solid var(--border);padding-top:18px;margin-bottom:18px"><div style="font-size:15px;font-weight:800;margin-bottom:6px">ðŸ› ï¸ Custom Exercise Videos</div><div style="font-size:12px;color:var(--muted);margin-bottom:12px">These codes are linked to your Custom Block exercises.</div>');
    customExercises.forEach(cx => {
      const key = `custom:${cx.id}`;
      const inputId = `video-custom-${cx.id}`;
      const saved = getSavedVideoId(key, cx.ytId || '');
      sections.push(`
        <div style="display:flex;gap:8px;align-items:flex-end;margin-bottom:8px;flex-wrap:wrap">
          <div style="flex:1;min-width:220px">
            <label class="settings-label">${escapeHtml(cx.code)} Â· ${escapeHtml(cx.name)}</label>
            <input type="text" class="settings-input" id="${inputId}" placeholder="YouTube video ID or URL" value="${escapeHtml(saved)}">
          </div>
          <button class="btn-ghost" style="min-width:88px" onclick="saveVideoCode('${key}', '${inputId}', 'settings')">Save</button>
        </div>`);
    });
    sections.push('</div>');
  }

  Object.entries(RECOVERY_ROUTINES).forEach(([tab, routines]) => {
    const title = tab === 'mobility' ? 'Rest Day Â· Full Body Mobility' : tab === 'stretch' ? 'Rest Day Â· Lower Body Stretch' : 'Rest Day Â· Upper Body Relief';
    sections.push(`<div style="margin-bottom:18px"><div style="font-size:14px;font-weight:800;margin-bottom:8px">${title}</div>`);
    routines.forEach((routine, idx) => {
      const key = `recovery:${tab}:${idx}`;
      const inputId = `video-${tab}-${idx}`;
      const saved = getSavedVideoId(key, routine.ytId || '');
      sections.push(`
        <div style="display:flex;gap:8px;align-items:flex-end;margin-bottom:8px;flex-wrap:wrap">
          <div style="flex:1;min-width:220px">
            <label class="settings-label">${escapeHtml(routine.title)}</label>
            <input type="text" class="settings-input" id="${inputId}" placeholder="YouTube video ID or URL" value="${escapeHtml(saved)}">
          </div>
          <button class="btn-ghost" style="min-width:88px" onclick="saveVideoCode('${key}', '${inputId}', 'settings')">Save</button>
        </div>`);
    });
    sections.push('</div>');
  });

  el.innerHTML = sections.join('');
}

// â•â• CARDIO â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
function getWeekKey() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);                        // normalise to midnight â€” without this,
                                                  // (d - jan1)/86400000 is fractional and
                                                  // Math.ceil rolls the week 24 hrs early
  const jan1 = new Date(d.getFullYear(), 0, 1);
  return d.getFullYear() + '-W' + Math.ceil(((d - jan1) / 86400000 + jan1.getDay() + 1) / 7);
}

function addCardio() {
  const raw = Number(document.getElementById('cardio-add').value);
  // Number() rejects "10abc" that parseInt would accept as 10
  if(!Number.isFinite(raw) || raw <= 0) {
    alert('Please enter a positive number of minutes.');
    return;
  }
  if(raw > 300) {
    alert('Please enter a realistic session duration (1â€“300 min).');
    return;
  }
  const mins = Math.round(raw); // integer minutes prevents floating-point drift
  const wk = getWeekKey();
  if(lastCardioReset !== wk) { cardioMins=0; lastCardioReset=wk; }
  cardioMins += mins;
  save('fitdash_cardio', cardioMins);
  save('fitdash_cardio_week', lastCardioReset);
  document.getElementById('cardio-add').value = '';
  renderCardio();
}

function resetCardio() {
  cardioMins = 0;
  lastCardioReset = getWeekKey();          // sync week key so auto-reset logic stays consistent
  save('fitdash_cardio', 0);
  save('fitdash_cardio_week', lastCardioReset);
  renderCardio();
}

function renderCardio() {
  // â”€â”€ Week-reset check (was only in addCardio before this fix) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
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
}

function renderTrainingReminder() {
  const el = document.getElementById('training-reminder');
  if(!el) return;
  const day = new Date().getDay();
  const scheduled = (userProfile.schedule || [0,1,2,3,4,5,6]).includes(day);
  if(!userProfile.reminderEnabled || !scheduled) {
    el.innerHTML = '<div style="font-size:12px;color:var(--muted);text-align:center">Rest or active recovery day. Adjust your schedule in Settings.</div>';
    return;
  }
  el.innerHTML = `<div class="card" style="padding:12px 16px;border-color:var(--red)"><strong>Today is a training day.</strong> Suggested reminder: ${escapeHtml(userProfile.reminderTime || '18:00')}. Warm up, train with control, and follow your selected Home/Gym plan.</div>`;
}

// â•â• PR TRACKER â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
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
  // Require strictly higher weight â€” equal weight doesn't set a new personal record.
  // The previous condition (wt < prs[ex].weight) let equal weight through, updating
  // the PR date silently even though the user tied rather than beat their record.
  if(prs[ex] && wt <= prs[ex].weight) {
    alert(`Your current PR for "${ex}" is ${prs[ex].weight} kg â€” enter a higher weight to update it.`);
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
    el.innerHTML = '<div class="empty-state" style="grid-column:1/-1"><div class="empty-icon">ðŸ†</div><p>No PRs logged yet.<br>Set your first personal record!</p></div>';
    return;
  }
  // Use btoa() to encode exercise names as data attributes â€” avoids inline onclick breakage
  // from special characters (apostrophes, backticks, quotes) in exercise names.
  el.innerHTML = keys.map(k => `
    <div class="pr-card" style="position:relative" data-pr-key="${btoa(unescape(encodeURIComponent(k)))}">
      <button class="pr-delete-btn del-btn del-btn-sm"
        title="Delete this PR"
        style="position:absolute;top:8px;right:8px">Ã—</button>
      <div class="pr-exname" style="padding-right:22px">${k}</div>
      <div class="pr-value">${prs[k].weight} kg</div>
      <div class="pr-date">${prs[k].date}</div>
    </div>`).join('');

  // Delegated handler assigned via .onclick (not addEventListener) so repeated
  // renderPRs() calls overwrite the previous handler instead of stacking a new
  // copy on top. addEventListener accumulates â€” after 10 renders, one click
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
 * Manual sessions store exercises â†’ { set1, set2, set3 } objects, so we must
 * sum the filled-in set values â€” not just count the exercise keys.
 */
function countSets(s) {
  if(s.setsCompleted) return s.setsCompleted;
  // Manual sessions: exercises = { "Goblet Squat (A1)": { set1: "50x10", set2: "60x8" }, ... }
  // Guided sessions: exercises = { "A-A1-0": { weight, reps, exName, setLabel }, ... }
  const exValues = Object.values(s.exercises || {});
  if(!exValues.length) return 0;
  // If the first value is an object with 'weight' key, it's a guided log â€” each key = 1 set
  if(exValues[0] && typeof exValues[0] === 'object' && 'weight' in exValues[0]) {
    return exValues.length;
  }
  // Manual: sum the number of set entries per exercise
  return exValues.reduce((total, sets) => total + Object.keys(sets).length, 0);
}

// â•â• SESSION LOG â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
function openLogModal() {
  const today = getLocalDateStr();   // toISOString() was UTC â€” wrong calendar day for UTC+6 mornings
  document.getElementById('log-date').value = today;
  const el = document.getElementById('log-exercises');
  const numSets = getSetConfig().length;
  el.innerHTML = EXERCISES.map(ex => `
    <div style="margin-bottom:10px">
      <div style="font-size:12px;font-weight:600;color:var(--muted);margin-bottom:6px">${ex}</div>
      <div class="exercise-log-row" style="grid-template-columns:${`repeat(${numSets},1fr)`}">
        ${Array.from({length: numSets}, (_, i) => `<input placeholder="Set ${i+1} wtÃ—reps" style="background:var(--card);border:1px solid var(--border);color:var(--text);border-radius:var(--radius-sm);padding:8px 10px;font-size:13px;outline:none" data-ex="${ex}" data-set="${i+1}">`).join('\n        ')}
      </div>
    </div>`).join('');
  document.getElementById('modal').classList.add('open');
  document.body.style.overflow = 'hidden';   // â† prevent background scroll
}

function closeModal() {
  document.getElementById('modal').classList.remove('open');
  document.body.style.overflow = '';          // â† restore scroll
}

/**
 * Extract the leading weight number from a manual set string.
 * Handles common user formats: "100x10", "80 Ã— 12", "100", "80kgÃ—10".
 * Returns null if no leading number is found.
 */
function parseWeightFromSetStr(str) {
  const m = String(str).match(/^(\d+(?:\.\d+)?)/);
  return m ? parseFloat(m[1]) : null;
}

/**
 * Auto-detect PRs from a manually logged session.
 * autoDetectPRs() only runs inside guided workout completion (saveWorkoutSummary).
 * Manual sessions were silently ignored â€” a PR logged manually was never recorded.
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
    el.innerHTML = '<div class="empty-state"><div class="empty-icon">ðŸ“‹</div><p>No sessions yet. Log your first workout!</p></div>';
    return;
  }
  el.innerHTML = last5.map(s => {
    const d        = parseLocalDate(s.date);
    const durLabel = s.durationSecs
      ? `â± ${String(Math.floor(s.durationSecs/60)).padStart(2,'0')}:${String(s.durationSecs%60).padStart(2,'0')}`
      : '';
    const calLabel = s.caloriesBurned ? `ðŸ”¥ ${s.caloriesBurned} cal` : '';
    const volLabel = s.volumeKg       ? `ðŸ“¦ ${s.volumeKg} kg vol`    : `${countSets(s)} sets logged`;
    const chips    = [durLabel, calLabel, volLabel].filter(Boolean).join(' Â· ');
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
      <button onclick="deleteSession(${s.id})" title="Delete session" class="del-btn del-btn-md">Ã—</button>
    </div>`;
  }).join('');
}





