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

// Sculpted muscle paths, drawn for the viewer's left side and mirrored (x → 200 − x).
const MUSCLE_PATHS = {
  front: [
    ['front_delts', 'M70,66 Q60,63 54,71 Q53,82 60,87 Q66,78 73,74 Z'], ['side_delts', 'M54,69 Q47,74 47,85 L54,88 Q53,78 57,71 Z'],
    ['chest', 'M99,71 L99,98 Q86,103 72,97 Q65,87 70,76 Q84,69 99,71 Z'], ['biceps', 'M50,89 Q45,101 47,117 Q54,120 58,112 Q61,98 56,89 Z'],
    ['forearms', 'M46,124 Q40,141 38,166 L46,169 Q53,148 55,126 Z'], ['abs', 'M89,104 L111,104 L113,160 Q100,169 87,160 Z', true],
    ['obliques', 'M86,107 Q76,118 73,146 Q80,163 87,165 L87,110 Z'], ['quads', 'M70,206 Q65,240 72,287 Q81,293 90,287 Q97,250 92,210 Q82,201 70,206 Z'],
    ['adductors', 'M94,211 Q99,213 99,224 L96,262 Q92,240 92,214 Z'], ['calves', 'M76,300 Q71,321 78,351 L86,353 Q91,322 88,300 Z'],
  ],
  back: [
    ['traps', 'M88,51 L112,51 L131,66 Q116,74 106,96 L100,104 L94,96 Q84,74 69,66 Z', true], ['rear_delts', 'M70,67 Q58,65 52,73 Q53,84 60,87 Q66,78 72,72 Z'],
    ['side_delts', 'M54,69 Q47,74 47,85 L54,88 Q53,78 57,71 Z'], ['mid_back', 'M94,80 Q84,84 82,104 Q88,112 96,110 Z'],
    ['lats', 'M80,96 Q65,110 70,147 Q80,161 90,158 Q93,126 90,104 Z'], ['lower_back', 'M93,150 Q88,166 90,185 L99,187 L99,150 Z'],
    ['triceps', 'M50,89 Q45,101 47,119 Q54,121 58,112 Q61,98 56,89 Z'], ['forearms', 'M46,124 Q40,141 38,166 L46,169 Q53,148 55,126 Z'],
    ['abductors', 'M68,190 Q63,198 68,209 L77,204 Q77,194 74,190 Z'], ['glutes', 'M99,196 L99,228 Q86,235 74,227 Q69,210 76,198 Q88,191 99,196 Z'],
    ['hamstrings', 'M72,236 Q69,262 76,293 L88,293 Q95,262 92,236 Z'], ['calves', 'M74,302 Q69,321 76,351 L88,351 Q95,322 90,302 Z'],
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
  const muscles = MUSCLE_PATHS[view].map(([id, d, center]) => {
    const cls = primary.includes(id) ? 'fg-muscle fg-primary' : secondary.includes(id) ? 'fg-muscle fg-secondary' : 'fg-muscle';
    const one = mirror => `<path class="${cls}" data-muscle="${id}" d="${d}"${mirror ? ' transform="matrix(-1 0 0 1 200 0)"' : ''}><title>${MUSCLE_NAMES[id]}</title></path>`;
    return one(false) + (center ? '' : one(true));
  }).join('');
  return `<g transform="translate(${offsetX},0)">${body}${muscles}<text x="100" y="398" text-anchor="middle" class="fg-view-label">${view === 'front' ? 'FRONT' : 'BACK'}</text></g>`;
}

function muscleMapSvg(primary, secondary) {
  return `<svg class="fg-svg" viewBox="0 0 420 402" role="img" aria-label="Muscle map: primary ${primary.map(m => MUSCLE_NAMES[m]).join(', ')}">
    ${bodyViewSvg('front', primary, secondary, 0)}${bodyViewSvg('back', primary, secondary, 220)}</svg>`;
}

// ── Animated motion figure (side view). Joints: h head, s shoulder, e elbow, w wrist, p hip, k/a front knee/ankle, k2/a2 back leg.
const STAND = { h:[100,40], s:[100,62], e:[100,90], w:[100,116], p:[100,115], k:[100,150], a:[100,184] };
const pose = (o) => ({ ...STAND, ...o });
const MOTION_POSES = {
  hpush: { label:'Push-up / press path', poses:[
      pose({ a:[172,180], k:[142,171], p:[112,162], s:[62,146], h:[46,139], e:[62,163], w:[62,181] }),
      pose({ a:[172,180], k:[142,173], p:[112,167], s:[62,158], h:[46,153], e:[78,168], w:[62,181] }),
      pose({ a:[172,180], k:[142,171], p:[112,162], s:[62,146], h:[46,139], e:[62,163], w:[62,181] }) ],
    arrows:[null, [40,140,40,168], [40,170,40,140]], bar:'floor' },
  vpush: { label:'Overhead press path', poses:[
      pose({ e:[82,82], w:[88,62] }), pose({ e:[82,84], w:[88,64] }), pose({ e:[96,40], w:[100,16] }) ],
    arrows:[null, [128,26,128,60], [128,62,128,22]], bar:'hand' },
  hpull: { label:'Row path', poses:[
      pose({ a:[122,184], k:[116,150], p:[126,114], s:[76,95], h:[60,88], e:[76,123], w:[76,150] }),
      pose({ a:[122,184], k:[116,150], p:[126,114], s:[76,95], h:[60,88], e:[74,125], w:[74,152] }),
      pose({ a:[122,184], k:[116,150], p:[126,114], s:[76,95], h:[60,88], e:[104,102], w:[90,124] }) ],
    arrows:[null, [48,118,48,150], [48,150,48,118]], bar:'hand' },
  vpull: { label:'Pull-up path', poses:[
      pose({ w:[100,20], e:[100,40], s:[100,62], h:[100,47], p:[100,112], k:[100,146], a:[100,180] }),
      pose({ w:[100,20], e:[100,40], s:[100,62], h:[100,47], p:[100,112], k:[100,146], a:[100,180] }),
      pose({ w:[100,20], e:[80,46], s:[100,42], h:[100,25], p:[100,92], k:[100,126], a:[100,160] }) ],
    arrows:[null, [138,40,138,70], [138,72,138,40]], bar:'pullup' },
  squat: { label:'Squat path', poses:[
      pose({ e:[112,80], w:[116,64] }), pose({ p:[80,150], k:[126,156], s:[96,98], h:[102,82], e:[112,114], w:[118,98] }), pose({ e:[112,80], w:[116,64] }) ],
    arrows:[null, [150,110,150,150], [150,152,150,110]], bar:'hand' },
  hinge: { label:'Hip hinge path', poses:[
      pose({}), pose({ p:[124,112], k:[110,150], s:[72,98], h:[57,90], e:[78,122], w:[82,146] }), pose({}) ],
    arrows:[null, [150,112,170,112], [170,112,148,112]], bar:'hand' },
  lunge: { label:'Split-squat path', poses:[
      pose({ p:[100,112], k:[124,148], a:[130,184], k2:[86,150], a2:[70,184] }),
      pose({ p:[100,136], k:[128,142], a:[132,184], s:[100,86], h:[100,70], e:[100,112], w:[100,136], k2:[82,178], a2:[58,182] }),
      pose({ p:[100,112], k:[124,148], a:[130,184], k2:[86,150], a2:[70,184] }) ],
    arrows:[null, [154,104,154,140], [154,142,154,104]], bar:'none' },
  curl: { label:'Curl / extension path', poses:[
      pose({}), pose({ e:[100,92], w:[102,118] }), pose({ e:[100,92], w:[120,74] }) ],
    arrows:[null, [134,76,134,112], [134,112,134,76]], bar:'hand' },
  triceps: { label:'Extension path', poses:[
      pose({ e:[106,34], w:[86,52] }), pose({ e:[106,34], w:[84,56] }), pose({ e:[106,34], w:[108,8] }) ],
    arrows:[null, [134,14,134,48], [134,50,134,12]], bar:'hand' },
  core: { label:'Plank / brace', poses:[
      pose({ a:[172,180], k:[142,171], p:[112,163], s:[62,156], h:[47,150], e:[62,180], w:[84,180] }),
      pose({ a:[172,180], k:[142,172], p:[112,166], s:[62,156], h:[47,150], e:[62,180], w:[84,180] }),
      pose({ a:[172,180], k:[142,170], p:[112,159], s:[62,156], h:[47,150], e:[62,180], w:[84,180] }) ],
    arrows:[null, [112,140,112,158], [112,160,112,142]], bar:'floor' },
  bridge: { label:'Hip-thrust path', poses:[
      pose({ s:[52,174], h:[36,171], e:[66,180], w:[82,180], p:[104,176], k:[132,146], a:[142,182] }),
      pose({ s:[52,174], h:[36,171], e:[66,180], w:[82,180], p:[104,178], k:[132,146], a:[142,182] }),
      pose({ s:[52,170], h:[36,167], e:[66,180], w:[82,180], p:[100,146], k:[132,140], a:[142,182] }) ],
    arrows:[null, [100,128,100,160], [100,162,100,128]], bar:'floor' },
  calf: { label:'Calf-raise path', poses:[
      pose({}), pose({ h:[100,44], s:[100,66], e:[100,94], w:[100,120], p:[100,119], k:[100,154], a:[100,186] }),
      pose({ h:[100,30], s:[100,52], e:[100,80], w:[100,106], p:[100,105], k:[100,140], a:[102,176] }) ],
    arrows:[null, [134,40,134,62], [134,64,134,36]], bar:'none' },
};
const MOTION_ALIAS = { lateral:'vpush', reardelt:'hpull', dip:'hpush', pullover:'vpull', adduction:'squat', abduction:'squat', legmachine:'squat', general:'squat' };

function motionSpec(key) { return MOTION_POSES[key] || MOTION_POSES[MOTION_ALIAS[key]] || MOTION_POSES.squat; }

function jointAngle(a, b, c) {
  const v1 = [a[0] - b[0], a[1] - b[1]], v2 = [c[0] - b[0], c[1] - b[1]];
  const cos = (v1[0] * v2[0] + v1[1] * v2[1]) / (Math.hypot(...v1) * Math.hypot(...v2) || 1);
  return Math.round(Math.acos(Math.max(-1, Math.min(1, cos))) * 180 / Math.PI);
}

function motionSvg(key) {
  const spec = motionSpec(key);
  const prop = spec.bar === 'pullup' ? '<line class="fg-prop" x1="60" y1="20" x2="140" y2="20"/>' : '';
  return `<svg class="fg-motion" viewBox="0 0 200 200" role="img" aria-label="${escapeHtml(spec.label)} animation">
    <defs><marker id="fg-arrowhead" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 Z" fill="#fbbf24"/></marker></defs>
    <line class="fg-ground" x1="10" y1="186" x2="190" y2="186"/>${prop}
    <g class="fg-figure">
      <line data-seg="p-k2"/><line data-seg="k2-a2"/>
      <line data-seg="s-p" class="fg-torso"/><line data-seg="p-k"/><line data-seg="k-a"/>
      <line data-seg="s-e"/><line data-seg="e-w"/>
      <circle data-joint="h" r="9" class="fg-head"/><circle data-joint="w" r="4" class="fg-load"/>
      ${['s','e','p','k','a'].map(j => `<circle data-joint="${j}" r="3" class="fg-joint"/>`).join('')}
    </g>
    <line class="fg-force" marker-end="url(#fg-arrowhead)" x1="0" y1="0" x2="0" y2="0" style="opacity:0"/>
    <text class="fg-angle" x="0" y="0"></text>
    <text class="fg-motion-label" x="100" y="198" text-anchor="middle">${escapeHtml(spec.label)}</text></svg>`;
}

function drawMotionPose(svg, p, arrow) {
  if(!svg) return;
  const pt = j => p[j] || (j === 'k2' ? p.k : j === 'a2' ? p.a : STAND[j]);
  svg.querySelectorAll('[data-seg]').forEach(l => {
    const [a, b] = l.dataset.seg.split('-');
    const A = pt(a), B = pt(b);
    l.setAttribute('x1', A[0]); l.setAttribute('y1', A[1]); l.setAttribute('x2', B[0]); l.setAttribute('y2', B[1]);
  });
  svg.querySelectorAll('[data-joint]').forEach(c => { const P = pt(c.dataset.joint); c.setAttribute('cx', P[0]); c.setAttribute('cy', P[1]); });
  const angle = svg.querySelector('.fg-angle');
  if(angle) { const e = pt('e'); angle.setAttribute('x', e[0] + 7); angle.setAttribute('y', e[1] - 6); angle.textContent = `${jointAngle(pt('s'), e, pt('w'))}°`; }
  const force = svg.querySelector('.fg-force');
  if(force) {
    if(arrow) { ['x1','y1','x2','y2'].forEach((k, i) => force.setAttribute(k, arrow[i])); force.style.opacity = '1'; }
    else force.style.opacity = '0';
  }
}

function animateMotionTo(phase) {
  const svg = document.querySelector('#form-guide-modal .fg-motion');
  if(!svg || !formGuideCtx) return;
  const spec = motionSpec(formGuideCtx.key);
  const from = formGuideCtx.motionPose || spec.poses[0], to = spec.poses[phase] || spec.poses[0];
  const arrow = spec.arrows[phase];
  cancelAnimationFrame(formGuideCtx.raf);
  const reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const dur = reduce ? 0 : 700, start = performance.now();
  const step = (now) => {
    const t = dur ? Math.min(1, (now - start) / dur) : 1, ease = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
    const cur = {};
    Object.keys({ ...from, ...to }).forEach(j => {
      const A = from[j] || to[j], B = to[j] || from[j];
      cur[j] = [A[0] + (B[0] - A[0]) * ease, A[1] + (B[1] - A[1]) * ease];
    });
    drawMotionPose(svg, cur, t === 1 ? arrow : null);
    if(formGuideCtx) formGuideCtx.motionPose = cur;
    if(t < 1 && formGuideCtx) formGuideCtx.raf = requestAnimationFrame(step);
  };
  formGuideCtx.raf = requestAnimationFrame(step);
}

const FG_ICON = (() => {
  const s = (body, cls = '') => `<svg class="fg-ic ${cls}" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${body}</svg>`;
  return {
    target: s('<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1.5" fill="currentColor"/>'),
    setup: s('<circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M4.9 19.1L7 17M17 7l2.1-2.1"/>'),
    down: s('<path d="M12 4v14M6 12l6 6 6-6"/>'), up: s('<path d="M12 20V6M6 12l6-6 6 6"/>'),
    bulb: s('<path d="M9 18h6M10 21h4M12 3a6 6 0 0 0-4 10.5c.8.8 1 1.5 1 2.5h6c0-1 .2-1.7 1-2.5A6 6 0 0 0 12 3z"/>'),
    warn: s('<path d="M12 3l9 16H3z"/><path d="M12 10v4M12 17v.5"/>'), trend: s('<path d="M3 17l6-6 4 4 8-8M15 7h6v6"/>'),
    x: s('<path d="M6 6l12 12M18 6L6 18"/>', 'fg-ic-bad'), check: s('<path d="M5 12l5 5L19 7"/>', 'fg-ic-good'),
    play: s('<path d="M7 5l12 7-12 7z" fill="currentColor"/>'), pause: s('<path d="M8 5v14M16 5v14"/>'),
  };
})();

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
    [FG_ICON.setup, 'Setup & Bracing', g.setup, 2], [FG_ICON.down, 'Eccentric (The Stretch)', g.eccentric, 3], [FG_ICON.up, 'Concentric (The Drive)', g.concentric, 1.5],
  ];
  modal.innerHTML = `
    <div class="swap-dialog form-dialog" role="dialog" aria-modal="true" aria-labelledby="fg-title">
      <button class="swap-close" onclick="closeFormGuide()" aria-label="Close">✕</button>
      <div class="fg-kicker">${FG_ICON.target} Form &amp; Biomechanics Studio · ${escapeHtml(g.label)}</div>
      <h3 id="fg-title" style="margin:2px 0 6px">${escapeHtml(ex.name)}</h3>
      ${ex.muscle ? `<div style="font-size:12px;color:var(--muted);margin-bottom:8px">${FG_ICON.target} ${escapeHtml(String(ex.muscle).replace(/^[^A-Za-z]+/, ''))}</div>` : ''}
      <div class="fg-visual"><div class="fg-panel"><div class="fg-panel-title">Live motion</div>${motionSvg(g.key)}</div><div class="fg-panel"><div class="fg-panel-title">Muscles</div><div class="fg-map">${muscleMapSvg(g.primary, g.secondary)}</div></div></div>
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
      <ul class="fg-mistakes">${g.mistakes.map(([bad, fix]) => `<li><span class="fg-bad">${FG_ICON.x} ${escapeHtml(bad)}</span> → <span class="fg-fix">${FG_ICON.check} ${escapeHtml(fix)}</span></li>`).join('')}</ul>
      <div class="fg-section-title"><span>${FG_ICON.trend} Progressive Effort Cue</span></div>
      <div class="fg-progress">${escapeHtml(g.cue)}</div>
    </div>`;
  modal.style.display = 'flex';
  formGuideCtx = { phase: 0, timer: null, playing: false, key: g.key, motionPose: null, raf: 0 };
  drawMotionPose(modal.querySelector('.fg-motion'), motionSpec(g.key).poses[0], null);
  formGuideCtx.motionPose = motionSpec(g.key).poses[0];
  modal.querySelector('.swap-close').focus();
}

function selectFormPhase(i) {
  const modal = document.getElementById('form-guide-modal');
  if(!modal || !formGuideCtx) return;
  formGuideCtx.phase = i;
  animateMotionTo(i);
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
  if(btn) { btn.innerHTML = `${FG_ICON.pause} Pause`; btn.setAttribute('aria-pressed', 'true'); }
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
  if(btn) { btn.innerHTML = `${FG_ICON.play} Play tempo`; btn.setAttribute('aria-pressed', 'false'); }
  selectFormPhase(formGuideCtx.phase);
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
