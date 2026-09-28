// â•â• INIT â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
renderMeals(MEALS_1500,   '1500');
renderMeals(MEALS_2000,   '2000');
renderMeals(MEALS_2500,   '2500');
renderMeals(MEALS_BD1500, 'bd1500');
renderMeals(MEALS_BD2000, 'bd2000');
renderMeals(MEALS_BD2500, 'bd2500');
if (!userProfile || !userProfile.height || !userProfile.weight) {
  document.getElementById('onboarding-modal').style.display = 'flex';
} else {
  renderDashboard();
}

function finishOnboarding() {
  const h = parseFloat(document.getElementById('ob-height').value);
  const w = parseFloat(document.getElementById('ob-weight').value);
  const a = parseInt(document.getElementById('ob-age').value);
  const g = document.getElementById('ob-gender').value;
  
  if(!h || !w || !a) {
    alert("Please fill out all fields with valid numbers.");
    return;
  }
  
  userProfile = { height: h, weight: w, age: a, gender: g, activity: 'moderate' };
  save('fitdash_profile', userProfile);
  const today = getLocalDateStr();
  weights = weights.filter(entry => entry.date !== today);
  weights.push({ date: today, val: w });
  save('fitdash_weights', weights);
  document.getElementById('onboarding-modal').style.display = 'none';
  renderDashboard();
  showPage('dashboard');
}

if('serviceWorker' in navigator && location.protocol !== 'file:') {
  navigator.serviceWorker.register('./service-worker.js').catch(() => {});
}


// Initialize Phase 1 components after state variables are defined
renderCalorieTracker();
renderIngredientBuilder();
renderSavedCustomDishes();
renderBodyComp();
renderAIPlan();
renderCircHistory();
