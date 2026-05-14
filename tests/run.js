// Entry-point dos testes — importa todos os suites e roda.
// Funciona tanto em Node (node tests/run.js) quanto no browser (test.html).

import './math.test.js';
import './solver.test.js';
import { runAll } from './test-runner.js';

const result = await runAll();
const isNode = typeof process !== 'undefined' && process.versions && process.versions.node;

if (isNode) {
  // Output texto pro terminal / CI
  for (const suite of result.results) {
    console.log(`\n  ${suite.name}`);
    for (const t of suite.tests) {
      if (t.ok) console.log(`    \x1b[32m✓\x1b[0m ${t.name}`);
      else      console.log(`    \x1b[31m✗\x1b[0m ${t.name}\n        ${t.error}`);
    }
  }
  console.log(`\n  ${result.passed} passed, ${result.failed} failed\n`);
  process.exit(result.failed > 0 ? 1 : 0);
} else {
  // Browser — renderiza HTML
  const out = document.getElementById('out');
  let html = '';
  for (const suite of result.results) {
    html += `<h2>${suite.name}</h2><ul>`;
    for (const t of suite.tests) {
      html += t.ok
        ? `<li class="ok">✓ ${t.name}</li>`
        : `<li class="fail">✗ ${t.name}<br><pre>${t.error}</pre></li>`;
    }
    html += '</ul>';
  }
  const status = result.failed === 0
    ? `<div class="summary ok">✓ ${result.passed} testes passando</div>`
    : `<div class="summary fail">✗ ${result.failed} falhando · ${result.passed} passando</div>`;
  out.innerHTML = status + html;
}
