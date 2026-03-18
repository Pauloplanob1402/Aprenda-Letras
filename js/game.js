// ═══════════════════════════════════════════════════
//  LEARN LETTERS — Engine completo
//  Streak + Moedas + Combo + Ranking + Anúncios + Premium
// ═══════════════════════════════════════════════════

var SAVE_KEY   = 'learnletters_v1';
var FREE_LEVELS = 15; // 15 grátis, resto premium

var state = {
  level:0, selected:null, tiles:[],
  moves:0, score:0, coins:0,
  hints:3, timerInt:null, timeLeft:0,
  active:false, hintTiles:[],
  combo:0, comboTimer:null,
  premium:false,
  streak:0, lastPlayDate:null,
  totalScore:0,
};

// ─── SAVE / LOAD ───────────────────────────────────
function loadData() {
  try { return JSON.parse(localStorage.getItem(SAVE_KEY) || '{}'); }
  catch(e) { return {}; }
}
function saveData() {
  var d = loadData();
  d.coins        = state.coins;
  d.premium      = state.premium;
  d.streak       = state.streak;
  d.lastPlayDate = state.lastPlayDate;
  d.totalScore   = state.totalScore;
  localStorage.setItem(SAVE_KEY, JSON.stringify(d));
}
function getLevelStars(i) { return loadData()['lvl_'+i] || 0; }
function saveLevelStars(i, stars) {
  var d = loadData();
  if (!d['lvl_'+i] || d['lvl_'+i] < stars) d['lvl_'+i] = stars;
  localStorage.setItem(SAVE_KEY, JSON.stringify(d));
}
function isUnlocked(i) {
  if (i === 0) return true;
  if (state.premium) return getLevelStars(i-1) > 0 || i === 0;
  if (i < FREE_LEVELS) return getLevelStars(i-1) > 0;
  return false;
}

// ─── STREAK (Hábitos Atômicos) ─────────────────────
function checkStreak() {
  var today = new Date().toDateString();
  var last  = state.lastPlayDate;
  if (!last) {
    state.streak = 1;
  } else if (last !== today) {
    var diff = Math.round((new Date(today) - new Date(last)) / 86400000);
    if (diff === 1) {
      state.streak++;
      if ([3,7,14,30].indexOf(state.streak) !== -1) {
        setTimeout(function(){ showStreakModal(state.streak); }, 800);
        SoundEngine.playStreak();
        addCoins(state.streak * 10);
      }
    } else if (diff > 1) {
      state.streak = 1;
    }
  }
  state.lastPlayDate = today;
  saveData();
  updateStreakUI();
}

function updateStreakUI() {
  var sc = document.getElementById('streak-count');
  var sl = document.getElementById('streak-levels');
  var sg = document.getElementById('streak-game-count');
  if (sc) sc.textContent = state.streak;
  if (sl) sl.textContent = state.streak;
  if (sg) sg.textContent = state.streak;
}

function showStreakModal(days) {
  var msgs = {
    3:'Você está construindo um hábito! 🔥',
    7:'Uma semana inteira! Você é imparável! 💪',
    14:'Duas semanas de domínio das letras! 🧠',
    30:'30 DIAS! Você é uma lenda! 👑'
  };
  document.getElementById('streak-modal-title').textContent = days + ' Dias Seguidos!';
  document.getElementById('streak-modal-msg').textContent   = msgs[days] || 'Continue assim!';
  openModal('modal-streak');
}

// ─── COINS (Nudge) ─────────────────────────────────
function addCoins(n) {
  state.coins += n;
  saveData();
  updateCoinsUI();
  SoundEngine.playCoins();
}
function updateCoinsUI() {
  var cc = document.getElementById('coin-count');
  var cl = document.getElementById('coins-levels');
  if (cc) cc.textContent = state.coins;
  if (cl) cl.textContent = state.coins;
}

// ─── RANKING (Contagious — social proof) ───────────
function getLeaderboard() {
  var d = loadData();
  var board = d.leaderboard ? JSON.parse(JSON.stringify(d.leaderboard)) : [];
  var me = { name: d.playerName || 'Você', score: state.totalScore };
  var existing = -1;
  for (var i=0;i<board.length;i++) { if(board[i].name===me.name){existing=i;break;} }
  if (existing>=0) { if(me.score>board[existing].score) board[existing].score=me.score; }
  else board.push(me);
  var bots = [
    {name:'AlphaQueen',score:52000},{name:'LetterMaster',score:41200},
    {name:'WordHero',score:33500},{name:'ABCKing',score:24800},
    {name:'SpellAce',score:17600},{name:'QuickMatch',score:9900},
  ];
  bots.forEach(function(b){ if(!board.find(function(x){return x.name===b.name;})) board.push(b); });
  return board.sort(function(a,b){return b.score-a.score;}).slice(0,10);
}

function showRanking() {
  var board = getLeaderboard();
  var list  = document.getElementById('ranking-list');
  var medals = ['🥇','🥈','🥉'];
  list.innerHTML = board.map(function(p,i){
    return '<div class="rank-item">'
      + '<span class="rank-pos">'+(medals[i]||'#'+(i+1))+'</span>'
      + '<span class="rank-name">'+p.name+'</span>'
      + '<span class="rank-score">🪙 '+p.score.toLocaleString()+'</span>'
      + '</div>';
  }).join('');
  showScreen('screen-ranking');
}

// ─── PREMIUM ───────────────────────────────────────
function activatePremium() {
  // Substitua aqui pela integração de pagamento real (Stripe, PIX, etc.)
  alert('🔧 Configure o pagamento em js/game.js → função activatePremium()\n\nPara demo: premium ativado!');
  state.premium = true;
  saveData();
  document.getElementById('ad-banner').classList.add('hidden');
  showMenu();
}
function showPremium() { showScreen('screen-premium'); }

// ─── SCREENS ───────────────────────────────────────
function showScreen(id) {
  document.querySelectorAll('.screen').forEach(function(s){ s.classList.remove('active'); });
  document.getElementById(id).classList.add('active');
}
function showMenu()        { stopTimer(); checkStreak(); updateCoinsUI(); showScreen('screen-menu'); }
function showHowTo()       { showScreen('screen-howto'); }
function showLevelSelect() { stopTimer(); buildLevelGrid(); showScreen('screen-levels'); }
function goToLevels()      { closeModal('modal-confirm'); closeModal('modal-win'); closeModal('modal-lose'); showLevelSelect(); }
function confirmBack()     { if (state.active) openModal('modal-confirm'); else showLevelSelect(); }
function closeModal(id)    { document.getElementById(id).classList.add('hidden'); }
function openModal(id)     { document.getElementById(id).classList.remove('hidden'); }

// ─── LEVEL GRID ────────────────────────────────────
function buildLevelGrid() {
  var grid = document.getElementById('levels-grid');
  grid.innerHTML = '';
  LEVELS.forEach(function(lvl, i) {
    var stars    = getLevelStars(i);
    var unlocked = isUnlocked(i);
    var isPrem   = i >= FREE_LEVELS && !state.premium;
    var cls      = stars > 0 ? 'completed' : (isPrem ? 'premium-locked' : (unlocked ? 'unlocked' : 'locked'));
    var btn      = document.createElement('button');
    btn.className = 'level-btn ' + cls;
    var starStr  = stars > 0 ? '⭐'.repeat(stars)+'☆'.repeat(3-stars) : (isPrem ? '⭐' : (unlocked ? '' : '🔒'));
    btn.innerHTML = '<span>'+(i+1)+'</span><span class="level-stars">'+starStr+'</span>';
    btn.title = lvl.name + (isPrem ? ' — Premium' : '');
    if (unlocked && !isPrem) {
      (function(idx){ btn.onclick = function(){ startLevel(idx); }; })(i);
    } else if (isPrem) {
      btn.onclick = showPremium;
    }
    grid.appendChild(btn);
  });
}

// ─── LAYOUT GENERATOR ──────────────────────────────
function generateLayout(levelDef) {
  var cols=levelDef.cols,rows=levelDef.rows,layers=levelDef.layers,layout=levelDef.layout;
  var set={}, pos=[];
  function add(c,r,l) {
    if(c<0||r<0||c>=cols||r>=rows||l<0) return;
    var k=c+','+r+','+l; if(set[k]) return; set[k]=1;
    pos.push({col:c,row:r,layer:l});
  }
  if (layout==='flat') {
    for(var c=0;c<cols;c++) for(var r=0;r<rows;r++) add(c,r,0);
  } else if (layout==='pyramid') {
    for(var c=0;c<cols;c++) for(var r=0;r<rows;r++) add(c,r,0);
    for(var l=1;l<layers;l++) for(var c=l;c<cols-l;c++) for(var r=l;r<rows-l;r++) add(c,r,l);
  } else if (layout==='cross') {
    var mc=Math.floor(cols/2),mr=Math.floor(rows/2);
    for(var c=0;c<cols;c++) for(var dr=-1;dr<=1;dr++) add(c,mr+dr,0);
    for(var r=0;r<rows;r++) for(var dc=-1;dc<=1;dc++) add(mc+dc,r,0);
    for(var l=1;l<layers;l++) for(var c=mc-1;c<=mc+1;c++) for(var r=mr-1;r<=mr+1;r++) add(c,r,l);
  } else if (layout==='diamond') {
    var cx=(cols-1)/2,cy=(rows-1)/2;
    for(var l=0;l<layers;l++){
      var sc=cx-l,sr=cy-l; if(sc<=0||sr<=0) break;
      for(var c=0;c<cols;c++) for(var r=0;r<rows;r++)
        if(Math.abs(c-cx)/sc+Math.abs(r-cy)/sr<=1.05) add(c,r,l);
    }
  } else if (layout==='castle') {
    for(var c=0;c<cols;c++) for(var r=0;r<rows;r++)
      if(c===0||c===cols-1||r===0||r===rows-1||(c%2===0&&r%2===0)) add(c,r,0);
    for(var l=1;l<layers;l++) for(var c=l;c<cols-l;c+=2) for(var r=l;r<rows-l;r+=2) add(c,r,l);
  } else if (layout==='spiral') {
    for(var c=0;c<cols;c++) for(var r=0;r<rows;r++) add(c,r,0);
    for(var l=1;l<layers;l++) for(var c=l;c<cols-l;c++) for(var r=l;r<rows-l;r++) if((c+r)%2===0) add(c,r,l);
  }
  return pos;
}

function buildTiles(levelDef) {
  var pos    = generateLayout(levelDef);
  var letters = levelDef.letters.split('');
  var maxP   = Math.floor(pos.length/2);
  var nPairs = Math.min(levelDef.pairs, maxP);
  var needed = nPairs*2;
  shuffle(pos);
  var used = pos.slice(0, needed);
  var pool = [];
  for(var i=0;i<nPairs;i++){ var l=letters[i%letters.length]; pool.push(l,l); }
  shuffle(pool);
  return used.map(function(p,i){ return {id:i,col:p.col,row:p.row,layer:p.layer,letter:pool[i],removed:false}; });
}

function shuffle(a) {
  for(var i=a.length-1;i>0;i--){var j=Math.floor(Math.random()*(i+1));var t=a[i];a[i]=a[j];a[j]=t;}
  return a;
}

// ─── TILE FREE CHECK ───────────────────────────────
function isFree(tile, tiles) {
  if (tile.removed) return false;
  for(var i=0;i<tiles.length;i++){
    var o=tiles[i];
    if(o.removed||o.id===tile.id) continue;
    if(o.layer===tile.layer+1&&o.col===tile.col&&o.row===tile.row) return false;
  }
  return true;
}

// ─── ADAPTIVE SIZING ───────────────────────────────
var TW_MAX=88,TW_MIN=28,TW_RATIO=1.18;
function calcSize(cols,rows,maxL,aw,ah){
  for(var tw=TW_MAX;tw>=TW_MIN;tw--){
    var th=Math.round(tw*TW_RATIO),lo=Math.max(3,Math.round(tw*0.09));
    if(cols*tw+maxL*lo+8<=aw&&rows*th+maxL*lo+8<=ah) return{tw:tw,th:th,lo:lo};
  }
  return{tw:TW_MIN,th:Math.round(TW_MIN*TW_RATIO),lo:3};
}

// ─── RENDER ────────────────────────────────────────
function renderBoard() {
  var board = document.getElementById('board');
  board.innerHTML = '';
  var all    = state.tiles;
  var active = all.filter(function(t){return !t.removed;});
  if (!active.length) { updateFooter(); return; }

  var maxCol   = Math.max.apply(null, all.map(function(t){return t.col;}));
  var maxRow   = Math.max.apply(null, all.map(function(t){return t.row;}));
  var maxLayer = Math.max.apply(null, all.map(function(t){return t.layer;}));

  var cont = document.querySelector('.board-container');
  var aw = Math.floor(cont.clientWidth)-8;
  var ah = Math.floor(cont.clientHeight)-8;
  var sz = calcSize(maxCol+1,maxRow+1,maxLayer,aw,ah);
  var tw=sz.tw,th=sz.th,lo=sz.lo;

  var bw=(maxCol+1)*tw+maxLayer*lo+8;
  var bh=(maxRow+1)*th+maxLayer*lo+8;
  board.style.width=bw+'px'; board.style.height=bh+'px'; board.style.transform='none';
  var sc=Math.min(aw/bw,ah/bh,1);
  if(sc<0.999) board.style.transform='scale('+sc.toFixed(3)+')';

  var fs=Math.max(10,Math.round(tw*0.56));

  active.slice().sort(function(a,b){return a.layer-b.layer;}).forEach(function(tile){
    var free=isFree(tile,all);
    var el=document.createElement('div');
    el.className='tile appearing'+(free?'':' blocked');
    el.dataset.id=tile.id; el.dataset.layer=tile.layer;
    var x=tile.col*tw+tile.layer*lo, y=tile.row*th-tile.layer*lo;
    el.style.left=x+'px'; el.style.top=y+'px';
    el.style.width=(tw-2)+'px'; el.style.height=(th-2)+'px';
    el.style.fontSize=fs+'px';
    el.style.zIndex=tile.layer*1000+tile.row*100+tile.col;
    el.style.color=getLetterColor(tile.letter);
    if(state.selected&&state.selected.id===tile.id) el.classList.add('selected');
    if(state.hintTiles.indexOf(tile.id)!==-1) el.classList.add('hint-glow');
    el.textContent=tile.letter;
    if(free)(function(id){el.addEventListener('click',function(){handleClick(id);});})(tile.id);
    board.appendChild(el);
  });
  updateFooter();
}

// ─── GAME LOGIC ────────────────────────────────────
function handleClick(id) {
  var tile=state.tiles.find(function(t){return t.id===id;});
  if(!tile||tile.removed||!isFree(tile,state.tiles)) return;
  clearHints();

  if (!state.selected) {
    state.selected=tile; SoundEngine.playClick(); renderBoard(); return;
  }
  if (state.selected.id===tile.id) { state.selected=null; renderBoard(); return; }

  if (state.selected.letter===tile.letter) {
    SoundEngine.playMatch();
    state.combo++;
    clearTimeout(state.comboTimer);
    state.comboTimer=setTimeout(function(){state.combo=0;},4000);
    if (state.combo>=2) { showCombo(state.combo); SoundEngine.playCombo(); }
    var id1=state.selected.id, id2=tile.id;
    state.selected=null; state.moves++; state.score+=100*Math.max(1,state.combo);
    removePair(id1,id2);
  } else {
    SoundEngine.playError();
    state.combo=0;
    state.selected=tile; renderBoard();
  }
}

function showCombo(n) {
  var el=document.getElementById('combo-display');
  document.getElementById('combo-num').textContent=n;
  el.classList.remove('hidden');
  clearTimeout(window._comboHide);
  window._comboHide=setTimeout(function(){el.classList.add('hidden');},1200);
}

function removePair(id1,id2) {
  var t1=state.tiles.find(function(t){return t.id===id1;});
  var t2=state.tiles.find(function(t){return t.id===id2;});
  if(!t1||!t2) return;
  var el1=document.querySelector('[data-id="'+id1+'"]');
  var el2=document.querySelector('[data-id="'+id2+'"]');
  if(el1){el1.classList.remove('appearing');el1.classList.add('removing');}
  if(el2){el2.classList.remove('appearing');el2.classList.add('removing');}
  if(el1) spawnParticles(el1,t1.letter,getLetterColor(t1.letter));
  setTimeout(function(){
    t1.removed=true; t2.removed=true;
    renderBoard();
    if(!checkWin()) checkDeadlock();
  },350);
}

function checkWin() {
  if(state.tiles.filter(function(t){return !t.removed;}).length>0) return false;
  stopTimer();
  state.active=false;
  var stars=calcStars();
  saveLevelStars(state.level,stars);
  var earned=50+(stars*30)+(state.combo>3?state.combo*10:0);
  addCoins(earned);
  state.totalScore+=state.score;
  saveData();
  SoundEngine.playVictory();
  setTimeout(function(){showWin(stars,earned);},400);
  return true;
}

function checkDeadlock() {
  var rem=state.tiles.filter(function(t){return !t.removed;});
  if(!rem.length) return;
  var free=rem.filter(function(t){return isFree(t,state.tiles);});
  var fm={};
  free.forEach(function(t){fm[t.letter]=(fm[t.letter]||0)+1;});
  if(Object.values(fm).some(function(c){return c>=2;})) return;
  var am={};
  rem.forEach(function(t){am[t.letter]=(am[t.letter]||0)+1;});
  if(Object.values(am).some(function(c){return c>=2;})) return;
  SoundEngine.playDefeat();
  setTimeout(function(){openModal('modal-lose');},600);
}

function calcStars() {
  var lvl=LEVELS[state.level];
  if(!lvl.timeLimit) return 3;
  var pct=(lvl.timeLimit-state.timeLeft)/lvl.timeLimit;
  if(pct<0.40) return 3; if(pct<0.75) return 2; return 1;
}

function showWin(stars,earned) {
  document.getElementById('stars-display').textContent='⭐'.repeat(stars)+'☆'.repeat(3-stars);
  document.getElementById('win-coins').textContent='🪙 +'+earned+' moedas!';
  document.getElementById('win-message').textContent=
    stars===3?'Perfeito! Incrível!':stars===2?'Muito bem! Continue!':'Nível concluído!';
  var next=state.level+1;
  var nudge=document.getElementById('nudge-msg');
  if(next<LEVELS.length&&next<FREE_LEVELS&&!isUnlocked(next))
    nudge.textContent='🔓 Nível '+(next+1)+' desbloqueado!';
  else nudge.textContent='';
  openModal('modal-win');
}

// ─── HINT ──────────────────────────────────────────
function clearHints(){state.hintTiles=[];}
function useHint(){
  if(state.hints<=0){alert('Sem dicas! Ganhe moedas jogando mais níveis.');return;}
  clearHints();
  var free=state.tiles.filter(function(t){return !t.removed&&isFree(t,state.tiles);});
  var map={};
  free.forEach(function(t){if(!map[t.letter])map[t.letter]=[];map[t.letter].push(t.id);});
  var pairs=Object.values(map).filter(function(ids){return ids.length>=2;});
  if(pairs.length){
    var pair=pairs[Math.floor(Math.random()*pairs.length)];
    state.hintTiles=[pair[0],pair[1]];
    state.hints--;
    document.getElementById('hint-count').textContent=state.hints;
    renderBoard();
    setTimeout(function(){clearHints();renderBoard();},2000);
  }
}

function shuffleFree(){
  var free=state.tiles.filter(function(t){return !t.removed&&isFree(t,state.tiles);});
  var letters=shuffle(free.map(function(t){return t.letter;}));
  free.forEach(function(t,i){t.letter=letters[i];});
  state.selected=null; clearHints(); renderBoard();
}

// ─── TIMER ─────────────────────────────────────────
function startTimer(sec){
  stopTimer();
  var bar=document.getElementById('timer-bar');
  if(!sec){bar.style.width='100%';return;}
  state.timeLeft=sec;
  updateTimerBar(sec,sec);
  state.timerInt=setInterval(function(){
    state.timeLeft=Math.max(0,state.timeLeft-1);
    updateTimerBar(state.timeLeft,sec);
    if(state.timeLeft<=0){stopTimer();state.active=false;SoundEngine.playDefeat();openModal('modal-lose');}
  },1000);
}
function stopTimer(){if(state.timerInt){clearInterval(state.timerInt);state.timerInt=null;}}
function updateTimerBar(c,t){document.getElementById('timer-bar').style.width=((c/t)*100)+'%';}

// ─── START ─────────────────────────────────────────
function startLevel(i){
  closeModal('modal-win'); closeModal('modal-lose'); closeModal('modal-confirm');
  state.level=i;
  var lvl=LEVELS[i];
  state.tiles=buildTiles(lvl);
  state.selected=null; state.moves=0; state.score=0;
  state.hints=lvl.hints; state.active=true;
  state.hintTiles=[]; state.combo=0;
  document.getElementById('level-badge').textContent='Nível '+(i+1)+' — '+lvl.name;
  document.getElementById('score-display').textContent='🪙 0';
  document.getElementById('hint-count').textContent=lvl.hints;
  document.getElementById('combo-display').classList.add('hidden');
  if(!state.premium) document.getElementById('ad-banner').classList.remove('hidden');
  else document.getElementById('ad-banner').classList.add('hidden');
  showScreen('screen-game');
  requestAnimationFrame(function(){requestAnimationFrame(function(){
    renderBoard(); startTimer(lvl.timeLimit);
  });});
}

function restartLevel(){
  closeModal('modal-win'); closeModal('modal-lose'); closeModal('modal-confirm');
  startLevel(state.level);
}
function nextLevel(){
  closeModal('modal-win');
  var next=state.level+1;
  if(next>=LEVELS.length){showLevelSelect();return;}
  if(next>=FREE_LEVELS&&!state.premium){showPremium();return;}
  startLevel(next);
}

function updateFooter(){
  var rem=state.tiles.filter(function(t){return !t.removed;});
  document.getElementById('pairs-left').textContent='Pares: '+Math.floor(rem.length/2);
  document.getElementById('moves-count').textContent='Movimentos: '+state.moves;
  document.getElementById('score-display').textContent='🪙 '+state.score;
}

// ─── PARTICLES ─────────────────────────────────────
function spawnParticles(el,letter,color){
  var rect=el.getBoundingClientRect();
  var cx=rect.left+rect.width/2,cy=rect.top+rect.height/2;
  for(var i=0;i<6;i++){
    var p=document.createElement('div');
    p.className='particle'; p.textContent=letter; p.style.color=color;
    p.style.left=cx+'px'; p.style.top=cy+'px';
    var angle=(i/6)*Math.PI*2,dist=55+Math.random()*45;
    p.style.setProperty('--px',(Math.cos(angle)*dist)+'px');
    p.style.setProperty('--py',(Math.sin(angle)*dist)+'px');
    document.body.appendChild(p);
    setTimeout(function(){try{p.remove();}catch(e){}},950);
  }
}

// ─── RESIZE ────────────────────────────────────────
var _resizeTimer;
window.addEventListener('resize',function(){
  clearTimeout(_resizeTimer);
  _resizeTimer=setTimeout(function(){if(state.active)renderBoard();},150);
});

// ─── INIT ──────────────────────────────────────────
document.addEventListener('DOMContentLoaded',function(){
  var d=loadData();
  state.coins      = d.coins      || 0;
  state.premium    = d.premium    || false;
  state.streak     = d.streak     || 0;
  state.lastPlayDate = d.lastPlayDate || null;
  state.totalScore = d.totalScore || 0;
  checkStreak();
  updateCoinsUI();
  if(state.premium) document.getElementById('ad-banner').classList.add('hidden');
  showScreen('screen-menu');
  setTimeout(function(){ SoundEngine.playIntroMusic(); }, 700);
});
