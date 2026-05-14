// Os 4 mentores brasileiros — cada um representa uma operação e um bioma.
// Cada mentor tem identidade visual (SVG inline simples), nome, bioma, frase típica.
//
// PROPRIEDADE INTELECTUAL — esses personagens são candidatos a virar IP
// (livro, desenho animado, brinquedo). Mantê-los consistentes em todos os
// pontos de contato do produto.

// SVG inline simples, estilo flat 2D, fofo. Pode evoluir pra ilustração mais
// caprichada depois sem mudar a interface dos mentores.

const capiSvg = `
<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
  <!-- Capivara - corpo redondo, marrom claro -->
  <ellipse cx="50" cy="60" rx="38" ry="32" fill="#a67c52"/>
  <ellipse cx="50" cy="60" rx="38" ry="32" fill="none" stroke="#7a5a3a" stroke-width="2"/>
  <!-- Focinho -->
  <ellipse cx="50" cy="72" rx="14" ry="10" fill="#c9a17e"/>
  <!-- Olhos -->
  <circle cx="38" cy="50" r="4.5" fill="white"/>
  <circle cx="62" cy="50" r="4.5" fill="white"/>
  <circle cx="38" cy="51" r="2.5" fill="#2d1f3d"/>
  <circle cx="62" cy="51" r="2.5" fill="#2d1f3d"/>
  <!-- Orelhinhas -->
  <ellipse cx="32" cy="33" rx="5" ry="6" fill="#a67c52" stroke="#7a5a3a" stroke-width="1.5"/>
  <ellipse cx="68" cy="33" rx="5" ry="6" fill="#a67c52" stroke="#7a5a3a" stroke-width="1.5"/>
  <!-- Narinas -->
  <circle cx="46" cy="74" r="1.2" fill="#2d1f3d"/>
  <circle cx="54" cy="74" r="1.2" fill="#2d1f3d"/>
  <!-- Sorriso -->
  <path d="M 44 80 Q 50 84 56 80" stroke="#2d1f3d" stroke-width="1.5" fill="none" stroke-linecap="round"/>
</svg>
`.trim();

const tucaSvg = `
<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
  <!-- Tucano - corpo preto com peito amarelo -->
  <ellipse cx="50" cy="60" rx="32" ry="34" fill="#1a1a2e"/>
  <ellipse cx="50" cy="68" rx="22" ry="18" fill="#ffd166"/>
  <!-- Bico grande colorido -->
  <path d="M 55 45 Q 92 38 88 55 Q 70 55 55 55 Z" fill="#ff8e3c" stroke="#c95a1a" stroke-width="1.5"/>
  <path d="M 55 45 Q 78 42 80 48" stroke="#43d177" stroke-width="3" fill="none" stroke-linecap="round"/>
  <!-- Olho -->
  <circle cx="42" cy="44" r="6" fill="white"/>
  <circle cx="42" cy="45" r="3" fill="#2d1f3d"/>
  <!-- Patinhas -->
  <line x1="42" y1="92" x2="42" y2="98" stroke="#ff8e3c" stroke-width="3" stroke-linecap="round"/>
  <line x1="58" y1="92" x2="58" y2="98" stroke="#ff8e3c" stroke-width="3" stroke-linecap="round"/>
</svg>
`.trim();

const botoSvg = `
<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
  <!-- Boto cor-de-rosa - corpo curvado -->
  <path d="M 15 55 Q 30 30 60 35 Q 88 42 85 60 Q 80 75 60 72 Q 30 78 15 55 Z" fill="#ff9eb5" stroke="#d6739e" stroke-width="2"/>
  <!-- Bico/focinho -->
  <ellipse cx="22" cy="58" rx="10" ry="5" fill="#ff9eb5" stroke="#d6739e" stroke-width="1.5"/>
  <!-- Olhinhos -->
  <circle cx="38" cy="52" r="3.5" fill="white"/>
  <circle cx="38" cy="53" r="2" fill="#2d1f3d"/>
  <!-- Nadadeira de cima -->
  <path d="M 55 30 L 60 18 L 65 32 Z" fill="#ff9eb5" stroke="#d6739e" stroke-width="1.5"/>
  <!-- Sorriso -->
  <path d="M 22 62 Q 28 65 33 62" stroke="#2d1f3d" stroke-width="1.5" fill="none" stroke-linecap="round"/>
  <!-- Borbulhas mágicas -->
  <circle cx="78" cy="35" r="2" fill="#a3e0ff" opacity="0.7"/>
  <circle cx="85" cy="42" r="1.5" fill="#a3e0ff" opacity="0.7"/>
</svg>
`.trim();

const miraSvg = `
<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
  <!-- Onça-pintada -->
  <ellipse cx="50" cy="60" rx="36" ry="32" fill="#f5c14b"/>
  <ellipse cx="50" cy="60" rx="36" ry="32" fill="none" stroke="#c8941a" stroke-width="2"/>
  <!-- Manchas -->
  <ellipse cx="35" cy="55" rx="3" ry="2.5" fill="#2d1f3d" opacity="0.6"/>
  <ellipse cx="65" cy="55" rx="3" ry="2.5" fill="#2d1f3d" opacity="0.6"/>
  <ellipse cx="30" cy="68" rx="2.5" ry="2" fill="#2d1f3d" opacity="0.6"/>
  <ellipse cx="70" cy="68" rx="2.5" ry="2" fill="#2d1f3d" opacity="0.6"/>
  <ellipse cx="50" cy="78" rx="2.5" ry="2" fill="#2d1f3d" opacity="0.6"/>
  <!-- Orelhas -->
  <path d="M 26 38 L 22 22 L 36 32 Z" fill="#f5c14b" stroke="#c8941a" stroke-width="1.5"/>
  <path d="M 74 38 L 78 22 L 64 32 Z" fill="#f5c14b" stroke="#c8941a" stroke-width="1.5"/>
  <!-- Olhos verdes (felinos) -->
  <ellipse cx="38" cy="48" rx="5" ry="6" fill="white"/>
  <ellipse cx="62" cy="48" rx="5" ry="6" fill="white"/>
  <ellipse cx="38" cy="49" rx="2" ry="4" fill="#43d177"/>
  <ellipse cx="62" cy="49" rx="2" ry="4" fill="#43d177"/>
  <!-- Focinho -->
  <ellipse cx="50" cy="64" rx="6" ry="4" fill="#ffd6a8"/>
  <path d="M 50 68 L 50 74" stroke="#2d1f3d" stroke-width="1.5"/>
  <path d="M 50 74 Q 46 78 42 76" stroke="#2d1f3d" stroke-width="1.5" fill="none" stroke-linecap="round"/>
  <path d="M 50 74 Q 54 78 58 76" stroke="#2d1f3d" stroke-width="1.5" fill="none" stroke-linecap="round"/>
</svg>
`.trim();

// Versão "mixed" — combinação dos 4 (logo do modo Tudo Junto)
const mixedSvg = `
<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
  <!-- Quatro circulinhos representando os 4 mentores -->
  <circle cx="32" cy="32" r="16" fill="#a67c52" stroke="#7a5a3a" stroke-width="2"/>
  <circle cx="68" cy="32" r="16" fill="#ffd166" stroke="#c8941a" stroke-width="2"/>
  <circle cx="32" cy="68" r="16" fill="#ff9eb5" stroke="#d6739e" stroke-width="2"/>
  <circle cx="68" cy="68" r="16" fill="#f5c14b" stroke="#c8941a" stroke-width="2"/>
  <!-- Operações pequenas no centro -->
  <text x="32" y="38" font-family="Baloo 2, sans-serif" font-weight="800" font-size="16" fill="white" text-anchor="middle">+</text>
  <text x="68" y="38" font-family="Baloo 2, sans-serif" font-weight="800" font-size="16" fill="#2d1f3d" text-anchor="middle">−</text>
  <text x="32" y="74" font-family="Baloo 2, sans-serif" font-weight="800" font-size="16" fill="white" text-anchor="middle">×</text>
  <text x="68" y="74" font-family="Baloo 2, sans-serif" font-weight="800" font-size="16" fill="#2d1f3d" text-anchor="middle">÷</text>
</svg>
`.trim();

export const MENTORS = {
  capi: {
    id: 'capi', name: 'Capi', species: 'Capivara',
    biome: 'Pantanal',
    operation: '+', operationLabel: 'Soma',
    color: '#a67c52',
    catchphrase: 'Quanto mais a gente junta, maior a família fica!',
    svg: capiSvg,
  },
  tuca: {
    id: 'tuca', name: 'Tuca', species: 'Tucano',
    biome: 'Amazônia',
    operation: '−', operationLabel: 'Subtração',
    color: '#ff8e3c',
    catchphrase: 'Tira essa daqui pra eu ver o outro lado!',
    svg: tucaSvg,
  },
  boto: {
    id: 'boto', name: 'Boto', species: 'Boto-cor-de-rosa',
    biome: 'Rio Amazonas',
    operation: '×', operationLabel: 'Multiplicação',
    color: '#ff9eb5',
    catchphrase: 'Olha o truque: era 3, virou 12!',
    svg: botoSvg,
  },
  mira: {
    id: 'mira', name: 'Mira', species: 'Onça-Pintada',
    biome: 'Cerrado',
    operation: '÷', operationLabel: 'Divisão',
    color: '#f5c14b',
    catchphrase: 'Pra dividir certo, primeiro a gente respira.',
    svg: miraSvg,
  },
  mixed: {
    id: 'mixed', name: 'Os Quatro', species: 'União dos Mentores',
    biome: 'Todo Brasil',
    operation: '🎯', operationLabel: 'Tudo Junto',
    color: '#9d4edd',
    catchphrase: 'Todos juntos, qualquer desafio.',
    svg: mixedSvg,
  },
};
