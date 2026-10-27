// ══ CALORIE TRACKER ═════════════════════════════════════
let calorieLog = safeLoad('fitdash_calorie_log', {});
let micronutrientLog = safeLoad('fitdash_micronutrient_log', {});
let recentFoods = safeLoad('fitdash_recent_foods', []);
let ingredientBuilder = { name: '', items: [] };
let savedRecipes = safeLoad('fitdash_saved_recipes', []);
const COMMON_INGREDIENTS = [
  { name: 'Basmati rice', kcal: 130, protein: 2.4, carbs: 28, fat: 0.3, per: 100, country: 'BD' },
  { name: 'Moong dal', kcal: 105, protein: 7, carbs: 18, fat: 0.4, per: 100, country: 'BD' },
  { name: 'Chicken breast', kcal: 165, protein: 31, carbs: 0, fat: 3.6, per: 100, country: 'INT' },
  { name: 'Egg', kcal: 155, protein: 13, carbs: 1.1, fat: 11, per: 100, country: 'INT' },
  { name: 'Cucumber', kcal: 16, protein: 0.7, carbs: 3.6, fat: 0.1, per: 100, country: 'BD' },
  { name: 'Tomato', kcal: 18, protein: 0.9, carbs: 3.9, fat: 0.2, per: 100, country: 'BD' },
  { name: 'Spinach', kcal: 23, protein: 2.9, carbs: 3.6, fat: 0.4, per: 100, country: 'BD' },
  { name: 'Fish (rui)', kcal: 120, protein: 20, carbs: 0, fat: 4, per: 100, country: 'BD' },
  { name: 'Greek yogurt', kcal: 59, protein: 10, carbs: 3.6, fat: 0.4, per: 100, country: 'INT' },
  { name: 'Potato', kcal: 77, protein: 2, carbs: 17, fat: 0.1, per: 100, country: 'INT' },
];
const COMMON_FOODS = {
  BD: [
    { name: 'Boiled dal', kcal: 110, protein: 7, carbs: 18, fat: 2, grams: 100, country: 'BD' },
    { name: 'Steamed rice', kcal: 170, protein: 3, carbs: 37, fat: 0, grams: 100, country: 'BD' },
    { name: 'Light fish curry (rui)', kcal: 210, protein: 20, carbs: 4, fat: 12, grams: 150, country: 'BD' },
    { name: 'Egg bhuna (1 egg)', kcal: 90, protein: 7, carbs: 1, fat: 6, grams: 70, country: 'BD' },
    { name: 'Cucumber salad', kcal: 45, protein: 1, carbs: 9, fat: 0, grams: 150, country: 'BD' },
    { name: 'Vegetable bhorta', kcal: 85, protein: 2, carbs: 10, fat: 4, grams: 120, country: 'BD' },
  ],
  INT: [
    { name: 'Greek yogurt', kcal: 120, protein: 11, carbs: 4, fat: 6, grams: 150, country: 'INT' },
    { name: 'Oatmeal', kcal: 150, protein: 5, carbs: 27, fat: 3, grams: 40, country: 'INT' },
    { name: 'Grilled chicken breast', kcal: 165, protein: 31, carbs: 0, fat: 4, grams: 120, country: 'INT' },
    { name: 'Mixed salad', kcal: 80, protein: 3, carbs: 10, fat: 3, grams: 180, country: 'INT' },
    { name: 'Brown rice bowl', kcal: 220, protein: 5, carbs: 45, fat: 2, grams: 150, country: 'INT' },
    { name: 'Banana', kcal: 105, protein: 1, carbs: 27, fat: 0, grams: 100, country: 'INT' },
  ]
};

function renderIngredientBuilder() {
  const el = document.getElementById('ingredient-builder');
  if(!el) return;
  const selected = ingredientBuilder.items.length ? ingredientBuilder.items[ingredientBuilder.items.length - 1].name : COMMON_INGREDIENTS[0]?.name || '';
  const totals = ingredientBuilder.items.reduce((t,item) => {
    t.calories += item.calories; t.protein += item.protein; t.carbs += item.carbs; t.fat += item.fat; t.grams += item.grams;
    return t;
  }, { calories:0, protein:0, carbs:0, fat:0, grams:0 });

  el.innerHTML = `
    <div style="border:1px solid var(--border);border-radius:var(--radius-sm);background:var(--card2);padding:14px">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px">
        <div>
          <div style="font-size:13px;font-weight:700">Build a dish from ingredients</div>
          <div style="font-size:11px;color:var(--muted);margin-top:4px">Choose ingredients, add grams, and create a logged dish.</div>
        </div>
        <button class="btn-ghost" onclick="clearIngredientBuilder()" style="font-size:11px;color:var(--muted);padding:6px 10px">Clear</button>
      </div>
      <div class="ib-grid ib-grid-pick">
        <select id="ingredient-select" class="settings-select" style="width:100%">${COMMON_INGREDIENTS.map(i => `<option value="${escapeHtml(i.name)}">${escapeHtml(i.name)} — ${i.kcal} kcal/100g</option>`).join('')}</select>
        <input id="ingredient-grams" type="number" min="1" value="100" placeholder="g" style="width:100%;background:var(--card2);border:1px solid var(--border);border-radius:var(--radius-sm);padding:10px;color:var(--text);outline:none">
        <button class="btn-red" onclick="addIngredientToDish()" style="justify-content:center">Add</button>
      </div>
      <div class="ib-grid ib-grid-custom">
        <input id="custom-ingredient-name" class="settings-input" placeholder="Custom ingredient name" style="width:100%">
        <input id="custom-ingredient-kcal" class="settings-input" type="number" placeholder="kcal/100g">
        <input id="custom-ingredient-protein" class="settings-input" type="number" placeholder="protein/100g">
        <input id="custom-ingredient-carbs" class="settings-input" type="number" placeholder="carbs/100g">
        <input id="custom-ingredient-fat" class="settings-input" type="number" placeholder="fat/100g">
      </div>
      <div class="ib-grid ib-grid-actions">
        <input id="dish-name" class="settings-input" placeholder="Dish name" value="${escapeHtml(ingredientBuilder.name)}">
        <button class="btn-ghost" onclick="saveCurrentRecipe()" style="justify-content:center">Save recipe</button>
        <button class="btn-ghost" onclick="lookupIngredientMacros(this)" style="justify-content:center">AI macros</button>
        <button class="btn-red" onclick="addIngredientToDish()" style="justify-content:center">Add ingredient</button>
        <button class="btn-ghost" onclick="createIngredientDish()" style="justify-content:center">Log dish</button>
      </div>
      ${ingredientBuilder.items.length ? `<div style="margin-bottom:12px">
        <div style="font-size:12px;color:var(--muted);margin-bottom:8px">Ingredients (${ingredientBuilder.items.length})</div>
        <div style="display:flex;flex-wrap:wrap;gap:6px">${ingredientBuilder.items.map((item, idx) => `
          <div style="background:var(--bg);border:1px solid var(--border);border-radius:var(--radius-sm);padding:8px;min-width:calc(33% - 8px);position:relative">
            <div style="font-size:13px;font-weight:700;margin-bottom:4px">${escapeHtml(item.name)}</div>
            <div style="font-size:11px;color:var(--muted)">${item.grams}g · ${Math.round(item.calories)} kcal</div>
            <div style="font-size:11px;color:var(--muted)">P ${Math.round(item.protein)}g · C ${Math.round(item.carbs)}g · F ${Math.round(item.fat)}g</div>
            <button onclick="removeIngredientFromDish(${idx})" class="del-btn del-btn-sm" style="position:absolute;top:8px;right:8px;">×</button>
          </div>`).join('')}</div>
      </div>
      <div style="display:flex;justify-content:space-between;gap:12px;font-size:12px;color:var(--muted)">
        <div>Total grams: <strong style="color:var(--text)">${Math.round(totals.grams)}g</strong></div>
        <div>Total calories: <strong style="color:var(--text)">${Math.round(totals.calories)} kcal</strong></div>
        <div>Macros: <strong style="color:var(--text)">P ${Math.round(totals.protein)}g C ${Math.round(totals.carbs)}g F ${Math.round(totals.fat)}g</strong></div>
      </div>` : '<div style="font-size:12px;color:var(--muted)">Add ingredients to build a custom dish.</div>'}
      ${savedRecipes.length ? `<div style="margin-top:18px;border-top:1px solid var(--border);padding-top:14px">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px">
          <div style="font-size:12px;font-weight:700;color:var(--text)">Saved recipes</div>
          <div style="font-size:11px;color:var(--muted)">${savedRecipes.length} saved</div>
        </div>
        <div style="display:flex;flex-wrap:wrap;gap:6px">${savedRecipes.map((recipe, idx) => `
          <div style="background:var(--bg);border:1px solid var(--border);border-radius:var(--radius-sm);padding:10px;min-width:calc(33% - 8px)">
            <div style="font-size:13px;font-weight:700;margin-bottom:4px">${escapeHtml(recipe.name)}</div>
            <div style="font-size:11px;color:var(--muted)">${recipe.items.length} ingredients · ${Math.round(recipe.items.reduce((s,i)=>s+i.calories,0))} kcal</div>
            <div style="display:flex;gap:4px;flex-wrap:wrap;margin-top:8px">
              <button class="btn-ghost" onclick="loadSavedRecipe(${idx})" style="font-size:11px">Load</button>
              <button class="btn-ghost" onclick="scaleSavedRecipe(${idx})" style="font-size:11px">Scale</button>
              <button class="btn-ghost" onclick="deleteSavedRecipe(${idx})" style="font-size:11px;color:var(--red)">Delete</button>
            </div>
          </div>`).join('')}</div>
      </div>` : ''}
    </div>
  `;
}

function addIngredientToDish() {
  const customName = document.getElementById('custom-ingredient-name')?.value.trim();
  const customKcal = parseFloat(document.getElementById('custom-ingredient-kcal')?.value);
  const customProtein = parseFloat(document.getElementById('custom-ingredient-protein')?.value) || 0;
  const customCarbs = parseFloat(document.getElementById('custom-ingredient-carbs')?.value) || 0;
  const customFat = parseFloat(document.getElementById('custom-ingredient-fat')?.value) || 0;
  const gramsInput = document.getElementById('ingredient-grams');
  const grams = parseFloat(gramsInput?.value);

  let ingredient;
  if(customName) {
    if(!customKcal || customKcal <= 0) {
      alert('Enter valid kcal for the custom ingredient.');
      return;
    }
    ingredient = { name: customName, kcal: customKcal, protein: customProtein, carbs: customCarbs, fat: customFat, per: 100, country: 'INT' };
  } else {
    const select = document.getElementById('ingredient-select');
    const name = select?.value;
    if(!name) { alert('Select an ingredient or enter a custom one.'); return; }
    ingredient = COMMON_INGREDIENTS.find(i => i.name === name);
    if(!ingredient) { alert('Selected ingredient not found.'); return; }
  }

  if(!grams || grams <= 0) { alert('Enter a valid gram amount.'); return; }
  const factor = grams / ingredient.per;
  ingredientBuilder.items.push({
    name: ingredient.name,
    grams,
    calories: ingredient.kcal * factor,
    protein: ingredient.protein * factor,
    carbs: ingredient.carbs * factor,
    fat: ingredient.fat * factor,
    country: ingredient.country || 'INT'
  });
  ingredientBuilder.name = document.getElementById('dish-name')?.value.trim() || ingredientBuilder.name || `${ingredient.name} dish`;
  if(gramsInput) gramsInput.value = '100';
  document.getElementById('custom-ingredient-name').value = '';
  document.getElementById('custom-ingredient-kcal').value = '';
  document.getElementById('custom-ingredient-protein').value = '';
  document.getElementById('custom-ingredient-carbs').value = '';
  document.getElementById('custom-ingredient-fat').value = '';
  renderIngredientBuilder();
}

function removeIngredientFromDish(index) {
  ingredientBuilder.items.splice(index, 1);
  renderIngredientBuilder();
}

function clearIngredientBuilder() {
  ingredientBuilder = { name: '', items: [] };
  renderIngredientBuilder();
}

async function lookupIngredientMacros(button) {
  const ingredientName = document.getElementById('custom-ingredient-name')?.value.trim();
  if(!ingredientName) {
    alert('Enter a custom ingredient name first.');
    return;
  }
  if(providerRequiresApiKey(aiConfig.provider) && !getProviderApiKey(aiConfig.provider)) {
    alert(missingApiKeyMessage());
    return;
  }
  const btn = button || { disabled: false, textContent: 'AI macros' };
  const originalText = btn.textContent || 'AI macros';
  btn.disabled = true;
  btn.textContent = 'Looking...';

  try {
    const messages = [
      { role: 'system', content: 'You are a nutrition assistant. Provide only JSON with calories, protein, carbs, and fat per 100g for a single ingredient. Do not include any extra text.' },
      { role: 'user', content: `Ingredient: ${ingredientName}\nReturn JSON only in this format: {"calories": number, "protein": number, "carbs": number, "fat": number}` }
    ];
    const response = await callAI(messages);

    const jsonMatch = response.match(/```(?:json)?\s*([\s\S]*?)\s*```/) || response.match(/(\{[\s\S]*\})/);
    if(!jsonMatch) throw new Error('AI response did not contain JSON.');

    const jsonText = jsonMatch[1].trim();
    const macros = JSON.parse(jsonText);
    if(!Number.isFinite(macros.calories) || !Number.isFinite(macros.protein) || !Number.isFinite(macros.carbs) || !Number.isFinite(macros.fat)) {
      throw new Error('Incomplete nutrition data returned.');
    }

    document.getElementById('custom-ingredient-kcal').value = Math.round(macros.calories);
    document.getElementById('custom-ingredient-protein').value = Math.round(macros.protein);
    document.getElementById('custom-ingredient-carbs').value = Math.round(macros.carbs);
    document.getElementById('custom-ingredient-fat').value = Math.round(macros.fat);
    alert(`AI macro lookup complete for ${ingredientName}.`);
  } catch(e) {
    alert('AI macro lookup failed: ' + e.message);
  } finally {
    btn.disabled = false;
    btn.textContent = originalText;
  }
}

function createIngredientDish() {
  const nameInput = document.getElementById('dish-name');
  const dishName = nameInput?.value.trim() || 'Custom dish';
  if(!ingredientBuilder.items.length) { alert('Add at least one ingredient before logging a dish.'); return; }
  const totals = ingredientBuilder.items.reduce((t,item) => {
    t.calories += item.calories; t.protein += item.protein; t.carbs += item.carbs; t.fat += item.fat; t.grams += item.grams;
    return t;
  }, { calories:0, protein:0, carbs:0, fat:0, grams:0 });
  addFoodEntry(dishName, Math.round(totals.grams), Math.round(totals.calories), Math.round(totals.protein), Math.round(totals.carbs), Math.round(totals.fat), 'dish');
  clearIngredientBuilder();
}

function saveCurrentRecipe() {
  const recipeName = document.getElementById('dish-name')?.value.trim();
  if(!recipeName) { alert('Enter a recipe name before saving.'); return; }
  if(!ingredientBuilder.items.length) { alert('Add ingredients to save a recipe.'); return; }
  const recipe = { name: recipeName, items: ingredientBuilder.items.map(item => ({ ...item })) };
  const existing = savedRecipes.find(r => r.name.toLowerCase() === recipeName.toLowerCase());
  if(existing) {
    if(!confirm(`Replace saved recipe "${recipeName}"?`)) return;
    existing.items = recipe.items;
  } else {
    savedRecipes.unshift(recipe);
  }
  save('fitdash_saved_recipes', savedRecipes);
  renderIngredientBuilder();
}

function loadSavedRecipe(index) {
  const recipe = savedRecipes[index];
  if(!recipe) return;
  ingredientBuilder = { name: recipe.name, items: recipe.items.map(item => ({ ...item })) };
  renderIngredientBuilder();
}

function scaleSavedRecipe(index) {
  const recipe = savedRecipes[index];
  if(!recipe) return;
  const factor = Number(prompt('How many times this recipe?', '1'));
  if(!Number.isFinite(factor) || factor <= 0 || factor > 20) return;
  ingredientBuilder = { name:`${recipe.name} ×${factor}`, items:recipe.items.map(item => ({ ...item, grams:item.grams * factor, calories:item.calories * factor, protein:item.protein * factor, carbs:item.carbs * factor, fat:item.fat * factor })) };
  renderIngredientBuilder();
}

function deleteSavedRecipe(index) {
  if(!confirm('Delete this saved recipe?')) return;
  savedRecipes.splice(index, 1);
  save('fitdash_saved_recipes', savedRecipes);
  renderIngredientBuilder();
}

function saveRecentFood(item) {
  if(!item || !item.name) return;
  const kcal = Number(item.kcal);
  const protein = Number(item.protein);
  const carbs = Number(item.carbs);
  const fat = Number(item.fat);
  const grams = Number(item.grams);

  recentFoods = recentFoods.filter(f => f.name !== item.name);
  recentFoods.unshift({
    name: item.name,
    kcal: Number.isFinite(kcal) ? Math.round(kcal) : 0,
    protein: Number.isFinite(protein) ? Math.round(protein) : 0,
    carbs: Number.isFinite(carbs) ? Math.round(carbs) : 0,
    fat: Number.isFinite(fat) ? Math.round(fat) : 0,
    grams: Number.isFinite(grams) ? Math.round(grams) : 0,
    country: item.country || 'INT'
  });
  recentFoods = recentFoods.slice(0,6);
  save('fitdash_recent_foods', recentFoods);
}

function addQuickFoodEntryFromButton(button) {
  const item = {
    name: button.dataset.name,
    kcal: Number(button.dataset.kcal) || 0,
    protein: Number(button.dataset.protein) || 0,
    carbs: Number(button.dataset.carbs) || 0,
    fat: Number(button.dataset.fat) || 0,
    grams: Number(button.dataset.grams) || 0,
    country: button.dataset.country || 'INT',
    source: 'quick'
  };
  addFoodEntry(item.name, item.grams, item.kcal, item.protein, item.carbs, item.fat, item.source, item.country);
  saveRecentFood(item);
}

function removeRecentFood(name) {
  recentFoods = recentFoods.filter(item => item.name !== name);
  save('fitdash_recent_foods', recentFoods);
  renderCalorieTracker();
}

function clearRecentFoods() {
  if(!confirm('Clear all recent food suggestions?')) return;
  recentFoods = [];
  save('fitdash_recent_foods', recentFoods);
  renderCalorieTracker();
}

function parseGramsFromText(text) {
  if(!text) return null;
  const match = text.match(/(\d+(?:\.\d+)?)\s*(g|grams?)/i);
  return match ? Math.round(parseFloat(match[1])) : null;
}

function addFoodEntry(name, grams, calories, protein, carbs, fat, source, country) {
  const today = getLocalDateStr();
  if(!calorieLog[today]) calorieLog[today] = [];

  const gramsNum = Number(grams);
  const caloriesNum = Number(calories);
  const proteinNum = Number(protein);
  const carbsNum = Number(carbs);
  const fatNum = Number(fat);

  const entry = {
    name,
    grams: Number.isFinite(gramsNum) ? Math.round(gramsNum) : 0,
    calories: Number.isFinite(caloriesNum) ? Math.round(caloriesNum) : 0,
    protein: Number.isFinite(proteinNum) ? Math.round(proteinNum) : 0,
    carbs: Number.isFinite(carbsNum) ? Math.round(carbsNum) : 0,
    fat: Number.isFinite(fatNum) ? Math.round(fatNum) : 0,
    source: source||'manual',
    country: country || '',
    time: new Date().toLocaleTimeString('en-US',{hour:'2-digit',minute:'2-digit'})
  };

  calorieLog[today].push(entry);
  save('fitdash_calorie_log', calorieLog);

  if(name) {
    saveRecentFood({
      name,
      kcal: entry.calories,
      protein: entry.protein,
      carbs: entry.carbs,
      fat: entry.fat,
      grams: entry.grams,
      country: entry.country || 'INT'
    });
  }

  renderCalorieTracker();
}

function deleteFoodEntry(idx) {
  const today = getLocalDateStr();
  if(!calorieLog[today]) return;
  const deletedItem = calorieLog[today].splice(idx, 1)[0];
  save('fitdash_calorie_log', calorieLog);
  renderCalorieTracker();
  showUndoToast('Food entry deleted', () => {
    calorieLog[today].splice(idx, 0, deletedItem);
    save('fitdash_calorie_log', calorieLog);
    renderCalorieTracker();
  });
}

async function logQuickFood() {
  const nameInput = document.getElementById('food-name-input');
  const gramsEl = document.getElementById('food-grams-input');
  const name = nameInput.value.trim();
  const gramsInput = parseFloat(gramsEl.value);
  const gramsText = parseGramsFromText(name);
  const grams = Number.isFinite(gramsInput) && gramsInput > 0 ? gramsInput : gramsText;
  if(!name) { alert('Enter a food name.'); return; }
  if(providerRequiresApiKey(aiConfig.provider) && !getProviderApiKey(aiConfig.provider)) {
    alert(missingApiKeyMessage());
    return;
  }

  const country = document.getElementById('label-country')?.value || 'INT';
  const logBtn = document.getElementById('food-log-btn');
  const logBtnText = logBtn ? logBtn.textContent : '';
  if(logBtn) { logBtn.disabled = true; logBtn.textContent = grams ? 'Counting…' : 'Looking up…'; }

  try {
    const macros = await estimateFoodMacros(name, grams, country);
    const loggedGrams = grams || macros.grams || 0;
    addFoodEntry(name, loggedGrams, macros.calories, macros.protein, macros.carbs, macros.fat, 'ai', country);
    const today = getLocalDateStr();
    const entry = calorieLog[today][calorieLog[today].length - 1];
    if(!grams && loggedGrams) entry.gramsEstimated = true;
    if(macros.note) entry.note = macros.note;
    if(macros.sources.length) entry.sources = macros.sources;
    save('fitdash_calorie_log', calorieLog);
    renderCalorieTracker();
    nameInput.value = '';
    gramsEl.value = '';
    const via = macros.webSearch ? 'web search' : 'AI estimate';
    showUndoToast(`Logged ${Math.round(macros.calories)} kcal${!grams && loggedGrams ? ` (~${Math.round(loggedGrams)} g)` : ''} · ${via}`, () => {
      const idx = calorieLog[today].indexOf(entry);
      if(idx >= 0) calorieLog[today].splice(idx, 1);
      save('fitdash_calorie_log', calorieLog);
      renderCalorieTracker();
    });
  } catch(err) {
    alert('Auto count failed: ' + err.message + ' Use Count calories + macros instead.');
  } finally {
    if(logBtn) { logBtn.disabled = false; logBtn.textContent = logBtnText; }
  }
}

function startVoiceFoodInput() {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  const input = document.getElementById('food-name-input');
  if(!SpeechRecognition || !input) { alert('Voice input is not supported in this browser.'); return; }
  const recognition = new SpeechRecognition();
  recognition.lang = 'en-US';
  recognition.interimResults = false;
  recognition.onresult = event => { input.value = event.results[0][0].transcript; input.focus(); };
  recognition.onerror = () => alert('Could not understand the food name.');
  recognition.start();
}

const FOOD_PORTION_GUIDANCE = 'If no weight is given, estimate it from the description: count the pieces, cups or plates mentioned and use the typical weight per piece or pack serving for that product (for a named brand, use its package nutrition label). Respect the cooking method (e.g. "cooked without oil" means no added oil; fried means add the absorbed oil).';

async function estimateFoodMacros(name, grams, country) {
  const cuisineHint = (userGoals.cuisinePref || 'both').toLowerCase();
  const countryHint = country === 'BD'
    ? 'Use Bangladeshi nutrition conventions and local ingredient names when applicable.'
    : 'Use international nutrition conventions when applicable.';
  const preferenceHint = cuisineHint === 'bangladeshi' || cuisineHint === 'bd'
    ? 'Prefer Bangladeshi ingredients and local brands where possible.'
    : cuisineHint.startsWith('int')
    ? 'Prefer international ingredients and globally available brands.'
    : 'Use both Bangladeshi and international ingredients as applicable.';

  const weightLine = grams ? `Weight: ${grams} g` : 'Weight: not measured — estimate it from the description.';
  const messages = [
    { role: 'system', content: `You are a nutrition assistant. If you can search the web, look up the product's or dish's published nutrition facts (brand website, package label, nutrition databases) before answering. ${FOOD_PORTION_GUIDANCE} Answer with only one JSON object and no other text.` },
    { role: 'user', content: `Food: ${name}\n${weightLine}\n${countryHint} ${preferenceHint}\nReturn only JSON like {"grams": number, "calories": number, "protein": number, "carbs": number, "fat": number, "note": "short note on the portion and source you used"}. The values must be totals for the whole amount eaten.` }
  ];

  const result = await callAIWithWebSearch(messages, { temperature:0.2 });
  const response = result.text;
  const jsonMatch = response.match(/```(?:json)?\s*([\s\S]*?)\s*```/) || response.match(/(\{[\s\S]*\})/);
  if(!jsonMatch) throw new Error('AI response did not contain JSON.');

  let macros;
  try {
    macros = JSON.parse(jsonMatch[1].trim());
  } catch(e) {
    throw new Error('Failed to parse AI JSON response.');
  }

  const calories = Number(macros.calories);
  const protein = Number(macros.protein);
  const carbs = Number(macros.carbs);
  const fat = Number(macros.fat);
  const estimatedGrams = Number(macros.grams);

  if(!Number.isFinite(calories) || !Number.isFinite(protein) || !Number.isFinite(carbs) || !Number.isFinite(fat)) {
    throw new Error('Incomplete nutrition data from AI.');
  }
  if(calories <= 0) {
    throw new Error('AI returned zero calories for a food item.');
  }

  return {
    calories,
    protein,
    carbs,
    fat,
    grams: Number.isFinite(estimatedGrams) && estimatedGrams > 0 ? estimatedGrams : 0,
    note: typeof macros.note === 'string' ? macros.note.slice(0, 200) : '',
    sources: result.sources || [],
    webSearch: result.webSearch,
  };
}

function askAIToCount() {
  const desc = document.getElementById('food-name-input').value.trim();
  const gramsInput = parseInt(document.getElementById('food-grams-input').value);
  const gramsText = parseGramsFromText(desc);
  const grams = gramsInput || gramsText;
  if(!desc) { alert('Describe what you ate first.'); return; }
  const country = document.getElementById('label-country')?.value || 'INT';
  const cuisineHint = (userGoals.cuisinePref || 'both').toLowerCase();
  const countryHint = country === 'BD'
    ? 'Use Bangladeshi nutrition label conventions and local ingredient names when applicable.'
    : 'Use international nutrition label conventions and product names when applicable.';
  const preferenceHint = cuisineHint === 'bangladeshi' || cuisineHint === 'bd'
    ? 'Prefer Bangladeshi ingredients and local brands where possible.'
    : cuisineHint.startsWith('int')
    ? 'Prefer international ingredients and globally available brands.'
    : 'Use both Bangladeshi and international ingredients as available.';
  const recentHint = recentFoods.length
    ? `Also consider these recent foods I logged: ${recentFoods.slice(0,4).map(f => f.name).join(', ')}.`
    : '';

  const panel = document.getElementById('ai-chat-panel');
  if(!panel.classList.contains('open')) toggleChat();
  setTimeout(() => {
    const input = document.getElementById('chat-input');
    const amount = grams > 0 ? ` (${grams} g)` : ' (weight not measured — estimate the portion from the description)';
    input.value = `Count the calories and macros for: ${desc}${amount}. Look up the brand's or dish's nutrition facts online if you can. ${FOOD_PORTION_GUIDANCE} Include a per-item breakdown table with the estimated grams and the total. ${countryHint} ${preferenceHint} ${recentHint}`;
    sendChatMessage({ webSearch:true });
  }, 400);
}

function toggleLabelForm() {
  document.getElementById('label-form').classList.toggle('open');
}

function openAIPlanChat() {
  const panel = document.getElementById('ai-chat-panel');
  if(!panel.classList.contains('open')) toggleChat();
  const cuisinePref = (userGoals.cuisinePref || 'both').toLowerCase();
  const preferenceHint = cuisinePref === 'bangladeshi' || cuisinePref === 'bd'
    ? 'Use Bangladeshi meal ideas, local ingredients, and budget-friendly brands.'
    : cuisinePref.startsWith('int')
    ? 'Use international meal ideas and globally available ingredients.'
    : 'Mix Bangladeshi and international meals to match my preference.';
  const recentHint = recentFoods.length
    ? `I have logged these recently: ${recentFoods.slice(0,4).map(f => f.name).join(', ')}.`
    : '';
  const input = document.getElementById('chat-input');
  input.value = `Create a personalized meal plan based on my current goals, profile, and cuisine preference. ${preferenceHint} ${recentHint} Include breakfast, lunch, dinner, and snacks with calories and macros for each item.`;
  input.focus();
  setTimeout(() => sendChatMessage(), 600);
}

function logBrandedProduct() {
  const name     = document.getElementById('label-name').value.trim();
  const calsPer  = parseFloat(document.getElementById('label-cals').value);
  const serving  = parseFloat(document.getElementById('label-serving').value);
  const servings = parseFloat(document.getElementById('label-servings-used').value);
  const protPer  = parseFloat(document.getElementById('label-protein').value) || 0;
  const carbPer  = parseFloat(document.getElementById('label-carbs').value) || 0;
  const fatPer   = parseFloat(document.getElementById('label-fat').value) || 0;

  if(!name) { alert('Enter product name.'); return; }
  if(!calsPer || calsPer <= 0) { alert('Enter calories per serving from label.'); return; }
  if(!servings || servings <= 0) { alert('Enter how many servings you consumed.'); return; }

  const totalCals = Math.round(calsPer * servings);
  const totalProt = Math.round(protPer * servings);
  const totalCarb = Math.round(carbPer * servings);
  const totalFat  = Math.round(fatPer * servings);
  const grams     = serving ? Math.round(serving * servings) : 0;

  const country = document.getElementById('label-country')?.value || 'INT';
  addFoodEntry(name, grams, totalCals, totalProt, totalCarb, totalFat, 'label', country);

  // Clear form
  ['label-name','label-cals','label-serving','label-servings-used','label-protein','label-carbs','label-fat'].forEach(id => {
    const el = document.getElementById(id);
    if(el) el.value = '';
  });
  const countrySelect = document.getElementById('label-country');
  if(countrySelect) countrySelect.value = 'INT';
  toggleLabelForm();
}

function renderCalorieTracker() {
  const el = document.getElementById('cal-tracker-content');
  if(!el) return;

  const today = getLocalDateStr();
  const entries = calorieLog[today] || [];
  const target = getTodayCalorieTarget();
  const totalCals = entries.reduce((s,e) => s + e.calories, 0);
  const totalP = entries.reduce((s,e) => s + e.protein, 0);
  const totalC = entries.reduce((s,e) => s + e.carbs, 0);
  const totalF = entries.reduce((s,e) => s + e.fat, 0);
  const latestWeight = weights.length ? weights.reduce((latest, entry) => (!latest || entry.date > latest.date) ? entry : latest, null) : null;
  const proteinTarget = userGoals.proteinTarget || (latestWeight ? Math.round(latestWeight.val * 1.6) : null);
  const carbTarget = userGoals.carbTarget;
  const fatTarget = userGoals.fatTarget;
  const pct = target ? Math.min(100, Math.round(totalCals / target * 100)) : 0;
  const barColor = pct > 100 ? 'var(--red)' : pct > 80 ? 'var(--yellow)' : 'var(--green)';

  let html = '';

  // Progress bar
  html += `<div style="margin-bottom:16px">
    <div style="display:flex;justify-content:space-between;font-size:12px;margin-bottom:6px">
      <span><strong style="color:var(--text)">${totalCals}</strong> <span style="color:var(--muted)">/ ${target} cal</span></span>
      <span style="color:var(--muted)">${pct}%</span>
    </div>
    <div class="cardio-bar"><div class="cardio-fill" style="width:${pct}%;background:${barColor}"></div></div>
    <div class="cal-macro-pills" style="margin-top:8px;justify-content:center">
      <span class="cal-macro-pill p">P ${totalP}g</span>
      <span class="cal-macro-pill c">C ${totalC}g</span>
      <span class="cal-macro-pill f">F ${totalF}g</span>
    </div>
    ${proteinTarget ? `<div style="margin-top:10px">
      <div style="display:flex;justify-content:space-between;font-size:11px;color:var(--muted);margin-bottom:5px"><span>Protein target</span><span>${Math.round(totalP)} / ${proteinTarget}g</span></div>
      <div class="cardio-bar"><div class="cardio-fill" style="width:${Math.min(100, Math.round(totalP / proteinTarget * 100))}%;background:var(--green)"></div></div>
    </div>` : '<div style="font-size:11px;color:var(--muted);text-align:center;margin-top:8px">Add body weight or set a protein target in Settings.</div>'}
    ${renderMacroTargetBar('Carbs', totalC, carbTarget, 'var(--blue)')}
    ${renderMacroTargetBar('Fat', totalF, fatTarget, 'var(--yellow)')}
  </div>`;

  const micronutrients = micronutrientLog[today];
  html += `<div style="border-top:1px solid var(--border);padding-top:14px;margin-bottom:16px">
    <div style="display:flex;justify-content:space-between;align-items:center;gap:8px;flex-wrap:wrap">
      <div>
        <div style="font-size:13px;font-weight:700">Micronutrients</div>
        <div style="font-size:11px;color:var(--muted)">AI estimates from today's logged foods</div>
      </div>
      <button class="btn-ghost" id="micronutrient-btn" onclick="estimateDailyMicronutrients()" style="font-size:11px">🤖 Estimate micros</button>
    </div>
    <div id="micronutrient-status" style="font-size:11px;color:var(--muted);margin-top:8px"></div>
    <div id="micronutrient-values" style="display:grid;grid-template-columns:repeat(4,1fr);gap:6px;margin-top:10px">
      ${micronutrients ? renderMicronutrientValues(micronutrients) : '<div style="grid-column:1/-1;font-size:12px;color:var(--muted);padding:8px 0">Add food first, then estimate fiber, sodium, potassium, calcium, iron, and vitamins.</div>'}
    </div>
  </div>`;

  // Quick food picker
  const cuisinePref = (userGoals.cuisinePref || 'both').toLowerCase();
  let quickOptions = [];
  if(cuisinePref === 'bangladeshi' || cuisinePref === 'bd') quickOptions = COMMON_FOODS.BD;
  else if(cuisinePref === 'international' || cuisinePref === 'intl' || cuisinePref === 'int') quickOptions = COMMON_FOODS.INT;
  else quickOptions = [...COMMON_FOODS.BD, ...COMMON_FOODS.INT];

  if(recentFoods.length) {
    html += `<div style="margin-bottom:12px">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">
        <span style="font-size:13px;font-weight:700">Recent foods</span>
        <button class="btn-ghost" style="font-size:11px;padding:6px 10px;color:var(--muted)" onclick="clearRecentFoods()">Clear recent</button>
      </div>
      <div style="display:flex;flex-wrap:wrap;gap:8px">${recentFoods.map(item => `
        <div class="recent-food-pill" style="display:inline-flex;align-items:center;gap:6px;background:var(--card2);border:1px solid var(--border);border-radius:999px;padding:8px 10px;">
          <button class="pill-btn" tabindex="0" aria-label="Add ${escapeHtml(item.name)} — ${item.kcal} kcal, ${item.protein}g protein, ${item.carbs}g carbs, ${item.fat}g fat" onclick="addQuickFoodEntryFromButton(this)" onkeydown="if(event.key==='Enter'||event.key===' '||event.code==='Space'){addQuickFoodEntryFromButton(this);event.preventDefault();}" data-name="${escapeHtml(item.name)}" data-kcal="${item.kcal}" data-protein="${item.protein}" data-carbs="${item.carbs}" data-fat="${item.fat}" data-grams="${item.grams}" data-country="${item.country}" style="border-radius:999px;">${escapeHtml(item.name)} · ${item.kcal} cal [${item.protein}g P | ${item.carbs}g C | ${item.fat}g F]</button>
          <button class="del-btn del-btn-sm" tabindex="0" aria-label="Remove ${escapeHtml(item.name)}" onclick="removeRecentFood('${escapeHtml(item.name)}');event.stopPropagation();" onkeydown="if(event.key==='Enter'||event.key===' '||event.code==='Space'){ removeRecentFood('${escapeHtml(item.name)}'); event.stopPropagation(); event.preventDefault(); }" title="Remove this recent food">×</button>
        </div>`).join('')}</div>
    </div>`;
  }
  if(quickOptions.length) {
    const quickLabel = cuisinePref === 'bangladeshi' || cuisinePref === 'bd'
      ? 'Bangladeshi quick foods'
      : cuisinePref.startsWith('int')
      ? 'International quick foods'
      : 'Quick food picker';
    html += `<div style="margin-bottom:16px">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px">
        <span style="font-size:13px;font-weight:700">${quickLabel}</span>
        <span style="font-size:11px;color:var(--muted)">Tap to log instantly</span>
      </div>
      <div style="display:flex;flex-wrap:wrap;gap:8px">${quickOptions.map(item => `<button class="pill-btn" onclick="addQuickFoodEntryFromButton(this)" data-name="${escapeHtml(item.name)}" data-kcal="${item.kcal}" data-protein="${item.protein}" data-carbs="${item.carbs}" data-fat="${item.fat}" data-grams="${item.grams}" data-country="${item.country}">${escapeHtml(item.name)} · ${item.kcal} cal</button>`).join('')}</div>
    </div>`;
  }

  // Entry list
  if(entries.length) {
    html += entries.map((e, i) => `
      <div class="cal-log-item">
        <div style="flex:1;min-width:0">
          <div class="cal-log-name">
            ${escapeHtml(e.name)}${e.country ? `<span style="margin-left:8px;font-size:10px;color:var(--muted)">(${escapeHtml(e.country)})</span>` : ''}
          </div>
          <div style="display:flex;gap:6px;margin-top:2px">
            ${e.grams ? `<span class="cal-log-amount"${e.gramsEstimated ? ' title="Estimated by AI"' : ''}>${e.gramsEstimated ? '~' : ''}${e.grams}g</span>` : ''}
            <span style="font-size:10px;color:var(--muted)">${e.time||''}</span>
          </div>
        </div>
        <div class="cal-macro-pills">
          ${e.protein?`<span class="cal-macro-pill p">${e.protein}p</span>`:''}
          ${e.carbs?`<span class="cal-macro-pill c">${e.carbs}c</span>`:''}
          ${e.fat?`<span class="cal-macro-pill f">${e.fat}f</span>`:''}
        </div>
        <span class="cal-log-cals">${e.calories}</span>
        <button onclick="toggleFavoriteFoodFromEntry(${i})" class="del-btn del-btn-sm" style="color:${isFavoriteFood(e.name) ? 'var(--yellow)' : 'var(--muted)'}" title="${isFavoriteFood(e.name) ? 'Unpin from' : 'Pin to'} Quick Log" aria-label="${isFavoriteFood(e.name) ? 'Unpin' : 'Pin'} ${escapeHtml(e.name)}">${isFavoriteFood(e.name) ? '★' : '☆'}</button>
        <button onclick="deleteFoodEntry(${i})" class="del-btn del-btn-sm">×</button>
      </div>`).join('');
  } else {
    html += '<div style="text-align:center;padding:16px;color:var(--muted);font-size:13px">No food logged today. Use the inputs above or ask the AI Coach!<div style="margin-top:10px;display:flex;gap:8px;justify-content:center"><button class="btn-red" onclick="showPage(\'nutrition\')">Add Quick Food</button><button class="btn-ghost" onclick="toggleChat()">Ask AI Coach</button></div></div>';
  }

  el.innerHTML = html;
  if(typeof renderQuickLog === 'function') renderQuickLog();
}

function renderMacroTargetBar(label, total, target, color) {
  if(!target) return '';
  const pct = Math.min(100, Math.round(total / target * 100));
  return `<div style="margin-top:10px">
    <div style="display:flex;justify-content:space-between;font-size:11px;color:var(--muted);margin-bottom:5px"><span>${label} target</span><span>${Math.round(total)} / ${target}g</span></div>
    <div class="cardio-bar"><div class="cardio-fill" style="width:${pct}%;background:${color}"></div></div>
  </div>`;
}

function renderMicronutrientValues(values) {
  const targets = {
    fiber_g:25, sodium_mg:2300, potassium_mg:3400, calcium_mg:1000, iron_mg:8,
    magnesium_mg:400, zinc_mg:11, phosphorus_mg:700, folate_mcg:400, vitamin_a_mcg:900,
    vitamin_c_mg:90, vitamin_d_mcg:15, vitamin_e_mg:15, vitamin_k_mcg:120, vitamin_b12_mcg:2.4
  };
  const items = [
    ['Fiber', values.fiber_g, 'g', 'fiber_g'], ['Sodium', values.sodium_mg, 'mg', 'sodium_mg'],
    ['Potassium', values.potassium_mg, 'mg', 'potassium_mg'], ['Calcium', values.calcium_mg, 'mg', 'calcium_mg'],
    ['Iron', values.iron_mg, 'mg', 'iron_mg'], ['Magnesium', values.magnesium_mg, 'mg', 'magnesium_mg'],
    ['Zinc', values.zinc_mg, 'mg', 'zinc_mg'], ['Phosphorus', values.phosphorus_mg, 'mg', 'phosphorus_mg'],
    ['Folate', values.folate_mcg, 'mcg', 'folate_mcg'], ['Vitamin A', values.vitamin_a_mcg, 'mcg', 'vitamin_a_mcg'],
    ['Vitamin C', values.vitamin_c_mg, 'mg', 'vitamin_c_mg'], ['Vitamin D', values.vitamin_d_mcg, 'mcg', 'vitamin_d_mcg'],
    ['Vitamin E', values.vitamin_e_mg, 'mg', 'vitamin_e_mg'], ['Vitamin K', values.vitamin_k_mcg, 'mcg', 'vitamin_k_mcg'],
    ['Vitamin B12', values.vitamin_b12_mcg, 'mcg', 'vitamin_b12_mcg']
  ];
  return items.map(([label, value, unit, key]) => {
    const target = targets[key];
    const pct = target ? Math.round(Number(value || 0) / target * 100) : 0;
    const color = pct >= 80 ? 'var(--green)' : 'var(--orange)';
    return `
    <div style="background:var(--card2);border:1px solid var(--border);border-radius:var(--radius-sm);padding:8px;text-align:center">
      <div style="font-size:11px;color:var(--muted)">${label}</div>
      <div style="font-size:14px;font-weight:700;color:var(--text);margin-top:3px">${Number(value || 0).toFixed(1)}${unit}</div>
      <div style="font-size:10px;color:${color};margin-top:3px">${pct}% of daily reference</div>
    </div>`;
  }).join('');
}

async function estimateDailyMicronutrients() {
  const today = getLocalDateStr();
  const entries = calorieLog[today] || [];
  const button = document.getElementById('micronutrient-btn');
  const status = document.getElementById('micronutrient-status');
  const values = document.getElementById('micronutrient-values');
  if(!entries.length) {
    status.textContent = 'Log at least one food first.';
    status.style.color = 'var(--orange)';
    return;
  }
  if(providerRequiresApiKey(aiConfig.provider) && !getProviderApiKey(aiConfig.provider)) {
    status.textContent = 'Set up an AI provider in Settings first.';
    status.style.color = 'var(--orange)';
    return;
  }
  if(aiConfig.shareHealthData === false) {
    status.textContent = 'Enable health and progress data sharing in AI settings to estimate daily micros.';
    status.style.color = 'var(--orange)';
    return;
  }

  button.disabled = true;
  status.textContent = 'Estimating...';
  status.style.color = 'var(--muted)';
  try {
    const foodSummary = entries.map(entry => `${entry.name} (${entry.grams || '?'}g)`).join('\n');
    const response = await callAI([
      { role:'system', content:'You are a nutrition assistant. Return only valid JSON with numeric daily totals. Estimate these nutrients from the listed foods: fiber_g, sodium_mg, potassium_mg, calcium_mg, iron_mg, magnesium_mg, zinc_mg, phosphorus_mg, folate_mcg, vitamin_a_mcg, vitamin_c_mg, vitamin_d_mcg, vitamin_e_mg, vitamin_k_mcg, vitamin_b12_mcg. Do not include explanations.' },
      { role:'user', content:`Estimate total micronutrients for these foods eaten today:\n${foodSummary}\nReturn JSON with exactly these keys: fiber_g, sodium_mg, potassium_mg, calcium_mg, iron_mg, magnesium_mg, zinc_mg, phosphorus_mg, folate_mcg, vitamin_a_mcg, vitamin_c_mg, vitamin_d_mcg, vitamin_e_mg, vitamin_k_mcg, vitamin_b12_mcg.` }
    ]);
    const jsonMatch = response.match(/```(?:json)?\s*([\s\S]*?)\s*```/) || response.match(/(\{[\s\S]*\})/);
    if(!jsonMatch) throw new Error('AI response did not contain JSON.');
    const parsed = JSON.parse(jsonMatch[1].trim());
    const keys = ['fiber_g','sodium_mg','potassium_mg','calcium_mg','iron_mg','magnesium_mg','zinc_mg','phosphorus_mg','folate_mcg','vitamin_a_mcg','vitamin_c_mg','vitamin_d_mcg','vitamin_e_mg','vitamin_k_mcg','vitamin_b12_mcg'];
    if(keys.some(key => !Number.isFinite(Number(parsed[key])))) throw new Error('Incomplete micronutrient data returned.');
    micronutrientLog[today] = Object.fromEntries(keys.map(key => [key, Number(parsed[key])]));
    save('fitdash_micronutrient_log', micronutrientLog);
    values.innerHTML = renderMicronutrientValues(micronutrientLog[today]);
    status.textContent = 'Estimated from today\'s logged foods. Values are approximate.';
    status.style.color = 'var(--green)';
  } catch(err) {
    status.textContent = `Micronutrient estimate failed: ${err.message.slice(0,120)}`;
    status.style.color = 'var(--red)';
  } finally {
    button.disabled = false;
  }
}

async function analyzeLabelPhoto(input) {
  const file = input.files?.[0];
  const status = document.getElementById('label-photo-status');
  if(!file) return;
  const geminiKey = getProviderApiKey('gemini');
  if(!geminiKey) {
    status.textContent = 'Photo reading uses Gemini. Add a Gemini API key in Settings (your current provider can stay selected).';
    status.style.color = 'var(--orange)';
    return;
  }
  const geminiModel = aiConfig.provider === 'gemini' && aiConfig.model ? aiConfig.model : 'gemini-2.5-flash';
  status.textContent = 'Reading label...';
  status.style.color = 'var(--muted)';
  try {
    const dataUrl = await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result));
      reader.onerror = () => reject(new Error('Could not read the photo.'));
      reader.readAsDataURL(file);
    });
    const comma = dataUrl.indexOf(',');
    const mimeType = dataUrl.slice(5, comma).split(';')[0];
    const base64 = dataUrl.slice(comma + 1);
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(geminiModel)}:generateContent?key=${encodeURIComponent(geminiKey)}`;
    const response = await fetch(url, {
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body:JSON.stringify({
        contents:[{role:'user',parts:[
          {text:'Read this nutrition label. Return only JSON with productName, calories, servingSizeGrams, protein, carbs, fat. Use numbers for all nutrition fields and do not guess if the label is unreadable.'},
          {inlineData:{mimeType,data:base64}}
        ]}],
        generationConfig:{temperature:0, maxOutputTokens:512}
      })
    });
    if(!response.ok) throw new Error(`${response.status}: ${(await response.text()).slice(0,120)}`);
    const result = await response.json();
    const text = result.candidates?.[0]?.content?.parts?.map(part => part.text || '').join('') || '';
    const match = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/) || text.match(/(\{[\s\S]*\})/);
    if(!match) throw new Error('No readable nutrition data found.');
    const parsed = JSON.parse(match[1].trim());
    const fields = { 'label-name':parsed.productName, 'label-cals':parsed.calories, 'label-serving':parsed.servingSizeGrams, 'label-protein':parsed.protein, 'label-carbs':parsed.carbs, 'label-fat':parsed.fat };
    Object.entries(fields).forEach(([id, value]) => { if(value !== undefined && value !== null) document.getElementById(id).value = value; });
    status.textContent = 'Label read. Check the fields before logging.';
    status.style.color = 'var(--green)';
  } catch(err) {
    status.textContent = `Photo reading failed: ${err.message.slice(0,100)}`;
    status.style.color = 'var(--red)';
  } finally {
    input.value = '';
  }
}


// ══ HIGH-VOLUME SATIETY ENGINE ═══════════════════════════════
const HV_FILTERS = {
  region: { label:'📍 Region & Pantry', options:[['all','All'],['bd','🇧🇩 Bangladesh / Deshi'],['sa','🌏 South Asian'],['med','🥗 Mediterranean'],['west','🍳 Western / Global']] },
  budget: { label:'💰 Budget Tier', options:[['all','All'],['budget','💸 Budget / Student-Friendly'],['moderate','⚖️ Moderate'],['premium','💎 Flexible / Premium']] },
  diet:   { label:'🍗 Dietary Preference', options:[['halal','Halal All'],['veg','High-Protein Vegetarian'],['pesc','Eggetarian + Fish (Pescetarian)'],['dairyfree','Dairy-Free']] },
  prep:   { label:'⏱️ Prep Time', options:[['all','Any'],['quick','⚡ Under 10 Mins'],['medium','🍳 15–25 Mins'],['prep','🥘 Meal Prep']] },
};
const HV_BUDGET_RANK = { budget:1, moderate:2, premium:3 };
const HV_BUDGET_HINTS = {
  budget: 'eggs, lentils/dal, seasonal gourds (lau, papaya), soya chunks, muri, oats, tilapia/pangash, tok doi',
  moderate: 'chicken breast, rui/katla, paneer or cottage cheese, chia/flax, peanut butter',
  premium: 'lean beef, salmon/tuna, whey isolate, Greek yogurt, berries',
};
const HV_SLOTS = [['breakfast','🌅 Breakfast'],['lunch','☀️ Lunch'],['dinner','🌙 Dinner'],['snack','🍬 Snacks']];

function regionFromCuisinePref(pref) {
  const p = String(pref || 'both').toLowerCase();
  if(p === 'bangladeshi' || p === 'bd') return 'bd';
  if(p.startsWith('int')) return 'west';
  return 'all';
}

function getNutritionPrefs() {
  const saved = safeLoad('fitdash_nutrition_prefs', null);
  const prefs = { region: regionFromCuisinePref(userGoals.cuisinePref), budget:'all', diet:'halal', prep:'all', ...(saved && typeof saved === 'object' ? saved : {}) };
  Object.keys(HV_FILTERS).forEach(k => {
    if(!HV_FILTERS[k].options.some(([v]) => v === prefs[k])) prefs[k] = HV_FILTERS[k].options[0][0];
  });
  return prefs;
}

function setNutritionPref(group, value) {
  if(!HV_FILTERS[group] || !HV_FILTERS[group].options.some(([v]) => v === value)) return;
  const prefs = { ...getNutritionPrefs(), [group]: value };
  save('fitdash_nutrition_prefs', prefs);
  if(group === 'region') {
    // Keep the quick food picker and AI prompts in step with the chosen pantry.
    userGoals.cuisinePref = value === 'bd' ? 'bangladeshi' : (value === 'med' || value === 'west') ? 'international' : 'both';
    save('fitdash_goals', userGoals);
    if(typeof renderCalorieTracker === 'function') renderCalorieTracker();
  }
  renderHVFilters();
  renderHVRecipes();
}

function recipeMatchesDiet(recipe, diet) {
  const has = recipe.contains || [];
  if(diet === 'veg') return !has.some(x => x === 'meat' || x === 'fish' || x === 'egg');
  if(diet === 'pesc') return !has.includes('meat');
  if(diet === 'dairyfree') return !has.includes('dairy');
  return true;
}

function filterHVRecipes(prefs) {
  return HV_RECIPES.filter(r =>
    (prefs.region === 'all' || r.region.includes(prefs.region)) &&
    (prefs.budget === 'all' || HV_BUDGET_RANK[r.budget] <= HV_BUDGET_RANK[prefs.budget]) &&
    recipeMatchesDiet(r, prefs.diet) &&
    (prefs.prep === 'all' || r.prep === prefs.prep));
}

function hvCostLabel(costBdt, costUsd, region) {
  const useBdt = region === 'bd' || region === 'sa' || region === 'all';
  if(useBdt && Number.isFinite(Number(costBdt))) return `≈ ৳${Math.round(costBdt)}`;
  if(Number.isFinite(Number(costUsd))) return `≈ $${Number(costUsd).toFixed(costUsd < 10 ? 1 : 0)}`;
  return '';
}

function renderHVFilters() {
  const el = document.getElementById('hv-filters');
  if(!el) return;
  const prefs = getNutritionPrefs();
  el.innerHTML = Object.entries(HV_FILTERS).map(([group, f]) => `
    <div class="hv-filter-group">
      <div class="hv-filter-label">${f.label}</div>
      <div class="hv-chip-row" role="radiogroup" aria-label="${escapeHtml(f.label)}">
        ${f.options.map(([v, label]) => `<button class="chip-btn${prefs[group] === v ? ' active' : ''}" role="radio" aria-checked="${prefs[group] === v}" onclick="setNutritionPref('${group}','${v}')">${escapeHtml(label)}</button>`).join('')}
      </div>
    </div>`).join('') +
    (prefs.budget !== 'all' ? `<div class="hv-filter-hint">🛒 ${escapeHtml(prefs.budget === 'budget' ? HV_BUDGET_HINTS.budget : prefs.budget === 'moderate' ? HV_BUDGET_HINTS.budget + ' + ' + HV_BUDGET_HINTS.moderate : 'Everything, incl. ' + HV_BUDGET_HINTS.premium)}</div>` : '') +
    (prefs.diet === 'halal' ? '<div class="hv-filter-hint">✅ Every FitDash recipe is pork- and alcohol-free.</div>' : '');
}

function hvRecipeCardHtml(r, region) {
  const cost = hvCostLabel(r.costBdt, r.costUsd, region);
  const prepLabel = (HV_FILTERS.prep.options.find(([v]) => v === r.prep) || [,''])[1];
  return `
    <div class="meal-card hv-card" id="hv-${r.id}">
      <div class="meal-card-header" onclick="toggleMeal('hv-${r.id}')">
        <div class="meal-icon">${r.emoji}</div>
        <div class="meal-name">${escapeHtml(r.name)}<div class="hv-card-sub">P ${r.protein}g · ${escapeHtml(prepLabel)}${cost ? ' · ' + cost : ''}</div></div>
        <div class="meal-cals">${r.kcal} cal</div>
        <div class="meal-chevron">▼</div>
      </div>
      <div class="meal-card-body">
        <div class="hv-macros"><span class="cal-macro-pill p">P ${r.protein}g</span><span class="cal-macro-pill c">C ${r.carbs}g</span><span class="cal-macro-pill f">F ${r.fat}g</span></div>
        <div class="hv-section-title">Ingredients</div>
        <ul class="hv-ingredients">${r.ingredients.map(([item, g]) => `<li><span>${escapeHtml(item)}</span><strong>${g} g</strong></li>`).join('')}</ul>
        <div class="hv-section-title">Steps</div>
        <ol class="hv-steps">${r.steps.map(s => `<li>${escapeHtml(s)}</li>`).join('')}</ol>
        <div class="hv-swap">🔁 <strong>Volume Swap:</strong> ${escapeHtml(r.swap)}</div>
        <div class="hv-log-row">
          <select class="settings-select hv-portion" id="hv-portion-${r.id}" aria-label="Portion size">
            <option value="0.75">¾ portion</option><option value="1" selected>1 portion</option><option value="1.25">1¼ portions</option><option value="1.5">1½ portions</option><option value="2">2 portions</option>
          </select>
          <button class="btn-red" onclick="logHVRecipe('${r.id}', this)">➕ Log to Today's Calories</button>
        </div>
      </div>
    </div>`;
}

function renderHVRecipes() {
  const el = document.getElementById('hv-recipes');
  if(!el) return;
  const prefs = getNutritionPrefs();
  const list = filterHVRecipes(prefs);
  el.innerHTML = HV_SLOTS.map(([slot, title]) => {
    const items = list.filter(r => r.slot === slot);
    const range = items.length ? `${items.length} recipe${items.length > 1 ? 's' : ''} · ${Math.min(...items.map(r => r.kcal))}–${Math.max(...items.map(r => r.kcal))} cal` : 'No match';
    return `<div class="meal-section">
      <div class="meal-header"><div class="meal-title">${title}</div><div class="meal-kcal">${range}</div></div>
      ${items.length ? items.map(r => hvRecipeCardHtml(r, prefs.region)).join('') : '<div class="hv-empty">No recipe matches these filters. Loosen one filter or tap “🤖 Generate Custom High-Volume Meal with AI”.</div>'}
    </div>`;
  }).join('');
  if(typeof renderPlanPreview === 'function') renderPlanPreview();
}

function logHVRecipe(id, btn) {
  const r = HV_RECIPES.find(x => x.id === id);
  if(!r) return;
  const factor = Number(document.getElementById(`hv-portion-${id}`)?.value) || 1;
  const grams = r.ingredients.reduce((s, [, g]) => s + g, 0) * factor;
  const country = r.region.includes('bd') ? 'BD' : 'INT';
  addFoodEntry(factor === 1 ? r.name : `${r.name} (×${factor})`, grams, r.kcal * factor, r.protein * factor, r.carbs * factor, r.fat * factor, 'recipe', country);
  if(btn) { btn.textContent = `✓ Logged ${Math.round(r.kcal * factor)} cal`; setTimeout(() => { btn.textContent = "➕ Log to Today's Calories"; }, 2500); }
}

function hvRemainingToday() {
  const entries = calorieLog[getLocalDateStr()] || [];
  const eaten = entries.reduce((s, e) => s + (e.calories || 0), 0);
  const protein = entries.reduce((s, e) => s + (e.protein || 0), 0);
  const latestWeight = weights.length ? weights.reduce((l, e) => (!l || e.date > l.date) ? e : l, null) : null;
  const proteinTarget = userGoals.proteinTarget || (latestWeight ? Math.round(latestWeight.val * 1.6) : 120);
  return { kcal: Math.max(0, getTodayCalorieTarget() - eaten), protein: Math.max(0, proteinTarget - protein) };
}

function normalizeAIRecipe(raw) {
  if(!raw || typeof raw !== 'object') return null;
  const r = raw.recipe && typeof raw.recipe === 'object' ? raw.recipe : raw;
  const num = v => { const n = Number(String(v ?? '').replace(/[^0-9.]/g, '')); return Number.isFinite(n) ? n : 0; };
  const ingredients = (Array.isArray(r.ingredients) ? r.ingredients : []).map(i => {
    if(typeof i === 'string') return [i, 0];
    return [String(i.item || i.name || 'Ingredient'), num(i.grams ?? i.g ?? i.weight)];
  }).filter(([item]) => item);
  const steps = (Array.isArray(r.steps) ? r.steps : []).map(String).filter(Boolean);
  if(!r.name || !ingredients.length) return null;
  return {
    name: String(r.name).slice(0, 80), emoji: r.emoji ? String(r.emoji).slice(0, 4) : '🤖',
    kcal: Math.round(num(r.kcal ?? r.calories)), protein: Math.round(num(r.protein)), carbs: Math.round(num(r.carbs)), fat: Math.round(num(r.fat)),
    cost: String(r.costEstimate || r.cost || '').slice(0, 40), ingredients, steps, swap: String(r.volumeSwap || r.swap || '').slice(0, 240),
  };
}

let hvLastAIRecipe = null;

function renderHVAIRecipe(recipe) {
  const el = document.getElementById('hv-ai-result');
  if(!el) return;
  hvLastAIRecipe = recipe;
  el.innerHTML = `<div class="hv-ai-card">
    <div class="hv-ai-head"><span style="font-size:22px">${escapeHtml(recipe.emoji)}</span><div style="flex:1;min-width:0"><strong>${escapeHtml(recipe.name)}</strong>
      <div class="hv-card-sub">${recipe.kcal} cal · P ${recipe.protein}g · C ${recipe.carbs}g · F ${recipe.fat}g${recipe.cost ? ' · ' + escapeHtml(recipe.cost) : ''}</div></div><span class="tag tag-blue">AI</span></div>
    <div class="hv-section-title">Ingredients</div>
    <ul class="hv-ingredients">${recipe.ingredients.map(([item, g]) => `<li><span>${escapeHtml(item)}</span><strong>${g ? g + ' g' : ''}</strong></li>`).join('')}</ul>
    ${recipe.steps.length ? `<div class="hv-section-title">Steps</div><ol class="hv-steps">${recipe.steps.map(s => `<li>${escapeHtml(s)}</li>`).join('')}</ol>` : ''}
    ${recipe.swap ? `<div class="hv-swap">🔁 <strong>Volume Swap:</strong> ${escapeHtml(recipe.swap)}</div>` : ''}
    <div class="hv-log-row">
      <button class="btn-red" onclick="logAIRecipe(hvLastAIRecipe, this)">➕ Log to Today's Calories</button>
      <button class="btn-ghost" onclick="saveAIRecipeAsDish(hvLastAIRecipe, this)">💾 Save dish</button>
    </div>
  </div>`;
}

function logAIRecipe(recipe, btn) {
  if(!recipe) return;
  const grams = recipe.ingredients.reduce((s, [, g]) => s + (Number(g) || 0), 0);
  addFoodEntry(recipe.name, grams, recipe.kcal, recipe.protein, recipe.carbs, recipe.fat, 'ai', regionFromCuisinePref(userGoals.cuisinePref) === 'bd' ? 'BD' : 'INT');
  if(btn) { btn.textContent = '✓ Logged!'; btn.disabled = true; }
}

function saveAIRecipeAsDish(recipe, btn) {
  if(!recipe) return;
  customDishes.unshift({ name: recipe.name, servings: 1, ingredients: recipe.ingredients.map(([item, g]) => g ? `${g}g ${item}` : item), steps: recipe.steps, calories: recipe.kcal, protein: recipe.protein, carbs: recipe.carbs, fat: recipe.fat });
  customDishes = customDishes.slice(0, 20);
  save('fitdash_custom_dishes', customDishes);
  renderSavedCustomDishes();
  if(btn) { btn.textContent = '✓ Saved to Custom Dishes'; btn.disabled = true; }
}

function setHVStatus(text, color) {
  const el = document.getElementById('hv-ai-status');
  if(el) { el.textContent = text; el.style.color = color || 'var(--muted)'; }
}

async function generateHVMealAI() {
  if(providerRequiresApiKey(aiConfig.provider) && !getProviderApiKey(aiConfig.provider)) { setHVStatus('⚠️ ' + missingApiKeyMessage(), 'var(--orange)'); return; }
  if(aiOfflineBlocked()) { setHVStatus(AI_OFFLINE_MESSAGE, 'var(--orange)'); return; }
  const prefs = getNutritionPrefs();
  const label = (group) => (HV_FILTERS[group].options.find(([v]) => v === prefs[group]) || [,''])[1].replace(/^[^A-Za-z]+/, '');
  const left = hvRemainingToday();
  const share = aiConfig.shareHealthData !== false;
  const target = share ? `Remaining today: about ${left.kcal} kcal and ${left.protein} g protein. Fit one meal into that (roughly 30–45% of the remaining calories, at least 30 g protein if possible).` : 'Aim for a 450–550 kcal meal with at least 30 g protein.';
  const btn = document.getElementById('hv-ai-btn');
  if(btn) btn.disabled = true;
  setHVStatus('🤖 Building a high-volume meal for your pantry...');
  try {
    const response = await callAI([
      { role:'system', content:'You are FitDash\'s nutrition coach. Follow the FitDash High-Volume Satiety Principle: lean protein plus a large volume of low-calorie vegetables, measured starch, minimal oil. Use locally available, affordable ingredients for the chosen region and budget. All food must be halal. Reply with one short sentence, then exactly |||FITDASH_PLAN|||{JSON}|||END_PLAN||| where JSON = {"kind":"recipe","name":string,"emoji":string,"kcal":number,"protein":number,"carbs":number,"fat":number,"costEstimate":string (local currency),"ingredients":[{"item":string,"grams":number}],"steps":[string],"volumeSwap":string}.' },
      { role:'user', content:`Region & pantry: ${label('region')}. Budget: ${label('budget')}${prefs.budget !== 'all' ? ` (${HV_BUDGET_HINTS[prefs.budget]})` : ''}. Diet: ${label('diet')}. Prep time: ${label('prep')}. ${target} Give ingredient weights in grams, a cost estimate, 3–5 numbered steps and one practical volume swap.` },
    ]);
    const recipe = normalizeAIRecipe(extractFitdashPlanJSON(response));
    if(!recipe) throw new Error('The AI reply did not include a recipe. Try again.');
    renderHVAIRecipe(recipe);
    setHVStatus('✅ Recipe ready. Review it, then log it in one tap.', 'var(--green)');
  } catch(err) {
    setHVStatus(typeof friendlyAIError === 'function' ? friendlyAIError(err) : `Meal generation failed: ${err.message}`, 'var(--red)');
  } finally {
    if(btn) btn.disabled = false;
  }
}
