// ═══════════════════════════════════════════════════
//  LEARN LETTERS — Engine do Jogo (revisado)
// ═══════════════════════════════════════════════════

const SAVE_KEY = 'learn-letters_save';

let state = {
  currentLevel: 0,
  selected: null,
  tiles: [],
  moves: 0,
  score: 0,
  hintsLeft: 3,
  timerInterval: null,
  timeLeft: 0,
  gameActive: false,
  hintTiles: [],
};

// ─── SAVE / LOAD ───────────────────────────────────
function getProgress() {
  return JSON.parse(localStorage.getItem(SAVE_KEY) || '{}');
}
function saveLevel(levelIdx, stars) {
  const p = getProgress();
  const key = 'lvl_' + levelIdx;
  if (!p[key] || p[key] < stars) p[key] = stars;
  localStorage.setItem(SAVE_KEY, JSON.stringify(p));
}
function getLevelStars(levelIdx) {
  return getProgress()['lvl_' + levelIdx] || 0;
}
function isLevelUnlocked(levelIdx) {
  if (levelIdx === 0) return true;
  return getLevelStars(levelIdx - 1) > 0;
}

// ─── SCREEN NAVIGATION ─────────────────────────────
function showScreen(id) {
  document.querySelectorAll('.screen').forEach(function(s) { s.classList.remove('active'); });
  document.getElementById(id).classList.add('active');
}
function showMenu()        { stopTimer(); showScreen('screen-menu'); }
function showHowTo()       { showScreen('screen-howto'); }
function showLevelSelect() { stopTimer(); buildLevelGrid(); showScreen('screen-levels'); }
function goToLevels()      { closeModal('modal-confirm'); showLevelSelect(); }
function confirmBack()     { if (state.gameActive) openModal('modal-confirm'); else showLevelSelect(); }
function closeModal(id)    { document.getElementById(id).classList.add('hidden'); }
function openModal(id)     { document.getElementById(id).classList.remove('hidden'); }

// ─── LEVEL GRID ────────────────────────────────────
function buildLevelGrid() {
  var grid = document.getElementById('levels-grid');
  grid.innerHTML = '';
  LEVELS.forEach(function(lvl, i) {
    var stars     = getLevelStars(i);
    var unlocked  = isLevelUnlocked(i);
    var completed = stars > 0;
    var btn       = document.createElement('button');
    var cls       = completed ? 'completed' : (unlocked ? 'unlocked' : 'locked');
    btn.className = 'level-btn ' + cls;
    var starStr   = completed
      ? '⭐'.repeat(stars) + '☆'.repeat(3 - stars)
      : (unlocked ? '' : '🔒');
    btn.innerHTML = '<span>' + (i + 1) + '</span><span class="level-stars">' + starStr + '</span>';
    btn.title     = lvl.name;
    if (unlocked) (function(idx){ btn.onclick = function(){ startLevel(idx); }; })(i);
    grid.appendChild(btn);
  });
}

// ─── LAYOUT GENERATOR (sem duplicatas) ─────────────
function generateLayout(levelDef) {
  var cols   = levelDef.cols;
  var rows   = levelDef.rows;
  var layers = levelDef.layers;
  var layout = levelDef.layout;
  var set    = {};
  var positions = [];

  function add(col, row, layer) {
    if (col < 0 || row < 0 || col >= cols || row >= rows || layer < 0) return;
    var key = col + ',' + row + ',' + layer;
    if (set[key]) return;
    set[key] = true;
    positions.push({ col: col, row: row, layer: layer });
  }

  if (layout === 'flat') {
    for (var c = 0; c < cols; c++)
      for (var r = 0; r < rows; r++)
        add(c, r, 0);

  } else if (layout === 'pyramid') {
    for (var c = 0; c < cols; c++)
      for (var r = 0; r < rows; r++)
        add(c, r, 0);
    for (var l = 1; l < layers; l++)
      for (var c = l; c < cols - l; c++)
        for (var r = l; r < rows - l; r++)
          add(c, r, l);

  } else if (layout === 'cross') {
    var midC = Math.floor(cols / 2);
    var midR = Math.floor(rows / 2);
    for (var c = 0; c < cols; c++) {
      for (var dr = -1; dr <= 1; dr++) add(c, midR + dr, 0);
    }
    for (var r = 0; r < rows; r++) {
      for (var dc = -1; dc <= 1; dc++) add(midC + dc, r, 0);
    }
    for (var l = 1; l < layers; l++)
      for (var c = midC - 1; c <= midC + 1; c++)
        for (var r = midR - 1; r <= midR + 1; r++)
          add(c, r, l);

  } else if (layout === 'diamond') {
    var cx = (cols - 1) / 2;
    var cy = (rows - 1) / 2;
    for (var l = 0; l < layers; l++) {
      var sc = cx - l, sr = cy - l;
      if (sc <= 0 || sr <= 0) break;
      for (var c = 0; c < cols; c++)
        for (var r = 0; r < rows; r++)
          if (Math.abs(c - cx) / sc + Math.abs(r - cy) / sr <= 1.05)
            add(c, r, l);
    }

  } else if (layout === 'castle') {
    for (var c = 0; c < cols; c++)
      for (var r = 0; r < rows; r++)
        if (c === 0 || c === cols-1 || r === 0 || r === rows-1 || (c % 2 === 0 && r % 2 === 0))
          add(c, r, 0);
    for (var l = 1; l < layers; l++)
      for (var c = l; c < cols - l; c += 2)
        for (var r = l; r < rows - l; r += 2)
          add(c, r, l);

  } else if (layout === 'spiral') {
    for (var c = 0; c < cols; c++)
      for (var r = 0; r < rows; r++)
        add(c, r, 0);
    for (var l = 1; l < layers; l++)
      for (var c = l; c < cols - l; c++)
        for (var r = l; r < rows - l; r++)
          if ((c + r) % 2 === 0) add(c, r, l);
  }

  return positions;
}

// ─── BUILD TILES ───────────────────────────────────
function buildTiles(levelDef) {
  var positions  = generateLayout(levelDef);
  var letters    = levelDef.letters.split('');
  var maxPairs   = Math.floor(positions.length / 2);
  var numPairs   = Math.min(levelDef.pairs, maxPairs);
  var needed     = numPairs * 2;

  shuffle(positions);
  var used = positions.slice(0, needed);

  var pool = [];
  for (var i = 0; i < numPairs; i++) {
    var letter = letters[i % letters.length];
    pool.push(letter, letter);
  }
  shuffle(pool);

  return used.map(function(pos, idx) {
    return { id: idx, col: pos.col, row: pos.row, layer: pos.layer, letter: pool[idx], removed: false };
  });
}

function shuffle(arr) {
  for (var i = arr.length - 1; i > 0; i--) {
    var j = Math.floor(Math.random() * (i + 1));
    var tmp = arr[i]; arr[i] = arr[j]; arr[j] = tmp;
  }
  return arr;
}

// ─── TILE BLOCKING ─────────────────────────────────
// Peça livre = não removida + nada exatamente em cima (mesma col/row, layer+1)
function isTileFree(tile, tiles) {
  if (tile.removed) return false;
  for (var i = 0; i < tiles.length; i++) {
    var other = tiles[i];
    if (other.removed || other.id === tile.id) continue;
    if (other.layer === tile.layer + 1 &&
        other.col  === tile.col &&
        other.row  === tile.row) {
      return false;
    }
  }
  return true;
}

// ─── ADAPTIVE TILE SIZING ──────────────────────────
var TILE_MAX   = 88;
var TILE_MIN   = 28;
var TILE_RATIO = 1.18;

function calcTileSize(cols, rows, maxLayer, availW, availH) {
  for (var tw = TILE_MAX; tw >= TILE_MIN; tw--) {
    var th = Math.round(tw * TILE_RATIO);
    var lo = Math.max(3, Math.round(tw * 0.09));
    var totalW = cols * tw + maxLayer * lo + 8;
    var totalH = rows * th + maxLayer * lo + 8;
    if (totalW <= availW && totalH <= availH) return { tw: tw, th: th, lo: lo };
  }
  var tw = TILE_MIN;
  return { tw: tw, th: Math.round(tw * TILE_RATIO), lo: 3 };
}

// ─── RENDER ────────────────────────────────────────
function renderBoard() {
  var board = document.getElementById('board');
  board.innerHTML = '';

  var allTiles    = state.tiles;
  var activeTiles = allTiles.filter(function(t) { return !t.removed; });
  if (activeTiles.length === 0) { updateFooter(); return; }

  var maxCol   = Math.max.apply(null, allTiles.map(function(t){ return t.col; }));
  var maxRow   = Math.max.apply(null, allTiles.map(function(t){ return t.row; }));
  var maxLayer = Math.max.apply(null, allTiles.map(function(t){ return t.layer; }));
  var cols = maxCol + 1;
  var rows = maxRow + 1;

  var container = document.querySelector('.board-container');
  var availW    = Math.floor(container.clientWidth)  - 8;
  var availH    = Math.floor(container.clientHeight) - 8;

  var sz     = calcTileSize(cols, rows, maxLayer, availW, availH);
  var tw = sz.tw, th = sz.th, lo = sz.lo;

  var boardW = cols * tw + maxLayer * lo + 8;
  var boardH = rows * th + maxLayer * lo + 8;

  board.style.width     = boardW + 'px';
  board.style.height    = boardH + 'px';
  board.style.transform = 'none';

  var scale = Math.min(availW / boardW, availH / boardH, 1);
  if (scale < 0.999) board.style.transform = 'scale(' + scale.toFixed(3) + ')';

  var fontSize = Math.max(11, Math.round(tw * 0.58));

  var sorted = activeTiles.slice().sort(function(a, b) { return a.layer - b.layer; });

  sorted.forEach(function(tile) {
    var free = isTileFree(tile, state.tiles);
    var el   = document.createElement('div');
    el.className     = 'tile appearing' + (free ? '' : ' blocked');
    el.dataset.id    = tile.id;
    el.dataset.layer = tile.layer;

    var x = tile.col * tw + tile.layer * lo;
    var y = tile.row * th - tile.layer * lo;

    el.style.left      = x + 'px';
    el.style.top       = y + 'px';
    el.style.width     = (tw - 2) + 'px';
    el.style.height    = (th - 2) + 'px';
    el.style.fontSize  = fontSize + 'px';
    el.style.zIndex    = tile.layer * 1000 + tile.row * 100 + tile.col;
    el.style.color     = getLetterColor(tile.letter);

    if (state.selected && state.selected.id === tile.id) el.classList.add('selected');
    if (state.hintTiles.indexOf(tile.id) !== -1)         el.classList.add('hint-glow');

    el.textContent = tile.letter;
    if (free) {
      (function(id){ el.addEventListener('click', function(){ handleTileClick(id); }); })(tile.id);
    }

    board.appendChild(el);
  });

  updateFooter();
}

// ─── GAME LOGIC ────────────────────────────────────
function handleTileClick(tileId) {
  var tile = state.tiles.find(function(t){ return t.id === tileId; });
  if (!tile || tile.removed || !isTileFree(tile, state.tiles)) return;

  clearHints();

  if (!state.selected) {
    state.selected = tile;
    SoundEngine.playClick();
    renderBoard();
    return;
  }

  if (state.selected.id === tile.id) {
    state.selected = null;
    renderBoard();
    return;
  }

  if (state.selected.letter === tile.letter) {
    SoundEngine.playMatch();
    var id1 = state.selected.id, id2 = tile.id;
    state.selected = null;
    state.moves++;
    state.score += 100;
    removePair(id1, id2);
  } else {
    SoundEngine.playError();
    state.selected = tile;
    renderBoard();
  }
}

function removePair(id1, id2) {
  var t1 = state.tiles.find(function(t){ return t.id === id1; });
  var t2 = state.tiles.find(function(t){ return t.id === id2; });
  if (!t1 || !t2) return;

  var el1 = document.querySelector('[data-id="' + id1 + '"]');
  var el2 = document.querySelector('[data-id="' + id2 + '"]');
  if (el1) { el1.classList.remove('appearing'); el1.classList.add('removing'); }
  if (el2) { el2.classList.remove('appearing'); el2.classList.add('removing'); }
  if (el1) spawnParticles(el1, t1.letter, getLetterColor(t1.letter));

  setTimeout(function() {
    t1.removed = true;
    t2.removed = true;
    renderBoard();
    if (!checkWin()) checkDeadlock();
  }, 350);
}

function checkWin() {
  var remaining = state.tiles.filter(function(t){ return !t.removed; });
  if (remaining.length === 0) {
    stopTimer();
    state.gameActive = false;
    var stars = calcStars();
    saveLevel(state.currentLevel, stars);
    SoundEngine.playVictory();
    setTimeout(function(){ showWin(stars); }, 400);
    return true;
  }
  return false;
}

function checkDeadlock() {
  var remaining = state.tiles.filter(function(t){ return !t.removed; });
  if (remaining.length === 0) return;

  // Conta letras livres
  var free = remaining.filter(function(t){ return isTileFree(t, state.tiles); });
  var freeMap = {};
  free.forEach(function(t){ freeMap[t.letter] = (freeMap[t.letter] || 0) + 1; });

  // Ainda há par livre → sem deadlock
  if (Object.values(freeMap).some(function(c){ return c >= 2; })) return;

  // Conta todas as letras ainda no tabuleiro
  var allMap = {};
  remaining.forEach(function(t){ allMap[t.letter] = (allMap[t.letter] || 0) + 1; });

  // Há letra com 2+ peças no total → ainda pode liberar → não é deadlock
  if (Object.values(allMap).some(function(c){ return c >= 2; })) return;

  // Deadlock real
  SoundEngine.playDefeat();
  setTimeout(function(){ openModal('modal-lose'); }, 600);
}

function calcStars() {
  var lvl   = LEVELS[state.currentLevel];
  var total = lvl.timeLimit || 0;
  if (total === 0) return 3;
  var pct = (total - state.timeLeft) / total;
  if (pct < 0.40) return 3;
  if (pct < 0.75) return 2;
  return 1;
}

function showWin(stars) {
  document.getElementById('stars-display').textContent = '⭐'.repeat(stars) + '☆'.repeat(3 - stars);
  document.getElementById('win-message').textContent   =
    stars === 3 ? 'Perfeito! Incrível!' :
    stars === 2 ? 'Muito bem! Continue assim!' : 'Nível concluído!';
  openModal('modal-win');
}

// ─── HINT ──────────────────────────────────────────
function clearHints() { state.hintTiles = []; }

function useHint() {
  if (state.hintsLeft <= 0) return;
  clearHints();
  var free = state.tiles.filter(function(t){ return !t.removed && isTileFree(t, state.tiles); });
  var map  = {};
  free.forEach(function(t){
    if (!map[t.letter]) map[t.letter] = [];
    map[t.letter].push(t.id);
  });
  var pairs = Object.values(map).filter(function(ids){ return ids.length >= 2; });
  if (pairs.length > 0) {
    var pair = pairs[Math.floor(Math.random() * pairs.length)];
    state.hintTiles = [pair[0], pair[1]];
    state.hintsLeft--;
    document.getElementById('hint-count').textContent = state.hintsLeft;
    renderBoard();
    setTimeout(function(){ clearHints(); renderBoard(); }, 2000);
  }
}

// ─── SHUFFLE FREE TILES ────────────────────────────
function shuffleFree() {
  var free    = state.tiles.filter(function(t){ return !t.removed && isTileFree(t, state.tiles); });
  var letters = shuffle(free.map(function(t){ return t.letter; }));
  free.forEach(function(t, i){ t.letter = letters[i]; });
  state.selected = null;
  clearHints();
  renderBoard();
}

// ─── TIMER ─────────────────────────────────────────
function startTimer(seconds) {
  stopTimer();
  var bar = document.getElementById('timer-bar');
  if (!seconds) { bar.style.width = '100%'; return; }
  state.timeLeft = seconds;
  updateTimerBar(seconds, seconds);
  state.timerInterval = setInterval(function() {
    state.timeLeft = Math.max(0, state.timeLeft - 1);
    updateTimerBar(state.timeLeft, seconds);
    if (state.timeLeft <= 0) {
      stopTimer();
      state.gameActive = false;
      SoundEngine.playDefeat();
      openModal('modal-lose');
    }
  }, 1000);
}
function stopTimer() {
  if (state.timerInterval) { clearInterval(state.timerInterval); state.timerInterval = null; }
}
function updateTimerBar(current, total) {
  document.getElementById('timer-bar').style.width = ((current / total) * 100) + '%';
}

// ─── START / RESTART / NEXT ────────────────────────
function startLevel(levelIdx) {
  closeModal('modal-win');
  closeModal('modal-lose');

  state.currentLevel = levelIdx;
  var lvl = LEVELS[levelIdx];

  state.tiles      = buildTiles(lvl);
  state.selected   = null;
  state.moves      = 0;
  state.score      = 0;
  state.hintsLeft  = lvl.hints;
  state.gameActive = true;
  state.hintTiles  = [];

  document.getElementById('level-badge').textContent   = 'Nível ' + (levelIdx + 1) + ' — ' + lvl.name;
  document.getElementById('score-display').textContent = '⭐ 0';
  document.getElementById('hint-count').textContent    = lvl.hints;

  showScreen('screen-game');

  // Duplo rAF garante que o DOM terminou de mostrar a tela antes de medir
  requestAnimationFrame(function() {
    requestAnimationFrame(function() {
      renderBoard();
      startTimer(lvl.timeLimit);
    });
  });
}

function restartLevel() {
  closeModal('modal-win'); closeModal('modal-lose');
  startLevel(state.currentLevel);
}
function nextLevel() {
  closeModal('modal-win');
  var next = state.currentLevel + 1;
  if (next < LEVELS.length) startLevel(next); else showLevelSelect();
}

function updateFooter() {
  var remaining = state.tiles.filter(function(t){ return !t.removed; });
  document.getElementById('pairs-left').textContent    = 'Pares: ' + Math.floor(remaining.length / 2);
  document.getElementById('moves-count').textContent   = 'Movimentos: ' + state.moves;
  document.getElementById('score-display').textContent = '⭐ ' + state.score;
}

// ─── PARTICLES ─────────────────────────────────────
function spawnParticles(el, letter, color) {
  var rect = el.getBoundingClientRect();
  var cx = rect.left + rect.width  / 2;
  var cy = rect.top  + rect.height / 2;
  for (var i = 0; i < 6; i++) {
    var p = document.createElement('div');
    p.className   = 'particle';
    p.textContent = letter;
    p.style.color = color;
    p.style.left  = cx + 'px';
    p.style.top   = cy + 'px';
    var angle = (i / 6) * Math.PI * 2;
    var dist  = 60 + Math.random() * 40;
    p.style.setProperty('--px', (Math.cos(angle) * dist) + 'px');
    p.style.setProperty('--py', (Math.sin(angle) * dist) + 'px');
    document.body.appendChild(p);
    setTimeout(function(){ p.remove(); }, 900);
  }
}

// ─── RESIZE ────────────────────────────────────────
var resizeTimer;
window.addEventListener('resize', function() {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(function() {
    if (state.gameActive) renderBoard();
  }, 150);
});

// ─── INIT ──────────────────────────────────────────
document.addEventListener('DOMContentLoaded', function() { showScreen('screen-menu'); });
