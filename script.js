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
        document.getElementById('proposalQuestion').style.animationPlayState = 'running';
      }, 400);
    }
  }, 55);
}

/* ============================================================
   HERO — NO BUTTON ESCAPE LOGIC
   ============================================================ */
function handleNo(e) {
  e.preventDefault();
  e.stopPropagation();
  noClickCount++;

  const noBtn  = document.getElementById('noBtn');
  const msgEl  = document.getElementById('noMessage');

  // Pick a random playful message
  const msg = NO_MESSAGES[Math.floor(Math.random() * NO_MESSAGES.length)];
  msgEl.textContent = msg;
  msgEl.style.opacity = '1';
  setTimeout(() => { msgEl.style.opacity = '0'; }, 1800);

  // Move button to random safe position
  moveNoButton(noBtn);

  // Increase difficulty over attempts: sometimes resize button too
  if (noClickCount > 3) {
    const scale = Math.max(0.55, 1 - noClickCount * 0.06);
    noBtn.style.transform = `scale(${scale})`;
  }
}

function moveNoButton(btn) {
  const margin = 20;
  const bw = btn.offsetWidth  || 120;
  const bh = btn.offsetHeight || 48;
  const maxX = window.innerWidth  - bw - margin;
  const maxY = window.innerHeight - bh - margin;

  const x = Math.random() * (maxX - margin) + margin;
  const y = Math.random() * (maxY - margin) + margin;

  btn.style.position = 'fixed';
  btn.style.left     = x + 'px';
  btn.style.top      = y + 'px';
  btn.style.bottom   = 'auto';
  btn.style.right    = 'auto';
  btn.style.transition = 'left 0.25s ease, top 0.25s ease, transform 0.3s ease';
  btn.style.zIndex   = '9000';
}

// On desktop: escape before mouse reaches NO
function setupNoHoverEscape() {
  const noBtn = document.getElementById('noBtn');
  noBtn.addEventListener('mousemove', (e) => {
    if (noClickCount >= 0) {
      moveNoButton(noBtn);
    }
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
  createHeartBurst(window.innerWidth / 2, window.innerHeight / 2, 24);

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
    const dist  = 120 + Math.random() * 200;
    const rad   = (angle * Math.PI) / 180;
    el.style.setProperty('--tx', Math.cos(rad) * dist + 'px');
    el.style.setProperty('--ty', Math.sin(rad) * dist + 'px');
    el.style.animationDelay = Math.random() * 0.3 + 's';
    el.style.fontSize = (1 + Math.random() * 0.8) + 'rem';

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

  for (let i = 0; i < 160; i++) {
    particles.push({
      x:    Math.random() * canvas.width,
      y:    Math.random() * canvas.height - canvas.height,
      w:    6 + Math.random() * 8,
      h:    8 + Math.random() * 10,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      rot:  Math.random() * 360,
      rotSpeed: (Math.random() - 0.5) * 6,
      vy:   2 + Math.random() * 4,
      vx:   (Math.random() - 0.5) * 2,
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

  // Stop after 6 seconds
  setTimeout(() => {
    cancelAnimationFrame(frame);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }, 6000);
}

/* ============================================================
   SHOW DATE SECTION
   ============================================================ */
function showDateSection() {
  showSection('dateSection');
  // Set min date to today
  const today = new Date().toISOString().split('T')[0];
  document.getElementById('dateInput').min = today;
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
  if (!dateInput.value) {
    showFieldError('dateError', 'dateInput');
    valid = false;
  } else {
    clearFieldError('dateError', 'dateInput');
  }

  // Validate time
  if (!timeInput.value) {
    showFieldError('timeError', 'timeInput');
    valid = false;
  } else {
    clearFieldError('timeError', 'timeInput');
  }

  // Validate message
  if (!msgInput.value.trim()) {
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
    'Her Message:',
    message,
    '',
    'I said YES to the date! 🥰',
  ].join('\n');

  const encoded  = encodeURIComponent(waText);
  const waURL    = `https://wa.me/${WHATSAPP_NUMBER}?text=${encoded}`;

  // Open WhatsApp
  window.open(waURL, '_blank');

  // Show thank you screen
  setTimeout(() => {
    showSection('thankyouSection');
    startCountdown(dateObj);
    createHeartBurst(window.innerWidth / 2, window.innerHeight / 2, 20);
  }, 800);
}

function showFieldError(errId, inputId) {
  document.getElementById(errId).classList.add('visible');
  const input = document.getElementById(inputId);
  if (input) input.closest('.form-group').classList.add('has-error');
}

function clearFieldError(errId, inputId) {
  document.getElementById(errId).classList.remove('visible');
  const input = document.getElementById(inputId);
  if (input) input.closest('.form-group').classList.remove('has-error');
}

/* ============================================================
   COUNTDOWN TO DATE
   ============================================================ */
function startCountdown(target) {
  function update() {
    const now  = new Date();
    const diff = target - now;
    if (diff <= 0) {
      document.getElementById('cdDays').textContent  = '00';
      document.getElementById('cdHours').textContent = '00';
      document.getElementById('cdMins').textContent  = '00';
      document.getElementById('cdSecs').textContent  = '00';
      document.querySelector('.countdown-label').textContent = "It's time! 🥰";
      return;
    }
    const d = Math.floor(diff / 86400000);
    const h = Math.floor((diff % 86400000) / 3600000);
    const m = Math.floor((diff % 3600000)  / 60000);
    const s = Math.floor((diff % 60000)    / 1000);

    document.getElementById('cdDays').textContent  = String(d).padStart(2, '0');
    document.getElementById('cdHours').textContent = String(h).padStart(2, '0');
    document.getElementById('cdMins').textContent  = String(m).padStart(2, '0');
    document.getElementById('cdSecs').textContent  = String(s).padStart(2, '0');

    setTimeout(update, 1000);
  }
  update();
}

/* ============================================================
   FLOATING HEARTS (canvas background)
   ============================================================ */
function initHeartsCanvas() {
  const canvas = document.getElementById('heartsCanvas');
  const ctx    = canvas.getContext('2d');

  function resize() {
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  const hearts = [];
  const HEART_CHARS = ['❤️', '💕', '💖', '💗', '🌸', '✨'];
  const COUNT = Math.min(28, Math.floor(window.innerWidth / 40));

  for (let i = 0; i < COUNT; i++) {
    hearts.push(createHeart());
  }

  function createHeart() {
    return {
      x:     Math.random() * window.innerWidth,
      y:     window.innerHeight + Math.random() * 100,
      size:  12 + Math.random() * 22,
      speed: 0.5 + Math.random() * 1.2,
      drift: (Math.random() - 0.5) * 0.8,
      opacity: 0.2 + Math.random() * 0.5,
      char:  HEART_CHARS[Math.floor(Math.random() * HEART_CHARS.length)],
      wave:  Math.random() * Math.PI * 2,
      waveSpeed: 0.01 + Math.random() * 0.02,
    };
  }

  function drawHearts() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    hearts.forEach(h => {
      ctx.globalAlpha = h.opacity;
      ctx.font = `${h.size}px serif`;
      ctx.fillText(h.char, h.x, h.y);

      h.y     -= h.speed;
      h.x     += h.drift + Math.sin(h.wave) * 0.5;
      h.wave  += h.waveSpeed;

      if (h.y < -60) {
        // Reset
        h.y      = window.innerHeight + 30;
        h.x      = Math.random() * window.innerWidth;
        h.opacity = 0.2 + Math.random() * 0.5;
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
  setInterval(() => {
    const secs = Math.floor((Date.now() - counterStart) / 1000);
    document.getElementById('counterValue').textContent = secs.toLocaleString();
  }, 1000);
}

/* ============================================================
   QUOTES ROTATOR
   ============================================================ */
function startQuotesRotator() {
  const el = document.getElementById('quoteText');
  setInterval(() => {
    el.style.opacity = '0';
    setTimeout(() => {
      quoteIndex = (quoteIndex + 1) % QUOTES.length;
      el.textContent = QUOTES[quoteIndex];
      el.style.opacity = '1';
    }, 600);
  }, 5000);
  // Also set transition
  el.style.transition = 'opacity 0.6s ease';
}

/* ============================================================
   REASONS CAROUSEL
   ============================================================ */
function initReasonsCarousel() {
  const track = document.getElementById('reasonsTrack');
  const dotsEl = document.getElementById('reasonsDots');

  // Build dots
  REASONS.forEach((_, i) => {
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
  }, 3200);
}

/* ============================================================
   BACKGROUND MUSIC (Web Audio API — procedural romantic melody)
   ============================================================ */
function initMusicButton() {
  const btn = document.getElementById('musicBtn');
  btn.addEventListener('click', toggleMusic);
}

function tryAutoplayMusic() {
  if (!musicPlaying) {
    startMusic();
  }
}

function toggleMusic() {
  if (musicPlaying) {
    stopMusic();
    document.getElementById('musicBtn').innerHTML = '<span class="music-icon">🎵</span><span class="music-label">Music</span>';
  } else {
    startMusic();
    document.getElementById('musicBtn').innerHTML = '<span class="music-icon">🔊</span><span class="music-label">Pause</span>';
  }
}

function startMusic() {
  try {
    if (!audioCtx) {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioCtx.state === 'suspended') audioCtx.resume();

    // Simple romantic waltz melody (C major pentatonic-ish)
    // Note frequencies
    const notes = {
      C4: 261.63, D4: 293.66, E4: 329.63, F4: 349.23,
      G4: 392.00, A4: 440.00, B4: 493.88, C5: 523.25,
      D5: 587.33, E5: 659.25, G5: 783.99, A5: 880.00,
    };

    // A gentle repeating 8-bar melody
    const melody = [
      { note: 'E4', dur: 0.6 }, { note: 'G4', dur: 0.4 },
      { note: 'A4', dur: 0.8 }, { note: 'G4', dur: 0.4 },
      { note: 'E4', dur: 0.6 }, { note: 'D4', dur: 0.4 },
      { note: 'C4', dur: 1.0 },
      { note: 'D4', dur: 0.6 }, { note: 'E4', dur: 0.4 },
      { note: 'G4', dur: 0.8 }, { note: 'A4', dur: 0.4 },
      { note: 'C5', dur: 0.6 }, { note: 'B4', dur: 0.4 },
      { note: 'A4', dur: 1.0 },
      { note: 'E5', dur: 0.5 }, { note: 'D5', dur: 0.5 },
      { note: 'C5', dur: 0.5 }, { note: 'B4', dur: 0.5 },
      { note: 'A4', dur: 0.6 }, { note: 'G4', dur: 0.4 },
      { note: 'E4', dur: 1.0 },
      { note: 'G4', dur: 0.6 }, { note: 'A4', dur: 0.4 },
      { note: 'C5', dur: 0.8 }, { note: 'A4', dur: 0.4 },
      { note: 'G4', dur: 0.6 }, { note: 'E4', dur: 0.4 },
      { note: 'C4', dur: 1.2 },
    ];

    const masterGain = audioCtx.createGain();
    masterGain.gain.setValueAtTime(0, audioCtx.currentTime);
    masterGain.gain.linearRampToValueAtTime(0.14, audioCtx.currentTime + 0.5);
    masterGain.connect(audioCtx.destination);

    // Reverb (convolver with simple IR)
    const convolver = audioCtx.createConvolver();
    const irLen = audioCtx.sampleRate * 1.5;
    const irBuf = audioCtx.createBuffer(2, irLen, audioCtx.sampleRate);
    for (let c = 0; c < 2; c++) {
      const data = irBuf.getChannelData(c);
      for (let i = 0; i < irLen; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / irLen, 2.5);
      }
    }
    convolver.buffer = irBuf;
    const reverbGain = audioCtx.createGain();
    reverbGain.gain.value = 0.3;
    convolver.connect(reverbGain);
    reverbGain.connect(masterGain);

    let t = audioCtx.currentTime + 0.1;
    const totalDur = melody.reduce((s, m) => s + m.dur, 0);

    function scheduleMelody(startTime) {
      let time = startTime;
      melody.forEach(({ note, dur }) => {
        const osc  = audioCtx.createOscillator();
        const gain = audioCtx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(notes[note], time);

        gain.gain.setValueAtTime(0, time);
        gain.gain.linearRampToValueAtTime(0.4, time + 0.04);
        gain.gain.setValueAtTime(0.35, time + dur * 0.6);
        gain.gain.linearRampToValueAtTime(0, time + dur);

        osc.connect(gain);
        gain.connect(masterGain);
        gain.connect(convolver);

        osc.start(time);
        osc.stop(time + dur + 0.05);

        musicNodes.push(osc);
        time += dur;
      });
      return time;
    }

    // Schedule looping
    let nextStart = scheduleMelody(t);

    const loopTimer = setInterval(() => {
      if (!musicPlaying) { clearInterval(loopTimer); return; }
      nextStart = scheduleMelody(nextStart);
    }, totalDur * 1000 - 200);

    musicPlaying = true;
  } catch (err) {
    console.warn('Audio not available:', err);
  }
}

function stopMusic() {
  musicPlaying = false;
  musicNodes.forEach(n => { try { n.stop(); } catch(e) {} });
  musicNodes = [];
  if (audioCtx) {
    audioCtx.suspend();
  }
}

/* ============================================================
   INIT
   ============================================================ */
document.addEventListener('DOMContentLoaded', () => {
  // Show hero
  showSection('heroSection');

  // Delayed hero typing
  setTimeout(startHeroTyping, 1400);

  // Background canvas hearts
  initHeartsCanvas();

  // Love counter
  startLoveCounter();

  // Quotes rotator
  startQuotesRotator();

  // Reasons carousel
  initReasonsCarousel();

  // Music button
  initMusicButton();

  // NO button escape on desktop hover
  setupNoHoverEscape();

  // Remove NO button from normal flow and position it on YES side for init
  const noBtn = document.getElementById('noBtn');
  const yesBtn = document.getElementById('yesBtn');
  // Wait for layout then position NO near YES
  setTimeout(() => {
    const rect = yesBtn.getBoundingClientRect();
    noBtn.style.position = 'fixed';
    noBtn.style.left = (rect.right + 16) + 'px';
    noBtn.style.top  = rect.top + 'px';
    noBtn.style.zIndex = '9000';
  }, 3200);

  // Live-clear form errors
  ['dateInput','timeInput','messageInput'].forEach(id => {
    const el = document.getElementById(id);
    if (!el) return;
    el.addEventListener('input', () => {
      const errMap = { dateInput:'dateError', timeInput:'timeError', messageInput:'messageError' };
      if (el.value) clearFieldError(errMap[id], id);
    });
  });

  // Handle resize — re-position NO button
  window.addEventListener('resize', () => {
    const noBtn = document.getElementById('noBtn');
    if (noBtn && noBtn.style.position === 'fixed') {
      moveNoButton(noBtn);
    }
    // Resize confetti canvas if active
    const cc = document.getElementById('confettiCanvas');
    if (cc) { cc.width = window.innerWidth; cc.height = window.innerHeight; }
  });
});

/* ============================================================
   TOUCH / MOBILE: prevent NO button being caught on scroll
   ============================================================ */
document.addEventListener('touchmove', (e) => {
  const noBtn = document.getElementById('noBtn');
  if (noBtn && e.target === noBtn) {
    e.preventDefault();
    moveNoButton(noBtn);
  }
}, { passive: false });
