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
      <div style="display:grid;grid-template-columns:1fr 100px 100px;gap:10px;margin-bottom:12px">
        <select id="ingredient-select" class="settings-select" style="width:100%">${COMMON_INGREDIENTS.map(i => `<option value="${escapeHtml(i.name)}">${escapeHtml(i.name)} — ${i.kcal} kcal/100g</option>`).join('')}</select>
        <input id="ingredient-grams" type="number" min="1" value="100" placeholder="g" style="width:100px;background:var(--card2);border:1px solid var(--border);border-radius:var(--radius-sm);padding:10px;color:var(--text);outline:none">
        <button class="btn-red" onclick="addIngredientToDish()" style="width:100px">Add</button>
      </div>
      <div style="display:grid;grid-template-columns:1fr 100px 100px 100px 100px;gap:10px;margin-bottom:12px">
        <input id="custom-ingredient-name" class="settings-input" placeholder="Custom ingredient name" style="width:100%">
        <input id="custom-ingredient-kcal" class="settings-input" type="number" placeholder="kcal/100g">
        <input id="custom-ingredient-protein" class="settings-input" type="number" placeholder="protein/100g">
        <input id="custom-ingredient-carbs" class="settings-input" type="number" placeholder="carbs/100g">
        <input id="custom-ingredient-fat" class="settings-input" type="number" placeholder="fat/100g">
      </div>
      <div style="display:grid;grid-template-columns:1fr 120px 120px 120px 120px;gap:10px;margin-bottom:12px">
        <input id="dish-name" class="settings-input" placeholder="Dish name" value="${escapeHtml(ingredientBuilder.name)}" style="flex:1">
        <button class="btn-ghost" onclick="saveCurrentRecipe()" style="width:120px">Save recipe</button>
        <button class="btn-ghost" onclick="lookupIngredientMacros(this)" style="width:120px">AI macros</button>
        <button class="btn-red" onclick="addIngredientToDish()" style="width:120px">Add ingredient</button>
        <button class="btn-ghost" onclick="createIngredientDish()" style="width:120px">Log dish</button>
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
  if(providerRequiresApiKey(aiConfig.provider) && !aiConfig.apiKey) {
    alert('Set your AI API key in Settings first.');
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
  const name = document.getElementById('food-name-input').value.trim();
  const gramsInput = parseFloat(document.getElementById('food-grams-input').value);
  const gramsText = parseGramsFromText(name);
  const grams = Number.isFinite(gramsInput) && gramsInput > 0 ? gramsInput : gramsText;
  if(!name) { alert('Enter a food name.'); return; }
  if(!grams || grams <= 0) { alert('Enter valid grams.'); return; }
  if(providerRequiresApiKey(aiConfig.provider) && !aiConfig.apiKey) {
    alert('Set your AI API key in Settings first to estimate calories from grams.');
    return;
  }

  const country = document.getElementById('label-country')?.value || 'INT';

  try {
    const macros = await estimateFoodMacros(name, grams, country);
    addFoodEntry(name, grams, macros.calories, macros.protein, macros.carbs, macros.fat, 'ai', country);
    document.getElementById('food-name-input').value = '';
    document.getElementById('food-grams-input').value = '';
  } catch(err) {
    alert('Auto count failed: ' + err.message + ' Use Ask AI to count instead.');
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

  const messages = [
    { role: 'system', content: 'You are a nutrition assistant. Provide only JSON with calories, protein, carbs, and fat for the described food and weight. Do not add any extra explanation.' },
    { role: 'user', content: `Food: ${name}\nWeight: ${grams} g\n${countryHint} ${preferenceHint}\nReturn only JSON like {"calories": number, "protein": number, "carbs": number, "fat": number}.` }
  ];

  const response = await callAI(messages);
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

  if(!Number.isFinite(calories) || !Number.isFinite(protein) || !Number.isFinite(carbs) || !Number.isFinite(fat)) {
    throw new Error('Incomplete nutrition data from AI.');
  }
  if(grams > 0 && calories <= 0) {
    throw new Error('AI returned zero calories for a food item.');
  }

  return {
    calories,
    protein,
    carbs,
    fat,
  };
}

function askAIToCount() {
  const desc = document.getElementById('food-name-input').value.trim();
  const gramsInput = parseInt(document.getElementById('food-grams-input').value);
  const gramsText = parseGramsFromText(desc);
  const grams = gramsInput || gramsText;
  if(!desc) { alert('Describe what you ate first.'); return; }
  if(!grams || grams <= 0) { alert('Enter the ingredient weight in grams, either in the grams field or inside the description.'); return; }
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
    input.value = `Count the calories and macros for: ${desc} ${grams} g. Include a per-item breakdown table and total. ${countryHint} ${preferenceHint} ${recentHint}`;
    sendChatMessage();
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
            ${e.grams ? `<span class="cal-log-amount">${e.grams}g</span>` : ''}
            <span style="font-size:10px;color:var(--muted)">${e.time||''}</span>
          </div>
        </div>
        <div class="cal-macro-pills">
          ${e.protein?`<span class="cal-macro-pill p">${e.protein}p</span>`:''}
          ${e.carbs?`<span class="cal-macro-pill c">${e.carbs}c</span>`:''}
          ${e.fat?`<span class="cal-macro-pill f">${e.fat}f</span>`:''}
        </div>
        <span class="cal-log-cals">${e.calories}</span>
        <button onclick="deleteFoodEntry(${i})" class="del-btn del-btn-sm">×</button>
      </div>`).join('');
  } else {
    html += '<div style="text-align:center;padding:16px;color:var(--muted);font-size:13px">No food logged today. Use the inputs above or ask the AI Coach!<div style="margin-top:10px;display:flex;gap:8px;justify-content:center"><button class="btn-red" onclick="showPage(\'nutrition\')">Add Quick Food</button><button class="btn-ghost" onclick="toggleChat()">Ask AI Coach</button></div></div>';
  }

  el.innerHTML = html;
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
  if(providerRequiresApiKey(aiConfig.provider) && !aiConfig.apiKey) {
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
  if(aiConfig.provider !== 'gemini') {
    status.textContent = 'Photo reading currently requires Gemini. Use manual entry with other providers.';
    status.style.color = 'var(--orange)';
    return;
  }
  if(!aiConfig.apiKey) {
    status.textContent = 'Set a Gemini API key in Settings first.';
    status.style.color = 'var(--orange)';
    return;
  }
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
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(aiConfig.model)}:generateContent?key=${encodeURIComponent(aiConfig.apiKey)}`;
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

