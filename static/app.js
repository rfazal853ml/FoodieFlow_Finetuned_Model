const MEAL_COLORS = {
  breakfast: { dot: '#EF9F27', label: '#BA7517' },
  lunch:     { dot: '#1D9E75', label: '#0F6E56' },
  dinner:    { dot: '#378ADD', label: '#185FA5' },
  snack:     { dot: '#D4537E', label: '#993556' },
};

let currentPlan = null;
let activeDay   = 0;

// ── Form submit ────────────────────────────────────────────
document.getElementById('planForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  await generatePlan();
});

async function generatePlan() {
  const form    = document.getElementById('planForm');
  const btn     = document.getElementById('genBtn');
  const errBar  = document.getElementById('errorBar');
  const results = document.getElementById('resultsArea');

  errBar.style.display = 'none';
  btn.disabled     = true;
  btn.textContent  = 'Generating…';

  const days    = document.getElementById('days').value;
  const country = document.getElementById('country').value.trim() || 'Pakistan';

  results.innerHTML = `
    <div class="loading">
      <div class="dots">
        <div class="dot"></div>
        <div class="dot"></div>
        <div class="dot"></div>
      </div>
      <p>Crafting your ${days}-day ${country} plan…</p>
    </div>`;

  const data = new FormData(form);

  try {
    const res = await fetch('/generate', { method: 'POST', body: data });
    const json = await res.json();

    if (!res.ok || json.error) {
      throw new Error(json.error || 'Server error');
    }

    currentPlan = json.meal_plan;
    activeDay   = 0;
    renderResults();

  } catch (err) {
    errBar.textContent  = err.message || 'Something went wrong. Please try again.';
    errBar.style.display = 'block';
    results.innerHTML   = '';
  }

  btn.disabled    = false;
  btn.textContent = 'Generate meal plan';
}

// ── Render results ─────────────────────────────────────────
function renderResults() {
  if (!currentPlan?.length) return;

  const day      = currentPlan[activeDay];
  const mealKeys = ['breakfast', 'lunch', 'dinner', 'snack'];

  const totalCal = mealKeys.reduce((s, m) => s + (day[m]?.calories_kcal || 0), 0);
  const totalPro = mealKeys.reduce((s, m) => s + (day[m]?.protein_g || 0), 0);
  const prepMax  = Math.max(...mealKeys.map(m => day[m]?.prep_time_min || 0));

  // Tabs
  const tabsHtml = currentPlan.map((d, i) => `
    <button class="day-tab ${i === activeDay ? 'active' : ''}"
            onclick="switchDay(${i})">Day ${d.day}</button>
  `).join('');

  // Summary chips
  const summaryHtml = `
    <div class="summary-chip">
      <div class="val">${Math.round(totalCal)}</div>
      <div class="lbl">kcal total</div>
    </div>
    <div class="summary-chip">
      <div class="val">${Math.round(totalPro)}g</div>
      <div class="lbl">protein</div>
    </div>
    <div class="summary-chip">
      <div class="val">${prepMax} min</div>
      <div class="lbl">max prep</div>
    </div>
    <div class="summary-chip">
      <div class="val">4</div>
      <div class="lbl">meals</div>
    </div>`;

  // Meal cards
  const cardsHtml = mealKeys.map(type => {
    const m = day[type];
    if (!m) return '';
    const c    = MEAL_COLORS[type];
    const diff = m.difficulty?.toLowerCase() || 'easy';

    return `
      <div class="meal-card">
        <div class="meal-type" style="color:${c.label}">
          <span class="meal-dot" style="background:${c.dot}"></span>
          ${type}
        </div>
        <div class="meal-name">${m.name}</div>
        <div class="meal-meta">
          <span class="meta-pill">${m.calories_kcal} kcal</span>
          <span class="meta-pill">${m.protein_g}g protein</span>
          <span class="meta-pill">${m.prep_time_min} min</span>
          <span class="meta-pill diff-${diff}">${diff}</span>
        </div>
      </div>`;
  }).join('');

  document.getElementById('resultsArea').innerHTML = `
    <div class="results-header">
      <p class="section-label" style="margin:0">Your plan</p>
      <div class="day-tabs">${tabsHtml}</div>
    </div>
    <div class="day-summary">${summaryHtml}</div>
    <div class="card" style="padding:1rem">
      <div class="meals-grid">${cardsHtml}</div>
    </div>`;
}

function switchDay(i) {
  activeDay = i;
  renderResults();
}