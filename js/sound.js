// ═══════════════════════════════════════════════════
//  LEARN LETTERS — Motor de Som (Web Audio API)
//  Sem arquivos externos — sons gerados por código!
// ═══════════════════════════════════════════════════

const SoundEngine = (() => {
  let ctx = null;
  let muted = false;

  function getCtx() {
    if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)();
    if (ctx.state === 'suspended') ctx.resume();
    return ctx;
  }

  // ── Utilitário: toca um oscilador simples ──────────
  function playTone(freq, type, startTime, duration, gainVal, ctx) {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = type;
    osc.frequency.setValueAtTime(freq, startTime);
    gain.gain.setValueAtTime(gainVal, startTime);
    gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);
    osc.start(startTime);
    osc.stop(startTime + duration);
  }

  // ── 1. SOM DE ACERTO (par combinado) ──────────────
  // Dois tons ascendentes, alegres e curtos
  function playMatch() {
    if (muted) return;
    const c = getCtx();
    const now = c.currentTime;
    playTone(523.25, 'sine', now,        0.12, 0.3, c);  // C5
    playTone(659.25, 'sine', now + 0.10, 0.15, 0.3, c);  // E5
    // Pequeno brilho agudo
    playTone(1046.5, 'sine', now + 0.18, 0.10, 0.15, c); // C6
  }

  // ── 2. SOM DE ERRO (seleção errada) ───────────────
  // Tom grave descendente, curto e discreto
  function playError() {
    if (muted) return;
    const c = getCtx();
    const now = c.currentTime;
    const osc = c.createOscillator();
    const gain = c.createGain();
    osc.connect(gain);
    gain.connect(c.destination);
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(220, now);
    osc.frequency.exponentialRampToValueAtTime(110, now + 0.2);
    gain.gain.setValueAtTime(0.25, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);
    osc.start(now);
    osc.stop(now + 0.25);
  }

  // ── 3. SOM DE VITÓRIA (passou de fase) ─────────────
  // Fanfarra ascendente com 5 notas comemorativas
  function playVictory() {
    if (muted) return;
    const c = getCtx();
    const now = c.currentTime;
    // Melodia: C E G E C (oitava acima) + acorde final
    const notes = [
      { f: 523.25, t: now + 0.00, d: 0.18 },  // C5
      { f: 659.25, t: now + 0.15, d: 0.18 },  // E5
      { f: 783.99, t: now + 0.30, d: 0.18 },  // G5
      { f: 659.25, t: now + 0.45, d: 0.18 },  // E5
      { f: 1046.5, t: now + 0.60, d: 0.35 },  // C6
    ];
    notes.forEach(n => playTone(n.f, 'sine', n.t, n.d, 0.35, c));

    // Acorde final sustentado (C + E + G)
    playTone(523.25, 'triangle', now + 0.80, 0.6, 0.2, c);
    playTone(659.25, 'triangle', now + 0.80, 0.6, 0.2, c);
    playTone(783.99, 'triangle', now + 0.80, 0.6, 0.2, c);

    // Brilho agudo final
    playTone(2093,   'sine',     now + 0.85, 0.4, 0.1, c);
  }

  // ── 4. SOM DE DERROTA (perdeu o nível) ─────────────
  // Sequência descendente triste
  function playDefeat() {
    if (muted) return;
    const c = getCtx();
    const now = c.currentTime;
    const notes = [
      { f: 392.00, t: now + 0.00, d: 0.25 },  // G4
      { f: 349.23, t: now + 0.22, d: 0.25 },  // F4
      { f: 293.66, t: now + 0.44, d: 0.25 },  // D4
      { f: 261.63, t: now + 0.66, d: 0.45 },  // C4
    ];
    notes.forEach(n => playTone(n.f, 'triangle', n.t, n.d, 0.3, c));
  }

  // ── 5. SOM DE CLIQUE (selecionar peça) ─────────────
  function playClick() {
    if (muted) return;
    const c = getCtx();
    const now = c.currentTime;
    playTone(800, 'sine', now, 0.07, 0.15, c);
  }

  // ── Botão de mute ──────────────────────────────────
  function toggleMute() {
    muted = !muted;
    const btn = document.getElementById('btn-mute');
    if (btn) btn.textContent = muted ? '🔇' : '🔊';
    return muted;
  }

  function isMuted() { return muted; }

  return { playMatch, playError, playVictory, playDefeat, playClick, toggleMute, isMuted };
})();
