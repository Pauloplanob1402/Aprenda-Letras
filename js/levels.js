// ═══════════════════════════════════════════════════
//  LETRAJONG — 30 NÍVEIS
//  Cada nível define:
//    cols, rows: tamanho do grid
//    layers: número de camadas
//    letters: letras usadas (cada uma aparece em pares)
//    layout: 'pyramid' | 'cross' | 'diamond' | 'spiral' | 'castle' | 'random'
//    timeLimit: segundos (0 = sem limite)
//    hintCount: dicas disponíveis
// ═══════════════════════════════════════════════════

const LEVELS = [
  // ── FÁCIL (1–8) ── pequenos, poucas letras, 1 camada
  { cols:4, rows:4, layers:1, pairs:6,  letters:'ABCDEF',        layout:'flat',    timeLimit:0,   hints:5, name:'Iniciante' },
  { cols:4, rows:4, layers:1, pairs:7,  letters:'ABCDEFG',       layout:'flat',    timeLimit:0,   hints:5, name:'Primeiros Passos' },
  { cols:5, rows:4, layers:1, pairs:8,  letters:'ABCDEFGH',      layout:'flat',    timeLimit:0,   hints:4, name:'Aquecimento' },
  { cols:5, rows:4, layers:2, pairs:10, letters:'ABCDEFGHIJ',    layout:'pyramid', timeLimit:0,   hints:4, name:'Torre Baixa' },
  { cols:6, rows:4, layers:2, pairs:10, letters:'ABCDEFGHIJ',    layout:'pyramid', timeLimit:180, hints:4, name:'Primeiros Blocos' },
  { cols:6, rows:5, layers:2, pairs:12, letters:'ABCDEFGHIJKL',  layout:'cross',   timeLimit:180, hints:4, name:'Cruz Simples' },
  { cols:6, rows:5, layers:2, pairs:13, letters:'ABCDEFGHIJKLM', layout:'cross',   timeLimit:150, hints:3, name:'Ampliando' },
  { cols:7, rows:5, layers:2, pairs:14, letters:'ABCDEFGHIJKLMN',layout:'diamond', timeLimit:150, hints:3, name:'Diamante' },

  // ── MÉDIO (9–18) ── grids maiores, mais camadas, timer
  { cols:7, rows:5, layers:2, pairs:16, letters:'ABCDEFGHIJKLMNOP',  layout:'pyramid', timeLimit:150, hints:3, name:'Pirâmide' },
  { cols:7, rows:6, layers:3, pairs:18, letters:'ABCDEFGHIJKLMNOPQR',layout:'pyramid', timeLimit:140, hints:3, name:'Grande Torre' },
  { cols:8, rows:6, layers:3, pairs:18, letters:'ABCDEFGHIJKLMNOPQR',layout:'cross',   timeLimit:140, hints:3, name:'Cruz Grande' },
  { cols:8, rows:6, layers:3, pairs:20, letters:'ABCDEFGHIJKLMNOPQRST', layout:'cross', timeLimit:130, hints:3, name:'Vinte Pares' },
  { cols:8, rows:6, layers:3, pairs:20, letters:'ABCDEFGHIJKLMNOPQRST', layout:'castle', timeLimit:130, hints:3, name:'Castelo' },
  { cols:8, rows:7, layers:3, pairs:22, letters:'ABCDEFGHIJKLMNOPQRSTUV', layout:'castle', timeLimit:120, hints:2, name:'Fortaleza' },
  { cols:9, rows:7, layers:3, pairs:22, letters:'ABCDEFGHIJKLMNOPQRSTUV', layout:'diamond', timeLimit:120, hints:2, name:'Grande Diamante' },
  { cols:9, rows:7, layers:4, pairs:24, letters:'ABCDEFGHIJKLMNOPQRSTUVWX', layout:'pyramid', timeLimit:120, hints:2, name:'Quatro Andares' },
  { cols:9, rows:7, layers:4, pairs:24, letters:'ABCDEFGHIJKLMNOPQRSTUVWX', layout:'spiral',  timeLimit:110, hints:2, name:'Espiral' },
  { cols:10,rows:7, layers:4, pairs:26, letters:'ABCDEFGHIJKLMNOPQRSTUVWXYZ', layout:'spiral', timeLimit:110, hints:2, name:'Espiral Grande' },

  // ── DIFÍCIL (19–25) ── tabuleiros grandes, mais camadas, timer curto
  { cols:10,rows:8, layers:4, pairs:26, letters:'ABCDEFGHIJKLMNOPQRSTUVWXYZ', layout:'castle',  timeLimit:100, hints:2, name:'Cidadela' },
  { cols:10,rows:8, layers:4, pairs:28, letters:'ABCDEFGHIJKLMNOPQRSTUVWXYZ', layout:'pyramid', timeLimit:100, hints:2, name:'Grande Pirâmide' },
  { cols:10,rows:8, layers:5, pairs:28, letters:'ABCDEFGHIJKLMNOPQRSTUVWXYZ', layout:'cross',   timeLimit:90,  hints:2, name:'Cruz Épica' },
  { cols:11,rows:8, layers:5, pairs:30, letters:'ABCDEFGHIJKLMNOPQRSTUVWXYZ', layout:'diamond', timeLimit:90,  hints:1, name:'Diamante Épico' },
  { cols:11,rows:8, layers:5, pairs:30, letters:'ABCDEFGHIJKLMNOPQRSTUVWXYZ', layout:'spiral',  timeLimit:90,  hints:1, name:'Labirinto' },
  { cols:11,rows:9, layers:5, pairs:32, letters:'ABCDEFGHIJKLMNOPQRSTUVWXYZ', layout:'castle',  timeLimit:80,  hints:1, name:'Bastilha' },
  { cols:12,rows:9, layers:5, pairs:32, letters:'ABCDEFGHIJKLMNOPQRSTUVWXYZ', layout:'pyramid', timeLimit:80,  hints:1, name:'Colosso' },

  // ── EXPERT (26–30) ── máxima dificuldade
  { cols:12,rows:9, layers:6, pairs:34, letters:'ABCDEFGHIJKLMNOPQRSTUVWXYZ', layout:'spiral',  timeLimit:70,  hints:1, name:'Mestre' },
  { cols:12,rows:9, layers:6, pairs:34, letters:'ABCDEFGHIJKLMNOPQRSTUVWXYZ', layout:'diamond', timeLimit:70,  hints:1, name:'Grão-Mestre' },
  { cols:13,rows:9, layers:6, pairs:36, letters:'ABCDEFGHIJKLMNOPQRSTUVWXYZ', layout:'castle',  timeLimit:60,  hints:1, name:'Lendário' },
  { cols:13,rows:9, layers:6, pairs:36, letters:'ABCDEFGHIJKLMNOPQRSTUVWXYZ', layout:'pyramid', timeLimit:60,  hints:1, name:'Épico' },
  { cols:13,rows:10,layers:7, pairs:36, letters:'ABCDEFGHIJKLMNOPQRSTUVWXYZ', layout:'spiral',  timeLimit:60,  hints:1, name:'Transcendente' },
];

// Cores por letra (ciclo de 8 cores vibrantes)
const LETTER_COLORS = [
  '#e94560','#FF6B6B','#FF8E53','#FFD93D',
  '#6BCB77','#4ECDC4','#45B7D1','#A78BFA',
  '#F472B6','#FB923C','#34D399','#60A5FA',
  '#C084FC','#F9A8D4','#86EFAC','#FCD34D',
  '#67E8F9','#A5B4FC','#FCA5A5','#6EE7B7',
  '#93C5FD','#D8B4FE','#FDE68A','#BBF7D0',
  '#BAE6FD','#E9D5FF',
];

function getLetterColor(letter) {
  const idx = letter.charCodeAt(0) - 65;
  return LETTER_COLORS[idx % LETTER_COLORS.length];
}
