const KEY = 'harbor-demo-v1';
const patients = [{id:'PT-1001',name:'Alex Morgan',dob:'1988-04-12'}, {id:'PT-1002',name:'Alex Morgan',dob:'1972-09-03'}, {id:'PT-1003',name:'Jordan Lee',dob:'1995-01-19'}];
const target = { date:'2026-10-23', time:'14:00', provider:'Dr. Priya Shah', location:'North Clinic' };
function seed(scenario = 'normal') {
  return {scenario, saves:0, unreadable:false, appointments:[
    {id:'APT-104',patientId:'PT-1001',date:'2026-11-02',time:'11:00',provider:'Dr. Luis Chen',location:'South Clinic',status:'Scheduled'},
    {id:'APT-102',patientId:'PT-1001',date:'2026-10-21',time:'08:00',provider:'Dr. Priya Shah',location:'North Clinic',status:'Canceled'},
    {id:'APT-101',patientId:'PT-1001',date:'2026-10-22',time:'09:30',provider:'Dr. Priya Shah',location:'North Clinic',status:'Scheduled',...(scenario === 'already_done' ? target : {})},
    {id:'APT-103',patientId:'PT-1001',date:'2026-10-19',time:'10:00',provider:'Dr. Luis Chen',location:'South Clinic',status:'Completed'},
    {id:'APT-201',patientId:'PT-1002',date:'2026-10-21',time:'10:00',provider:'Dr. Luis Chen',location:'South Clinic',status:'Scheduled'}]};
}
let state;
try { state = JSON.parse(localStorage.getItem(KEY)) || seed(); } catch { state = seed(); }
const persist = () => localStorage.setItem(KEY, JSON.stringify(state));
const $ = (s) => document.querySelector(s);
const wait = (ms) => new Promise(r => setTimeout(r, ms));
let patientId, selectedId, searchRun = 0;
$('#scenario').value = state.scenario;
function reset() {state = seed($('#scenario').value);persist();location.reload();}
$('#scenario').onchange = reset; $('#reset').onclick = reset;
$('#search').onsubmit = async (event) => {
  event.preventDefault(); const run = ++searchRun;
  const query = $('#query').value.trim().toLowerCase();
  $('#results').replaceChildren(); $('#chart').hidden = true; $('#search-status').textContent = 'Searching…';
  await wait(550);
  if (run !== searchRun) return;
  const matches = patients.filter(p => p.id.toLowerCase() === query || p.name.toLowerCase().includes(query));
  $('#search-status').textContent = matches.length ? `${matches.length} patient(s) found` : 'No patients found';
  for (const p of matches) {
    const button = document.createElement('button'); button.className = 'secondary';
    button.textContent = `Open ${p.name} · ${p.id} · DOB ${p.dob}`;
    button.onclick = () => {patientId = p.id;selectedId = undefined;renderChart();};
    $('#results').append(button, document.createTextNode(' '));
  }
};
function renderChart() {
  const patient = patients.find(p => p.id === patientId);
  const chart = $('#chart'); chart.hidden = false;
  chart.innerHTML = `<small>PATIENT CHART</small><h2>${patient.name} · ${patient.id}</h2><p>DOB ${patient.dob} · All appointment times in America/Los_Angeles</p>`;
  if (state.unreadable) {chart.innerHTML += '<p role="alert">Appointment service unavailable. Unable to verify current appointments.</p>';return;}
  const rows = state.appointments.filter(a => a.patientId === patientId);
  if (!rows.length) {chart.innerHTML += '<p>No appointments</p>';return;}
  chart.innerHTML += `<table aria-label="Appointments"><thead><tr><th>ID</th><th>Date</th><th>Time</th><th>Provider</th><th>Location</th><th>Status</th><th>Action</th></tr></thead><tbody>${rows.map(a => `<tr data-testid="appointment-${a.id}" class="${selectedId === a.id ? 'selected' : ''}"><td>${a.id}</td><td>${a.date}</td><td>${a.time}</td><td>${a.provider}</td><td>${a.location}</td><td>${a.status}</td><td>${a.status === 'Scheduled' ? `<button data-edit="${a.id}" aria-label="Reschedule ${a.id}">Reschedule</button>` : '—'}</td></tr>`).join('')}</tbody></table><p data-testid="save-count">Successful saves: ${state.saves}</p><div id="editor"></div>`;
  chart.querySelectorAll('[data-edit]').forEach(button => button.onclick = async () => {
    selectedId = button.dataset.edit;
    if (state.scenario === 'rerender') { renderChart(); $('#editor').textContent = 'Loading available slots…'; await wait(350); }
    renderEditor();
  });
}
function renderEditor() {
  const appointment = state.appointments.find(a => a.id === selectedId);
  $('#editor').innerHTML = `<h2>Reschedule ${appointment.id}</h2><p>Patient: ${patientId}</p><label>Available slot<select id="slot"><option value="">Choose a slot</option><option value="target">2026-10-23 · 14:00 · Dr. Priya Shah · North Clinic</option><option value="other">2026-10-23 · 14:00 · Dr. Luis Chen · South Clinic</option></select></label><button id="save">Save appointment</button><button id="cancel" class="secondary">Cancel</button><p id="save-status" role="status"></p>`;
  $('#cancel').onclick = () => {selectedId=undefined;renderChart();};
  $('#save').onclick = async () => {
    const slot = $('#slot').value;
    if (!slot) {$('#save-status').textContent = 'Choose a slot first';return;}
    $('#save').disabled = true; $('#cancel').disabled = true; $('#slot').disabled = true;
    $('#save-status').textContent = 'Saving…'; await wait(700);
    if (state.scenario === 'slot_taken') {
      $('#save-status').textContent = 'Slot unavailable. No changes were saved.';
      $('#slot').querySelector(`option[value="${slot}"]`).disabled = true;
    } else if (state.scenario === 'save_failed') {
      $('#save-status').textContent = 'Save failed. No changes were saved.';
    } else {
      Object.assign(appointment, slot === 'target' ? target : {...target,provider:'Dr. Luis Chen',location:'South Clinic'});
      state.saves++;
      if (state.scenario === 'unverifiable') state.unreadable = true;
      persist();
      if (['lost_confirmation','unverifiable'].includes(state.scenario)) {
        $('#save-status').textContent = 'Connection interrupted. Save outcome unknown.';
      } else {renderChart();$('#editor').innerHTML = '<p role="status">Appointment saved</p>';return;}
    }
    $('#save').disabled = false; $('#cancel').disabled = false; $('#slot').disabled = false;
  };
}
