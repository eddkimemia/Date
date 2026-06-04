/* ============================================================
   ROMANTIC PROPOSAL WEBSITE — script.js
   All interactivity, animations, timers, and integrations
   ============================================================ */

'use strict';

/* ============================================================
   CONSTANTS & STATE
   ============================================================ */
const WHATSAPP_NUMBER = '254715135141'; // no +

const QUOTES = [
  '"Love is not just looking at each other, it\'s looking in the same direction."',
  '"You are the finest, loveliest, tenderest person I have ever known."',
  '"In all the world, there is no heart for me like yours."',
  '"I carry your heart with me — I carry it in my heart."',
  '"To the world you may be one person, but to one person you may be the world."',
  '"You make me feel alive in ways I never knew were possible."',
  '"Every love story is beautiful, but ours is my favorite."',
  '"Being deeply loved by someone gives you strength."',
  '"Where there is love there is life."',
  '"You are my today and all of my tomorrows."',
  '"I love you not only for what you are, but for what I am when I am with you."',
  '"If I had a flower for every time I thought of you... I could walk through my garden forever."',
  '"You are my sun, my moon, and all my stars."',
  '"Grow old along with me! The best is yet to be."',
  '"I have found the one whom my soul loves."',
];

const NO_MESSAGES = [
  'Are you sure? 😏',
  'Try again 😂',
  'Nice try 😘',
  'You can\'t escape love ❤️',
  'Still no? 🤭',
  'Come on... 🥺',
  'I believe in you 😅',
  'Almost clicked YES? 😍',
  'One more try! 💕',
  'This button hates you 😂',
  'Catch me if you can 😜',
  'Love always wins 💌',
];

const REASONS = [
  '💛 Your smile lights up my entire day',
  '🌙 You make ordinary moments feel magical',
  '💬 I love every conversation with you',
  '✨ You inspire me to be better',
  '🌸 Your laugh is my favorite sound',
  '💫 You see beauty in everything',
  '🔥 Your passion for life is contagious',
  '🫂 Your hugs feel like home',
  '🍩 You are the sprinkle on my donut of life',
  '🎨 You color my world with happiness',
  '🧩 You are the missing piece to my puzzle',
  '🍀 I am so lucky to have you in my life',
  '💝 You have the kindest soul I know',
];

const DATE_IDEAS = [
  'A cozy picnic at the park 🧺',
  'A romantic dinner under the stars 🕯️',
  'Watching the sunset at the beach 🌅',
  'A fun night at the movies 🍿',
  'Exploring a beautiful botanical garden 🌺',
  'Stargazing with hot chocolate ☕',
  'A spontaneous road trip 🚗',
  'Visiting an art gallery together 🎨',
  'Ice cream date and a long walk 🍦',
  'Cooking a new recipe together at home 🍳'
];

let noClickCount    = 0;    // how many times NO was attempted
let currentReason   = 0;    // carousel index
let quoteIndex      = 0;    // current quote index
let counterStart    = Date.now();
let dateTarget      = null; // Date selected for countdown
let audioCtx        = null; // Web Audio context for music
let musicPlaying    = false;
let musicNodes      = [];   // track active oscillators

/* ============================================================
   SECTION NAVIGATION
   ============================================================ */
function showSection(id) {
  document.querySelectorAll('.section').forEach(s => {
    s.classList.remove('active');
  });
  const target = document.getElementById(id);
  if (target) {
    target.classList.add('active');
    target.scrollTop = 0;
  }
}

/* ============================================================
   HERO — TYPING ANIMATION
   ============================================================ */
function startHeroTyping() {
  const subEl = document.getElementById('heroSub');
  const text   = "I have something important to ask you...";
  if (!subEl) return;
  subEl.textContent = '';
  subEl.classList.add('typing-cursor');

  let i = 0;
  const typeInterval = setInterval(() => {
    if (i < text.length) {
      subEl.textContent += text[i];
      i++;
    } else {
      clearInterval(typeInterval);
      subEl.classList.remove('typing-cursor');
      // Reveal question after typing
      setTimeout(() => {
        const pq = document.getElementById('proposalQuestion');
        if (pq) pq.style.animationPlayState = 'running';
      }, 400);
    }
  }, 55);
}

/* ============================================================
   HERO — NO BUTTON ESCAPE LOGIC
   ============================================================ */
function handleNo(e) {
  if (e) {
    e.preventDefault();
    e.stopPropagation();
  }
  noClickCount++;

  const noBtn  = document.getElementById('noBtn');
  const msgEl  = document.getElementById('noMessage');

  // Pick a random playful message
  const msg = NO_MESSAGES[Math.floor(Math.random() * NO_MESSAGES.length)];
  if (msgEl) {
    msgEl.textContent = msg;
    msgEl.style.opacity = '1';
    setTimeout(() => { msgEl.style.opacity = '0'; }, 1800);
  }

  // Move button to random safe position
  moveNoButton(noBtn);

  // Increase difficulty over attempts: sometimes resize button too
  if (noClickCount > 3) {
    const scale = Math.max(0.4, 1 - noClickCount * 0.08);
    noBtn.style.transform = `scale(${scale})`;
    noBtn.style.opacity = Math.max(0.3, 1 - noClickCount * 0.05);
  }
}

function moveNoButton(btn) {
  if (!btn) return;
  const margin = 40;
  const bw = btn.offsetWidth  || 120;
  const bh = btn.offsetHeight || 48;

  // Viewport dimensions
  const vw = Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0);
  const vh = Math.max(document.documentElement.clientHeight || 0, window.innerHeight || 0);

  const maxX = vw - bw - margin;
  const maxY = vh - bh - margin;

  let x = Math.random() * (maxX - margin) + margin;
  let y = Math.random() * (maxY - margin) + margin;

  // Keep it within bounds
  x = Math.max(margin, Math.min(x, maxX));
  y = Math.max(margin, Math.min(y, maxY));

  btn.style.position = 'fixed';
  btn.style.left     = x + 'px';
  btn.style.top      = y + 'px';
  btn.style.bottom   = 'auto';
  btn.style.right    = 'auto';
  btn.style.transition = 'left 0.3s cubic-bezier(0.34, 1.56, 0.64, 1), top 0.3s cubic-bezier(0.34, 1.56, 0.64, 1), transform 0.3s ease, opacity 0.3s ease';
  btn.style.zIndex   = '9000';
}

// On desktop: escape before mouse reaches NO
function setupNoHoverEscape() {
  const noBtn = document.getElementById('noBtn');
  if (!noBtn) return;
  noBtn.addEventListener('mouseenter', (e) => {
    moveNoButton(noBtn);
  });
  // Also on touchstart for mobile
  noBtn.addEventListener('touchstart', (e) => {
    e.preventDefault();
    handleNo(e);
  }, { passive: false });
}

/* ============================================================
   YES BUTTON — CELEBRATION
   ============================================================ */
function handleYes() {
  // Burst of hearts
  createHeartBurst(window.innerWidth / 2, window.innerHeight / 2, 30);

  // Switch to celebration section after short delay
  setTimeout(() => {
    showSection('celebrationSection');
    launchConfetti();
    tryAutoplayMusic();
  }, 600);
}

function createHeartBurst(cx, cy, count) {
  const emojis = ['❤️', '💕', '💖', '💗', '🌸', '✨', '💝'];
  for (let i = 0; i < count; i++) {
    const el = document.createElement('div');
    el.className = 'heart-burst';
    el.textContent = emojis[Math.floor(Math.random() * emojis.length)];
    el.style.left = cx + 'px';
    el.style.top  = cy + 'px';

    const angle = (360 / count) * i + Math.random() * 20;
    const dist  = 150 + Math.random() * 250;
    const rad   = (angle * Math.PI) / 180;
    el.style.setProperty('--tx', Math.cos(rad) * dist + 'px');
    el.style.setProperty('--ty', Math.sin(rad) * dist + 'px');
    el.style.animationDelay = Math.random() * 0.3 + 's';
    el.style.fontSize = (1.2 + Math.random() * 1.2) + 'rem';

    document.body.appendChild(el);
    setTimeout(() => el.remove(), 1600);
  }
}

/* ============================================================
   CONFETTI
   ============================================================ */
function launchConfetti() {
  const canvas = document.getElementById('confettiCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  canvas.width  = window.innerWidth;
  canvas.height = window.innerHeight;

  const COLORS = ['#ff7aa2', '#e8547a', '#ffadc5', '#b76e79', '#ffffff', '#ffd6e0', '#ff3c6e'];
  const particles = [];

  for (let i = 0; i < 200; i++) {
    particles.push({
      x:    Math.random() * canvas.width,
      y:    Math.random() * canvas.height - canvas.height,
      w:    6 + Math.random() * 8,
      h:    8 + Math.random() * 10,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      rot:  Math.random() * 360,
      rotSpeed: (Math.random() - 0.5) * 8,
      vy:   3 + Math.random() * 5,
      vx:   (Math.random() - 0.5) * 3,
      opacity: 0.8 + Math.random() * 0.2,
    });
  }

  let frame;
  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach(p => {
      ctx.save();
      ctx.globalAlpha = p.opacity;
      ctx.fillStyle = p.color;
      ctx.translate(p.x + p.w / 2, p.y + p.h / 2);
      ctx.rotate((p.rot * Math.PI) / 180);
      ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
      ctx.restore();
      p.y  += p.vy;
      p.x  += p.vx;
      p.rot += p.rotSpeed;
      if (p.y > canvas.height + 20) p.y = -20;
    });
    frame = requestAnimationFrame(draw);
  }
  draw();

  // Stop after 8 seconds
  setTimeout(() => {
    cancelAnimationFrame(frame);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }, 8000);
}

/* ============================================================
   SHOW DATE SECTION
   ============================================================ */
function showDateSection() {
  showSection('dateSection');
  // Set min date to today
  const di = document.getElementById('dateInput');
  if (di) {
    const today = new Date().toISOString().split('T')[0];
    di.min = today;
  }
}

/* ============================================================
   SEND — WHATSAPP INTEGRATION
   ============================================================ */
function handleSend() {
  const dateInput    = document.getElementById('dateInput');
  const timeInput    = document.getElementById('timeInput');
  const msgInput     = document.getElementById('messageInput');

  let valid = true;

  // Validate date
  if (!dateInput || !dateInput.value) {
    showFieldError('dateError', 'dateInput');
    valid = false;
  } else {
    clearFieldError('dateError', 'dateInput');
  }

  // Validate time
  if (!timeInput || !timeInput.value) {
    showFieldError('timeError', 'timeInput');
    valid = false;
  } else {
    clearFieldError('timeError', 'timeInput');
  }

  // Validate message
  if (!msgInput || !msgInput.value.trim()) {
    showFieldError('messageError', 'messageInput');
    valid = false;
  } else {
    clearFieldError('messageError', 'messageInput');
  }

  if (!valid) return;

  // Format date nicely
  const dateObj  = new Date(dateInput.value + 'T' + timeInput.value);
  const dateStr  = dateObj.toLocaleDateString('en-KE', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  });
  const timeStr  = dateObj.toLocaleTimeString('en-KE', { hour: '2-digit', minute: '2-digit' });
  const message  = msgInput.value.trim();

  // Store date for countdown
  dateTarget = dateObj;

  // Build WhatsApp message
  const waText = [
    '❤️ DATE ACCEPTED ❤️',
    '',
    `Selected Date: ${dateStr}`,
    `Selected Time: ${timeStr}`,
    '',
    'My Message:',
    message,
    '',
    'I said YES to the date! 🥰',
  ].join('\n');

  const encoded  = encodeURIComponent(waText);
  const waURL    = `https://wa.me/${WHATSAPP_NUMBER}?text=${encoded}`;

  // Open WhatsApp in a new tab
  const waWindow = window.open(waURL, '_blank');
  if (!waWindow) {
    // Fallback if popup blocked
    window.location.href = waURL;
  }

  // Show thank you screen
  setTimeout(() => {
    showSection('thankyouSection');
    startCountdown(dateObj);
    createHeartBurst(window.innerWidth / 2, window.innerHeight / 2, 25);
  }, 1000);
}

function showFieldError(errId, inputId) {
  const err = document.getElementById(errId);
  const input = document.getElementById(inputId);
  if (err) err.classList.add('visible');
  if (input) input.closest('.form-group').classList.add('has-error');
}

function clearFieldError(errId, inputId) {
  const err = document.getElementById(errId);
  const input = document.getElementById(inputId);
  if (err) err.classList.remove('visible');
  if (input) input.closest('.form-group').classList.remove('has-error');
}

/* ============================================================
   COUNTDOWN TO DATE
   ============================================================ */
function startCountdown(target) {
  function update() {
    const now  = new Date();
    const diff = target - now;

    const dEl = document.getElementById('cdDays');
    const hEl = document.getElementById('cdHours');
    const mEl = document.getElementById('cdMins');
    const sEl = document.getElementById('cdSecs');
    const labelEl = document.querySelector('.countdown-label');

    if (diff <= 0) {
      if (dEl) dEl.textContent  = '00';
      if (hEl) hEl.textContent = '00';
      if (mEl) mEl.textContent  = '00';
      if (sEl) sEl.textContent  = '00';
      if (labelEl) labelEl.textContent = "It's time! 🥰";
      return;
    }
    const d = Math.floor(diff / 86400000);
    const h = Math.floor((diff % 86400000) / 3600000);
    const m = Math.floor((diff % 3600000)  / 60000);
    const s = Math.floor((diff % 60000)    / 1000);

    if (dEl) dEl.textContent  = String(d).padStart(2, '0');
    if (hEl) hEl.textContent = String(h).padStart(2, '0');
    if (mEl) mEl.textContent  = String(m).padStart(2, '0');
    if (sEl) sEl.textContent  = String(s).padStart(2, '0');

    setTimeout(update, 1000);
  }
  update();
}

/* ============================================================
   FLOATING HEARTS (canvas background)
   ============================================================ */
function initHeartsCanvas() {
  const canvas = document.getElementById('heartsCanvas');
  if (!canvas) return;
  const ctx    = canvas.getContext('2d');

  function resize() {
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  const hearts = [];
  const HEART_CHARS = ['❤️', '💕', '💖', '💗', '🌸', '✨'];
  const COUNT = Math.min(35, Math.floor(window.innerWidth / 35));

  for (let i = 0; i < COUNT; i++) {
    hearts.push(createHeart());
  }

  function createHeart() {
    return {
      x:     Math.random() * window.innerWidth,
      y:     window.innerHeight + Math.random() * 200,
      size:  14 + Math.random() * 24,
      speed: 0.6 + Math.random() * 1.5,
      drift: (Math.random() - 0.5) * 1.0,
      opacity: 0.15 + Math.random() * 0.5,
      char:  HEART_CHARS[Math.floor(Math.random() * HEART_CHARS.length)],
      wave:  Math.random() * Math.PI * 2,
      waveSpeed: 0.01 + Math.random() * 0.03,
    };
  }

  function drawHearts() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    hearts.forEach(h => {
      ctx.globalAlpha = h.opacity;
      ctx.font = `${h.size}px serif`;
      ctx.fillText(h.char, h.x, h.y);

      h.y     -= h.speed;
      h.x     += h.drift + Math.sin(h.wave) * 0.7;
      h.wave  += h.waveSpeed;

      if (h.y < -60) {
        // Reset
        h.y      = window.innerHeight + 30;
        h.x      = Math.random() * window.innerWidth;
        h.opacity = 0.15 + Math.random() * 0.5;
        h.char   = HEART_CHARS[Math.floor(Math.random() * HEART_CHARS.length)];
      }
    });
    ctx.globalAlpha = 1;
    requestAnimationFrame(drawHearts);
  }
  drawHearts();
}

/* ============================================================
   LOVE COUNTER
   ============================================================ */
function startLoveCounter() {
  counterStart = Date.now();
  const cv = document.getElementById('counterValue');
  if (!cv) return;
  setInterval(() => {
    const secs = Math.floor((Date.now() - counterStart) / 1000);
    cv.textContent = secs.toLocaleString();
  }, 1000);
}

/* ============================================================
   QUOTES ROTATOR
   ============================================================ */
function startQuotesRotator() {
  const el = document.getElementById('quoteText');
  if (!el) return;
  setInterval(() => {
    el.style.opacity = '0';
    setTimeout(() => {
      quoteIndex = (quoteIndex + 1) % QUOTES.length;
      el.textContent = QUOTES[quoteIndex];
      el.style.opacity = '1';
    }, 600);
  }, 6000);
  el.style.transition = 'opacity 0.6s ease';
}

/* ============================================================
   REASONS CAROUSEL
   ============================================================ */
function initReasonsCarousel() {
  const track = document.getElementById('reasonsTrack');
  const dotsEl = document.getElementById('reasonsDots');

  if (!track || !dotsEl) return;

  // Build cards and dots
  REASONS.forEach((reason, i) => {
    const card = document.createElement('div');
    card.className = 'reason-card';
    card.textContent = reason;
    track.appendChild(card);

    const dot = document.createElement('div');
    dot.className = 'dot' + (i === 0 ? ' active' : '');
    dot.addEventListener('click', () => goToReason(i));
    dotsEl.appendChild(dot);
  });

  function goToReason(index) {
    currentReason = index;
    track.style.transform = `translateX(-${index * 100}%)`;
    dotsEl.querySelectorAll('.dot').forEach((d, i) => {
      d.classList.toggle('active', i === index);
    });
  }

  // Auto-advance
  setInterval(() => {
    goToReason((currentReason + 1) % REASONS.length);
  }, 4000);
}

/* ============================================================
   DATE IDEA GENERATOR
   ============================================================ */
function generateDateIdea() {
  const idea = DATE_IDEAS[Math.floor(Math.random() * DATE_IDEAS.length)];
  const msgInput = document.getElementById('messageInput');
  if (msgInput) {
    msgInput.value = `I was thinking maybe: ${idea}`;
    msgInput.focus();
    clearFieldError('messageError', 'messageInput');
  }
}

/* ============================================================
   BACKGROUND MUSIC
   ============================================================ */
function initMusicButton() {
  const btn = document.getElementById('musicBtn');
  if (btn) btn.addEventListener('click', toggleMusic);
}

function tryAutoplayMusic() {
  if (!musicPlaying) {
    startMusic();
  }
}

function toggleMusic() {
  if (musicPlaying) {
    stopMusic();
    const btn = document.getElementById('musicBtn');
    if (btn) btn.innerHTML = '<span class="music-icon">🎵</span><span class="music-label">Music</span>';
  } else {
    startMusic();
    const btn = document.getElementById('musicBtn');
    if (btn) btn.innerHTML = '<span class="music-icon">🔊</span><span class="music-label">Pause</span>';
  }
}

function startMusic() {
  try {
    if (!audioCtx) {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioCtx.state === 'suspended') audioCtx.resume();

    const notes = {
      C4: 261.63, D4: 293.66, E4: 329.63, F4: 349.23,
      G4: 392.00, A4: 440.00, B4: 493.88, C5: 523.25,
      D5: 587.33, E5: 659.25, G5: 783.99, A5: 880.00,
    };

    const melody = [
      { note: 'E4', dur: 0.6 }, { note: 'G4', dur: 0.4 },
      { note: 'A4', dur: 0.8 }, { note: 'G4', dur: 0.4 },
      { note: 'E4', dur: 0.6 }, { note: 'D4', dur: 0.4 },
      { note: 'C4', dur: 1.0 },
      { note: 'D4', dur: 0.6 }, { note: 'E4', dur: 0.4 },
      { note: 'G4', dur: 0.8 }, { note: 'A4', dur: 0.4 },
      { note: 'C5', dur: 0.6 }, { note: 'B4', dur: 0.4 },
      { note: 'A4', dur: 1.0 },
    ];

    const masterGain = audioCtx.createGain();
    masterGain.gain.setValueAtTime(0, audioCtx.currentTime);
    masterGain.gain.linearRampToValueAtTime(0.12, audioCtx.currentTime + 0.5);
    masterGain.connect(audioCtx.destination);

    function scheduleMelody(startTime) {
      let time = startTime;
      melody.forEach(({ note, dur }) => {
        const osc  = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(notes[note], time);
        gain.gain.setValueAtTime(0, time);
        gain.gain.linearRampToValueAtTime(0.3, time + 0.05);
        gain.gain.linearRampToValueAtTime(0, time + dur);
        osc.connect(gain);
        gain.connect(masterGain);
        osc.start(time);
        osc.stop(time + dur);
        musicNodes.push(osc);
        time += dur;
      });
      return time;
    }

    let nextStart = scheduleMelody(audioCtx.currentTime + 0.1);
    const totalDur = melody.reduce((s, m) => s + m.dur, 0);

    const loopTimer = setInterval(() => {
      if (!musicPlaying) { clearInterval(loopTimer); return; }
      nextStart = scheduleMelody(nextStart);
    }, totalDur * 1000 - 100);

    musicPlaying = true;
  } catch (err) {
    console.warn('Audio issues:', err);
  }
}

function stopMusic() {
  musicPlaying = false;
  musicNodes.forEach(n => { try { n.stop(); } catch(e) {} });
  musicNodes = [];
  if (audioCtx) audioCtx.suspend();
}

/* ============================================================
   INIT
   ============================================================ */
document.addEventListener('DOMContentLoaded', () => {
  const urlParams = new URLSearchParams(window.location.search);
  const name = urlParams.get('name');
  if (name) {
    const greetingEl = document.getElementById('heroGreeting');
    if (greetingEl) greetingEl.textContent = `Hey ${name} ❤️`;
  }

  showSection('heroSection');
  setTimeout(startHeroTyping, 1200);
  initHeartsCanvas();
  startLoveCounter();
  startQuotesRotator();
  initReasonsCarousel();
  initMusicButton();
  setupNoHoverEscape();

  const yesBtn = document.getElementById('yesBtn');
  const noBtn = document.getElementById('noBtn');
  if (yesBtn && noBtn) {
    setTimeout(() => {
      const rect = yesBtn.getBoundingClientRect();
      noBtn.style.position = 'fixed';
      noBtn.style.left = (rect.right + 20) + 'px';
      noBtn.style.top = rect.top + 'px';
    }, 3000);
  }

  ['dateInput','timeInput','messageInput'].forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      el.addEventListener('input', () => {
        const errMap = { dateInput:'dateError', timeInput:'timeError', messageInput:'messageError' };
        if (el.value) clearFieldError(errMap[id], id);
      });
    }
  });

  window.addEventListener('resize', () => {
    if (noBtn && noBtn.style.position === 'fixed') moveNoButton(noBtn);
  });
});

window.handleYes = handleYes;
window.handleNo = handleNo;
window.showDateSection = showDateSection;
window.handleSend = handleSend;
window.generateDateIdea = generateDateIdea;
