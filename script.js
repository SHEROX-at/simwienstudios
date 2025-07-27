let userData = JSON.parse(localStorage.getItem('wartungsDaten')) || {};
let currentStep = 0;
let serviceIndex = 0;

const steps = [
  {html: `<h1>Willkommen!</h1><p>Wie heißt du?</p><input id='username' type='text' placeholder='Dein Name'><button onclick='next()'>Weiter</button>`,
   action: () => userData.name = document.getElementById('username').value || 'Gast'},
  {html: () => `<h2>Hallo ${userData.name}!</h2><p>Füge dein Auto hinzu.</p><input id='carName' type='text' value='${userData.car||''}' placeholder='z.B. VW Golf'><button onclick='next()'>Weiter</button>`,
   action: () => userData.car = document.getElementById('carName').value || 'Unbekanntes Auto'},
  {html: () => `<h2>${userData.car}</h2><p>${userData.name}, wie viele Kilometer hat dein Auto?</p><input id='km' type='number' value='${userData.km||''}'><button onclick='next()'>Weiter</button>`,
   action: () => userData.km = parseInt(document.getElementById('km').value)||0}
];

const services = [
  {key:'oil', label:'Motoröl', interval:15000},
  {key:'fuel', label:'Kraftstofffilter', interval:30000},
  {key:'brake', label:'Bremsflüssigkeit', date:true, interval:'2 Jahre'},
  {key:'air', label:'Luftfilter', interval:20000},
  {key:'steering', label:'Servolenkungsöl', interval:50000},
  {key:'belt', label:'Zahnriemen', intervalSelect:[90000,120000,150000]}
];

function renderStep() {
  const c = document.getElementById('stepContainer');
  if (currentStep < steps.length) {
    c.innerHTML = typeof steps[currentStep].html === 'function' ? steps[currentStep].html() : steps[currentStep].html;
  } else {
    askService();
  }
}

function next() {
  steps[currentStep].action();
  currentStep++;
  renderStep();
}

function askService() {
  const c = document.getElementById('stepContainer');
  if (serviceIndex >= services.length) {
    return showSummary();
  }
  const s = services[serviceIndex];
  if (s.date) {
    c.innerHTML = `<h2>${s.label}</h2><p>${userData.name}, wann wurde das zuletzt gewechselt?</p><input type='date' id='val' value='${userData[s.key]||''}'><button onclick='saveService()'>Weiter</button>`;
  } else if (s.intervalSelect) {
    const intervalOptions = s.intervalSelect.map(i => `<option value='${i}' ${userData.beltInterval===i?'selected':''}>${i} km</option>`).join('');
    c.innerHTML = `<h2>${s.label}</h2><p>${userData.name}, bei wie viel km war der letzte Wechsel?</p><input type='number' id='val' value='${userData[s.key]||''}'><p>Intervall:</p><select id='int'>${intervalOptions}</select><button onclick='saveService(true)'>Weiter</button>`;
  } else {
    c.innerHTML = `<h2>${s.label}</h2><p>${userData.name}, bei wie viel km war der letzte Wechsel?</p><input type='number' id='val' value='${userData[s.key]||''}'><button onclick='saveService()'>Weiter</button>`;
  }
}

function saveService(hasInterval) {
  const s = services[serviceIndex];
  if (s.date) {
    userData[s.key] = document.getElementById('val').value;
  } else {
    userData[s.key] = parseInt(document.getElementById('val').value) || 0;
  }
  if (hasInterval) {
    userData['beltInterval'] = parseInt(document.getElementById('int').value);
  }
  serviceIndex++;
  askService();
}

function showSummary() {
  localStorage.setItem('wartungsDaten', JSON.stringify(userData));
  const km = userData.km;
  const nextBrake = new Date(userData.brake); nextBrake.setFullYear(nextBrake.getFullYear() + 2);
  document.getElementById('stepContainer').innerHTML = `<h2>Übersicht</h2>
    <p>Ölwechsel in ${15000 - (km - (userData.oil||0))} km</p>
    <p>Kraftstofffilter in ${30000 - (km - (userData.fuel||0))} km</p>
    <p>Bremsflüssigkeit am ${nextBrake.toLocaleDateString()}</p>
    <p>Luftfilter in ${20000 - (km - (userData.air||0))} km</p>
    <p>Servolenkungsöl in ${50000 - (km - (userData.steering||0))} km</p>
    <p>Zahnriemen in ${userData.beltInterval - (km - (userData.belt||0))} km</p>`;
}

renderStep();
