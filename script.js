let userData = JSON.parse(localStorage.getItem('wartungsDaten')) || {};
let history = JSON.parse(localStorage.getItem('wartungsHistory')) || [];
let currentStep=0, serviceIndex=0;

const steps=[
 {html:`<h1>Willkommen!</h1><p>Wie heißt du?</p><input id='username' type='text' placeholder='Dein Name'><button class='primary' onclick='next()'>Weiter</button>`,
  action:()=>userData.name=document.getElementById('username').value||'Gast'},
 {html:()=>`<h2>Hallo ${userData.name}!</h2><p>Füge dein Auto hinzu.</p><input id='carName' type='text' value='${userData.car||''}' placeholder='z.B. VW Golf'><button class='primary' onclick='next()'>Weiter</button>`,
  action:()=>userData.car=document.getElementById('carName').value||'Unbekanntes Auto'},
 {html:()=>`<h2>${userData.car}</h2><p>${userData.name}, wie viele Kilometer hat dein Auto?</p><input id='km' type='number' value='${userData.km||''}'><button class='primary' onclick='next()'>Weiter</button>`,
  action:()=>userData.km=parseInt(document.getElementById('km').value)||0}
];

const services=[
 {key:'oil',label:'Motoröl',interval:15000,icon:'🛢️'},
 {key:'fuel',label:'Kraftstofffilter',interval:30000,icon:'⛽'},
 {key:'brake',label:'Bremsflüssigkeit',date:true,interval:'2 Jahre',icon:'🛑'},
 {key:'air',label:'Luftfilter',interval:20000,icon:'🌬️'},
 {key:'steering',label:'Servolenkungsöl',interval:50000,icon:'🔧'},
 {key:'belt',label:'Zahnriemen',intervalSelect:[90000,120000,150000],icon:'⚙️'}
];

function init(){ if(userData.name){ showHome(); } else { renderStep(); } }

function showHome(){
  document.getElementById('homePage').style.display='block';
  document.getElementById('stepContainer').style.display='none';
  document.getElementById('dashboard').style.display='none';
  document.getElementById('userName').innerText=userData.name;
  const list=document.getElementById('historyList'); list.innerHTML='';
  if(history.length===0){ list.innerHTML='<p>Noch keine Berechnungen vorhanden.</p>'; }
  history.slice(-5).forEach(h=>{
    const btn=document.createElement('button');
    btn.className='secondary';
    btn.innerText=`${h.date} - ${h.car}`;
    btn.onclick=()=>{ userData=h; showDashboard(); };
    list.appendChild(btn);
  });
}

function startNewCalculation(){
  currentStep=0; serviceIndex=0;
  document.getElementById('homePage').style.display='none';
  renderStep();
}

function renderStep(){
  const c=document.getElementById('stepContainer');
  c.style.display='block';
  if(currentStep<steps.length){
    c.innerHTML=typeof steps[currentStep].html==='function'?steps[currentStep].html():steps[currentStep].html;
  } else { askService(); }
}

function next(){ steps[currentStep].action(); currentStep++; renderStep(); }

function askService(){
  const c=document.getElementById('stepContainer');
  if(serviceIndex>=services.length){ return finishCalc(); }
  const s=services[serviceIndex];
  if(s.date){
    c.innerHTML=`<h2>${s.label}</h2><p>${userData.name}, wann wurde das zuletzt gewechselt?</p><input type='date' id='val' value='${userData[s.key]||''}'><button class='primary' onclick='saveService()'>Weiter</button>`;
  } else if(s.intervalSelect){
    const opts=s.intervalSelect.map(i=>`<option value='${i}' ${userData.beltInterval===i?'selected':''}>${i} km</option>`).join('');
    c.innerHTML=`<h2>${s.label}</h2><p>${userData.name}, bei wie viel km war der letzte Wechsel?</p><input type='number' id='val' value='${userData[s.key]||''}'><p>Intervall:</p><select id='int'>${opts}</select><button class='primary' onclick='saveService(true)'>Weiter</button>`;
  } else {
    c.innerHTML=`<h2>${s.label}</h2><p>${userData.name}, bei wie viel km war der letzte Wechsel?</p><input type='number' id='val' value='${userData[s.key]||''}'><button class='primary' onclick='saveService()'>Weiter</button>`;
  }
}

function saveService(hasInt){
  const s=services[serviceIndex];
  if(s.date){ userData[s.key]=document.getElementById('val').value; }
  else { userData[s.key]=parseInt(document.getElementById('val').value)||0; }
  if(hasInt){ userData['beltInterval']=parseInt(document.getElementById('int').value); }
  serviceIndex++; askService();
}

function finishCalc(){
  userData.date=new Date().toLocaleDateString();
  history.push({...userData});
  localStorage.setItem('wartungsDaten',JSON.stringify(userData));
  localStorage.setItem('wartungsHistory',JSON.stringify(history));
  showDashboard();
}

function showDashboard(){
  document.getElementById('dashboard').style.display='block';
  document.getElementById('stepContainer').style.display='none';
  document.getElementById('homePage').style.display='none';
  const km=userData.km;
  const nextBrake=new Date(userData.brake); nextBrake.setFullYear(nextBrake.getFullYear()+2);
  const today = new Date();
  const pb=document.getElementById('progressBars'); pb.innerHTML='';
  const items=[
    {label:'Ölwechsel',remain:15000-(km-userData.oil),icon:'🛢️',max:15000},
    {label:'Kraftstofffilter',remain:30000-(km-userData.fuel),icon:'⛽',max:30000},
    {label:'Bremsflüssigkeit',remain:Math.ceil((nextBrake-today)/(1000*60*60*24))+' Tage',icon:'🛑',days:(nextBrake-today)/(1000*60*60*24)},
    {label:'Luftfilter',remain:20000-(km-userData.air),icon:'🌬️',max:20000},
    {label:'Servolenkungsöl',remain:50000-(km-userData.steering),icon:'🔧',max:50000},
    {label:'Zahnriemen',remain:userData.beltInterval-(km-userData.belt),icon:'⚙️',max:userData.beltInterval}
  ];
  items.forEach(it=>{
    const cont=document.createElement('div'); cont.className='progress-container';
    let warn=false;
    if(typeof it.remain==='number' && it.remain<=1000){ warn=true; }
    if(it.days!==undefined && it.days<=30){ warn=true; }
    if(warn) cont.classList.add('warning');
    cont.innerHTML=`<div class='progress-label'>${it.icon} ${it.label}: ${it.remain}</div>`;
    if(typeof it.remain==='number'){ const perc=Math.max(0,Math.min(100,(it.remain/it.max)*100)); cont.innerHTML+=`<div class='progress-bar'><div class='progress-fill' style='width:${perc}%'></div></div>`; }
    pb.appendChild(cont);
  });
}

function openMileageModal(){
  document.getElementById('newKmInput').value = userData.km || '';
  document.getElementById('mileageModal').style.display='flex';
}

function closeMileageModal(){
  document.getElementById('mileageModal').style.display='none';
}

function confirmMileageUpdate(){
  const newKm=parseInt(document.getElementById('newKmInput').value);
  if(!isNaN(newKm)){ userData.km=newKm; localStorage.setItem('wartungsDaten',JSON.stringify(userData)); showDashboard(); }
  closeMileageModal();
}

function goHome(){ document.getElementById('dashboard').style.display='none'; showHome(); }

init();
