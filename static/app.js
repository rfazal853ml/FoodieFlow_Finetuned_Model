const MEAL_COLORS = {
  breakfast: { accent: '#EF9F27', label: '#BA7517' },
  lunch:     { accent: '#1D9E75', label: '#0F6E56' },
  dinner:    { accent: '#378ADD', label: '#185FA5' },
  snack:     { accent: '#D4537E', label: '#993556' },
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
  btn.textContent = 'Generating…';

  area.innerHTML = `
    <div class="loading-wrap">
      <div class="dots"><div class="dot"></div><div class="dot"></div><div class="dot"></div></div>
      <p>Crafting your ${days}-day Meal plan…</p>
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
    errBar.textContent  = err.message || 'Something went wrong — please try again.';
    errBar.style.display = 'block';
    area.innerHTML = '';
  }

  btn.disabled    = false;
  btn.textContent = 'Generate my meal plan';
}

function render() {
  if (!plan?.length) return;
  const meals = ['breakfast', 'lunch', 'dinner', 'snack'];
  const day   = plan[dayIdx];

  const totalCal = meals.reduce((s, m) => s + (day[m]?.calories_kcal || 0), 0);
  const totalPro = meals.reduce((s, m) => s + (day[m]?.protein_g    || 0), 0);
  const maxPrep  = Math.max(...meals.map(m => day[m]?.prep_time_min  || 0));

  const tabs = plan.map((d, i) =>
    `<button class="day-tab ${i === dayIdx ? 'active' : ''}" onclick="switchDay(${i})">Day ${d.day}</button>`
  ).join('');

  const chips = `
    <div class="schip"><div class="schip-val">${Math.round(totalCal)}</div><div class="schip-lbl">kcal today</div></div>
    <div class="schip"><div class="schip-val">${Math.round(totalPro)}g</div><div class="schip-lbl">protein</div></div>
    <div class="schip"><div class="schip-val">4</div><div class="schip-lbl">meals</div></div>`;

  const cards = meals.map(type => {
    const m = day[type]; if (!m) return '';
    const c    = MEAL_COLORS[type];
    const diff = (m.difficulty || 'easy').toLowerCase();
    return `
      <div class="meal-card">
        <div class="meal-accent" style="background:${c.accent}"></div>
        <div class="meal-type" style="color:${c.label}">${type}</div>
        <div class="meal-name">${m.name}</div>
        <div class="meal-pills">
          <span class="mpill">${m.calories_kcal} kcal</span>
          <span class="mpill">${m.protein_g}g protein</span>
          <span class="mpill">${m.prep_time_min} min</span>
          <span class="mpill ${diff}">${diff}</span>
        </div>
      </div>`;
  }).join('');

  document.getElementById('resultsArea').innerHTML = `
    <div class="results-header">
      <p class="section-label" style="margin:0">Day plan</p>
      <div class="day-tabs">${tabs}</div>
    </div>
    <div class="summary-row">${chips}</div>
    <div class="meals-grid">${cards}</div>`;
}

function switchDay(i) { dayIdx = i; render(); }