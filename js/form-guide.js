// ══ FORM & BIOMECHANICS STUDIO ═══════════════════════════════
// Offline exercise guide: SVG muscle-activation map + 3-phase execution breakdown.

const MUSCLE_NAMES = {
  chest:'Chest / Pectorals', front_delts:'Front Delts', side_delts:'Side Delts', rear_delts:'Rear Delts', traps:'Traps',
  lats:'Lats', mid_back:'Mid Back / Rhomboids', lower_back:'Lower Back / Erectors', biceps:'Biceps', triceps:'Triceps',
  forearms:'Forearms / Grip', abs:'Abs / Core', obliques:'Obliques', quads:'Quads', hamstrings:'Hamstrings',
  glutes:'Glutes', adductors:'Adductors', abductors:'Glute Med / Abductors', calves:'Calves', serratus:'Serratus Anterior',
};

const MUSCLE_ALIASES = [
  [/chest|pec/, ['chest']], [/front delt|anterior delt/, ['front_delts']], [/lateral delt|side delt|lateral deltoid/, ['side_delts']],
  [/rear delt|posterior delt/, ['rear_delts']], [/shoulder/, ['front_delts', 'side_delts']], [/trap/, ['traps']],
  [/\blats?\b|latissimus|vertical back/, ['lats']], [/serratus/, ['serratus']], [/mid back|rhomboid|horizontal back|upper back/, ['mid_back']],
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

// ── Muscle map: true anatomical paths live in js/anatomy-svg.js ──
function muscleMapSvg(primary, secondary) { return anatomyMapSvg(primary, secondary); }

// ── Phase-synced 2D biomechanics figure (side view, facing +x). ──
// Each pose is a set of joint angles: tr trunk lean, fx upper-spine flexion, nk neck, arm/fore and
// thigh/shin absolute segment angles (0 = pointing down, 90 = forward). W / A / A2 pin a hand or
// ankle to a point and the elbow / knee is then solved with two-bone IK, so limbs never stretch.
const ML = { th:42, sh:42, tl:24, tu:24, nk:16, ua:29, fa:26, ft:14 };
const FLOOR_Y = 184;
const mvec = (a, l) => [Math.sin(a * Math.PI / 180) * l, Math.cos(a * Math.PI / 180) * l];
const madd = (p, v) => [p[0] + v[0], p[1] + v[1]];
const msub = (a, b) => [a[0] - b[0], a[1] - b[1]];
const munit = v => { const l = Math.hypot(v[0], v[1]) || 1; return [v[0] / l, v[1] / l]; };
const mmul = (v, k) => [v[0] * k, v[1] * k];
const r1 = n => Math.round(n * 10) / 10;

function solveIK(root, target, l1, l2, bend) {
  const d = msub(target, root), dist = Math.hypot(d[0], d[1]) || 1e-6, u = [d[0] / dist, d[1] / dist];
  const dc = Math.min(dist, l1 + l2 - 0.01), a = (l1 * l1 - l2 * l2 + dc * dc) / (2 * dc), h = Math.sqrt(Math.max(0, l1 * l1 - a * a));
  return [madd(madd(root, mmul(u, a)), [-u[1] * h * bend, u[0] * h * bend]), madd(root, mmul(u, dc))];
}

function solvePose(q, spec) {
  const P = q.P, up = 180 - (q.tr || 0);
  const T = madd(P, mvec(up, ML.tl)), S = madd(T, mvec(up - (q.fx || 0), ML.tu));
  const H = madd(S, mvec(up - (q.fx || 0) - (q.nk || 0), ML.nk));
  let E, W;
  if(q.W) [E, W] = solveIK(S, q.W, ML.ua, ML.fa, spec.eb ?? 1);
  else { E = madd(S, mvec(q.arm || 0, ML.ua)); W = madd(E, mvec(q.fore || 0, ML.fa)); }
  const leg = (A, thigh, shin, kb) => {
    if(A) return solveIK(P, A, ML.th, ML.sh, kb);
    const K = madd(P, mvec(thigh || 0, ML.th)); return [K, madd(K, mvec(shin || 0, ML.sh))];
  };
  const [K, A] = leg(q.A, q.thigh, q.shin, spec.kb ?? -1);
  const two = q.A2 || q.thigh2 !== undefined;
  const [K2, A2] = two ? leg(q.A2, q.thigh2, q.shin2, spec.kb2 ?? -1) : [K, A];
  const foot = (an, ang) => [madd(an, mvec(ang, -3)), madd(an, mvec(ang, ML.ft))];
  const [heel, toe] = foot(A, q.foot ?? 90), [heel2, toe2] = foot(A2, two ? (q.foot2 ?? 90) : (q.foot ?? 90));
  return { P, T, S, H, E, W, K, A, K2, A2, heel, toe, heel2, toe2, hand: madd(W, mmul(munit(msub(W, E)), 5)) };
}

function lerpPose(a, b, t) {
  const out = {};
  new Set([...Object.keys(a), ...Object.keys(b)]).forEach(k => {
    const x = a[k] ?? b[k], y = b[k] ?? a[k];
    out[k] = Array.isArray(x) ? [x[0] + (y[0] - x[0]) * t, x[1] + (y[1] - x[1]) * t] : typeof x === 'number' ? x + (y - x) * t : x;
  });
  return out;
}

function poseDiff(a, b) {
  let m = 0;
  new Set([...Object.keys(a), ...Object.keys(b)]).forEach(k => {
    const x = a[k], y = b[k];
    if(Array.isArray(x) && Array.isArray(y)) m = Math.max(m, Math.abs(x[0] - y[0]), Math.abs(x[1] - y[1]));
    else if(typeof x === 'number' && typeof y === 'number') m = Math.max(m, Math.abs(x - y));
    else if(x !== y) m = Infinity;
  });
  return m;
}

const mBar = (x1, y1, x2, y2, w) => {
  const u = munit([x2 - x1, y2 - y1]), n = [-u[1] * w / 2, u[0] * w / 2];
  return `M${r1(x1 + n[0])},${r1(y1 + n[1])} L${r1(x2 + n[0])},${r1(y2 + n[1])} L${r1(x2 - n[0])},${r1(y2 - n[1])} L${r1(x1 - n[0])},${r1(y1 - n[1])} Z`;
};
const MPROPS = {
  bench: mBar(56, 151, 162, 151, 6) + mBar(70, 154, 70, 184, 4) + mBar(148, 154, 148, 184, 4),
  incline: mBar(110, 155, 70, 113, 7) + mBar(100, 155, 146, 155, 6) + mBar(122, 158, 122, 184, 4) + mBar(84, 130, 84, 184, 3),
  pullup: mBar(60, -4, 180, -4, 4) + mBar(64, -4, 64, 184, 3) + mBar(176, -4, 176, 184, 3),
  dip: mBar(76, 107, 150, 107, 4) + mBar(84, 107, 84, 184, 3) + mBar(142, 107, 142, 184, 3),
  seat: mBar(70, 146, 116, 146, 7) + mBar(92, 150, 92, 184, 4) + mBar(68, 146, 60, 100, 6),
};

const MBASE = { P:[112,96], tr:0, A:[112,180], foot:90, arm:0, fore:0 };
const mpose = (...o) => Object.assign({}, MBASE, ...o);
// poses: [setup, end of eccentric (stretch), end of concentric (contracted)]
const MOTION_SPECS = {
  pushup: { label:'Horizontal press · push-up', note:'Elbows tucked 45–60° from the torso', load:'none', eb:1,
    poses:[ mpose({ A:[48,172], foot:-30, P:[125.6,142], tr:68.9, W:[168,180] }), mpose({ A:[48,172], foot:-30, P:[130.7,166.3], tr:86, W:[168,180] }),
      mpose({ A:[48,172], foot:-30, P:[125.6,142], tr:68.9, W:[168,180] }) ],
    arcs:[['S','E','W','elbow'], ['P','S','E','shoulder']], track:'S', fo:[0,-26] },
  bench: { label:'Horizontal press · bench', note:'Elbows 45–60°, bar over mid-chest', load:'db', eb:-1, kb:1, prop:'bench',
    poses:[ mpose({ P:[96,141], tr:90, A:[66,180], W:[144,86] }), mpose({ P:[96,141], tr:90, A:[66,180], W:[140,124] }),
      mpose({ P:[96,141], tr:90, A:[66,180], W:[144,86] }) ],
    arcs:[['S','E','W','elbow'], ['P','S','E','shoulder']], track:'W', fo:[18,0] },
  incline: { label:'Incline / vertical press', note:'Press over the upper chest, elbows ~45°', load:'db', eb:1, prop:'incline',
    poses:[ mpose({ P:[118,146], tr:-42, A:[160,180], W:[92,57] }), mpose({ P:[118,146], tr:-42, A:[160,180], W:[96,101] }),
      mpose({ P:[118,146], tr:-42, A:[160,180], W:[92,57] }) ],
    arcs:[['S','E','W','elbow']], track:'W', fo:[22,0] },
  ohp: { label:'Vertical press · overhead', note:'Ribs down, bar path over mid-foot', load:'db', eb:1,
    poses:[ mpose({ W:[122,46] }), mpose({ W:[122,46] }), mpose({ W:[113,-6] }) ],
    arcs:[['S','E','W','elbow']], track:'W', fo:[24,0] },
  row: { label:'Horizontal row', note:'Drive the elbow to the hip', load:'db', eb:1,
    poses:[ mpose({ A:[100,180], P:[84,104], tr:62, W:[128,136] }), mpose({ A:[100,180], P:[84,104], tr:62, W:[129,137] }),
      mpose({ A:[100,180], P:[84,104], tr:62, W:[112,108] }) ],
    arcs:[['S','E','W','elbow']], track:'W', fo:[18,0] },
  pullup: { label:'Vertical pull · pull-up', note:'Full hang → elbows to ribs', load:'none', eb:1, prop:'pullup',
    poses:[ { P:[111.5,100], tr:3, W:[118,-2], thigh:10, shin:-60, foot:-30 }, { P:[111.5,100], tr:3, W:[118,-2], thigh:10, shin:-60, foot:-30 },
      { P:[111.5,64], tr:-4, W:[118,-2], thigh:20, shin:-50, foot:-30 } ],
    arcs:[['S','E','W','elbow']], track:'S', fo:[-30,0] },
  squat: { label:'Squat', note:'Knees track over the toes', load:'db',
    poses:[ mpose({ tr:3, arm:25, fore:165 }), mpose({ P:[88,140], tr:38, arm:45, fore:175 }), mpose({ tr:3, arm:25, fore:165 }) ],
    arcs:[['P','K','A','knee'], ['S','P','K','hip']], guide:'knee', track:'P', fo:[-26,0] },
  hinge: { label:'Hip hinge · RDL', note:'Hips back, neutral spine, bar close', load:'bar',
    poses:[ mpose({}), mpose({ P:[76,106], tr:75 }), mpose({}) ],
    arcs:[['S','P','K','hip']], guide:'spine', track:'P', fo:[0,-22] },
  lunge: { label:'Lunge / split squat', note:'Front knee over the second toe', load:'none',
    poses:[ mpose({ A:[132,180], A2:[66,175], foot2:50, P:[100,104], tr:2 }), mpose({ A:[132,180], A2:[66,175], foot2:50, P:[100,138], tr:6 }),
      mpose({ A:[132,180], A2:[66,175], foot2:50, P:[100,104], tr:2 }) ],
    arcs:[['P','K','A','knee']], guide:'knee', track:'P', fo:[-40,0] },
  curl: { label:'Elbow flexion · curl', note:'Elbows pinned to the sides', load:'db',
    poses:[ mpose({ arm:-4, fore:0 }), mpose({ arm:-4, fore:2 }), mpose({ arm:-4, fore:145 }) ],
    arcs:[['S','E','W','elbow']], track:'W', fo:[20,0] },
  overhead: { label:'Elbow extension · overhead', note:'Upper arm fixed, only the forearm moves', load:'db',
    poses:[ mpose({ arm:165, fore:170 }), mpose({ arm:165, fore:315 }), mpose({ arm:165, fore:170 }) ],
    arcs:[['S','E','W','elbow']], track:'W', fo:[-22,0] },
  pushdown: { label:'Elbow extension · pushdown', note:'Elbows pinned, lock out fully', load:'bar',
    poses:[ mpose({ arm:2, fore:2 }), mpose({ arm:2, fore:125 }), mpose({ arm:2, fore:2 }) ],
    arcs:[['S','E','W','elbow']], track:'W', fo:[22,0] },
  dip: { label:'Dip', note:'Lower to ~90° at the elbow', load:'none', eb:1, prop:'dip',
    poses:[ { P:[106.7,96.9], tr:4, W:[110,104], thigh:25, shin:-80, foot:-20 }, { P:[105.6,126.4], tr:15, W:[110,104], thigh:25, shin:-80, foot:-20 },
      { P:[106.7,96.9], tr:4, W:[110,104], thigh:25, shin:-80, foot:-20 } ],
    arcs:[['S','E','W','elbow']], track:'S', fo:[-30,0] },
  plank: { label:'Core · plank brace', note:'One straight line, ribs down', load:'none',
    poses:[ mpose({ A:[40,172], foot:-30, P:[122.9,158.6], tr:80.8, arm:0, fore:90 }), mpose({ A:[40,172], foot:-30, P:[122.9,160], tr:80.8, arm:0, fore:90 }),
      mpose({ A:[40,172], foot:-30, P:[122.9,155.5], tr:79.5, arm:0, fore:90 }) ],
    arcs:[['S','P','K','hip']], guide:'line', track:'P', fo:[0,-24] },
  crunch: { label:'Core · crunch', note:'Curl the ribs toward the pelvis', load:'none',
    poses:[ mpose({ P:[118,174], tr:-90, A:[156,180], arm:90, fore:90 }), mpose({ P:[118,174], tr:-90, A:[156,180], arm:90, fore:90 }),
      mpose({ P:[118,174], tr:-84, fx:36, A:[156,180], arm:100, fore:100 }) ],
    arcs:[['S','T','P','spine']], track:'S', fo:[0,-22] },
  deadbug: { label:'Core · supine anti-extension', note:'Lower back stays glued to the floor', load:'none',
    poses:[ { P:[122,174], tr:-90, arm:180, fore:180, thigh:180, shin:90, foot:180 }, { P:[122,174], tr:-90, arm:262, fore:264, thigh:102, shin:98, foot:110 },
      { P:[122,174], tr:-90, arm:180, fore:180, thigh:180, shin:90, foot:180 } ],
    arcs:[['S','P','K','hip']], guide:'line', track:'A', fo:[0,-10] },
  hollow: { label:'Core · hollow hold', note:'Low back pressed down, legs and arms long', load:'none',
    poses:[ { P:[122,174], tr:-90, fx:14, arm:250, fore:252, thigh:112, shin:110, foot:120 }, { P:[122,174], tr:-90, fx:12, arm:254, fore:256, thigh:108, shin:106, foot:116 },
      { P:[122,174], tr:-90, fx:16, arm:248, fore:250, thigh:114, shin:112, foot:122 } ],
    arcs:[['S','P','K','hip']], guide:'line', track:'A', fo:[0,-10] },
  bridge: { label:'Hip extension · bridge', note:'Finish with the glutes, not the low back', load:'none',
    poses:[ mpose({ P:[104,175], tr:-90, A:[140,180], arm:90, fore:90 }), mpose({ P:[104,175], tr:-90, A:[140,180], arm:90, fore:90 }),
      mpose({ P:[106,146], tr:-117.6, A:[140,180], arm:80, fore:80 }) ],
    arcs:[['S','P','K','hip']], track:'P', fo:[0,-24] },
  calf: { label:'Ankle plantarflexion', note:'Pause in the stretch, rise to the big toe', load:'none',
    poses:[ mpose({}), mpose({}), mpose({ P:[110,85], A:[110,169], foot:40 }) ],
    arcs:[['K','A','toe','ankle']], track:'A', fo:[-22,0] },
  raise: { label:'Shoulder raise', note:'Lead with the elbows to shoulder height', load:'db',
    poses:[ mpose({ arm:4, fore:8 }), mpose({ arm:4, fore:8 }), mpose({ arm:84, fore:90 }) ],
    arcs:[['P','S','E','shoulder']], track:'W', fo:[10,-14] },
  legext: { label:'Knee extension', note:'Knee lined up with the machine pivot', load:'none', prop:'seat',
    poses:[ { P:[100,140], tr:-8, arm:10, fore:30, thigh:88, shin:2, foot:90 }, { P:[100,140], tr:-8, arm:10, fore:30, thigh:88, shin:2, foot:90 },
      { P:[100,140], tr:-8, arm:10, fore:30, thigh:88, shin:84, foot:170 } ],
    arcs:[['P','K','A','knee']], track:'A', fo:[0,18] },
  legcurl: { label:'Knee flexion', note:'Hips pinned, full range', load:'none', prop:'seat',
    poses:[ { P:[100,140], tr:-8, arm:10, fore:30, thigh:88, shin:80, foot:160 }, { P:[100,140], tr:-8, arm:10, fore:30, thigh:88, shin:80, foot:160 },
      { P:[100,140], tr:-8, arm:10, fore:30, thigh:88, shin:-15, foot:75 } ],
    arcs:[['P','K','A','knee']], track:'A', fo:[0,18] },
};

function motionKeyFor(key, name) {
  const n = String(name || '').toLowerCase();
  if(key === 'hpush') return /push-?up|press-?up/.test(n) ? 'pushup' : /incline/.test(n) ? 'incline' : 'bench';
  if(key === 'vpush') return /incline/.test(n) ? 'incline' : 'ohp';
  if(key === 'core' && /hollow/.test(n)) return 'hollow';
  if(key === 'core' && /dead ?bug|leg raise|flutter|scissor/.test(n)) return 'deadbug';
  if(key === 'core') return /crunch|sit-?up|v-?up|jackknife/.test(n) ? 'crunch' : 'plank';
  if(key === 'triceps') return /pushdown|press-?down/.test(n) ? 'pushdown' : 'overhead';
  if(key === 'legmachine') return /curl/.test(n) ? 'legcurl' : 'legext';
  return { hpull:'row', reardelt:'row', vpull:'pullup', pullover:'pullup', lateral:'raise', curl:'curl', dip:'dip', calf:'calf',
    bridge:'bridge', lunge:'lunge', hinge:'hinge', squat:'squat' }[key] || 'squat';
}
function motionSpec(mkey) { return MOTION_SPECS[mkey] || MOTION_SPECS.squat; }

const MOTION_SEG_MUSCLES = {
  torsoU:['chest','lats','mid_back','traps','serratus'], torsoL:['abs','obliques','lower_back'],
  arm:['front_delts','side_delts','rear_delts','biceps','triceps'], fore:['forearms'],
  thigh:['quads','hamstrings','glutes','adductors','abductors'], shin:['calves'],
};

function jointAngle(a, b, c) {
  const v1 = msub(a, b), v2 = msub(c, b);
  const cos = (v1[0] * v2[0] + v1[1] * v2[1]) / (Math.hypot(...v1) * Math.hypot(...v2) || 1);
  return Math.round(Math.acos(Math.max(-1, Math.min(1, cos))) * 180 / Math.PI);
}

// Tapered limb with gently bulging (muscle-belly) sides and rounded ends.
function limbPath(A, B, wa, wb, bulge = 1) {
  const u = munit(msub(B, A)), n = [-u[1], u[0]], L = Math.hypot(B[0] - A[0], B[1] - A[1]);
  const ra = wa / 2, rb = wb / 2, mid = madd(A, mmul(u, L * 0.42)), rm = (ra + rb) / 2 + bulge;
  const p = (pt, s, r) => `${r1(pt[0] + n[0] * r * s)},${r1(pt[1] + n[1] * r * s)}`;
  return `M${p(A, 1, ra)} Q${p(mid, 1, rm)} ${p(B, 1, rb)} A${r1(rb)},${r1(rb)} 0 0 0 ${p(B, -1, rb)} Q${p(mid, -1, rm)} ${p(A, -1, ra)} A${r1(ra)},${r1(ra)} 0 0 0 ${p(A, 1, ra)} Z`;
}

function headPath(H, S) {
  const u = munit(msub(H, S)), f = [-u[1], u[0]], k = 0.5523;
  const at = (a, b) => madd(madd(H, mmul(u, a)), mmul(f, b));
  const T = at(9.5, 0), F = at(0, 8), B = at(-8.5, 1.5), K = at(0, -7.5);
  const c = (pt, du, df) => { const q = madd(madd(pt, mmul(u, du)), mmul(f, df)); return `${r1(q[0])},${r1(q[1])}`; };
  const P = pt => `${r1(pt[0])},${r1(pt[1])}`;
  return `M${P(T)} C${c(T, 0, 8 * k)} ${c(F, 9.5 * k, 0)} ${P(F)} C${c(F, -8.5 * k, 0)} ${c(B, 0, 6.5 * k)} ${P(B)} C${c(B, 0, -8 * k)} ${c(K, -8.5 * k, 0)} ${P(K)} C${c(K, 9.5 * k, 0)} ${c(T, 0, -7.5 * k)} ${P(T)} Z`;
}

function loadPath(J, type) {
  if(type === 'db' || type === 'bar') {
    const r = type === 'bar' ? 9 : 6.5, c = J.hand;
    return Array.from({ length: 8 }, (_, i) => { const a = Math.PI / 8 + i * Math.PI / 4; return `${i ? 'L' : 'M'}${r1(c[0] + Math.cos(a) * r)},${r1(c[1] + Math.sin(a) * r)}`; }).join(' ') + ' Z';
  }
  return '';
}

function packPath(J) {
  const u = munit(msub(J.S, J.T)), f = [-u[1], u[0]], c = madd(madd(J.T, mmul(u, 12)), mmul(f, -12));
  const pt = (a, b) => { const q = madd(madd(c, mmul(u, a)), mmul(f, b)); return `${r1(q[0])},${r1(q[1])}`; };
  return `M${pt(9, 2)} Q${pt(11, -6)} ${pt(7, -7)} L${pt(-9, -7)} Q${pt(-11, -6)} ${pt(-10, 2)} Z`;
}

function arcPath(A, B, C, r = 10) {
  const u = munit(msub(A, B)), v = munit(msub(C, B)), p1 = madd(B, mmul(u, r)), p2 = madd(B, mmul(v, r));
  const sweep = u[0] * v[1] - u[1] * v[0] > 0 ? 1 : 0;
  return `M${r1(B[0])},${r1(B[1])} L${r1(p1[0])},${r1(p1[1])} A${r},${r} 0 0 ${sweep} ${r1(p2[0])},${r1(p2[1])} Z`;
}

function motionSvg(mkey, primary, secondary, exName) {
  const spec = motionSpec(mkey);
  const segCls = part => {
    const m = MOTION_SEG_MUSCLES[part] || [];
    return m.some(x => primary.includes(x)) ? ' fg-on-primary' : m.some(x => secondary.includes(x)) ? ' fg-on-secondary' : '';
  };
  const seg = (part, extra = '') => `<path data-part="${part}" class="fg-seg${segCls(part.replace(/2$/, ''))}${extra}"/>`;
  const pack = mkey === 'pushup' && /backpack|weighted/i.test(exName || '');
  return `<svg class="fg-motion" viewBox="0 -14 240 214" role="img" aria-label="${escapeHtml(spec.label)} animation">
    <defs><marker id="fg-arrowhead" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 Z" fill="#fbbf24"/></marker></defs>
    ${spec.prop ? `<path class="fg-prop" d="${MPROPS[spec.prop]}"/>` : ''}
    <path class="fg-ground" d="M8,${FLOOR_Y} L232,${FLOOR_Y}"/>
    <path class="fg-guide" data-guide d=""/><text class="fg-guide-label" data-guide-label></text>
    <g class="fg-fig">
      ${seg('thigh2', ' fg-far')}${seg('shin2', ' fg-far')}${seg('foot2', ' fg-far')}
      ${seg('torsoL')}${seg('torsoU')}${seg('neck')}<path data-part="head" class="fg-head"/>
      ${pack ? '<path data-part="pack" class="fg-load"/>' : ''}
      ${seg('thigh')}${seg('shin')}${seg('foot')}${seg('arm')}${seg('fore')}${seg('hand')}
      ${spec.load === 'db' || spec.load === 'bar' ? '<path data-part="load" class="fg-load"/>' : ''}
    </g>
    ${spec.arcs.map((_, i) => `<path class="fg-arc" data-arc="${i}"/><text class="fg-angle" data-arc-label="${i}"></text>`).join('')}
    <path class="fg-force" marker-end="url(#fg-arrowhead)" d="" style="opacity:0"/>
    <text class="fg-motion-note" x="8" y="-3">${escapeHtml(spec.note)}</text>
    <text class="fg-motion-label" x="120" y="197" text-anchor="middle">${escapeHtml(spec.label.toUpperCase())}</text></svg>`;
}

function drawMotionPose(svg, q, spec, force) {
  if(!svg) return;
  const J = solvePose(q, spec);
  const set = (part, d) => { const el = svg.querySelector(`[data-part="${part}"]`); if(el) el.setAttribute('d', d); };
  set('torsoL', limbPath(J.P, J.T, 15, 14, 1)); set('torsoU', limbPath(J.T, J.S, 14, 17, 1.5));
  set('neck', limbPath(J.S, madd(J.S, mmul(msub(J.H, J.S), 0.6)), 7, 6, 0)); set('head', headPath(J.H, J.S));
  set('thigh', limbPath(J.P, J.K, 13, 9, 2)); set('shin', limbPath(J.K, J.A, 9, 6, 1.5)); set('foot', limbPath(J.heel, J.toe, 6, 4, 0));
  set('thigh2', limbPath(J.P, J.K2, 13, 9, 2)); set('shin2', limbPath(J.K2, J.A2, 9, 6, 1.5)); set('foot2', limbPath(J.heel2, J.toe2, 6, 4, 0));
  set('arm', limbPath(J.S, J.E, 9, 7, 1.5)); set('fore', limbPath(J.E, J.W, 7, 5, 1)); set('hand', limbPath(J.W, J.hand, 5.5, 4.5, 0));
  set('load', loadPath(J, spec.load)); set('pack', packPath(J));
  spec.arcs.forEach(([a, b, c, name], i) => {
    const arc = svg.querySelector(`[data-arc="${i}"]`), label = svg.querySelector(`[data-arc-label="${i}"]`);
    if(!arc || !label) return;
    arc.setAttribute('d', arcPath(J[a], J[b], J[c]));
    const bis = munit(madd(munit(msub(J[a], J[b])), munit(msub(J[c], J[b]))));
    const at = madd(J[b], mmul(bis[0] || bis[1] ? bis : [0, -1], -16));
    label.setAttribute('x', r1(Math.max(26, Math.min(214, at[0])))); label.setAttribute('y', r1(Math.min(FLOOR_Y - 6, at[1] + 3))); label.setAttribute('text-anchor', 'middle');
    label.textContent = `${name} ${jointAngle(J[a], J[b], J[c])}°`;
  });
  const guide = svg.querySelector('[data-guide]'), gl = svg.querySelector('[data-guide-label]');
  if(guide && gl) {
    let d = '', lx = 0, ly = 0, txt = '';
    if(spec.guide === 'knee') { d = `M${r1(J.toe[0])},${FLOOR_Y} L${r1(J.toe[0])},${r1(J.K[1] - 10)}`; lx = J.toe[0] + 3; ly = FLOOR_Y - 4; txt = 'toe line'; }
    else if(spec.guide === 'spine' || spec.guide === 'line') {
      const from = spec.guide === 'line' ? J.A : J.P, n = munit(msub(J.H, from)), off = [n[1] * 10, -n[0] * 10];
      const p1 = madd(from, off), p2 = madd(J.H, off);
      d = `M${r1(p1[0])},${r1(p1[1])} L${r1(p2[0])},${r1(p2[1])}`; lx = p2[0] - 30; ly = p2[1] - 6; txt = spec.guide === 'line' ? 'straight line' : 'neutral spine';
    }
    guide.setAttribute('d', d); gl.setAttribute('x', r1(lx)); gl.setAttribute('y', r1(ly)); gl.textContent = txt;
  }
  const fe = svg.querySelector('.fg-force');
  if(fe) {
    if(force && Math.hypot(force[2] - force[0], force[3] - force[1]) > 4) { fe.setAttribute('d', `M${r1(force[0])},${r1(force[1])} L${r1(force[2])},${r1(force[3])}`); fe.style.opacity = '1'; }
    else fe.style.opacity = '0';
  }
}

const easeInOutSine = t => -(Math.cos(Math.PI * t) - 1) / 2;
const easeOutCubic = t => 1 - Math.pow(1 - t, 3);

// Moves the figure through one execution phase in real time (secs = the phase's tempo).
function playMotionPhase(phase, secs) {
  const ctx = formGuideCtx, svg = document.querySelector('#form-guide-modal .fg-motion');
  if(!ctx || !svg) return;
  const spec = motionSpec(ctx.motionKey), cur = ctx.q || spec.poses[0];
  cancelAnimationFrame(ctx.raf);
  const reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const legs = [];
  let force = null;
  ctx.prep = 0;
  if(phase === 0) legs.push([cur, spec.poses[0], 600, easeInOutSine]);
  else {
    const from = spec.poses[phase === 1 ? 2 : 1], to = spec.poses[phase], full = Math.max(300, secs * 1000);
    const prep = poseDiff(cur, from) > 1.5 ? Math.min(600, full * 0.25) : 0;
    if(prep) legs.push([cur, from, prep, easeInOutSine]);
    legs.push([from, to, full, phase === 1 ? easeInOutSine : easeOutCubic]);
    ctx.prep = prep;
    const a = solvePose(from, spec)[spec.track], b = solvePose(to, spec)[spec.track], o = spec.fo || [0, 0];
    const dir = munit(msub(b, a)), len = Math.hypot(b[0] - a[0], b[1] - a[1]), pad = Math.min(3, len / 4);
    force = [a[0] + o[0] + dir[0] * pad, a[1] + o[1] + dir[1] * pad, b[0] + o[0] - dir[0] * pad, b[1] + o[1] - dir[1] * pad];
  }
  if(reduce) { const last = legs[legs.length - 1]; ctx.q = last[1]; ctx.prep = 0; drawMotionPose(svg, ctx.q, spec, force); return; }
  let li = 0, start = performance.now();
  const step = now => {
    if(formGuideCtx !== ctx) return;
    const [a, b, dur, ease] = legs[li];
    const t = Math.min(1, (now - start) / dur);
    ctx.q = lerpPose(a, b, ease(t));
    drawMotionPose(svg, ctx.q, spec, force);
    if(t >= 1) { if(++li >= legs.length) return; start = now; }
    ctx.raf = requestAnimationFrame(step);
  };
  ctx.raf = requestAnimationFrame(step);
}

const FG_ICON = (() => {
  const s = (body, cls = '') => `<svg class="fg-ic ${cls}" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${body}</svg>`;
  return {
    target: formTargetIcon(),
    setup: s('<path d="M12 9a3 3 0 1 0 0.01 0"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M4.9 19.1L7 17M17 7l2.1-2.1"/>'),
    down: s('<path d="M12 4v14M6 12l6 6 6-6"/>'), up: s('<path d="M12 20V6M6 12l6-6 6 6"/>'),
    bulb: s('<path d="M9 18h6M10 21h4M12 3a6 6 0 0 0-4 10.5c.8.8 1 1.5 1 2.5h6c0-1 .2-1.7 1-2.5A6 6 0 0 0 12 3z"/>'),
    warn: s('<path d="M12 3l9 16H3z"/><path d="M12 10v4M12 17v.5"/>'), trend: s('<path d="M3 17l6-6 4 4 8-8M15 7h6v6"/>'),
    x: s('<path d="M6 6l12 12M18 6L6 18"/>', 'fg-ic-bad'), check: s('<path d="M5 12l5 5L19 7"/>', 'fg-ic-good'),
    play: s('<path d="M7 5l12 7-12 7z" fill="currentColor"/>'), pause: s('<path d="M8 5v14M16 5v14"/>'),
    close: s('<path d="M6 6l12 12M18 6L6 18"/>'), arrow: s('<path d="M4 12h15M13 6l6 6-6 6"/>', 'fg-ic-arrow'),
  };
})();

// ── Modal ──
let formGuideCtx = null;

function openFormGuide(ex) {
  if(!ex || !ex.name) return;
  const g = buildFormGuide(ex);
  const mkey = motionKeyFor(g.key, ex.name);
  let modal = document.getElementById('form-guide-modal');
  if(!modal) {
    modal = document.createElement('div');
    modal.id = 'form-guide-modal';
    modal.className = 'swap-modal form-guide-modal';
    modal.addEventListener('click', e => { if(e.target === modal) closeFormGuide(); });
    document.body.appendChild(modal);
  }
  const phases = [
    [FG_ICON.setup, 'Setup & Bracing', g.setup, 2], [FG_ICON.down, 'Eccentric (The Stretch)', g.eccentric, 3], [FG_ICON.up, 'Concentric (The Drive)', g.concentric, 1.5],
  ];
  modal.innerHTML = `
    <div class="swap-dialog form-dialog" role="dialog" aria-modal="true" aria-labelledby="fg-title">
      <button class="swap-close" onclick="closeFormGuide()" aria-label="Close">${FG_ICON.close}</button>
      <div class="fg-kicker">${FG_ICON.target} Form &amp; Biomechanics Studio · ${escapeHtml(g.label)}</div>
      <h3 id="fg-title" style="margin:2px 0 6px">${escapeHtml(ex.name)}</h3>
      ${ex.muscle ? `<div style="font-size:12px;color:var(--muted);margin-bottom:8px">${FG_ICON.target} ${escapeHtml(String(ex.muscle).replace(/^[^A-Za-z]+/, ''))}</div>` : ''}
      <div class="fg-visual"><div class="fg-panel"><div class="fg-panel-title"><span>Live biomechanics</span><span class="fg-phase-now" id="fg-phase-now">1 · Setup</span></div>${motionSvg(mkey, g.primary, g.secondary, ex.name)}</div><div class="fg-panel"><div class="fg-panel-title"><span>Muscle activation</span><span>Anterior · Posterior</span></div><div class="fg-map">${muscleMapSvg(g.primary, g.secondary)}</div></div></div>
      <div class="fg-legend">
        <span><i class="fg-dot fg-dot-primary"></i>Primary: ${g.primary.map(m => escapeHtml(MUSCLE_NAMES[m])).join(', ')}</span>
        ${g.secondary.length ? `<span><i class="fg-dot fg-dot-secondary"></i>Secondary / stabilisers: ${g.secondary.map(m => escapeHtml(MUSCLE_NAMES[m])).join(', ')}</span>` : ''}
      </div>
      <div class="fg-section-title">3-Phase Execution <button class="btn-ghost fg-play" id="fg-play" onclick="toggleFormGuidePlay()" aria-pressed="false">${FG_ICON.play} Play tempo</button></div>
      <div class="fg-phases" role="tablist">
        ${phases.map(([icon, title], i) => `<button class="fg-phase-tab${i === 0 ? ' active' : ''}" role="tab" aria-selected="${i === 0}" onclick="selectFormPhase(${i})">${icon} ${i + 1}. ${title.split(' (')[0]}</button>`).join('')}
      </div>
      ${phases.map(([icon, title, text, secs], i) => `
        <div class="fg-phase${i === 0 ? ' active' : ''}" data-phase="${i}" data-secs="${secs}" role="tabpanel">
          <div class="fg-phase-title">${icon} ${escapeHtml(title)}</div>
          <div class="fg-phase-text">${escapeHtml(text)}</div>
          <div class="fg-tempo"><div class="fg-tempo-fill"></div></div>
        </div>`).join('')}
      ${ex.tips ? `<div class="fg-cue">${FG_ICON.bulb} <strong>Coach cue:</strong> ${escapeHtml(ex.tips)}</div>` : ''}
      <div class="fg-section-title"><span>${FG_ICON.warn} Common Mistakes vs. Pro Fixes</span></div>
      <ul class="fg-mistakes">${g.mistakes.map(([bad, fix]) => `<li><span class="fg-bad">${FG_ICON.x} ${escapeHtml(bad)}</span> ${FG_ICON.arrow} <span class="fg-fix">${FG_ICON.check} ${escapeHtml(fix)}</span></li>`).join('')}</ul>
      <div class="fg-section-title"><span>${FG_ICON.trend} Progressive Effort Cue</span></div>
      <div class="fg-progress">${escapeHtml(g.cue)}</div>
    </div>`;
  modal.style.display = 'flex';
  if(formGuideCtx) { clearTimeout(formGuideCtx.timer); cancelAnimationFrame(formGuideCtx.raf); }
  formGuideCtx = { phase: 0, timer: null, playing: false, key: g.key, motionKey: mkey, q: motionSpec(mkey).poses[0], raf: 0 };
  drawMotionPose(modal.querySelector('.fg-motion'), formGuideCtx.q, motionSpec(mkey), null);
  modal.querySelector('.swap-close').focus();
}

function selectFormPhase(i) {
  const modal = document.getElementById('form-guide-modal');
  if(!modal || !formGuideCtx) return;
  formGuideCtx.phase = i;
  const panel = modal.querySelector(`.fg-phase[data-phase="${i}"]`);
  playMotionPhase(i, Number(panel?.dataset.secs) || 2);
  const prep = formGuideCtx.prep || 0;
  const now = document.getElementById('fg-phase-now');
  if(now) now.textContent = `${i + 1} · ${['Setup', 'Eccentric', 'Concentric'][i]} · ${panel?.dataset.secs || 2}s`;
  modal.querySelectorAll('.fg-phase-tab').forEach((t, j) => { t.classList.toggle('active', j === i); t.setAttribute('aria-selected', String(j === i)); });
  modal.querySelectorAll('.fg-phase').forEach((p, j) => {
    p.classList.toggle('active', j === i);
    const fill = p.querySelector('.fg-tempo-fill');
    if(!fill) return;
    fill.style.transition = 'none'; fill.style.width = '0%';
    if(j === i) {
      void fill.offsetWidth;
      fill.style.transition = `width ${p.dataset.secs}s linear ${prep}ms`;
      fill.style.width = '100%';
    }
  });
}

function toggleFormGuidePlay() {
  if(!formGuideCtx) return;
  const btn = document.getElementById('fg-play');
  if(formGuideCtx.playing) { stopFormGuidePlay(); return; }
  formGuideCtx.playing = true;
  if(btn) { btn.innerHTML = `${FG_ICON.pause} Pause`; btn.setAttribute('aria-pressed', 'true'); }
  const step = (i) => {
    if(!formGuideCtx || !formGuideCtx.playing) return;
    selectFormPhase(i);
    const panel = document.querySelector(`#form-guide-modal .fg-phase[data-phase="${i}"]`);
    const secs = Number(panel?.dataset.secs) || 2;
    formGuideCtx.timer = setTimeout(() => step((i + 1) % 3), (secs + 0.6) * 1000 + (formGuideCtx.prep || 0));
  };
  step(formGuideCtx.phase);
}

function stopFormGuidePlay() {
  if(!formGuideCtx) return;
  clearTimeout(formGuideCtx.timer);
  cancelAnimationFrame(formGuideCtx.raf);
  formGuideCtx.playing = false;
  document.querySelectorAll('#form-guide-modal .fg-tempo-fill').forEach(f => { const w = getComputedStyle(f).width; f.style.transition = 'none'; f.style.width = w; });
  const btn = document.getElementById('fg-play');
  if(btn) { btn.innerHTML = `${FG_ICON.play} Play tempo`; btn.setAttribute('aria-pressed', 'false'); }
}

function closeFormGuide() {
  stopFormGuidePlay();
  if(formGuideCtx) cancelAnimationFrame(formGuideCtx.raf);
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
