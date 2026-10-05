const TARGET = 8;
const DATA_KEY = 'hydrate-data';
const SETTINGS_KEY = 'hydrate-settings';
const CIRC = 2 * Math.PI * 70;
const $ = id => document.getElementById(id);

let count = 0;
let celebrated = false;
let reminderTimer = null;
let toastTimer = null;
let currentDay = todayStr();

function todayStr() {
  const d = new Date();
  return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
}

function saveData() {
  try { localStorage.setItem(DATA_KEY, JSON.stringify({ date: todayStr(), count, celebrated })); } catch (e) {}
}

function loadData() {
  try {
    const saved = JSON.parse(localStorage.getItem(DATA_KEY));
    if (saved && saved.date === todayStr()) {
      count = Number(saved.count) || 0;
      celebrated = !!saved.celebrated;
    }
  } catch (e) {}
}

function render() {
  $('counter').textContent = count + ' / ' + TARGET + ' glasses';
  const progress = Math.min(count / TARGET, 1);
  $('ringFilled').style.strokeDashoffset = CIRC * (1 - progress);
}

function rolloverIfNewDay() {
  if (todayStr() !== currentDay) {
    currentDay = todayStr();
    count = 0;
    celebrated = false;
    render();
  }
}

function pulseCard() {
  const card = document.querySelector('.counter-card');
  card.classList.remove('pulse');
  void card.offsetWidth;
  card.classList.add('pulse');
}

/* ---------- Confetti ---------- */
const canvas = $('confetti');
const ctx = canvas.getContext('2d');
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
let pieces = [];
let rafId = null;
let confettiEnd = 0;

function startConfetti() {
  if (reduceMotion) return;
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  const colors = ['#ffffff', '#bfdbfe', '#93c5fd', '#fde68a', '#fbcfe8'];
  pieces = Array.from({ length: 120 }, () => ({
    x: Math.random() * canvas.width,
    y: -20 - Math.random() * canvas.height * 0.5,
    w: 6 + Math.random() * 6,
    h: 10 + Math.random() * 8,
    vx: -1 + Math.random() * 2,
    vy: 2 + Math.random() * 3,
    rot: Math.random() * Math.PI,
    vr: -0.1 + Math.random() * 0.2,
    color: colors[Math.floor(Math.random() * colors.length)]
  }));
  confettiEnd = performance.now() + 3000;
  cancelAnimationFrame(rafId);
  rafId = requestAnimationFrame(tick);
}

function tick(now) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  pieces.forEach(p => {
    p.x += p.vx;
    p.y += p.vy;
    p.rot += p.vr;
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate(p.rot);
    ctx.fillStyle = p.color;
    ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
    ctx.restore();
  });
  if (now < confettiEnd) {
    rafId = requestAnimationFrame(tick);
  } else {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }
}

function stopConfetti() {
  cancelAnimationFrame(rafId);
  ctx.clearRect(0, 0, canvas.width, canvas.height);
}

/* ---------- Celebration ---------- */
function showCelebration() {
  $('celebration').classList.add('show');
  $('keepBtn').focus();
  startConfetti();
}

function hideCelebration() {
  $('celebration').classList.remove('show');
  stopConfetti();
}

/* ---------- Counter buttons ---------- */
$('addBtn').addEventListener('click', () => {
  rolloverIfNewDay();
  count++;
  pulseCard();
  render();
  if (count >= TARGET && !celebrated) {
    celebrated = true;
    showCelebration();
  }
  saveData();
});

$('removeBtn').addEventListener('click', () => {
  rolloverIfNewDay();
  if (count > 0) count--;
  pulseCard();
  render();
  saveData();
});

$('keepBtn').addEventListener('click', hideCelebration);

document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && $('celebration').classList.contains('show')) hideCelebration();
});

/* Reset the count if the tab stays open past midnight */
document.addEventListener('visibilitychange', rolloverIfNewDay);
setInterval(rolloverIfNewDay, 60000);

/* ---------- Reminders ---------- */
function showToast(msg) {
  const t = $('toast');
  t.textContent = msg;
  t.classList.add('visible');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove('visible'), 5000);
}

function remind() {
  const msg = 'Time to drink a glass of water';
  if ('Notification' in window && Notification.permission === 'granted') {
    try {
      new Notification('Hydrate', { body: msg });
      return;
    } catch (e) {
      /* some mobile browsers block this constructor; fall back to the toast */
    }
  }
  showToast(msg);
}

function stopReminders() {
  clearInterval(reminderTimer);
  reminderTimer = null;
}

function startReminders() {
  stopReminders();
  const minutes = parseInt($('intervalSelect').value, 10);
  reminderTimer = setInterval(remind, minutes * 60 * 1000);
}

function saveSettings() {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify({
      enabled: $('reminderToggle').checked,
      interval: $('intervalSelect').value
    }));
  } catch (e) {}
}

function loadSettings() {
  try {
    const s = JSON.parse(localStorage.getItem(SETTINGS_KEY));
    if (!s) return;
    if (['30', '60', '120'].includes(String(s.interval))) {
      $('intervalSelect').value = String(s.interval);
    }
    $('reminderToggle').checked = !!s.enabled;
    if (s.enabled) startReminders();
  } catch (e) {}
}

$('reminderToggle').addEventListener('change', async () => {
  if ($('reminderToggle').checked) {
    if ('Notification' in window && Notification.permission === 'default') {
      try { await Notification.requestPermission(); } catch (e) {}
    }
    startReminders();
    showToast('Reminders on');
  } else {
    stopReminders();
  }
  saveSettings();
});

$('intervalSelect').addEventListener('change', () => {
  if ($('reminderToggle').checked) startReminders();
  saveSettings();
});

/* ---------- Init ---------- */
$('ringFilled').style.strokeDasharray = CIRC;
$('ringFilled').style.strokeDashoffset = CIRC;
loadData();
loadSettings();
render();
