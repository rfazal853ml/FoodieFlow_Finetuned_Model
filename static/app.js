const MEAL_ICONS = {
  breakfast: '🍳',
  lunch:     '🥗',
  dinner:    '🍽️',
  snack:     '🍎',
};

let plan    = null;
let dayIdx  = 0;

document.getElementById('planForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  await generate();
});

async function generate() {
  const btn    = document.getElementById('genBtn');
  const errBar = document.getElementById('errorBar');
  const area   = document.getElementById('resultsArea');
  const days   = document.getElementById('days').value;
  const country= document.getElementById('country').value.trim() || 'Pakistan';

  errBar.style.display = 'none';
  btn.disabled = true;
  btn.querySelector('.btn-inner').innerHTML = `
    <div class="dots"><div class="dot"></div><div class="dot"></div><div class="dot"></div></div>
    Crafting your plan…`;

  area.innerHTML = `
    <div class="loading-wrap">
      <div class="loading-icon">🍳</div>
      <div class="dots"><div class="dot"></div><div class="dot"></div><div class="dot"></div></div>
      <p>Crafting your ${days}-day meal plan for <strong>${country}</strong> cuisine…</p>
    </div>`;

  const formData = new FormData(document.getElementById('planForm'));

  try {
    const res  = await fetch('/generate', { method: 'POST', body: formData });
    const json = await res.json();
    if (!res.ok || json.error) throw new Error(json.error || 'Server error');
    plan   = json.meal_plan;
    dayIdx = 0;
    render();
  } catch (err) {
    errBar.textContent  = '⚠ ' + (err.message || 'Something went wrong — please try again.');
    errBar.style.display = 'block';
    area.innerHTML = '';
  }

  btn.disabled = false;
  btn.querySelector('.btn-inner').innerHTML = `
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round">
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
    </svg>
    Generate My Meal Plan`;
}

function render() {
  if (!plan?.length) return;
  const meals = ['breakfast', 'lunch', 'dinner', 'snack'];
  const day   = plan[dayIdx];

  const totalCal = meals.reduce((s, m) => s + (day[m]?.calories_kcal || 0), 0);
  const totalPro = meals.reduce((s, m) => s + (day[m]?.protein_g    || 0), 0);

  const tabs = plan.map((d, i) =>
    `<button class="day-tab ${i === dayIdx ? 'active' : ''}" onclick="switchDay(${i})">Day ${d.day}</button>`
  ).join('');

  const chips = `
    <div class="schip">
      <div class="schip-val">${Math.round(totalCal)}</div>
      <div class="schip-lbl">kcal today</div>
    </div>
    <div class="schip">
      <div class="schip-val">${Math.round(totalPro)}g</div>
      <div class="schip-lbl">protein</div>
    </div>
    <div class="schip">
      <div class="schip-val">4</div>
      <div class="schip-lbl">meals</div>
    </div>`;

  const cards = meals.map(type => {
    const m = day[type]; if (!m) return '';
    const diff = (m.difficulty || 'easy').toLowerCase();
    const icon = MEAL_ICONS[type];
    return `
      <div class="meal-card" style="animation: cardIn 0.4s ease both;">
        <div class="meal-card-header ${type}">
          <div class="meal-type-badge">${icon}</div>
          <div class="meal-type-label">${type}</div>
        </div>
        <div class="meal-card-body">
          <div class="meal-name">${m.name}</div>
          <div class="macro-bar">
            <span class="mpill mpill-cal">🔥 ${m.calories_kcal} kcal</span>
            <span class="mpill mpill-prot">💪 ${m.protein_g}g</span>
            <span class="mpill mpill-time">⏱ ${m.prep_time_min} min</span>
            <span class="mpill ${diff}">${diff}</span>
          </div>
          <div class="diff-strip ${diff}"></div>
        </div>
      </div>`;
  }).join('');

  document.getElementById('resultsArea').innerHTML = `
    <div class="results-header">
      <div>
        <div class="results-label">Day plan</div>
        <div class="day-tabs">${tabs}</div>
      </div>
    </div>
    <div class="summary-row">${chips}</div>
    <div class="meals-grid">${cards}</div>`;
}

// Card entrance animation
const style = document.createElement('style');
style.textContent = `
  @keyframes cardIn {
    from { opacity: 0; transform: translateY(16px); }
    to   { opacity: 1; transform: translateY(0); }
  }
`;
document.head.appendChild(style);

function switchDay(i) { dayIdx = i; render(); }