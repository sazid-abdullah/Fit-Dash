// ══ AI COACH CHAT ═══════════════════════════════════════
let chatHistory = safeLoad('fitdash_chat', []);
let chatStreaming = false;

function toggleChat() {
  const panel = document.getElementById('ai-chat-panel');
  const bubble = document.getElementById('ai-chat-bubble');
  const isOpen = panel.classList.toggle('open');
  bubble.classList.toggle('hidden', isOpen);
  // hide mobile action bar when chat is open to avoid overlap on small screens
  const mobileBar = document.getElementById('mobile-action-bar');
  if(mobileBar) mobileBar.style.display = isOpen ? 'none' : '';
  if(isOpen) {
    renderChatMessages();
    updateChatModelLabel();
    setTimeout(() => document.getElementById('chat-input').focus(), 300);
  }
}

function updateChatModelLabel() {
  const el = document.getElementById('chat-model-label');
  if(!el) return;
  const models = AI_MODELS[aiConfig.provider] || [];
  const m = models.find(m => m.id === aiConfig.model);
  el.textContent = m ? m.name : aiConfig.model || 'No model';
}

function renderChatMessages() {
  const el = document.getElementById('chat-messages');
  if(!el) return;
  if(!chatHistory.length) {
    el.innerHTML = `<div class="chat-msg system">👋 Hi! I'm your AI fitness coach. Ask me anything about nutrition, training, or your progress. Set up your API key in Settings first!</div>`;
    return;
  }
  el.innerHTML = chatHistory.map(m => {
    const cls = m.role === 'user' ? 'user' : 'assistant';
    const content = m.role === 'user' ? escapeHtml(m.content) : formatAIResponse(m.content);
    return `<div class="chat-msg ${cls}">${content}</div>`;
  }).join('');
  el.scrollTop = el.scrollHeight;
}

function formatAIResponse(text) {
  // Convert markdown-style formatting to HTML
  let html = escapeHtml(text);
  // Bold
  html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  // Inline code
  html = html.replace(/`([^`]+)`/g, '<code style="background:var(--card2);padding:1px 5px;border-radius:3px;font-size:12px">$1</code>');
  // Tables: detect lines with | separators
  const lines = html.split('\n');
  let inTable = false;
  let tableHtml = '';
  const processed = [];
  for(let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if(line.startsWith('|') && line.endsWith('|')) {
      if(!inTable) { inTable = true; tableHtml = '<table>'; }
      const isSep = /^\|[\s\-:|]+\|$/.test(line);
      if(isSep) continue;
      const cells = line.split('|').filter(c => c.trim() !== '');
      const tag = !tableHtml.includes('<tr>') ? 'th' : 'td';
      tableHtml += '<tr>' + cells.map(c => `<${tag}>${c.trim()}</${tag}>`).join('') + '</tr>';
    } else {
      if(inTable) { tableHtml += '</table>'; processed.push(tableHtml); tableHtml = ''; inTable = false; }
      processed.push(line);
    }
  }
  if(inTable) { tableHtml += '</table>'; processed.push(tableHtml); }
  html = processed.join('<br>');
  // Bullet points
  html = html.replace(/^- (.*)/gm, '• $1');
  return html;
}

function buildSystemPrompt() {
  const p = userProfile;
  const g = userGoals;
  const latestW = weights.length ? weights.reduce((b,w) => (!b||w.date>b.date)?w:b, null) : null;
  const latestBC = bodyComp.length ? bodyComp[bodyComp.length-1] : null;
  const last7w = [...weights].sort((a,b) => a.date.localeCompare(b.date)).slice(-7);
  const streak = calcStreak();
  const totalSes = sessions.length;
  const last3 = sessions.slice(-3).reverse();

  // Calculate TDEE
  let tdee = 'unknown';
  if(p.height && p.age && (latestW || p.weight)) {
    const w = latestW ? latestW.val : p.weight;
    let bmr = (10*w) + (6.25*p.height) - (5*p.age) + (p.gender==='male' ? 5 : -161);
    const actMap = {sedentary:1.2,light:1.375,moderate:1.55,active:1.725,veryActive:1.9};
    tdee = Math.round(bmr * (actMap[p.activity]||1.55));
  }

  const labelCountry = document.getElementById('label-country')?.value || 'INT';
  const prList = Object.entries(prs).map(([k,v]) => `${k}: ${v.weight}kg`).join(', ') || 'None yet';
  const weightTrend = last7w.map(w => `${w.date}: ${w.val}kg`).join(', ') || 'No data';
  const todayFoodEntries = (calorieLog[getLocalDateStr()] || []).filter(f => f.source === 'label');
  const labelSummary = todayFoodEntries.length
    ? todayFoodEntries.map(f => `${f.name}${f.country ? ' ('+f.country+')' : ''}: ${f.calories} cal`).join(', ')
    : 'No branded product labels logged today';
  const sessionSummary = last3.map(s => {
    const dur = s.durationSecs ? `${Math.floor(s.durationSecs/60)}min` : '?';
    return `${s.date}: ${dur}, ${s.caloriesBurned||'?'} cal, ${s.volumeKg||'?'}kg vol`;
  }).join('\n  ') || 'No sessions yet';
  const bodyCompInfo = latestBC
    ? `Body fat: ${latestBC.bf}% (${latestBC.method}) | Lean: ${latestBC.leanMass}kg | Fat: ${latestBC.fatMass}kg | Logged: ${latestBC.date}`
    : 'No body composition data logged yet';

  // Today's calorie log
  const todayKey = getLocalDateStr();
  const todayFoods = (calorieLog[todayKey] || []);
  const todayCals = todayFoods.reduce((s,f) => s + (f.calories||0), 0);
  const todayFoodSummary = todayFoods.length
    ? todayFoods.map(f => `${f.name}: ${f.calories}cal`).join(', ') + ` (Total: ${todayCals} cal)`
    : 'Nothing logged yet today';
    
  // Water & Sleep
  const todayWater = waterLog.date === todayKey ? waterLog.ml : 0;
  const recentSleep = [...sleepHistory].sort((a,b) => a.date.localeCompare(b.date)).slice(-3)
    .map(s => `${s.date}: ${s.hours}h (${s.quality})`).join(', ') || 'No sleep data';

  return `You are FitDash Coach, a concise fitness and nutrition advisor embedded in a tracking app.

SELECTED TRAINING CATEGORY:
- ${trainingCategory === 'gym' ? 'Gym: use the supplied full-body gym plan. Prefer machines, use the Legs & Calves superset, Back-Chest-Back giant set, and Finishing Circuit. Beginners should start with 2 sessions weekly; experienced users can use 2–3 sessions with at least one rest day between sessions. Aim for 150–300 weekly minutes of moderate steady-state cardio, and progress by training harder than last time without treating example weights as prescriptions.' : 'Home: use the existing FitDash home workout plan and its available-equipment exercise substitutions.'}
- Equipment available: ${(p.equipment || []).join(', ') || 'not specified'}
- Movement limitations: ${p.limitations || 'none specified'}

${aiConfig.shareHealthData === false ? `PRIVACY MODE:
- Personal health, body, nutrition, sleep, and progress data are not shared with the AI provider.
- Give general fitness guidance only and ask the user for details when needed.` : `USER PROFILE:
- Height: ${p.height||'?'}cm | Weight: ${latestW?latestW.val:(p.weight||'?')}kg | Age: ${p.age||'?'} | Gender: ${p.gender||'?'}
- Activity: ${p.activity||'moderate'} | Goal: ${g.goalType||'recomp'}
- Daily calorie target: ${g.calTarget||tdee||'?'} cal
- Cuisine preference: ${g.cuisinePref||'both'}
- Latest body fat: ${latestBC ? latestBC.bf + '%' : 'n/a'}

TODAY:
- Food log: ${todayFoodSummary}
- Water: ${todayWater}ml / ${g.waterTarget||3000}ml
- Sleep: ${recentSleep}`}

INSTRUCTIONS:
- Use evidence-based nutrition and training guidance.
- Keep answers short, clear, and practical.
- Prefer Bangladeshi foods and brands when the user requests them.
- Avoid rich festive dishes unless the calorie target allows them.
- When counting food calories, break down macros by weight and include totals.
- Include ingredients and concise numbered cooking steps for every generated meal or recipe.
- Output special FitDash markers as instructed (FITDASH_PLAN, FITDASH_CAL, FITDASH_FOOD).
- When the user asks to personalize app data, propose changes using approval markers only. Never claim a change was applied until the user presses Apply.
- For goal edits, output |||FITDASH_GOALS|||JSON|||END_GOALS||| with only requested fields: calTarget, proteinTarget, carbTarget, fatTarget, waterTarget, goalType.
- For a custom exercise, output |||FITDASH_EXERCISE|||JSON|||END_EXERCISE||| with name, muscle, tips, block, and optional ytId.
- For a grocery list, output |||FITDASH_GROCERY|||JSON array|||END_GROCERY|||. For a workout template, output |||FITDASH_TEMPLATE|||JSON|||END_TEMPLATE|||.
`;
}

async function sendChatMessage() {
  const input = document.getElementById('chat-input');
  const text = input.value.trim();
  if(!text || chatStreaming) return;

  if(providerRequiresApiKey(aiConfig.provider) && !getProviderApiKey(aiConfig.provider)) {
    chatHistory.push({ role:'assistant', content:'⚠️ Please set up your API key first! Go to **Settings → AI Coach Setup** to enter your provider key.' });
    save('fitdash_chat', chatHistory);
    renderChatMessages();
    return;
  }

  chatHistory.push({ role:'user', content: text });
  input.value = '';
  input.style.height = '';
  renderChatMessages();

  // Show typing indicator
  const msgArea = document.getElementById('chat-messages');
  const typing = document.createElement('div');
  typing.className = 'chat-typing';
  typing.id = 'chat-typing';
  typing.innerHTML = '<div class="dots"><span></span><span></span><span></span></div> Thinking...';
  msgArea.appendChild(typing);
  msgArea.scrollTop = msgArea.scrollHeight;

  chatStreaming = true;
  document.getElementById('chat-send-btn').disabled = true;

  try {
    const sysPrompt = buildSystemPrompt();
    const messages = [
      { role: 'system', content: sysPrompt },
      ...chatHistory.slice(-18).map(m => ({ role: m.role, content: m.content }))
    ];

    const response = await callAI(messages);
    // Remove typing
    const typingEl = document.getElementById('chat-typing');
    if(typingEl) typingEl.remove();

    chatHistory.push({ role: 'assistant', content: response });
    // Keep last 20
    if(chatHistory.length > 20) chatHistory = chatHistory.slice(-20);
    save('fitdash_chat', chatHistory);

    // Parse actions from AI response
    parseAIActions(response);

    renderChatMessages();
  } catch(err) {
    const typingEl = document.getElementById('chat-typing');
    if(typingEl) typingEl.remove();
    const errMsg = err.message.includes('401') ? '🔑 Invalid API key. Check your key in Settings.'
      : err.message.includes('429') ? '⏳ Rate limited. Wait a moment and try again.'
      : err.message.includes('Failed to fetch') ? '🌐 Network error. Check your internet connection.'
      : `❌ Error: ${err.message}`;
    chatHistory.push({ role: 'assistant', content: errMsg });
    save('fitdash_chat', chatHistory);
    renderChatMessages();
  } finally {
    chatStreaming = false;
    document.getElementById('chat-send-btn').disabled = false;
  }
}

async function callAI(messages) {
  const primaryConfig = { ...aiConfig };
  try {
    return await callAIRequest(messages);
  } catch(primaryError) {
    const statusMatch = String(primaryError.message || '').match(/^(\d+):/);
    const statusCode = statusMatch ? Number(statusMatch[1]) : 0;
    const canFallback = [400, 404, 408, 409, 429].includes(statusCode) || statusCode >= 500;
    const fallbackModels = canFallback
      ? (AI_MODELS[primaryConfig.provider] || []).map(model => model.id).filter(model => model !== primaryConfig.model)
      : [];
    if(!fallbackModels.length) throw primaryError;

    for(const fallbackModel of fallbackModels) {
      aiConfig = { ...primaryConfig, model:fallbackModel };
      try {
        return await callAIRequest(messages);
      } catch(fallbackError) {
        primaryError = fallbackError;
      }
    }
    throw primaryError;
  } finally {
    aiConfig = primaryConfig;
  }
}

async function callAIRequest(messages) {
  if(aiConfig.provider === 'ollama') {
    const res = await fetch('http://localhost:11434/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ model:aiConfig.model, messages, temperature:0.7, max_tokens:2048, stream:false })
    });
    if(!res.ok) {
      const errText = await res.text().catch(() => '');
      throw new Error(`${res.status}: ${errText.slice(0,200)}`);
    }
    const data = await res.json();
    return data.choices?.[0]?.message?.content || 'No response received.';
  }

  if(aiConfig.provider === 'gemini') {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(aiConfig.model)}:generateContent?key=${encodeURIComponent(getProviderApiKey(aiConfig.provider))}`;
    const systemMessage = messages.find(message => message.role === 'system');
    const contents = messages
      .filter(message => message.role !== 'system')
      .map(message => ({
        role: message.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: message.content }],
      }));
    const body = {
      contents,
      generationConfig: { temperature: 0.7, maxOutputTokens: 2048 },
    };
    if(systemMessage) body.systemInstruction = { parts: [{ text: systemMessage.content }] };

    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if(!res.ok) {
      const errText = await res.text().catch(() => '');
      throw new Error(`${res.status}: ${errText.slice(0,200)}`);
    }
    const data = await res.json();
    return data.candidates?.[0]?.content?.parts?.map(part => part.text || '').join('') || 'No response received.';
  }

  const isGroq = aiConfig.provider === 'groq';
  const url = isGroq ? 'https://api.groq.com/openai/v1/chat/completions' : 'https://openrouter.ai/api/v1/chat/completions';

  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${getProviderApiKey(aiConfig.provider)}`,
  };
  if(!isGroq) {
    headers['HTTP-Referer'] = 'https://fitdash.app';
    headers['X-Title'] = 'FitDash Coach';
  }

  const res = await fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      model: aiConfig.model,
      messages,
      temperature: 0.7,
      max_tokens: 2048,
      stream: false, // non-streaming for simplicity first
    })
  });

  if(!res.ok) {
    const errText = await res.text().catch(() => '');
    throw new Error(`${res.status}: ${errText.slice(0,200)}`);
  }

  const data = await res.json();
  return data.choices?.[0]?.message?.content || 'No response received.';
}

function parseAIActions(content) {
  // Check for meal plan
  const planMatch = content.match(/\|\|\|FITDASH_PLAN\|\|\|([\s\S]*?)\|\|\|END_PLAN\|\|\|/);
  if(planMatch) {
    try {
      const planData = JSON.parse(planMatch[1]);
      // Add apply button to last message
      setTimeout(() => {
        const msgs = document.querySelectorAll('.chat-msg.assistant');
        const lastMsg = msgs[msgs.length - 1];
        if(lastMsg && !lastMsg.querySelector('.apply-btn')) {
          const btn = document.createElement('button');
          btn.className = 'apply-btn';
          btn.textContent = '✅ Apply this meal plan';
          btn.onclick = () => applyAIPlan(planData);
          lastMsg.appendChild(btn);
        }
      }, 100);
    } catch(e) { if(FITDASH_DEBUG) console.warn('Failed to parse AI plan:', e); }
  }

  // Check for calorie target
  const calMatch = content.match(/\|\|\|FITDASH_CAL\|\|\|([\s\S]*?)\|\|\|END_CAL\|\|\|/);
  if(calMatch) {
    try {
      const calData = JSON.parse(calMatch[1]);
      setTimeout(() => {
        const msgs = document.querySelectorAll('.chat-msg.assistant');
        const lastMsg = msgs[msgs.length - 1];
        if(lastMsg && !lastMsg.querySelector('.apply-btn')) {
          const btn = document.createElement('button');
          btn.className = 'apply-btn';
          btn.textContent = `✅ Set target to ${calData.value} cal`;
          btn.onclick = () => {
            userGoals.calTarget = calData.value;
            save('fitdash_goals', userGoals);
            if(document.getElementById('s-cal-target')) document.getElementById('s-cal-target').value = calData.value;
            btn.textContent = '✓ Applied!';
            btn.disabled = true;
            renderCalorieTracker();
          };
          lastMsg.appendChild(btn);
        }
      }, 100);
    } catch(e) { if(FITDASH_DEBUG) console.warn('Failed to parse calorie data:', e); }
  }

  // Check for food logging
  const foodMatch = content.match(/\|\|\|FITDASH_FOOD\|\|\|([\s\S]*?)\|\|\|END_FOOD\|\|\|/);
  if(foodMatch) {
    try {
      const foods = JSON.parse(foodMatch[1]);
      setTimeout(() => {
        const msgs = document.querySelectorAll('.chat-msg.assistant');
        const lastMsg = msgs[msgs.length - 1];
        if(lastMsg && !lastMsg.querySelector('.apply-btn')) {
          const btn = document.createElement('button');
          btn.className = 'apply-btn';
          btn.textContent = `✅ Log ${foods.length} item(s) to today`;
          btn.onclick = () => {
            foods.forEach(f => {
              addFoodEntry(f.name, f.grams, f.calories, f.protein||0, f.carbs||0, f.fat||0, 'ai', f.country || 'INT');
              saveRecentFood({
                name: f.name,
                kcal: Math.round(f.calories || 0),
                protein: Math.round(f.protein || 0),
                carbs: Math.round(f.carbs || 0),
                fat: Math.round(f.fat || 0),
                grams: Math.round(f.grams || 0),
                country: f.country || 'INT'
              });
            });
            btn.textContent = '✓ Logged!';
            btn.disabled = true;
            renderCalorieTracker();
          };
          lastMsg.appendChild(btn);
        }
      }, 100);
    } catch(e) { if(FITDASH_DEBUG) console.warn('Failed to parse food data:', e); }
  }

  const addActionButton = (label, action, actionKey) => setTimeout(() => {
    const msgs = document.querySelectorAll('.chat-msg.assistant');
    const lastMsg = msgs[msgs.length - 1];
    if(!lastMsg || lastMsg.querySelector(`[data-ai-action="${actionKey}"]`)) return;
    const btn = document.createElement('button');
    btn.className = 'apply-btn'; btn.dataset.aiAction = actionKey; btn.textContent = label;
    btn.onclick = () => { action(btn); };
    lastMsg.appendChild(btn);
  }, 100);

  const goalsMatch = content.match(/\|\|\|FITDASH_GOALS\|\|\|([\s\S]*?)\|\|\|END_GOALS\|\|\|/);
  if(goalsMatch) {
    try {
      const requested = JSON.parse(goalsMatch[1]);
      addActionButton('✅ Apply goal changes', btn => {
        ['calTarget','proteinTarget','carbTarget','fatTarget','waterTarget'].forEach(key => { if(Number.isFinite(Number(requested[key]))) userGoals[key] = Number(requested[key]); });
        if(['cut','recomp','bulk'].includes(requested.goalType)) userGoals.goalType = requested.goalType;
        save('fitdash_goals', userGoals); btn.textContent = '✓ Goals applied'; btn.disabled = true; renderCalorieTracker();
      }, 'goals');
    } catch(e) { if(FITDASH_DEBUG) console.warn('Failed to parse goal data:', e); }
  }

  const exerciseMatch = content.match(/\|\|\|FITDASH_EXERCISE\|\|\|([\s\S]*?)\|\|\|END_EXERCISE\|\|\|/);
  if(exerciseMatch) {
    try {
      const exercise = JSON.parse(exerciseMatch[1]);
      if(exercise.name && exercise.muscle && exercise.tips) addActionButton(`✅ Add ${exercise.name}`, btn => {
        const block = ['A','B','C'].includes(exercise.block) ? exercise.block : 'C';
        const existing = customExercises.filter(cx => cx.block === block);
        const baseCount = block === 'A' ? 2 : block === 'B' ? 3 : 6;
        const item = { id:Date.now(), code:`${block}${baseCount + existing.length + 1}`, name:String(exercise.name).slice(0,80), muscle:String(exercise.muscle).slice(0,100), tips:String(exercise.tips).slice(0,240), ytId:normalizeYouTubeId(exercise.ytId || ''), block };
        customExercises.push(item); save('fitdash_custom_ex', customExercises); renderCustomExercises(); renderVideoCodeLibrary(); btn.textContent = '✓ Exercise added'; btn.disabled = true;
      }, 'exercise');
    } catch(e) { if(FITDASH_DEBUG) console.warn('Failed to parse exercise data:', e); }
  }

  const groceryMatch = content.match(/\|\|\|FITDASH_GROCERY\|\|\|([\s\S]*?)\|\|\|END_GROCERY\|\|\|/);
  if(groceryMatch) {
    try {
      const grocery = JSON.parse(groceryMatch[1]);
      if(Array.isArray(grocery)) addActionButton('✅ Save grocery list', btn => { save('fitdash_grocery_list', grocery.map(item => typeof item === 'string' ? item : `${item.name || 'Item'}${item.quantity ? ` — ${item.quantity}` : ''}`)); renderSavedGroceryList(); btn.textContent = '✓ Grocery list saved'; btn.disabled = true; }, 'grocery');
    } catch(e) { if(FITDASH_DEBUG) console.warn('Failed to parse grocery data:', e); }
  }

  const templateMatch = content.match(/\|\|\|FITDASH_TEMPLATE\|\|\|([\s\S]*?)\|\|\|END_TEMPLATE\|\|\|/);
  if(templateMatch) {
    try {
      const template = JSON.parse(templateMatch[1]);
      if(template && template.name && Array.isArray(template.plan)) addActionButton('✅ Save as routine', btn => { const r = saveTemplateAsRoutine(template); if(!r) return; btn.textContent=`✓ Saved routine "${r.name}" — pick it on Training`; btn.disabled=true; }, 'template');
    } catch(e) { if(FITDASH_DEBUG) console.warn('Failed to parse template data:', e); }
  }
}

function handleQuickChip(action) {
  const input = document.getElementById('chat-input');
  const prompts = {
    'count':    'I want to log what I ate. I\'ll describe the food and amounts — please count the calories and macros for each item and give me a table breakdown.',
    'plan':     'Create a personalized daily meal plan for me based on my profile, goals, and calorie target. Include breakfast, lunch, dinner, and snacks. Include ingredients and concise numbered cooking steps for every meal.',
    'progress': 'Analyze my recent workout history, weight trend, and body composition. What\'s going well? What should I adjust?',
    'calories': 'Based on my current weight trend and goals, should I adjust my daily calorie target? Analyze my data and recommend a specific number.',
  };
  input.value = prompts[action] || '';
  input.focus();
}

function suggestFoodSubstitution() {
  const today = getLocalDateStr();
  const entries = calorieLog[today] || [];
  const input = document.getElementById('chat-input');
  if(!input) return;
  if(!entries.length) {
    input.value = 'Suggest a high-protein, lower-calorie food substitution for a meal I am planning. Prefer foods from my selected cuisine.';
  } else {
    const foods = entries.map(entry => `${entry.name} (${entry.grams || '?'}g, ${Math.round(entry.calories || 0)} cal)`).join('; ');
    input.value = `Suggest practical substitutions for these foods while preserving similar protein and improving my calorie or micronutrient balance: ${foods}. Give 3 alternatives with approximate calories and macros.`;
  }
  toggleChat();
  input.focus();
}

// ══ AI PLAN MANAGEMENT ═══════════════════════════════════
let aiPlan = safeLoad('fitdash_ai_plan', null);
let customDishes = safeLoad('fitdash_custom_dishes', []);
if (activePlan === 'ai' && !aiPlan) activePlan = '1500';

function renderSavedCustomDishes() {
  const el = document.getElementById('saved-custom-dishes');
  if(!el) return;
  el.innerHTML = customDishes.length ? `<div style="font-size:12px;font-weight:700;margin-bottom:8px">Saved custom dishes</div>${customDishes.slice(0,8).map((dish, index) => `<div style="display:flex;justify-content:space-between;gap:8px;padding:8px 0;border-bottom:1px solid var(--border);font-size:12px"><span><strong>${escapeHtml(dish.name)}</strong> · ${dish.calories || '?'} cal · ${dish.servings || 1} serving(s)</span><button class="btn-ghost" onclick="loadCustomDish(${index})" style="font-size:11px;padding:4px 8px">Edit with AI</button></div>`).join('')}` : '';
}

function loadCustomDish(index) {
  const dish = customDishes[index];
  if(!dish) return;
  document.getElementById('custom-dish-name').value = dish.name || '';
  document.getElementById('custom-dish-servings').value = dish.servings || 1;
  document.getElementById('custom-dish-info').value = (dish.ingredients || []).join(', ');
  document.getElementById('custom-dish-result').scrollIntoView({behavior:'smooth', block:'center'});
}

function toggleDishExample() {
  const example = document.getElementById('custom-dish-example');
  const button = document.querySelector('[aria-controls="custom-dish-example"]');
  if(!example || !button) return;
  example.hidden = !example.hidden;
  button.setAttribute('aria-expanded', String(!example.hidden));
}

async function generateCustomDish() {
  const name = document.getElementById('custom-dish-name').value.trim() || 'Custom dish';
  const info = document.getElementById('custom-dish-info').value.trim();
  const servings = Number(document.getElementById('custom-dish-servings').value) || 1;
  const status = document.getElementById('custom-dish-status');
  const result = document.getElementById('custom-dish-result');
  if(!info) { status.textContent = 'Describe the ingredients or dish first.'; status.style.color = 'var(--orange)'; return; }
  if(providerRequiresApiKey(aiConfig.provider) && !getProviderApiKey(aiConfig.provider)) { status.textContent = 'Set up an AI provider in Settings first.'; status.style.color = 'var(--orange)'; return; }
  if(aiConfig.shareHealthData === false) { status.textContent = 'Enable health-data sharing for personalized nutrition generation.'; status.style.color = 'var(--orange)'; return; }
  status.textContent = 'Creating recipe...'; status.style.color = 'var(--muted)';
  try {
    const response = await callAI([
      {role:'system',content:'You are a practical nutrition recipe assistant. Return only valid JSON with name, servings, ingredients (array of strings), steps (array of concise cooking steps), calories, protein, carbs, and fat. Respect the user ingredients, cuisine, budget, and cooking preferences. Never invent medical claims.'},
      {role:'user',content:`Create or edit this custom dish. Name: ${name}. Servings: ${servings}. User information: ${info}. Return JSON only.`}
    ]);
    const match = response.match(/```(?:json)?\s*([\s\S]*?)\s*```/) || response.match(/(\{[\s\S]*\})/);
    if(!match) throw new Error('AI response did not contain recipe JSON.');
    const dish = JSON.parse(match[1].trim());
    if(!dish.name || !Array.isArray(dish.ingredients) || !Array.isArray(dish.steps)) throw new Error('Recipe is missing ingredients or cooking steps.');
    result.innerHTML = `<div style="background:var(--card2);border:1px solid var(--border);border-radius:var(--radius-sm);padding:12px"><strong>${escapeHtml(dish.name)}</strong><div style="font-size:12px;color:var(--muted);margin-top:5px">${dish.calories || '?'} cal · P ${dish.protein || '?'}g · C ${dish.carbs || '?'}g · F ${dish.fat || '?'}g</div><div style="font-size:12px;margin-top:8px"><strong>Ingredients:</strong> ${escapeHtml(dish.ingredients.join(', '))}</div><div style="font-size:12px;margin-top:8px"><strong>Cooking steps:</strong><br>${dish.steps.map((step,index)=>`${index+1}. ${escapeHtml(step)}`).join('<br>')}</div><button class="apply-btn" id="apply-custom-dish">✅ Save custom dish</button></div>`;
    document.getElementById('apply-custom-dish').onclick = event => { customDishes.unshift({...dish, servings}); customDishes=customDishes.slice(0,20); save('fitdash_custom_dishes',customDishes); renderSavedCustomDishes(); event.target.textContent='✓ Dish saved'; event.target.disabled=true; };
    status.textContent = 'Recipe ready. Review it before saving.'; status.style.color = 'var(--green)';
  } catch(err) { status.textContent = `Recipe failed: ${err.message.slice(0,120)}`; status.style.color = 'var(--red)'; }
}

function applyAIPlan(planData) {
  aiPlan = { ...planData, createdAt: getLocalDateStr() };
  save('fitdash_ai_plan', aiPlan);
  renderAIPlan();
  switchPlan('ai');
  // Notify in chat
  chatHistory.push({ role:'assistant', content:'✅ Your personalized meal plan has been applied! Check the **Nutrition** tab → **🤖 My Plan** to see it.' });
  save('fitdash_chat', chatHistory);
  renderChatMessages();
}

function renderAIPlan() {
  const el = document.getElementById('plan-ai-content');
  if(!el) return;

  if(!aiPlan || !aiPlan.meals) {
    el.innerHTML = `<div style="padding:20px;border:1px solid var(--border);border-radius:var(--radius);background:var(--card2);text-align:center;">
      <div style="font-size:15px;font-weight:700;margin-bottom:8px">No AI meal plan generated yet</div>
      <div style="color:var(--muted);margin-bottom:16px">Use the AI Coach to create a plan tailored to your goals, cuisine preference, and food budget.</div>
      <button class="btn-red" onclick="openAIPlanChat()" style="max-width:240px;margin:0 auto">Generate AI Meal Plan</button>
    </div>`;
    return;
  }

  const m = aiPlan.meals;
  let html = `<div style="margin-bottom:16px">
    <div style="font-size:12px;color:var(--muted);background:var(--card2);border:1px solid var(--border);border-radius:var(--radius-sm);padding:10px 14px">
      🤖 <strong style="color:var(--text)">AI-Generated · ${aiPlan.dailyCal||'?'} cal/day</strong>&nbsp;·&nbsp;Created ${aiPlan.createdAt||''}
    </div>
  </div>`;

  const renderSlot = (title, icon, meals) => {
    if(!meals || !meals.length) return '';
    let out = `<div class="meal-section"><div class="meal-header"><div class="meal-title">${icon} ${title}</div></div>`;
    out += meals.map((m, i) => `
      <div class="meal-card" id="mc-ai-${title.toLowerCase()}-${i}">
        <div class="meal-card-header" onclick="toggleMeal('mc-ai-${title.toLowerCase()}-${i}')">
          <div class="meal-icon">${m.emoji||'🍽️'}</div>
          <div class="meal-name">${escapeHtml(m.name)}</div>
          <div class="meal-cals">${m.kcal} cal</div>
          <div class="meal-chevron">▼</div>
        </div>
        <div class="meal-card-body">
          <div class="meal-desc">${escapeHtml(m.desc||'')}</div>
          ${m.recipe ? `<div style="font-size:11px;color:var(--muted2);margin-top:8px;background:var(--bg);padding:8px;border-radius:var(--radius-sm)"><strong>Recipe & Macros:</strong><br>${escapeHtml(typeof m.recipe === 'string' ? m.recipe : (Array.isArray(m.recipe) ? m.recipe.map(x => Object.values(x).join(' ')).join(', ') : JSON.stringify(m.recipe)))}</div>` : ''}
          ${m.steps || m.cookingSteps || m.instructions ? `<div style="font-size:11px;color:var(--muted2);margin-top:8px;background:var(--bg);padding:8px;border-radius:var(--radius-sm)"><strong>Cooking steps:</strong><br>${escapeHtml(Array.isArray(m.steps || m.cookingSteps || m.instructions) ? (m.steps || m.cookingSteps || m.instructions).map((step, index) => `${index + 1}. ${step}`).join('\n') : (m.steps || m.cookingSteps || m.instructions))}</div>` : ''}
        </div>
      </div>`).join('');
    out += '</div>';
    return out;
  };

  html += renderSlot('Breakfast', '🌅', m.breakfast);
  html += renderSlot('Lunch', '☀️', m.lunch);
  html += renderSlot('Dinner', '🌙', m.dinner);

  if(m.snacks && m.snacks.length) {
    html += '<div class="meal-section"><div class="meal-header"><div class="meal-title">🍬 Snacks</div></div>';
    html += '<div class="snack-grid">' + m.snacks.map(s => `
      <div class="snack-item">
        <div class="snack-emoji">${s.emoji||'🍎'}</div>
        <div><div class="snack-name">${escapeHtml(s.name)}</div><div class="snack-cal">${s.kcal} cal</div></div>
      </div>`).join('') + '</div></div>';
  }

  html += `<div style="margin-top:16px;display:flex;gap:8px">
    <button class="btn-ghost" onclick="clearAIPlan()" style="color:var(--muted)">🗑 Clear Plan</button>
  </div>`;

  el.innerHTML = html;
}

function clearAIPlan() {
  if(!confirm('Clear your AI-generated meal plan?')) return;
  aiPlan = null;
  save('fitdash_ai_plan', null);
  switchPlan('1500');
  renderAIPlan();
}
