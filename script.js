// ============= DATA LAYER =============
const STORAGE_KEY = 'student-dashboard-data';
const SUBJECT_COLORS = ['#34d399','#60a5fa','#f472b6','#fbbf24','#a78bfa','#fb923c','#2dd4bf','#e879f9','#f87171','#4ade80'];

const defaultData = { subjects: [], sessions: [], streakLastDate: null, streakCount: 0, tasks: [], dailyGoal: { dailyTargetMinutes: 120 } };

function loadData() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return JSON.parse(JSON.stringify(defaultData));
    const p = JSON.parse(raw);
    return { ...defaultData, ...p, tasks: p.tasks || [], dailyGoal: p.dailyGoal || { dailyTargetMinutes: 120 } };
  } catch { return JSON.parse(JSON.stringify(defaultData)); }
}
function saveData(d) { localStorage.setItem(STORAGE_KEY, JSON.stringify(d)); }
function genId() { return Date.now().toString(36) + Math.random().toString(36).slice(2, 7); }
function getToday() { return new Date().toISOString().split('T')[0]; }

function getWeekStart() {
  const now = new Date(); const day = now.getDay();
  const diff = now.getDate() - day + (day === 0 ? -6 : 1);
  const s = new Date(now); s.setDate(diff); s.setHours(0,0,0,0); return s;
}
function getSessionsThisWeek(sessions) {
  const ws = getWeekStart();
  return sessions.filter(s => new Date(s.date) >= ws);
}
function getTodaySessions(sessions) {
  const t = getToday(); return sessions.filter(s => s.date === t);
}
function formatDuration(m) {
  const h = Math.floor(m / 60); const mins = Math.round(m % 60);
  return h === 0 ? `${mins}m` : `${h}h ${mins}m`;
}
function formatTimer(sec) {
  const h = Math.floor(sec / 3600); const m = Math.floor((sec % 3600) / 60); const s = sec % 60;
  return [h, m, s].map(v => v.toString().padStart(2, '0')).join(':');
}
function calculateStreak(sessions, cur, last) {
  const today = getToday();
  const todayS = sessions.filter(s => s.date === today);
  if (todayS.length > 0) {
    if (last === today) return { streak: cur, lastDate: today };
    const y = new Date(); y.setDate(y.getDate() - 1);
    const ys = y.toISOString().split('T')[0];
    return last === ys ? { streak: cur + 1, lastDate: today } : { streak: 1, lastDate: today };
  }
  if (last) {
    const y = new Date(); y.setDate(y.getDate() - 1);
    if (last < y.toISOString().split('T')[0]) return { streak: 0, lastDate: last };
  }
  return { streak: cur, lastDate: last || '' };
}

// ============= SVG ICONS =============
const icons = {
  dashboard: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="7" height="9" x="3" y="3" rx="1"/><rect width="7" height="5" x="14" y="3" rx="1"/><rect width="7" height="9" x="14" y="12" rx="1"/><rect width="7" height="5" x="3" y="16" rx="1"/></svg>',
  sun: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/></svg>',
  book: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>',
  timer: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 22h14"/><path d="M5 2h14"/><path d="M17 22v-4.172a2 2 0 0 0-.586-1.414L12 12l-4.414 4.414A2 2 0 0 0 7 17.828V22"/><path d="M7 2v4.172a2 2 0 0 0 .586 1.414L12 12l4.414-4.414A2 2 0 0 0 17 6.172V2"/></svg>',
  clock: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>',
  list: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 12H3"/><path d="M16 6H3"/><path d="M16 18H3"/><path d="m19 10-4 4"/><path d="m15 10 4 4"/></svg>',
  history: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/><path d="M12 7v5l4 2"/></svg>',
  flame: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/></svg>',
  menu: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="4" x2="20" y1="12" y2="12"/><line x1="4" x2="20" y1="6" y2="6"/><line x1="4" x2="20" y1="18" y2="18"/></svg>',
  x: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>',
  plus: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>',
  trash: '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>',
  play: '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="6 3 20 12 6 21 6 3"/></svg>',
  pause: '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="4" height="16" x="6" y="4"/><rect width="4" height="16" x="14" y="4"/></svg>',
  stop: '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="14" height="14" x="5" y="5" rx="2"/></svg>',
  reset: '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>',
  brain: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5a3 3 0 1 0-5.997.125 4 4 0 0 0-2.526 5.77 4 4 0 0 0 .556 6.588A4 4 0 1 0 12 18Z"/><path d="M12 5a3 3 0 1 1 5.997.125 4 4 0 0 1 2.526 5.77 4 4 0 0 1-.556 6.588A4 4 0 1 1 12 18Z"/><path d="M15 13a4.5 4.5 0 0 1-3-4 4.5 4.5 0 0 1-3 4"/><path d="M17.599 6.5a3 3 0 0 0 .399-1.375"/><path d="M6.003 5.125A3 3 0 0 0 6.401 6.5"/><path d="M3.477 10.896a4 4 0 0 1 .585-.396"/><path d="M19.938 10.5a4 4 0 0 1 .585.396"/><path d="M6 18a4 4 0 0 1-1.967-.516"/><path d="M19.967 17.484A4 4 0 0 1 18 18"/></svg>',
  coffee: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 2v2"/><path d="M14 2v2"/><path d="M16 8a1 1 0 0 1 1 1v8a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V9a1 1 0 0 1 1-1h14a4 4 0 1 1 0 8h-1"/><path d="M6 2v2"/></svg>',
  target: '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>',
  trending: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></svg>',
  edit: '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg>',
  check: '<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>',
};

// ============= STATE =============
let data = loadData();
let currentSection = 'dashboard';
let mobileOpen = false;

// Session timer state
let sessionInterval = null;
let sessionSeconds = 0;
let sessionRunning = false;
let sessionPaused = false;
let sessionStartTime = '';
let selectedSubjectId = '';

// Pomodoro state
const FOCUS_TIME = 25 * 60;
const BREAK_TIME = 5 * 60;
let pomPhase = 'focus';
let pomSeconds = FOCUS_TIME;
let pomRunning = false;
let pomInterval = null;
let pomCompleted = 0;

// Confirm delete tracking
let confirmDeleteId = null;
let confirmDeleteTimeout = null;

// Task editing
let editingTaskId = null;

// Color selection
let selectedColor = SUBJECT_COLORS[0];

// ============= TOAST =============
function showToast(msg, type = 'success') {
  const container = document.getElementById('toast-container');
  const t = document.createElement('div');
  t.className = `toast ${type}`;
  t.textContent = msg;
  container.appendChild(t);
  setTimeout(() => { t.remove(); }, 3000);
}

// ============= RENDERING =============
function render() {
  document.getElementById('streak-count').textContent = `${data.streakCount} day${data.streakCount !== 1 ? 's' : ''}`;
  document.querySelectorAll('.nav-btn').forEach(b => {
    b.classList.toggle('active', b.dataset.section === currentSection);
  });

  const main = document.getElementById('main-content');
  switch (currentSection) {
    case 'dashboard': main.innerHTML = renderDashboard(); break;
    case 'daily-goal': main.innerHTML = renderDailyGoal(); break;
    case 'subjects': main.innerHTML = renderSubjects(); break;
    case 'session': main.innerHTML = renderSession(); break;
    case 'pomodoro': main.innerHTML = renderPomodoro(); break;
    case 'tasks': main.innerHTML = renderTasks(); break;
    case 'history': main.innerHTML = renderHistory(); break;
  }
  bindEvents();
}

function renderDashboard() {
  const weekSessions = getSessionsThisWeek(data.sessions);
  const todaySessions = getTodaySessions(data.sessions);
  const weekMin = weekSessions.reduce((s, x) => s + x.durationMinutes, 0);
  const todayMin = todaySessions.reduce((s, x) => s + x.durationMinutes, 0);
  const totalTarget = data.subjects.reduce((s, x) => s + x.weeklyTarget, 0);
  const weekPct = totalTarget > 0 ? Math.min(100, (weekMin / 60 / totalTarget) * 100) : 0;
  const remainMin = Math.max(0, totalTarget * 60 - weekMin);
  const dailyPct = data.dailyGoal.dailyTargetMinutes > 0 ? Math.min(100, (todayMin / data.dailyGoal.dailyTargetMinutes) * 100) : 0;

  let subjectProgress = '';
  if (data.subjects.length > 0) {
    subjectProgress = `<div class="card" style="padding:24px">
      <h3 class="font-semibold" style="margin-bottom:16px;color:var(--foreground)">Subject Progress</h3>
      <div>${data.subjects.map(sub => {
        const subMin = weekSessions.filter(s => s.subjectId === sub.id).reduce((s, x) => s + x.durationMinutes, 0);
        const pct = sub.weeklyTarget > 0 ? Math.min(100, (subMin / 60 / sub.weeklyTarget) * 100) : 0;
        return `<div class="subject-progress-item">
          <div class="subject-progress-header">
            <div class="subject-progress-left"><div class="dot" style="background:${sub.color}"></div><span>${sub.name}</span></div>
            <span class="subject-progress-right">${formatDuration(subMin)} / ${sub.weeklyTarget}h</span>
          </div>
          <div class="progress-track thin"><div class="progress-fill" style="width:${pct}%;background:${sub.color}"></div></div>
        </div>`;
      }).join('')}</div>
    </div>`;
  } else {
    subjectProgress = `<div class="card empty-state">${icons.book}<p>No subjects yet. Add some to start tracking!</p></div>`;
  }

  return `<div class="space-y-6 fade-in">
    <div><h2 class="section-title">Dashboard</h2><p class="section-desc">Your study overview at a glance</p></div>
    <div class="stats-grid">
      ${[
        { label: 'This Week', value: formatDuration(weekMin), icon: icons.trending, color: 'var(--primary)' },
        { label: 'Today', value: formatDuration(todayMin), icon: icons.clock, color: 'var(--info)' },
        { label: 'Subjects', value: data.subjects.length, icon: icons.book, color: 'var(--accent)' },
        { label: 'Streak', value: `${data.streakCount} days`, icon: icons.flame, color: 'var(--warning)' },
      ].map((s, i) => `<div class="card stat-card slide-up" style="animation-delay:${i*80}ms">
        <div class="stat-icon" style="color:${s.color}">${s.icon}</div>
        <p class="stat-value">${s.value}</p>
        <p class="stat-label">${s.label}</p>
      </div>`).join('')}
    </div>
    <div class="card" style="padding:24px">
      <div class="flex items-center justify-between" style="margin-bottom:16px">
        <div class="flex items-center gap-2"><span style="color:var(--warning)">${icons.sun}</span><h3 class="font-semibold" style="color:var(--foreground)">Daily Goal</h3></div>
        <span class="text-sm font-medium" style="color:var(--primary)">${Math.round(dailyPct)}%</span>
      </div>
      <div class="progress-track"><div class="progress-fill" style="width:${dailyPct}%;background:var(--warning)"></div></div>
      <p class="text-xs mt-2" style="color:var(--muted-foreground)">${formatDuration(todayMin)} of ${formatDuration(data.dailyGoal.dailyTargetMinutes)} daily target</p>
    </div>
    <div class="card" style="padding:24px">
      <div class="flex items-center justify-between" style="margin-bottom:16px">
        <div class="flex items-center gap-2"><span style="color:var(--primary)">${icons.target}</span><h3 class="font-semibold" style="color:var(--foreground)">Weekly Goal Progress</h3></div>
        <span class="text-sm font-medium" style="color:var(--primary)">${Math.round(weekPct)}%</span>
      </div>
      <div class="progress-track"><div class="progress-fill" style="width:${weekPct}%;background:var(--primary)"></div></div>
      <div class="flex justify-between mt-2">
        <p class="text-xs" style="color:var(--muted-foreground)">${formatDuration(weekMin)} of ${totalTarget}h target</p>
        <p class="text-xs" style="color:var(--muted-foreground)">${formatDuration(remainMin)} remaining</p>
      </div>
    </div>
    ${subjectProgress}
  </div>`;
}

function renderDailyGoal() {
  const todaySessions = getTodaySessions(data.sessions);
  const todayMin = todaySessions.reduce((s, x) => s + x.durationMinutes, 0);
  const dailyPct = data.dailyGoal.dailyTargetMinutes > 0 ? Math.min(100, (todayMin / data.dailyGoal.dailyTargetMinutes) * 100) : 0;

  return `<div class="space-y-6 fade-in">
    <div><h2 class="section-title">Daily Goal</h2><p class="section-desc">Set and track your daily study target</p></div>
    <div class="card" style="padding:24px">
      <h3 class="font-semibold flex items-center gap-2" style="color:var(--foreground);margin-bottom:16px"><span style="color:var(--primary)">${icons.target}</span>Set Daily Target</h3>
      <div class="flex gap-3 items-end">
        <div style="flex:1"><label class="text-xs" style="color:var(--muted-foreground);display:block;margin-bottom:4px">Hours per day</label>
          <input type="number" id="daily-target-input" class="input" value="${data.dailyGoal.dailyTargetMinutes / 60}" min="0.5" max="16" step="0.5">
        </div>
        <button class="btn btn-primary" id="save-daily-target">Save</button>
      </div>
    </div>
    <div class="card" style="padding:24px">
      <div class="flex items-center justify-between" style="margin-bottom:16px">
        <div class="flex items-center gap-2"><span style="color:var(--warning)">${icons.sun}</span><h3 class="font-semibold" style="color:var(--foreground)">Today's Progress</h3></div>
        <span class="text-sm font-medium" style="color:var(--primary)">${Math.round(dailyPct)}%</span>
      </div>
      <div class="progress-track thick"><div class="progress-fill" style="width:${dailyPct}%;background:var(--primary)"></div></div>
      <div class="flex justify-between mt-2">
        <p class="text-xs" style="color:var(--muted-foreground)">${formatDuration(todayMin)} studied today</p>
        <p class="text-xs" style="color:var(--muted-foreground)">Goal: ${formatDuration(data.dailyGoal.dailyTargetMinutes)}</p>
      </div>
    </div>
    <div class="card" style="padding:24px">
      <h3 class="font-semibold" style="color:var(--foreground);margin-bottom:16px">Today's Sessions</h3>
      ${todaySessions.length > 0 ? todaySessions.map(s => `<div class="daily-sessions-item">
        <div><p class="text-sm font-medium" style="color:var(--foreground)">${s.subjectName}</p><p class="text-xs" style="color:var(--muted-foreground)">${s.startTime} – ${s.endTime}</p></div>
        <span class="text-sm font-semibold" style="color:var(--primary)">${formatDuration(s.durationMinutes)}</span>
      </div>`).join('') : '<p class="text-sm" style="color:var(--muted-foreground);text-align:center;padding:16px 0">No sessions today yet. Start studying!</p>'}
    </div>
  </div>`;
}

function renderSubjects() {
  return `<div class="space-y-6 fade-in">
    <div><h2 class="section-title">Subjects</h2><p class="section-desc">Manage your study subjects and goals</p></div>
    <div class="card" style="padding:24px">
      <h3 class="font-semibold" style="color:var(--foreground);margin-bottom:16px">Add Subject</h3>
      <div class="form-row">
        <input id="subject-name" class="input" placeholder="Subject name..." style="flex:1">
        <input id="subject-target" type="number" class="input input-small" placeholder="Weekly hrs" value="5" min="1" max="40">
        <div class="color-picker" id="color-picker">
          ${SUBJECT_COLORS.map(c => `<button class="color-dot${c === selectedColor ? ' selected' : ''}" data-color="${c}" style="background:${c}"></button>`).join('')}
        </div>
        <button class="btn btn-primary" id="add-subject">${icons.plus} Add</button>
      </div>
    </div>
    ${data.subjects.length > 0 ? `<div class="space-y-3">${data.subjects.map((sub, i) => `<div class="card flex items-center justify-between slide-up" style="padding:20px;animation-delay:${i*60}ms">
      <div class="flex items-center gap-4">
        <div style="width:40px;height:40px;border-radius:8px;background:${sub.color}20;display:flex;align-items:center;justify-content:center;color:${sub.color}">${icons.book}</div>
        <div><p class="font-medium" style="color:var(--foreground)">${sub.name}</p><p class="text-xs" style="color:var(--muted-foreground)">${formatDuration(sub.totalMinutesStudied)} studied · ${sub.weeklyTarget}h/week goal</p></div>
      </div>
      <button class="btn-icon danger delete-subject ${confirmDeleteId === sub.id ? 'active-delete' : ''}" data-id="${sub.id}">${icons.trash}</button>
    </div>`).join('')}</div>` : `<div class="card empty-state">${icons.book}<p>No subjects yet</p><p class="sub">Add your first subject above to get started</p></div>`}
  </div>`;
}

function renderSession() {
  if (data.subjects.length === 0) {
    return `<div class="space-y-6 fade-in">
      <div><h2 class="section-title">Study Session</h2><p class="section-desc">Track your study time in real-time</p></div>
      <div class="card empty-state">${icons.timer}<p>Add subjects first to start tracking</p></div>
    </div>`;
  }

  const activeSub = data.subjects.find(s => s.id === selectedSubjectId);
  let subjectSelector = '';
  if (!sessionRunning) {
    subjectSelector = `<div class="card" style="padding:24px">
      <h3 class="font-semibold" style="color:var(--foreground);margin-bottom:12px">Select Subject</h3>
      <div class="subject-grid">${data.subjects.map(s => `<button class="subject-btn${selectedSubjectId === s.id ? ' selected' : ''}" data-id="${s.id}">
        <div class="dot" style="background:${s.color}"></div>${s.name}
      </button>`).join('')}</div>
    </div>`;
  }

  let subjectIndicator = '';
  if (activeSub && sessionRunning) {
    subjectIndicator = `<div class="timer-subject"><div class="dot" style="background:${activeSub.color}"></div><span>${activeSub.name}</span></div>`;
  }

  let controls = '';
  if (!sessionRunning) {
    controls = `<button class="btn btn-primary" id="start-session" style="padding:12px 32px;font-size:1rem">${icons.play} Start Session</button>`;
  } else {
    controls = `<button class="btn btn-secondary" id="pause-session">${sessionPaused ? icons.play : icons.pause} ${sessionPaused ? 'Resume' : 'Pause'}</button>
      <button class="btn btn-destructive" id="stop-session">${icons.stop} Stop</button>`;
  }

  return `<div class="space-y-6 fade-in">
    <div><h2 class="section-title">Study Session</h2><p class="section-desc">Track your study time in real-time</p></div>
    ${subjectSelector}
    <div class="card" style="padding:32px;text-align:center">
      ${subjectIndicator}
      <div class="timer-display${sessionRunning && !sessionPaused ? ' active' : ''}">${formatTimer(sessionSeconds)}</div>
      <div class="flex items-center justify-center gap-3">${controls}</div>
    </div>
  </div>`;
}

function renderPomodoro() {
  const totalTime = pomPhase === 'focus' ? FOCUS_TIME : BREAK_TIME;
  const progress = ((totalTime - pomSeconds) / totalTime) * 100;
  const circumference = 2 * Math.PI * 45;
  const offset = circumference * (1 - progress / 100);
  const strokeColor = pomPhase === 'focus' ? 'hsl(160,55%,42%)' : 'hsl(200,60%,50%)';
  const timeStr = formatTimer(pomSeconds).slice(3);

  return `<div class="space-y-6 fade-in">
    <div><h2 class="section-title">Pomodoro Timer</h2><p class="section-desc">Stay focused with timed sessions</p></div>
    <div class="card pomodoro-center" style="padding:32px">
      <div class="phase-badge ${pomPhase}">${pomPhase === 'focus' ? icons.brain : icons.coffee} ${pomPhase === 'focus' ? 'Focus Time' : 'Break Time'}</div>
      <div class="pomodoro-ring">
        <svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="45" fill="none" stroke="var(--secondary)" stroke-width="4"/><circle cx="50" cy="50" r="45" fill="none" stroke="${strokeColor}" stroke-width="4" stroke-linecap="round" stroke-dasharray="${circumference}" stroke-dashoffset="${offset}" style="transition:all 1s"/></svg>
        <div class="time-display">${timeStr}</div>
      </div>
      <div class="pomodoro-controls">
        <button class="btn ${pomPhase === 'focus' ? 'btn-primary' : 'btn-info'}" id="pom-toggle" style="padding:12px 32px">${pomRunning ? icons.pause : icons.play} ${pomRunning ? 'Pause' : 'Start'}</button>
        <button class="btn btn-secondary btn-icon" id="pom-reset" style="padding:12px">${icons.reset}</button>
      </div>
      <p class="pomodoro-count">🍅 Pomodoros completed: <span>${pomCompleted}</span></p>
    </div>
  </div>`;
}

function renderTasks() {
  const pending = data.tasks.filter(t => !t.completed);
  const completed = data.tasks.filter(t => t.completed);

  const importanceConfig = {
    critical: { label: 'Critical', badgeClass: 'critical', borderClass: 'critical-border' },
    important: { label: 'Important', badgeClass: 'important', borderClass: 'important-border' },
    routine: { label: 'Routine', badgeClass: 'routine', borderClass: 'routine-border' },
  };

  function renderTaskItem(task, isCompleted) {
    const cfg = importanceConfig[task.importance];
    if (editingTaskId === task.id && !isCompleted) {
      return `<div class="card task-item ${cfg.borderClass}">
        <div style="width:100%" class="space-y-2">
          <input class="input" id="edit-title" value="${task.title}">
          <input class="input" id="edit-desc" placeholder="Description..." value="${task.description || ''}">
          <div class="flex gap-2">
            <select class="input" id="edit-importance" style="width:auto">
              <option value="critical" ${task.importance === 'critical' ? 'selected' : ''}>🔴 Critical</option>
              <option value="important" ${task.importance === 'important' ? 'selected' : ''}>🟡 Important</option>
              <option value="routine" ${task.importance === 'routine' ? 'selected' : ''}>🟢 Routine</option>
            </select>
            <button class="btn-icon" id="save-edit" style="color:var(--primary)">${icons.check}</button>
            <button class="btn-icon" id="cancel-edit">${icons.x}</button>
          </div>
        </div>
      </div>`;
    }

    if (isCompleted) {
      return `<div class="card task-item ${cfg.borderClass} completed">
        <button class="task-checkbox checked toggle-task" data-id="${task.id}">${icons.check}</button>
        <div class="task-body"><p class="task-title done">${task.title}</p>${task.description ? `<p class="task-desc done">${task.description}</p>` : ''}</div>
        <div class="task-actions"><button class="btn-icon danger delete-task ${confirmDeleteId === task.id ? 'active-delete' : ''}" data-id="${task.id}">${icons.trash}</button></div>
      </div>`;
    }

    return `<div class="card task-item ${cfg.borderClass} slide-up">
      <button class="task-checkbox toggle-task" data-id="${task.id}"></button>
      <div class="task-body">
        <div class="task-title-row"><p class="task-title">${task.title}</p><span class="importance-badge ${cfg.badgeClass}">${cfg.label}</span></div>
        ${task.description ? `<p class="task-desc">${task.description}</p>` : ''}
      </div>
      <div class="task-actions">
        <button class="btn-icon edit-task" data-id="${task.id}">${icons.edit}</button>
        <button class="btn-icon danger delete-task ${confirmDeleteId === task.id ? 'active-delete' : ''}" data-id="${task.id}">${icons.trash}</button>
      </div>
    </div>`;
  }

  return `<div class="space-y-6 fade-in">
    <div><h2 class="section-title">Tasks</h2><p class="section-desc">Manage your study to-do list</p></div>
    <div class="card" style="padding:24px">
      <h3 class="font-semibold" style="color:var(--foreground);margin-bottom:16px">Add Task</h3>
      <div class="space-y-3">
        <input id="task-title" class="input" placeholder="Task title...">
        <input id="task-desc" class="input" placeholder="Description (optional)...">
        <div class="flex gap-3 items-center">
          <select id="task-importance" class="input" style="width:auto">
            <option value="critical">🔴 Critical</option>
            <option value="important">🟡 Important</option>
            <option value="routine" selected>🟢 Routine</option>
          </select>
          <button class="btn btn-primary" id="add-task">${icons.plus} Add</button>
        </div>
      </div>
    </div>
    ${pending.length > 0 ? `<div class="space-y-2"><h3 class="task-section-title">Pending (${pending.length})</h3>${pending.map(t => renderTaskItem(t, false)).join('')}</div>` : ''}
    ${completed.length > 0 ? `<div class="space-y-2"><h3 class="task-section-title">Completed (${completed.length})</h3>${completed.map(t => renderTaskItem(t, true)).join('')}</div>` : ''}
    ${data.tasks.length === 0 ? `<div class="card empty-state">${icons.list}<p>No tasks yet</p><p class="sub">Add your first task above</p></div>` : ''}
  </div>`;
}

function renderHistory() {
  const sorted = [...data.sessions].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime() || b.startTime.localeCompare(a.startTime));

  return `<div class="space-y-6 fade-in">
    <div><h2 class="section-title">Study History</h2><p class="section-desc">All your past study sessions</p></div>
    ${sorted.length > 0 ? `<div class="space-y-2">${sorted.map((s, i) => `<div class="card history-item slide-up" style="animation-delay:${i*40}ms">
      <div class="history-left">
        <div class="history-icon">${icons.history}</div>
        <div><p class="font-medium text-sm" style="color:var(--foreground)">${s.subjectName}</p><p class="text-xs" style="color:var(--muted-foreground)">${s.date} · ${s.startTime} – ${s.endTime}</p></div>
      </div>
      <div class="history-right">
        <span class="history-duration">${formatDuration(s.durationMinutes)}</span>
        <button class="btn-icon danger delete-session ${confirmDeleteId === s.id ? 'active-delete' : ''}" data-id="${s.id}">${icons.trash}</button>
      </div>
    </div>`).join('')}</div>` : `<div class="card empty-state">${icons.history}<p>No study sessions recorded yet</p></div>`}
  </div>`;
}

// ============= EVENT BINDING =============
function bindEvents() {
  // Daily goal
  const saveDailyBtn = document.getElementById('save-daily-target');
  if (saveDailyBtn) {
    saveDailyBtn.onclick = () => {
      const h = parseFloat(document.getElementById('daily-target-input').value);
      if (isNaN(h) || h <= 0) { showToast('Please enter a valid number of hours', 'error'); return; }
      data.dailyGoal.dailyTargetMinutes = Math.round(h * 60);
      saveData(data); showToast(`Daily goal set to ${h}h`); render();
    };
  }

  // Subjects
  const addSubBtn = document.getElementById('add-subject');
  if (addSubBtn) {
    addSubBtn.onclick = () => {
      const name = document.getElementById('subject-name').value.trim();
      if (!name) { showToast('Please enter a subject name', 'error'); return; }
      const target = Number(document.getElementById('subject-target').value) || 5;
      data.subjects.push({ id: genId(), name, color: selectedColor, weeklyTarget: target, totalMinutesStudied: 0 });
      saveData(data); showToast(`${name} added!`); render();
    };
    document.getElementById('subject-name').onkeydown = e => { if (e.key === 'Enter') addSubBtn.click(); };
  }
  document.querySelectorAll('.color-dot').forEach(d => {
    d.onclick = () => { selectedColor = d.dataset.color; document.querySelectorAll('.color-dot').forEach(x => x.classList.toggle('selected', x.dataset.color === selectedColor)); };
  });
  document.querySelectorAll('.delete-subject').forEach(b => {
    b.onclick = () => handleConfirmDelete(b.dataset.id, () => {
      const sub = data.subjects.find(s => s.id === b.dataset.id);
      data.subjects = data.subjects.filter(s => s.id !== b.dataset.id);
      data.sessions = data.sessions.filter(s => s.subjectId !== b.dataset.id);
      saveData(data); showToast(`${sub?.name} deleted`); render();
    });
  });

  // Session
  document.querySelectorAll('.subject-btn').forEach(b => {
    b.onclick = () => { selectedSubjectId = b.dataset.id; render(); };
  });
  const startBtn = document.getElementById('start-session');
  if (startBtn) {
    startBtn.onclick = () => {
      if (!selectedSubjectId) { showToast('Select a subject first', 'error'); return; }
      sessionSeconds = 0; sessionRunning = true; sessionPaused = false;
      sessionStartTime = new Date().toLocaleTimeString();
      startSessionTimer(); render();
    };
  }
  const pauseBtn = document.getElementById('pause-session');
  if (pauseBtn) {
    pauseBtn.onclick = () => {
      sessionPaused = !sessionPaused;
      if (sessionPaused) { clearInterval(sessionInterval); sessionInterval = null; }
      else { startSessionTimer(); }
      render();
    };
  }
  const stopBtn = document.getElementById('stop-session');
  if (stopBtn) {
    stopBtn.onclick = () => {
      clearInterval(sessionInterval); sessionInterval = null;
      if (sessionSeconds < 5) { showToast('Session too short', 'error'); sessionRunning = false; sessionPaused = false; sessionSeconds = 0; render(); return; }
      const endTime = new Date().toLocaleTimeString();
      const durMin = sessionSeconds / 60;
      const sub = data.subjects.find(s => s.id === selectedSubjectId);
      if (sub) {
        data.sessions.push({ id: genId(), subjectId: selectedSubjectId, subjectName: sub.name, durationMinutes: durMin, date: getToday(), startTime: sessionStartTime, endTime });
        data.subjects = data.subjects.map(s => s.id === selectedSubjectId ? { ...s, totalMinutesStudied: s.totalMinutesStudied + durMin } : s);
        const streak = calculateStreak(data.sessions, data.streakCount, data.streakLastDate);
        data.streakCount = streak.streak; data.streakLastDate = streak.lastDate;
        saveData(data); showToast('Session saved!');
      }
      sessionRunning = false; sessionPaused = false; sessionSeconds = 0; render();
    };
  }

  // Pomodoro
  const pomToggle = document.getElementById('pom-toggle');
  if (pomToggle) {
    pomToggle.onclick = () => { pomRunning = !pomRunning; if (pomRunning) startPomTimer(); else { clearInterval(pomInterval); pomInterval = null; } render(); };
  }
  const pomResetBtn = document.getElementById('pom-reset');
  if (pomResetBtn) {
    pomResetBtn.onclick = () => { pomRunning = false; clearInterval(pomInterval); pomInterval = null; pomPhase = 'focus'; pomSeconds = FOCUS_TIME; render(); };
  }

  // Tasks
  const addTaskBtn = document.getElementById('add-task');
  if (addTaskBtn) {
    addTaskBtn.onclick = () => {
      const title = document.getElementById('task-title').value.trim();
      if (!title) { showToast('Please enter a task title', 'error'); return; }
      const desc = document.getElementById('task-desc').value.trim();
      const imp = document.getElementById('task-importance').value;
      data.tasks.push({ id: genId(), title, description: desc, importance: imp, completed: false, createdAt: getToday() });
      saveData(data); showToast('Task added!'); render();
    };
    document.getElementById('task-title').onkeydown = e => { if (e.key === 'Enter') addTaskBtn.click(); };
  }
  document.querySelectorAll('.toggle-task').forEach(b => {
    b.onclick = () => { data.tasks = data.tasks.map(t => t.id === b.dataset.id ? { ...t, completed: !t.completed } : t); saveData(data); render(); };
  });
  document.querySelectorAll('.edit-task').forEach(b => {
    b.onclick = () => { editingTaskId = b.dataset.id; render(); };
  });
  const saveEditBtn = document.getElementById('save-edit');
  if (saveEditBtn) {
    saveEditBtn.onclick = () => {
      const title = document.getElementById('edit-title').value.trim();
      if (!title) return;
      const desc = document.getElementById('edit-desc').value.trim();
      const imp = document.getElementById('edit-importance').value;
      data.tasks = data.tasks.map(t => t.id === editingTaskId ? { ...t, title, description: desc, importance: imp } : t);
      editingTaskId = null; saveData(data); showToast('Task updated'); render();
    };
  }
  const cancelEditBtn = document.getElementById('cancel-edit');
  if (cancelEditBtn) { cancelEditBtn.onclick = () => { editingTaskId = null; render(); }; }
  document.querySelectorAll('.delete-task').forEach(b => {
    b.onclick = () => handleConfirmDelete(b.dataset.id, () => { data.tasks = data.tasks.filter(t => t.id !== b.dataset.id); saveData(data); showToast('Task deleted'); render(); });
  });

  // History
  document.querySelectorAll('.delete-session').forEach(b => {
    b.onclick = () => handleConfirmDelete(b.dataset.id, () => {
      const session = data.sessions.find(s => s.id === b.dataset.id);
      if (session) {
        data.sessions = data.sessions.filter(s => s.id !== b.dataset.id);
        data.subjects = data.subjects.map(s => s.id === session.subjectId ? { ...s, totalMinutesStudied: Math.max(0, s.totalMinutesStudied - session.durationMinutes) } : s);
        saveData(data); showToast('Session deleted'); render();
      }
    });
  });
}

function handleConfirmDelete(id, callback) {
  if (confirmDeleteId === id) { confirmDeleteId = null; clearTimeout(confirmDeleteTimeout); callback(); return; }
  confirmDeleteId = id;
  clearTimeout(confirmDeleteTimeout);
  confirmDeleteTimeout = setTimeout(() => { confirmDeleteId = null; render(); }, 3000);
  render();
}

function startSessionTimer() {
  if (sessionInterval) clearInterval(sessionInterval);
  sessionInterval = setInterval(() => {
    sessionSeconds++;
    const display = document.querySelector('.timer-display');
    if (display) display.textContent = formatTimer(sessionSeconds);
  }, 1000);
}

function startPomTimer() {
  if (pomInterval) clearInterval(pomInterval);
  pomInterval = setInterval(() => {
    pomSeconds--;
    if (pomSeconds <= 0) {
      if (pomPhase === 'focus') { pomCompleted++; pomPhase = 'break'; pomSeconds = BREAK_TIME; }
      else { pomPhase = 'focus'; pomSeconds = FOCUS_TIME; }
    }
    render();
  }, 1000);
}

// ============= NAVIGATION =============
function navigate(section) {
  // Stop session timer if leaving session view while running
  currentSection = section;
  editingTaskId = null;
  confirmDeleteId = null;
  render();
  if (mobileOpen) toggleMobile();
}

function toggleMobile() {
  mobileOpen = !mobileOpen;
  document.getElementById('sidebar').classList.toggle('open', mobileOpen);
  document.getElementById('overlay').classList.toggle('show', mobileOpen);
  document.getElementById('mobile-toggle').innerHTML = mobileOpen ? icons.x : icons.menu;
}

// ============= INIT =============
document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('mobile-toggle').onclick = toggleMobile;
  document.getElementById('overlay').onclick = toggleMobile;
  document.querySelectorAll('.nav-btn').forEach(b => {
    b.onclick = () => navigate(b.dataset.section);
  });
  render();
});
