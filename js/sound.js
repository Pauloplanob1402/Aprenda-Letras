// ═══════════════════════════════════════════════════
//  LEARN LETTERS — Motor de Som v2
//  Volume aumentado + Musiquinha de abertura infantil
// ═══════════════════════════════════════════════════
var SoundEngine = (function() {
  var ctx = null, muted = false;

  function getCtx() {
    if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)();
    if (ctx.state === 'suspended') ctx.resume();
    return ctx;
  }

  function tone(freq, type, start, dur, vol, c, freqEnd) {
    var o = c.createOscillator();
    var g = c.createGain();
    var comp = c.createDynamicsCompressor();
    comp.threshold.value = -10; comp.ratio.value = 4;
    o.connect(g); g.connect(comp); comp.connect(c.destination);
    o.type = type;
    o.frequency.setValueAtTime(freq, start);
    if (freqEnd) o.frequency.exponentialRampToValueAtTime(freqEnd, start + dur);
    g.gain.setValueAtTime(vol, start);
    g.gain.exponentialRampToValueAtTime(0.001, start + dur);
    o.start(start); o.stop(start + dur + 0.05);
  }

  function bongo(c, t) {
    var o = c.createOscillator(), g = c.createGain();
    o.connect(g); g.connect(c.destination);
    o.type = 'sine';
    o.frequency.setValueAtTime(200, t);
    o.frequency.exponentialRampToValueAtTime(60, t + 0.12);
    g.gain.setValueAtTime(0.45, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.15);
    o.start(t); o.stop(t + 0.16);
  }

  // ── MUSIQUINHA DE ABERTURA ─────────────────────────
  // Melodia alegre e infantil — Dó Ré Mi Sol La
  function playIntroMusic() {
    if (muted) return;
    var c = getCtx();
    var now = c.currentTime + 0.15;

    // Melodia principal
    var melody = [
      [523, 0.00, 0.16], // C5
      [659, 0.16, 0.16], // E5
      [784, 0.32, 0.16], // G5
      [659, 0.48, 0.16], // E5
      [880, 0.64, 0.30], // A5
      [784, 0.94, 0.16], // G5
      [659, 1.10, 0.16], // E5
      [523, 1.26, 0.16], // C5
      [587, 1.42, 0.16], // D5
      [659, 1.58, 0.16], // E5
      [784, 1.74, 0.30], // G5
      [880, 2.04, 0.16], // A5
      [784, 2.20, 0.16], // G5
      [659, 2.36, 0.16], // E5
      [784, 2.52, 0.16], // G5
      [880, 2.68, 0.16], // A5
      [1047,2.84, 0.55], // C6 — fim épico!
    ];
    melody.forEach(function(n) { tone(n[0],'sine', now+n[1], n[2], 0.60, c); });

    // Harmonia suave
    var harm = [
      [261,0.00,0.48],[392,0.48,0.48],[440,0.96,0.48],
      [392,1.44,0.60],[261,2.04,0.48],[523,2.52,0.87],
    ];
    harm.forEach(function(n) { tone(n[0],'triangle', now+n[1], n[2], 0.28, c); });

    // Bongos rítmicos
    [0.00,0.32,0.64,0.96,1.26,1.58,1.90,2.20,2.52,2.84].forEach(function(t) {
      bongo(c, now+t);
    });

    // Brilhos no topo
    [0.64,1.26,1.90,2.84].forEach(function(t) {
      tone(2093,'sine', now+t, 0.10, 0.18, c);
    });
  }

  // ── ACERTO ─────────────────────────────────────────
  function playMatch() {
    if (muted) return;
    var c = getCtx(), now = c.currentTime;
    tone(523.25,'sine', now,        0.12, 0.75, c);
    tone(659.25,'sine', now+0.10,   0.15, 0.75, c);
    tone(1046.5,'sine', now+0.18,   0.12, 0.55, c);
  }

  // ── ERRO ───────────────────────────────────────────
  function playError() {
    if (muted) return;
    var c = getCtx(), now = c.currentTime;
    tone(220,'sawtooth', now, 0.22, 0.65, c, 110);
  }

  // ── VITÓRIA ────────────────────────────────────────
  function playVictory() {
    if (muted) return;
    var c = getCtx(), now = c.currentTime;
    [[523.25,0],[659.25,0.15],[783.99,0.30],[659.25,0.45],[1046.5,0.60]].forEach(function(n) {
      tone(n[0],'sine', now+n[1], 0.18, 0.80, c);
    });
    [523.25,659.25,783.99].forEach(function(f) { tone(f,'triangle', now+0.80, 0.6, 0.55, c); });
    tone(2093,'sine', now+0.85, 0.4, 0.40, c);
  }

  // ── DERROTA ────────────────────────────────────────
  function playDefeat() {
    if (muted) return;
    var c = getCtx(), now = c.currentTime;
    [[392,0],[349.23,0.22],[293.66,0.44],[261.63,0.66]].forEach(function(n) {
      tone(n[0],'triangle', now+n[1], 0.25, 0.65, c);
    });
  }

  // ── CLIQUE ─────────────────────────────────────────
  function playClick() {
    if (muted) return;
    var c = getCtx(), now = c.currentTime;
    tone(800,'sine', now, 0.07, 0.55, c);
  }

  // ── COMBO ──────────────────────────────────────────
  function playCombo() {
    if (muted) return;
    var c = getCtx(), now = c.currentTime;
    [660,880,1100,1320].forEach(function(f,i) { tone(f,'sine', now+i*0.07, 0.1, 0.65, c); });
  }

  // ── MOEDAS ─────────────────────────────────────────
  function playCoins() {
    if (muted) return;
    var c = getCtx(), now = c.currentTime;
    [1047,1319,1568].forEach(function(f,i) { tone(f,'sine', now+i*0.08, 0.12, 0.60, c); });
  }

  // ── STREAK ─────────────────────────────────────────
  function playStreak() {
    if (muted) return;
    var c = getCtx(), now = c.currentTime;
    [440,554,659,880,1108].forEach(function(f,i) { tone(f,'sine', now+i*0.1, 0.12, 0.65, c); });
  }

  // ── MUTE ───────────────────────────────────────────
  function toggleMute() {
    muted = !muted;
    var btn = document.getElementById('btn-mute');
    if (btn) btn.textContent = muted ? '🔇' : '🔊';
    return muted;
  }

  return {
    playMatch:playMatch, playError:playError, playVictory:playVictory,
    playDefeat:playDefeat, playClick:playClick, playCombo:playCombo,
    playCoins:playCoins, playStreak:playStreak, playIntroMusic:playIntroMusic,
    toggleMute:toggleMute
  };
})();
