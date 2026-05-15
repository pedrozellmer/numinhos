// Dados das fases + universo dos Numinhos.
//
// O jogo NÃO é "defesa contra inimigos" — é "ajudar os Numinhos a alcançar
// seu número-destino". Cada modo tem um Mentor (Capi, Tuca, Boto, Mira) que
// representa a operação naquele bioma brasileiro.

import { MENTORS } from './mentors.js';

export const MODE_ORDER = ['add', 'sub', 'mul', 'div', 'mixed'];

export const MODES = {
  add: {
    id: 'add', icon: '+', label: 'Soma', sub: 'complete o alvo',
    color: '#43d177',
    mentor: MENTORS.capi,
    tutorial: 'Cada Numinho tem um ALVO (→ amarelo). Some até chegar nele!',
    levels: [
      // Modo Soma — pedagogia BNCC EF01MA08 / EF02MA05 (complementos)
      { id: 1, diff: 0, lives: 3, title: 'Complementos do 5',
        handPool: [{op:'+',val:1},{op:'+',val:2},{op:'+',val:3},{op:'+',val:4}],
        enemies: [
          {value:1,target:5,delay:2.0,speed:0.11},
          {value:2,target:5,delay:7.0,speed:0.11},
          {value:3,target:5,delay:12.0,speed:0.11},
          {value:4,target:5,delay:17.0,speed:0.11},
        ],
        tutorial: 'Some até chegar no número amarelo (→ 5). Ex: 1 + 4 = 5.' },
      { id: 2, diff: 0, lives: 3, title: 'Quase no 10',
        handPool: [{op:'+',val:1},{op:'+',val:2},{op:'+',val:3},{op:'+',val:5}],
        enemies: [
          {value:5,target:10,delay:1.5,speed:0.12},
          {value:7,target:10,delay:6.0,speed:0.12},
          {value:8,target:10,delay:10.5,speed:0.12},
          {value:6,target:10,delay:15.0,speed:0.12},
        ],
        tutorial: 'Complementos do 10. Ex: 7 + 3 = 10.' },
      { id: 3, diff: 0, lives: 3, title: 'Complementos do 10',
        handPool: [{op:'+',val:1},{op:'+',val:2},{op:'+',val:3},{op:'+',val:5},{op:'+',val:7}],
        enemies: [
          {value:3,target:10,delay:1.2,speed:0.14},
          {value:5,target:10,delay:5.0,speed:0.14},
          {value:1,target:10,delay:9.0,speed:0.14},
          {value:8,target:10,delay:13.0,speed:0.14},
          {value:4,target:10,delay:17.0,speed:0.14},
        ],
        tutorial: 'Combine cartas: 3 + 7 = 10, ou 3 + 5 + 2 = 10.' },
      { id: 4, diff: 0, lives: 3, title: 'Misturando alvos',
        handPool: [{op:'+',val:1},{op:'+',val:2},{op:'+',val:3},{op:'+',val:5},{op:'+',val:7}],
        enemies: [
          {value:3,target:5,delay:1.0,speed:0.16},
          {value:5,target:10,delay:4.0,speed:0.16},
          {value:2,target:5,delay:7.5,speed:0.16},
          {value:7,target:10,delay:11.0,speed:0.16},
          {value:4,target:10,delay:14.5,speed:0.16},
        ] },
      { id: 5, diff: 1, lives: 3, title: 'Complementos do 15',
        handPool: [{op:'+',val:2},{op:'+',val:3},{op:'+',val:5},{op:'+',val:7}],
        enemies: [
          {value:8,target:15,delay:1.0,speed:0.18},
          {value:10,target:15,delay:4.0,speed:0.18},
          {value:12,target:15,delay:7.0,speed:0.20},
          {value:6,target:15,delay:10.0,speed:0.20},
          {value:13,target:15,delay:13.0,speed:0.20},
        ] },
      { id: 6, diff: 1, lives: 3, title: 'Pulando alvos',
        handPool: [{op:'+',val:2},{op:'+',val:3},{op:'+',val:5},{op:'+',val:7},{op:'+',val:10}],
        enemies: [
          {value:5,target:10,delay:1.0,speed:0.20},
          {value:8,target:15,delay:3.5,speed:0.20},
          {value:7,target:15,delay:6.0,speed:0.22},
          {value:3,target:10,delay:8.5,speed:0.22},
          {value:10,target:20,delay:11.0,speed:0.20},
        ] },
      { id: 7, diff: 1, lives: 3, title: 'Caminho do 20',
        handPool: [{op:'+',val:2},{op:'+',val:3},{op:'+',val:5},{op:'+',val:7},{op:'+',val:10}],
        enemies: [
          {value:10,target:20,delay:1.0,speed:0.22},
          {value:13,target:20,delay:3.5,speed:0.22},
          {value:15,target:20,delay:6.0,speed:0.24},
          {value:8,target:20,delay:8.5,speed:0.22},
          {value:17,target:20,delay:11.0,speed:0.24},
        ] },
      { id: 8, diff: 3, lives: 3, title: 'BOSS: Vinte!',
        handPool: [{op:'+',val:2},{op:'+',val:3},{op:'+',val:5},{op:'+',val:7},{op:'+',val:10}],
        enemies: [
          {value:5,target:10,delay:0.8,speed:0.24},
          {value:10,target:20,delay:2.5,speed:0.24},
          {value:13,target:20,delay:4.5,speed:0.26},
          {value:8,target:15,delay:6.5,speed:0.26},
          {value:15,target:20,delay:8.5,speed:0.26},
          {value:7,target:20,delay:10.5,speed:0.26},
        ] },
    ]
  },

  sub: {
    id: 'sub', icon: '−', label: 'Subtração', sub: 'tira até zerar',
    color: '#ff6b6b',
    mentor: MENTORS.tuca,
    tutorial: 'Os Numinhos descem com números. Tire até chegar a ZERO!',
    levels: [
      { id: 1, diff: 0, lives: 3, title: 'Tira até zerar',
        handPool: [{op:'-',val:1},{op:'-',val:2},{op:'-',val:3}],
        enemies: [
          {value:1,delay:2.0,speed:0.11},
          {value:2,delay:7.0,speed:0.11},
          {value:3,delay:12.0,speed:0.11},
        ],
        tutorial: 'Arraste a carta - no Numinho até chegar em 0.' },
      { id: 2, diff: 0, lives: 3, title: 'Mais Numinhos',
        handPool: [{op:'-',val:1},{op:'-',val:2},{op:'-',val:3}],
        enemies: [
          {value:2,delay:1.5,speed:0.13},
          {value:4,delay:5.5,speed:0.13},
          {value:3,delay:9.5,speed:0.13},
          {value:5,delay:13.5,speed:0.13},
        ],
        tutorial: 'Combine cartas! Ex: 5 = (-3) + (-2).' },
      { id: 3, diff: 0, lives: 3, title: 'Até o 6',
        handPool: [{op:'-',val:1},{op:'-',val:2},{op:'-',val:3},{op:'-',val:5}],
        enemies: [
          {value:3,delay:1.2,speed:0.15},
          {value:5,delay:5.0,speed:0.15},
          {value:4,delay:8.5,speed:0.15},
          {value:6,delay:12.0,speed:0.15},
        ] },
      { id: 4, diff: 0, lives: 3, title: 'Até o 10',
        handPool: [{op:'-',val:1},{op:'-',val:2},{op:'-',val:3},{op:'-',val:5}],
        enemies: [
          {value:4,delay:1.0,speed:0.17},
          {value:7,delay:4.0,speed:0.17},
          {value:5,delay:7.0,speed:0.17},
          {value:8,delay:10.0,speed:0.18},
          {value:10,delay:13.5,speed:0.17},
        ] },
      { id: 5, diff: 1, lives: 3, title: 'Onda',
        handPool: [{op:'-',val:2},{op:'-',val:3},{op:'-',val:5},{op:'-',val:7}],
        enemies: [
          {value:5,delay:1.0,speed:0.19},
          {value:8,delay:3.5,speed:0.19},
          {value:7,delay:6.0,speed:0.20},
          {value:10,delay:8.5,speed:0.20},
          {value:6,delay:11.0,speed:0.20},
        ] },
      { id: 6, diff: 1, lives: 3, title: 'Acelerou',
        handPool: [{op:'-',val:2},{op:'-',val:3},{op:'-',val:5},{op:'-',val:7}],
        enemies: [
          {value:7,delay:0.8,speed:0.21},
          {value:10,delay:3.0,speed:0.22},
          {value:8,delay:5.5,speed:0.22},
          {value:12,delay:8.0,speed:0.22},
          {value:9,delay:10.5,speed:0.24},
        ] },
      { id: 7, diff: 1, lives: 3, title: 'Quinze',
        handPool: [{op:'-',val:3},{op:'-',val:5},{op:'-',val:7},{op:'-',val:10}],
        enemies: [
          {value:10,delay:0.8,speed:0.24},
          {value:12,delay:3.0,speed:0.24},
          {value:8,delay:5.5,speed:0.24},
          {value:15,delay:8.0,speed:0.24},
          {value:13,delay:10.5,speed:0.26},
        ] },
      { id: 8, diff: 3, lives: 3, title: 'BOSS: Vinte!',
        handPool: [{op:'-',val:2},{op:'-',val:3},{op:'-',val:5},{op:'-',val:7},{op:'-',val:10}],
        enemies: [
          {value:10,delay:0.8,speed:0.24},
          {value:15,delay:2.8,speed:0.24},
          {value:12,delay:4.8,speed:0.26},
          {value:8,delay:6.5,speed:0.26},
          {value:17,delay:8.5,speed:0.26},
          {value:20,delay:10.5,speed:0.26},
        ] },
    ]
  },

  mul: {
    id: 'mul', icon: '×', label: 'Multiplicação', sub: 'tabuada',
    color: '#ffa600',
    mentor: MENTORS.boto,
    tutorial: 'O Boto faz mágica! Multiplique pra chegar no alvo da tabuada.',
    levels: [
      { id: 1, diff: 0, lives: 3, title: 'Quanto multiplica?',
        // Variedade desde o começo: pool com ×2, ×3, ×4, ×5.
        // Cada inimigo é um puzzle diferente — criança aprende a ESCOLHER a carta.
        handPool: [{op:'×',val:2},{op:'×',val:3},{op:'×',val:4},{op:'×',val:5}],
        enemies: [
          {value:2,target:4,delay:1.8,speed:0.11},   // ×2
          {value:3,target:6,delay:5.0,speed:0.11},   // ×2
          {value:2,target:6,delay:8.5,speed:0.12},   // ×3
          {value:4,target:8,delay:12.0,speed:0.12},  // ×2
          {value:3,target:9,delay:15.5,speed:0.12},  // ×3
          {value:2,target:8,delay:19.0,speed:0.12},  // ×4
          {value:5,target:10,delay:22.5,speed:0.13}, // ×2
          {value:3,target:12,delay:26.0,speed:0.13}, // ×4
          {value:4,target:20,delay:29.5,speed:0.13}, // ×5
        ],
        tutorial: 'Olha o alvo amarelo e escolha a carta certa! 2 × ? = 4 → use ×2.' },
      { id: 2, diff: 0, lives: 3, title: 'Mais tabuadas',
        // Pool expandido: ×2 a ×6 + ×10. Variedade ainda maior.
        handPool: [{op:'×',val:2},{op:'×',val:3},{op:'×',val:4},{op:'×',val:5},{op:'×',val:6},{op:'×',val:10}],
        enemies: [
          {value:3,target:18,delay:1.5,speed:0.12},  // ×6
          {value:4,target:24,delay:4.5,speed:0.12},  // ×6
          {value:2,target:20,delay:7.5,speed:0.13},  // ×10
          {value:5,target:30,delay:10.5,speed:0.13}, // ×6
          {value:3,target:30,delay:13.5,speed:0.13}, // ×10
          {value:4,target:40,delay:16.5,speed:0.14}, // ×10
          {value:6,target:24,delay:19.5,speed:0.14}, // ×4
          {value:5,target:25,delay:22.5,speed:0.14}, // ×5
          {value:6,target:36,delay:25.5,speed:0.14}, // ×6
        ],
        tutorial: 'Tabuadas misturadas! 4 × 6 = 24, 3 × 10 = 30.' },
      { id: 3, diff: 0, lives: 3, title: 'Tabuada do 4 inteira',
        // Toda tabuada do 4. Pool ×4 + ×3 como ruído (criança escolhe certa).
        handPool: [{op:'×',val:4},{op:'×',val:3}],
        enemies: [
          {value:1,target:4,delay:1.8,speed:0.13},
          {value:2,target:8,delay:5.0,speed:0.14},
          {value:3,target:12,delay:8.5,speed:0.14},
          {value:4,target:16,delay:12.0,speed:0.15},
          {value:5,target:20,delay:15.5,speed:0.15},
          {value:6,target:24,delay:19.0,speed:0.15},
          {value:7,target:28,delay:22.5,speed:0.15},
          {value:8,target:32,delay:26.0,speed:0.16},
        ],
        tutorial: 'Tabuada do 4: 2×4=8, 6×4=24. Cuidado pra não pegar a ×3!' },
      { id: 4, diff: 0, lives: 3, title: 'Tabuada do 5 inteira',
        // Toda tabuada do 5. Pool ×5 + ×4 ruído.
        handPool: [{op:'×',val:5},{op:'×',val:4}],
        enemies: [
          {value:1,target:5,delay:1.5,speed:0.14},
          {value:2,target:10,delay:4.5,speed:0.15},
          {value:3,target:15,delay:7.5,speed:0.15},
          {value:4,target:20,delay:10.5,speed:0.16},
          {value:5,target:25,delay:13.5,speed:0.16},
          {value:6,target:30,delay:16.5,speed:0.16},
          {value:7,target:35,delay:19.5,speed:0.17},
          {value:8,target:40,delay:22.5,speed:0.17},
        ],
        tutorial: 'Tabuada do 5: termina em 0 ou 5!' },
      { id: 5, diff: 1, lives: 3, title: 'Tabuada do 10',
        handPool: [{op:'×',val:10},{op:'×',val:5}],
        enemies: [
          {value:1,target:10,delay:1.0,speed:0.19},
          {value:2,target:20,delay:4.0,speed:0.19},
          {value:3,target:30,delay:7.0,speed:0.20},
          {value:4,target:40,delay:10.0,speed:0.20},
          {value:5,target:50,delay:13.0,speed:0.20},
        ],
        tutorial: 'Tabuada do 10: só coloca o zero atrás! 3×10=30.' },
      { id: 6, diff: 1, lives: 3, title: 'Mista 2-3-5',
        handPool: [{op:'×',val:2},{op:'×',val:3},{op:'×',val:5}],
        enemies: [
          {value:4,target:12,delay:1.0,speed:0.22},
          {value:3,target:15,delay:3.5,speed:0.22},
          {value:5,target:10,delay:6.0,speed:0.22},
          {value:4,target:8,delay:8.5,speed:0.22},
          {value:6,target:18,delay:11.0,speed:0.22},
        ] },
      { id: 7, diff: 1, lives: 3, title: 'Mista 2-4-5-10',
        handPool: [{op:'×',val:2},{op:'×',val:4},{op:'×',val:5},{op:'×',val:10}],
        enemies: [
          {value:3,target:12,delay:1.0,speed:0.22},
          {value:5,target:50,delay:3.5,speed:0.24},
          {value:4,target:20,delay:6.0,speed:0.24},
          {value:7,target:14,delay:8.5,speed:0.24},
          {value:6,target:30,delay:11.0,speed:0.24},
        ] },
      { id: 8, diff: 3, lives: 3, title: 'BOSS: Tabuada Mestre',
        // Inimigos COMPOSTOS — vários caminhos cada (×2×6, ×3×4, ×4×3...).
        // Evita o problema de "carta única" que parecia bug.
        handPool: [{op:'×',val:2},{op:'×',val:3},{op:'×',val:4},{op:'×',val:5},{op:'×',val:6}],
        enemies: [
          {value:2,target:12,delay:0.8,speed:0.22},  // ×6, ×2×3, ×3×2
          {value:3,target:24,delay:2.8,speed:0.24},  // ×2×4, ×4×2, ×8(n/a)→ ×2×2×... várias
          {value:4,target:24,delay:5.0,speed:0.24},  // ×6, ×2×3, ×3×2
          {value:2,target:36,delay:7.2,speed:0.24},  // ×2×3×3, ×3×6, ×6×3, ×2×2×... várias
          {value:3,target:36,delay:9.4,speed:0.26},  // ×2×6, ×6×2, ×3×4, ×4×3, ×3×2×2
          {value:2,target:48,delay:11.6,speed:0.26}, // ×2×4×... ×4×2×6, ×6×4×2, ×2×3×... várias
        ] },
    ]
  },

  div: {
    id: 'div', icon: '÷', label: 'Divisão', sub: 'divida até 1',
    color: '#6c8dff',
    mentor: MENTORS.mira,
    tutorial: 'A Mira ensina a repartir. Divida o Numinho até virar 1!',
    levels: [
      { id: 1, diff: 0, lives: 3, title: 'Quanto dividir?',
        // Variedade desde o início — pool com ÷2, ÷3, ÷4, ÷5.
        // Cada inimigo é um puzzle: qual carta (ou combinação) chega em 1?
        handPool: [{op:'÷',val:2},{op:'÷',val:3},{op:'÷',val:4},{op:'÷',val:5}],
        enemies: [
          {value:2,target:1,delay:1.8,speed:0.11},    // ÷2
          {value:3,target:1,delay:5.0,speed:0.11},    // ÷3
          {value:4,target:1,delay:8.5,speed:0.12},    // ÷4 OU ÷2÷2
          {value:5,target:1,delay:12.0,speed:0.12},   // ÷5
          {value:6,target:1,delay:15.5,speed:0.12},   // ÷2÷3 OU ÷3÷2
          {value:8,target:1,delay:19.0,speed:0.12},   // ÷4÷2 OU ÷2÷4 OU ÷2÷2÷2
          {value:9,target:1,delay:22.5,speed:0.13},   // ÷3÷3
          {value:10,target:1,delay:26.0,speed:0.13},  // ÷5÷2 OU ÷2÷5
        ],
        tutorial: 'Divida até virar 1! 8 ÷ 4 = 2, ÷ 2 = 1. Várias formas funcionam.' },
      { id: 2, diff: 0, lives: 3, title: 'Mais divisores',
        // Pool maior — ÷2 a ÷6 + ÷10. Inimigos com múltiplos caminhos.
        handPool: [{op:'÷',val:2},{op:'÷',val:3},{op:'÷',val:4},{op:'÷',val:5},{op:'÷',val:6},{op:'÷',val:10}],
        enemies: [
          {value:6,target:1,delay:1.5,speed:0.12},    // ÷6 OU ÷2÷3 OU ÷3÷2
          {value:10,target:1,delay:4.5,speed:0.13},   // ÷10 OU ÷5÷2
          {value:12,target:1,delay:7.5,speed:0.13},   // ÷6÷2, ÷4÷3, ÷3÷4
          {value:15,target:1,delay:10.5,speed:0.13},  // ÷5÷3, ÷3÷5
          {value:18,target:1,delay:13.5,speed:0.14},  // ÷6÷3, ÷3÷6, ÷2÷3÷3
          {value:20,target:1,delay:16.5,speed:0.14},  // ÷10÷2, ÷5÷4, ÷4÷5
          {value:24,target:1,delay:19.5,speed:0.14},  // ÷6÷4, ÷4÷6, ÷3÷4÷2 etc
          {value:30,target:1,delay:22.5,speed:0.14},  // ÷6÷5, ÷5÷6, ÷10÷3
        ],
        tutorial: 'Várias divisões possíveis! 12 ÷ 4 = 3, ÷ 3 = 1. Ou 12 ÷ 6 = 2, ÷ 2 = 1.' },
      { id: 3, diff: 0, lives: 3, title: 'Múltiplos de 4',
        handPool: [{op:'÷',val:2},{op:'÷',val:3},{op:'÷',val:4}],
        enemies: [
          {value:8,target:1,delay:1.2,speed:0.15},
          {value:12,target:1,delay:5.0,speed:0.15},
          {value:9,target:1,delay:8.5,speed:0.15},
          {value:16,target:1,delay:12.0,speed:0.15},
        ] },
      { id: 4, diff: 0, lives: 3, title: 'Mais opções',
        handPool: [{op:'÷',val:2},{op:'÷',val:3},{op:'÷',val:4},{op:'÷',val:5}],
        enemies: [
          {value:25,target:1,delay:1.0,speed:0.17},
          {value:20,target:1,delay:4.0,speed:0.17},
          {value:16,target:1,delay:7.0,speed:0.17},
          {value:12,target:1,delay:10.0,speed:0.18},
          {value:15,target:1,delay:13.0,speed:0.17},
        ],
        tutorial: '25 ÷ 5 = 5, ÷ 5 = 1. Pense quais divisores existem.' },
      { id: 5, diff: 1, lives: 3, title: 'Até trinta',
        handPool: [{op:'÷',val:2},{op:'÷',val:3},{op:'÷',val:4},{op:'÷',val:5}],
        enemies: [
          {value:18,target:1,delay:1.0,speed:0.19},
          {value:20,target:1,delay:3.5,speed:0.19},
          {value:24,target:1,delay:6.0,speed:0.20},
          {value:30,target:1,delay:8.5,speed:0.20},
          {value:16,target:1,delay:11.0,speed:0.20},
        ] },
      { id: 6, diff: 1, lives: 3, title: 'Por seis também',
        handPool: [{op:'÷',val:2},{op:'÷',val:3},{op:'÷',val:4},{op:'÷',val:5},{op:'÷',val:6}],
        enemies: [
          {value:36,target:1,delay:1.0,speed:0.20},
          {value:24,target:1,delay:3.5,speed:0.20},
          {value:30,target:1,delay:6.0,speed:0.22},
          {value:25,target:1,delay:8.5,speed:0.22},
          {value:20,target:1,delay:11.0,speed:0.22},
        ] },
      { id: 7, diff: 1, lives: 3, title: 'Por dez',
        handPool: [{op:'÷',val:2},{op:'÷',val:3},{op:'÷',val:4},{op:'÷',val:5},{op:'÷',val:6},{op:'÷',val:10}],
        enemies: [
          {value:36,target:1,delay:1.0,speed:0.22},
          {value:60,target:1,delay:3.0,speed:0.22},
          {value:48,target:1,delay:5.5,speed:0.24},
          {value:30,target:1,delay:8.0,speed:0.24},
          {value:24,target:1,delay:10.5,speed:0.24},
        ] },
      { id: 8, diff: 3, lives: 3, title: 'BOSS: Cem!',
        handPool: [{op:'÷',val:2},{op:'÷',val:3},{op:'÷',val:4},{op:'÷',val:5},{op:'÷',val:6},{op:'÷',val:10}],
        enemies: [
          {value:100,target:1,delay:0.8,speed:0.22},
          {value:60,target:1,delay:3.0,speed:0.24},
          {value:48,target:1,delay:5.0,speed:0.24},
          {value:36,target:1,delay:7.0,speed:0.26},
          {value:24,target:1,delay:9.0,speed:0.26},
          {value:72,target:1,delay:11.0,speed:0.24},
        ] },
    ]
  },

  mixed: {
    id: 'mixed', icon: '🎯', label: 'Tudo Junto', sub: '4 operações',
    color: '#9d4edd',
    mentor: MENTORS.mixed,
    tutorial: 'Tudo misturado! Os 4 mentores juntos. Escolha a operação certa!',
    levels: [
      { id: 1, diff: 0, lives: 3, title: 'Soma ou subtrai?',
        handPool: [{op:'+',val:1},{op:'+',val:2},{op:'+',val:3},{op:'-',val:2},{op:'-',val:4}],
        enemies: [
          {value:3,target:5,delay:1.8,speed:0.13},
          {value:4,target:0,delay:6.0,speed:0.13},
          {value:2,target:5,delay:10.0,speed:0.13},
          {value:2,target:0,delay:14.0,speed:0.13},
        ],
        tutorial: 'Olha o alvo amarelo. Soma ou subtrai pra chegar nele!' },
      { id: 2, diff: 0, lives: 3, title: 'Entra ×',
        handPool: [{op:'+',val:3},{op:'-',val:5},{op:'×',val:2}],
        enemies: [
          {value:3,target:6,delay:1.5,speed:0.15},
          {value:5,target:0,delay:5.0,speed:0.15},
          {value:4,target:8,delay:9.0,speed:0.15},
          {value:3,target:6,delay:13.0,speed:0.15},
        ],
        tutorial: 'Carta amarela (×) multiplica! 3 × 2 = 6.' },
      { id: 3, diff: 0, lives: 3, title: 'Entra ÷',
        handPool: [{op:'+',val:5},{op:'-',val:5},{op:'×',val:2},{op:'÷',val:2}],
        enemies: [
          {value:8,target:1,delay:1.5,speed:0.17},
          {value:5,target:10,delay:5.0,speed:0.17},
          {value:5,target:0,delay:9.0,speed:0.17},
          {value:4,target:1,delay:13.0,speed:0.17},
        ],
        tutorial: 'Alvo 1? Use ÷ pra dividir até 1!' },
      { id: 4, diff: 0, lives: 3, title: 'Tudo simples',
        handPool: [{op:'+',val:3},{op:'-',val:3},{op:'×',val:3},{op:'÷',val:3}],
        enemies: [
          {value:2,target:5,delay:1.2,speed:0.18},
          {value:3,target:0,delay:4.5,speed:0.18},
          {value:2,target:6,delay:7.5,speed:0.18},
          {value:9,target:1,delay:10.5,speed:0.18},
          {value:3,target:9,delay:13.5,speed:0.18},
        ] },
      { id: 5, diff: 1, lives: 3, title: 'Mais opções',
        handPool: [{op:'+',val:2},{op:'+',val:5},{op:'-',val:3},{op:'-',val:5},{op:'×',val:2},{op:'÷',val:2}],
        enemies: [
          {value:5,target:10,delay:1.0,speed:0.20},
          {value:8,target:0,delay:3.5,speed:0.20},
          {value:10,target:0,delay:6.0,speed:0.22},
          {value:8,target:4,delay:8.5,speed:0.22},
          {value:3,target:6,delay:11.0,speed:0.22},
        ] },
      { id: 6, diff: 1, lives: 3, title: 'Estratégia',
        handPool: [{op:'+',val:5},{op:'+',val:10},{op:'-',val:10},{op:'×',val:3},{op:'×',val:5},{op:'÷',val:3}],
        enemies: [
          {value:5,target:15,delay:1.0,speed:0.22},
          {value:10,target:0,delay:3.5,speed:0.22},
          {value:9,target:1,delay:6.0,speed:0.24},
          {value:4,target:20,delay:8.5,speed:0.24},
          {value:15,target:5,delay:11.0,speed:0.24},
        ] },
      { id: 7, diff: 1, lives: 3, title: 'Pressão',
        handPool: [{op:'+',val:5},{op:'+',val:10},{op:'-',val:10},{op:'-',val:20},{op:'×',val:4},{op:'×',val:5},{op:'÷',val:2},{op:'÷',val:5}],
        enemies: [
          {value:5,target:25,delay:1.0,speed:0.24},
          {value:20,target:0,delay:2.8,speed:0.24},
          {value:8,target:1,delay:5.0,speed:0.26},
          {value:4,target:20,delay:7.0,speed:0.26},
          {value:25,target:1,delay:9.0,speed:0.26},
          {value:10,target:0,delay:11.0,speed:0.26},
        ] },
      { id: 8, diff: 3, lives: 3, title: 'BOSS Final',
        // Inimigos com MÚLTIPLOS caminhos — sem "carta única" frustrante.
        handPool: [{op:'+',val:5},{op:'+',val:10},{op:'-',val:5},{op:'-',val:10},{op:'×',val:2},{op:'×',val:3},{op:'÷',val:2},{op:'÷',val:3}],
        enemies: [
          {value:5,target:15,delay:0.8,speed:0.22},   // +10, ×3, +5+5
          {value:20,target:0,delay:2.6,speed:0.24},   // -10-10, -10-5-5, -5×4
          {value:12,target:2,delay:4.8,speed:0.24},   // ÷2÷3, ÷3÷2
          {value:10,target:20,delay:7.0,speed:0.24},  // +10, ×2, +5+5
          {value:10,target:30,delay:9.2,speed:0.26},  // ×3, +10+10, +5+5+10
          {value:18,target:1,delay:11.4,speed:0.26},  // ÷2÷3÷3, ÷3÷2÷3, ÷3÷3÷2 — vários
        ] },
    ]
  },
};

// Função utilitária — cor do Numinho baseada no valor.
export function colorFor(v) {
  if (v === 0) return '#cccccc';
  if (v < 0) return '#9d4edd';
  if (v <= 5) return '#43d177';
  if (v <= 10) return '#ffd166';
  if (v <= 20) return '#ff8e3c';
  return '#ff6b6b';
}
