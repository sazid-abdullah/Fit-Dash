// ══ FORM & BIOMECHANICS STUDIO ═══════════════════════════════
// Offline exercise guide: SVG muscle-activation map + 3-phase execution breakdown.

const MUSCLE_NAMES = {
  chest:'Chest / Pectorals', front_delts:'Front Delts', side_delts:'Side Delts', rear_delts:'Rear Delts', traps:'Traps',
  lats:'Lats', mid_back:'Mid Back / Rhomboids', lower_back:'Lower Back / Erectors', biceps:'Biceps', triceps:'Triceps',
  forearms:'Forearms / Grip', abs:'Abs / Core', obliques:'Obliques', quads:'Quads', hamstrings:'Hamstrings',
  glutes:'Glutes', adductors:'Adductors', abductors:'Glute Med / Abductors', calves:'Calves',
};

const MUSCLE_ALIASES = [
  [/chest|pec/, ['chest']], [/front delt|anterior delt/, ['front_delts']], [/lateral delt|side delt|lateral deltoid/, ['side_delts']],
  [/rear delt|posterior delt/, ['rear_delts']], [/shoulder/, ['front_delts', 'side_delts']], [/trap/, ['traps']],
  [/\blats?\b|latissimus|vertical back|serratus/, ['lats']], [/mid back|rhomboid|horizontal back|upper back/, ['mid_back']],
  [/lower back|erector/, ['lower_back']], [/bicep|brachialis/, ['biceps']], [/tricep/, ['triceps']], [/forearm|grip/, ['forearms']],
  [/core|\babs?\b|abdominal/, ['abs']], [/oblique/, ['obliques']], [/quad/, ['quads']], [/hamstring/, ['hamstrings']],
  [/glute(?!.*med)|glutes/, ['glutes']], [/adductor|inner thigh/, ['adductors']], [/abductor|outer hip|glute med/, ['abductors']],
  [/calf|calves|gastrocnemius|soleus/, ['calves']],
];

// [bad, fix] pairs keep the mistakes list short and scannable.
const FORM_PATTERNS = {
  squat: { label:'Squat pattern', primary:['quads','glutes'], secondary:['adductors','abs','lower_back'],
    setup:'Feet shoulder-width, toes slightly out. Big breath into the belly, brace like you are about to be punched, chest tall.',
    eccentric:'Sit down between the heels for 2–3 seconds, knees tracking over the toes, until the hips reach at least knee height.',
    concentric:'Drive the floor away through the whole foot, hips and chest rising together. Exhale on effort and squeeze the glutes at the top.',
    mistakes:[['Knees caving inward', 'Push the knees out over the little toes the whole rep'], ['Heels lifting / folding forward', 'Sit back between the heels and keep weight over mid-foot']] },
  lunge: { label:'Single-leg squat', primary:['quads','glutes'], secondary:['adductors','hamstrings','abs'],
    setup:'Long split stance, hips square, torso tall or slightly forward. Brace and keep the front foot flat.',
    eccentric:'Lower the back knee straight down for 2–3 seconds until the front thigh is about parallel — feel the stretch in the front glute.',
    concentric:'Push through the front heel and mid-foot to stand. Exhale on effort; don\'t push off the back leg.',
    mistakes:[['Front knee collapsing inward', 'Keep the knee in line with the second toe'], ['Short stance and heel lifting', 'Lengthen the stance until the front heel stays down']] },
  hinge: { label:'Hip hinge', primary:['hamstrings','glutes'], secondary:['lower_back','forearms','mid_back'],
    setup:'Feet hip-width, soft knees, weight close to the legs. Lats tight (“protect your armpits”) and spine neutral.',
    eccentric:'Push the hips back for 2–3 seconds, sliding the load down the thighs until you feel a deep hamstring stretch.',
    concentric:'Drive the hips forward to stand tall, squeezing the glutes hard. Exhale at the top — don\'t lean back.',
    mistakes:[['Rounding the lower back', 'Stop the descent where your back starts to round and brace harder'], ['Squatting the weight down', 'Keep shins nearly vertical and move the hips back, not down']] },
  bridge: { label:'Hip extension', primary:['glutes'], secondary:['hamstrings','abs','adductors'],
    setup:'Upper back on the floor or bench, feet flat about hip-width, shins vertical at the top. Chin tucked, ribs down.',
    eccentric:'Lower the hips under control for 2–3 seconds without letting the lower back arch.',
    concentric:'Drive through the heels and squeeze the glutes to full hip extension; hold 1–2 s at the top, exhale on effort.',
    mistakes:[['Arching the lower back at the top', 'Tuck the pelvis and finish with the glutes, not the spine'], ['Feet too far away (hamstring cramps)', 'Bring the feet in until shins are vertical at the top']] },
  calf: { label:'Ankle plantarflexion', primary:['calves'], secondary:['forearms'],
    setup:'Balls of the feet on a step or plate, knees soft, hold something for balance.',
    eccentric:'Lower the heels for 2–3 seconds into a deep stretch and pause 1 second at the bottom.',
    concentric:'Rise as high as possible onto the big toe, pause and squeeze. Exhale on effort.',
    mistakes:[['Bouncing out of the bottom', 'Pause 1 s in the stretch to remove the bounce'], ['Half reps', 'Use a step so you get the full stretch and full rise']] },
  hpush: { label:'Horizontal press', primary:['chest'], secondary:['triceps','front_delts','abs'],
    setup:'Shoulder blades pulled back and down, chest proud, feet planted. Grip just outside shoulder width, wrists stacked over elbows.',
    eccentric:'Lower for 2–3 seconds to the mid-chest, elbows at 45–60°, until you feel a deep pec stretch.',
    concentric:'Press up and slightly in, keeping the shoulder blades pinned. Exhale on effort and squeeze the chest at the top.',
    mistakes:[['Flaring elbows to 90°', 'Tuck elbows to a 45°–60° arrow path to protect the rotator cuffs and maximise pec recruitment'], ['Shoulders rolling forward at the top', 'Keep the shoulder blades pinned; stop just short of lockout']] },
  vpush: { label:'Overhead press', primary:['front_delts','side_delts'], secondary:['triceps','traps','abs'],
    setup:'Stand or sit tall, glutes and abs braced, load at chin height with forearms vertical.',
    eccentric:'Lower to chin / upper-chest height for 2–3 seconds, elbows slightly in front of the body.',
    concentric:'Press straight up, moving the head back then through so the load finishes over mid-foot. Exhale on effort.',
    mistakes:[['Leaning back to finish the rep', 'Squeeze glutes and ribs down — reduce the load if you still lean'], ['Elbows flared straight out', 'Keep elbows slightly forward of the bar or dumbbells']] },
  hpull: { label:'Horizontal row', primary:['mid_back','lats'], secondary:['biceps','rear_delts','forearms'],
    setup:'Hinge or brace on a support with a flat back, arm long, shoulder blade allowed to stretch forward.',
    eccentric:'Let the weight travel down and forward for 2–3 seconds until the upper back is stretched.',
    concentric:'Drive the elbow back toward the hip (not up), squeeze the shoulder blade for 1 s. Exhale on effort.',
    mistakes:[['Yanking with the torso', 'Keep the torso still — if it moves, the load is too heavy'], ['Shrugging up to the ear', 'Think "elbow to back pocket" and keep the shoulder down']] },
  vpull: { label:'Vertical pull', primary:['lats'], secondary:['biceps','mid_back','forearms','abs'],
    setup:'Grip slightly wider than shoulders, start from a full hang / full stretch with the shoulders up by the ears.',
    eccentric:'Lower for 2–3 seconds all the way to straight arms so the lats get a full stretch.',
    concentric:'Pull the elbows down to the ribs, chest toward the bar. Exhale on effort and pause at the top.',
    mistakes:[['Half reps from bent arms', 'Return to a full hang each rep'], ['Kipping or swinging', 'Brace the core and slow the lowering to 3 s']] },
  pullover: { label:'Shoulder extension', primary:['lats'], secondary:['chest','triceps','abs'],
    setup:'Upper back across a bench or chair, hips level, both hands on the load with soft elbows.',
    eccentric:'Arc the load behind the head for 2–3 seconds until you feel a big lat stretch; ribs stay down.',
    concentric:'Pull the load back over the chest using the lats. Exhale on effort.',
    mistakes:[['Ribs flaring as the arms go back', 'Brace the abs and stop where the ribs start to lift'], ['Bending the elbows a lot (turns into a triceps press)', 'Lock a slight elbow bend and keep it fixed']] },
  lateral: { label:'Shoulder abduction', primary:['side_delts'], secondary:['traps','front_delts'],
    setup:'Slight forward lean, soft elbows, weights by the thighs. Shoulders down away from the ears.',
    eccentric:'Lower over 2–3 seconds, keeping tension — don\'t let the weights rest at the bottom.',
    concentric:'Lead with the elbows out and slightly forward up to shoulder height. Exhale on effort.',
    mistakes:[['Shrugging and swinging', 'Lighten the load and stop at shoulder height'], ['Leading with the hands', 'Elbows lead, pinkies roughly level with thumbs']] },
  reardelt: { label:'Rear-delt fly / pull', primary:['rear_delts'], secondary:['mid_back','traps'],
    setup:'Hinge forward (or face the anchor), soft elbows, shoulder blades relaxed forward.',
    eccentric:'Return the arms for 2–3 seconds under control.',
    concentric:'Sweep the arms wide and back, thinking “hands to the walls”. Exhale on effort, squeeze 1 s.',
    mistakes:[['Squeezing the shoulder blades only', 'Move from the shoulder joint — feel the back of the shoulder'], ['Too heavy, turns into a row', 'Keep the elbow angle fixed and go lighter']] },
  curl: { label:'Elbow flexion', primary:['biceps'], secondary:['forearms'],
    setup:'Stand tall, elbows pinned at the sides, wrists straight.',
    eccentric:'Lower for 2–3 seconds to a full stretch with straight arms.',
    concentric:'Curl up without moving the elbows forward, turn the pinky up at the top and squeeze. Exhale on effort.',
    mistakes:[['Swinging the hips', 'Brace the glutes and lighten the load'], ['Stopping halfway down', 'Fully straighten the arms every rep']] },
  triceps: { label:'Elbow extension', primary:['triceps'], secondary:['forearms','front_delts'],
    setup:'Upper arms fixed (overhead or by the sides), elbows pointing forward, core braced.',
    eccentric:'Bend the elbows for 2–3 seconds into a deep triceps stretch.',
    concentric:'Extend to full lockout and squeeze the back of the arm. Exhale on effort.',
    mistakes:[['Elbows drifting out', 'Keep the elbows narrow and pointing forward'], ['Upper arms moving with the rep', 'Only the forearms move']] },
  dip: { label:'Dip', primary:['triceps','chest'], secondary:['front_delts'],
    setup:'Hands on a stable chair, bench or bars, shoulders down and back, chest up.',
    eccentric:'Lower for 2–3 seconds until the elbows reach about 90°, elbows pointing back.',
    concentric:'Press up to straight arms. Exhale on effort.',
    mistakes:[['Shoulders rolling forward at the bottom', 'Stop at 90° and keep the chest proud'], ['Elbows flaring out', 'Point the elbows straight back']] },
  core: { label:'Core bracing', primary:['abs'], secondary:['obliques','lower_back'],
    setup:'Ribs down, pelvis tucked slightly, breathe out to lock the abs before you move.',
    eccentric:'Move slowly away from the start position (2–3 s) without letting the lower back arch.',
    concentric:'Return under control using the abs, exhale fully on effort.',
    mistakes:[['Lower back arching', 'Shorten the range or bend the knees'], ['Holding the breath the whole set', 'Exhale on effort, sip air between reps']] },
  adduction: { label:'Hip adduction', primary:['adductors'], secondary:['abs'],
    setup:'Sit tall (or side plank) with the hips square and the legs at a comfortable wide stretch.',
    eccentric:'Let the legs open for 2–3 seconds to a deep but comfortable inner-thigh stretch.',
    concentric:'Squeeze the legs together, pause 1 s. Exhale on effort.',
    mistakes:[['Slamming the pads together', 'Pause and squeeze instead of bouncing'], ['Too wide too soon', 'Increase range gradually week by week']] },
  abduction: { label:'Hip abduction', primary:['abductors'], secondary:['glutes'],
    setup:'Sit tall or stand with a slight hip hinge, knees soft, core braced.',
    eccentric:'Bring the legs back in for 2–3 seconds against the resistance.',
    concentric:'Push the knees out with the side of the hip, pause 1 s. Exhale on effort.',
    mistakes:[['Rocking the torso', 'Brace and keep the torso still'], ['Rushing the return', 'Control the way back in']] },
  legmachine: { label:'Knee extension / flexion', primary:['quads','hamstrings'], secondary:['calves'],
    setup:'Line the knee up with the machine pivot, pad just above the ankle, grip the handles.',
    eccentric:'Return for 2–3 seconds to the full stretch.',
    concentric:'Extend or curl fully and squeeze 1 s. Exhale on effort.',
    mistakes:[['Hips lifting off the seat', 'Pull yourself into the seat with the handles'], ['Partial range', 'Use a load you can move through the full range']] },
  general: { label:'Strength movement', primary:[], secondary:['abs'],
    setup:'Set your stance and grip, brace the core and start from a stable position.',
    eccentric:'Lower or return for 2–3 seconds with full control and a deep stretch.',
    concentric:'Drive through the working muscle with intent. Exhale on effort and squeeze at the end range.',
    mistakes:[['Rushing the reps', 'Own a 2–3 s lowering phase every rep'], ['Ego load with sloppy form', 'Drop the weight until every rep looks the same']] },
};

function classifyMovement(name, muscle) {
  const n = String(name || '').toLowerCase();
  const tests = [
    [/pullover/, 'pullover'], [/calf/, 'calf'], [/abduct|lateral walk|side-lying leg|clamshell/, 'abduction'],
    [/adduct|copenhagen/, 'adduction'], [/reverse fly|reverse flye|rear delt|face pull|pull-apart|reverse pec|y-t/, 'reardelt'],
    [/lateral raise/, 'lateral'], [/leg curl|leg extension/, 'legmachine'], [/curl/, 'curl'],
    [/skull|tricep|pushdown|overhead extension|kickback/, 'triceps'], [/\bdips?\b/, 'dip'],
    [/pull-?up|chin-?up|pulldown/, 'vpull'], [/\brows?\b/, 'hpull'],
    [/overhead press|shoulder press|pike|military|ohp/, 'vpush'], [/push-?up|bench press|floor press|chest press|press-up|\bpress\b/, 'hpush'],
    [/bridge|hip thrust|glute/, 'bridge'], [/deadlift|\brdl\b|good morning|hinge|swing/, 'hinge'],
    [/lunge|split squat|step-?up|bulgarian/, 'lunge'], [/squat|leg press|hack|wall sit/, 'squat'],
    [/plank|crunch|dead bug|bird dog|hollow|sit-?up|leg raise|knee raise|mountain|twist|pallof|\babs?\b/, 'core'],
  ];
  for(const [re, key] of tests) if(re.test(n)) return key;
  const m = String(muscle || '').toLowerCase();
  const byMuscle = [[/quad/, 'squat'], [/hamstring/, 'hinge'], [/glute/, 'bridge'], [/chest|pec/, 'hpush'], [/lat|back/, 'hpull'],
    [/shoulder|delt/, 'vpush'], [/bicep/, 'curl'], [/tricep/, 'triceps'], [/core|abs/, 'core'], [/calf/, 'calf']];
  for(const [re, key] of byMuscle) if(re.test(m)) return key;
  return 'general';
}

function musclesFromText(text) {
  const t = String(text || '').toLowerCase();
  const out = [];
  MUSCLE_ALIASES.forEach(([re, ids]) => { if(re.test(t)) ids.forEach(id => { if(!out.includes(id)) out.push(id); }); });
  return out;
}

function isBodyweightMove(name) {
  return /bodyweight|push-?up|pull-?up|chin-?up|plank|dead bug|inverted|pike|chair dip|bench dip|y-t|hollow|single-leg|towel/i.test(String(name || ''));
}

function buildFormGuide(ex) {
  const key = classifyMovement(ex.name, ex.muscle);
  const pat = FORM_PATTERNS[key] || FORM_PATTERNS.general;
  const fromText = musclesFromText(ex.muscle);
  const primary = fromText.length ? fromText.slice(0, 4) : (pat.primary.length ? pat.primary : ['abs']);
  const secondary = [...pat.primary, ...pat.secondary].filter((m, i, a) => !primary.includes(m) && a.indexOf(m) === i).slice(0, 4);
  const compound = ['squat', 'lunge', 'hinge', 'bridge', 'hpush', 'vpush', 'hpull', 'vpull'].includes(key);
  const cue = isBodyweightMove(ex.name)
    ? 'Target 1–2 reps shy of muscular failure (RIR 1–2) with strict control. When you beat the top of the rep range, add +1–2 reps, a slower 3 s lowering, or a loaded backpack next session.'
    : `Target 1–2 reps shy of muscular failure (RIR 1–2) with strict control before adding ${compound ? '+2.5 kg' : '+1–2 kg'} or +1 rep next session.`;
  return { key, label: pat.label, primary, secondary, setup: pat.setup, eccentric: pat.eccentric, concentric: pat.concentric, mistakes: pat.mistakes, cue };
}

// ── SVG anatomy (shapes drawn for the viewer's left side, mirrored for the right) ──
const BODY_SHAPES = [
  ['circle', { cx:100, cy:30, r:17 }, true], ['rect', { x:92, y:45, width:16, height:12, rx:4 }, true],
  ['path', { d:'M62,60 Q100,50 138,60 L144,118 Q136,160 132,198 L68,198 Q64,160 56,118 Z' }, true],
  ['ellipse', { cx:52, cy:96, rx:11, ry:30, rot:10 }], ['ellipse', { cx:42, cy:150, rx:9, ry:28, rot:8 }],
  ['circle', { cx:37, cy:185, r:7 }], ['ellipse', { cx:83, cy:252, rx:18, ry:52, rot:3 }],
  ['ellipse', { cx:85, cy:336, rx:12, ry:40, rot:0 }], ['ellipse', { cx:85, cy:382, rx:12, ry:6, rot:0 }],
];

const MUSCLE_SHAPES = {
  front: [
    ['front_delts', { cx:63, cy:70, rx:11, ry:10, rot:-25 }], ['side_delts', { cx:52, cy:73, rx:6, ry:10, rot:10 }],
    ['chest', { cx:84, cy:84, rx:17, ry:12, rot:8 }], ['biceps', { cx:52, cy:102, rx:7.5, ry:17, rot:10 }],
    ['forearms', { cx:43, cy:146, rx:7, ry:21, rot:8 }], ['abs', { cx:100, cy:134, rx:13, ry:32, rot:0 }, true],
    ['obliques', { cx:74, cy:138, rx:7, ry:22, rot:-6 }], ['quads', { cx:82, cy:248, rx:14, ry:38, rot:3 }],
    ['adductors', { cx:95, cy:226, rx:6, ry:20, rot:-8 }], ['calves', { cx:83, cy:330, rx:8, ry:25, rot:0 }],
  ],
  back: [
    ['traps', { cx:100, cy:70, rx:24, ry:13, rot:0 }, true], ['rear_delts', { cx:62, cy:74, rx:10, ry:9, rot:-20 }],
    ['side_delts', { cx:52, cy:74, rx:6, ry:10, rot:10 }], ['mid_back', { cx:89, cy:96, rx:8, ry:15, rot:0 }],
    ['lats', { cx:75, cy:120, rx:12, ry:30, rot:14 }], ['lower_back', { cx:93, cy:166, rx:6, ry:20, rot:0 }],
    ['triceps', { cx:52, cy:104, rx:7.5, ry:18, rot:10 }], ['forearms', { cx:43, cy:146, rx:7, ry:21, rot:8 }],
    ['abductors', { cx:72, cy:198, rx:7, ry:9, rot:0 }], ['glutes', { cx:87, cy:214, rx:15, ry:16, rot:0 }],
    ['hamstrings', { cx:83, cy:262, rx:13, ry:32, rot:3 }], ['calves', { cx:84, cy:326, rx:10, ry:24, rot:0 }],
  ],
};

function svgShape(tag, a, mirror, extra) {
  const m = mirror ? { ...a, cx: a.cx !== undefined ? 200 - a.cx : undefined, rot: a.rot ? -a.rot : 0 } : a;
  if(tag === 'ellipse') return `<ellipse cx="${m.cx}" cy="${m.cy}" rx="${m.rx}" ry="${m.ry}" transform="rotate(${m.rot || 0} ${m.cx} ${m.cy})" ${extra}/>`;
  if(tag === 'circle') return `<circle cx="${m.cx}" cy="${m.cy}" r="${m.r}" ${extra}/>`;
  if(tag === 'rect') return `<rect x="${a.x}" y="${a.y}" width="${a.width}" height="${a.height}" rx="${a.rx}" ${extra}/>`;
  return `<path d="${a.d}" ${extra}/>`;
}

function bodyViewSvg(view, primary, secondary, offsetX) {
  const body = BODY_SHAPES.map(([tag, a, center]) => svgShape(tag, a, false, 'class="fg-body"') + (center ? '' : svgShape(tag, a, true, 'class="fg-body"'))).join('');
  const muscles = MUSCLE_SHAPES[view].map(([id, a, center]) => {
    const cls = primary.includes(id) ? 'fg-muscle fg-primary' : secondary.includes(id) ? 'fg-muscle fg-secondary' : 'fg-muscle';
    const one = (m) => {
      const cx = m ? 200 - a.cx : a.cx, rot = m ? -(a.rot || 0) : (a.rot || 0);
      return `<ellipse class="${cls}" data-muscle="${id}" cx="${cx}" cy="${a.cy}" rx="${a.rx}" ry="${a.ry}" transform="rotate(${rot} ${cx} ${a.cy})"><title>${MUSCLE_NAMES[id]}</title></ellipse>`;
    };
    return one(false) + (center ? '' : one(true));
  }).join('');
  return `<g transform="translate(${offsetX},0)">${body}${muscles}<text x="100" y="398" text-anchor="middle" class="fg-view-label">${view === 'front' ? 'FRONT' : 'BACK'}</text></g>`;
}

function muscleMapSvg(primary, secondary) {
  return `<svg class="fg-svg" viewBox="0 0 420 402" role="img" aria-label="Muscle map: primary ${primary.map(m => MUSCLE_NAMES[m]).join(', ')}">
    ${bodyViewSvg('front', primary, secondary, 0)}${bodyViewSvg('back', primary, secondary, 220)}</svg>`;
}

// ── Modal ──
let formGuideCtx = null;

function openFormGuide(ex) {
  if(!ex || !ex.name) return;
  const g = buildFormGuide(ex);
  let modal = document.getElementById('form-guide-modal');
  if(!modal) {
    modal = document.createElement('div');
    modal.id = 'form-guide-modal';
    modal.className = 'swap-modal form-guide-modal';
    modal.addEventListener('click', e => { if(e.target === modal) closeFormGuide(); });
    document.body.appendChild(modal);
  }
  const phases = [
    ['⚙️', 'Setup & Bracing', g.setup, 2], ['📉', 'Eccentric (The Stretch)', g.eccentric, 3], ['🚀', 'Concentric (The Drive)', g.concentric, 1.5],
  ];
  modal.innerHTML = `
    <div class="swap-dialog form-dialog" role="dialog" aria-modal="true" aria-labelledby="fg-title">
      <button class="swap-close" onclick="closeFormGuide()" aria-label="Close">✕</button>
      <div class="fg-kicker">🎯 Form &amp; Biomechanics Studio · ${escapeHtml(g.label)}</div>
      <h3 id="fg-title" style="margin:2px 0 6px">${escapeHtml(ex.name)}</h3>
      ${ex.muscle ? `<div style="font-size:12px;color:var(--muted);margin-bottom:8px">${escapeHtml(ex.muscle)}</div>` : ''}
      <div class="fg-map">${muscleMapSvg(g.primary, g.secondary)}</div>
      <div class="fg-legend">
        <span><i class="fg-dot fg-dot-primary"></i>Primary: ${g.primary.map(m => escapeHtml(MUSCLE_NAMES[m])).join(', ')}</span>
        ${g.secondary.length ? `<span><i class="fg-dot fg-dot-secondary"></i>Secondary / stabilisers: ${g.secondary.map(m => escapeHtml(MUSCLE_NAMES[m])).join(', ')}</span>` : ''}
      </div>
      <div class="fg-section-title">3-Phase Execution <button class="btn-ghost fg-play" id="fg-play" onclick="toggleFormGuidePlay()" aria-pressed="false">▶ Play tempo</button></div>
      <div class="fg-phases" role="tablist">
        ${phases.map(([icon, title], i) => `<button class="fg-phase-tab${i === 0 ? ' active' : ''}" role="tab" aria-selected="${i === 0}" onclick="selectFormPhase(${i})">${icon} ${i + 1}. ${title.split(' (')[0]}</button>`).join('')}
      </div>
      ${phases.map(([icon, title, text, secs], i) => `
        <div class="fg-phase${i === 0 ? ' active' : ''}" data-phase="${i}" data-secs="${secs}" role="tabpanel">
          <div class="fg-phase-title">${icon} ${escapeHtml(title)}</div>
          <div class="fg-phase-text">${escapeHtml(text)}</div>
          <div class="fg-tempo"><div class="fg-tempo-fill"></div></div>
        </div>`).join('')}
      ${ex.tips ? `<div class="fg-cue">💡 <strong>Coach cue:</strong> ${escapeHtml(ex.tips)}</div>` : ''}
      <div class="fg-section-title">⚠️ Common Mistakes vs. Pro Fixes</div>
      <ul class="fg-mistakes">${g.mistakes.map(([bad, fix]) => `<li><span class="fg-bad">❌ ${escapeHtml(bad)}</span> → <span class="fg-fix">✅ ${escapeHtml(fix)}</span></li>`).join('')}</ul>
      <div class="fg-section-title">📈 Progressive Effort Cue</div>
      <div class="fg-progress">${escapeHtml(g.cue)}</div>
    </div>`;
  modal.style.display = 'flex';
  formGuideCtx = { phase: 0, timer: null, playing: false };
  modal.querySelector('.swap-close').focus();
}

function selectFormPhase(i) {
  const modal = document.getElementById('form-guide-modal');
  if(!modal || !formGuideCtx) return;
  formGuideCtx.phase = i;
  modal.querySelectorAll('.fg-phase-tab').forEach((t, j) => { t.classList.toggle('active', j === i); t.setAttribute('aria-selected', String(j === i)); });
  modal.querySelectorAll('.fg-phase').forEach((p, j) => {
    p.classList.toggle('active', j === i);
    const fill = p.querySelector('.fg-tempo-fill');
    if(!fill) return;
    fill.style.transition = 'none'; fill.style.width = '0%';
    if(j === i && formGuideCtx.playing) {
      void fill.offsetWidth;
      fill.style.transition = `width ${p.dataset.secs}s linear`;
      fill.style.width = '100%';
    }
  });
}

function toggleFormGuidePlay() {
  if(!formGuideCtx) return;
  const btn = document.getElementById('fg-play');
  if(formGuideCtx.playing) { stopFormGuidePlay(); return; }
  formGuideCtx.playing = true;
  if(btn) { btn.textContent = '❚❚ Pause'; btn.setAttribute('aria-pressed', 'true'); }
  const step = (i) => {
    if(!formGuideCtx || !formGuideCtx.playing) return;
    selectFormPhase(i);
    const panel = document.querySelector(`#form-guide-modal .fg-phase[data-phase="${i}"]`);
    const secs = Number(panel?.dataset.secs) || 2;
    formGuideCtx.timer = setTimeout(() => step((i + 1) % 3), (secs + 0.6) * 1000);
  };
  step(formGuideCtx.phase);
}

function stopFormGuidePlay() {
  if(!formGuideCtx) return;
  clearTimeout(formGuideCtx.timer);
  formGuideCtx.playing = false;
  const btn = document.getElementById('fg-play');
  if(btn) { btn.textContent = '▶ Play tempo'; btn.setAttribute('aria-pressed', 'false'); }
  selectFormPhase(formGuideCtx.phase);
}

function closeFormGuide() {
  stopFormGuidePlay();
  formGuideCtx = null;
  const modal = document.getElementById('form-guide-modal');
  if(modal) modal.style.display = 'none';
}

function findExerciseByCode(code) {
  for(const block of getFullWorkoutPlan()) {
    const ex = block.exercises.find(e => e.code === code);
    if(ex) return ex;
  }
  return findBaseExercise(code) || (customExercises || []).find(cx => cx.code === code) || null;
}

function openFormGuideByCode(code) { openFormGuide(findExerciseByCode(code)); }

function openFormGuideForCurrentStep() {
  const ex = getFullWorkoutPlan()[wo.blockIdx]?.exercises[wo.exIdx];
  if(ex) openFormGuide(ex);
}

// Escape closes the guide before the workout overlay's own Escape handling runs.
document.addEventListener('keydown', e => {
  const modal = document.getElementById('form-guide-modal');
  if(e.key === 'Escape' && modal && modal.style.display === 'flex') { e.stopImmediatePropagation(); closeFormGuide(); }
}, true);
