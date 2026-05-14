// Test runner minimalista — compatível com browser e Node (zero dependências).
// API parecida com Vitest: describe / it / expect(...).toBe(...) / .toEqual(...) / .not.

const suites = [];
let currentSuite = null;

export function describe(name, fn) {
  const suite = { name, tests: [] };
  currentSuite = suite;
  suites.push(suite);
  fn();
  currentSuite = null;
}

export function it(name, fn) {
  if (!currentSuite) throw new Error('it() fora de describe()');
  currentSuite.tests.push({ name, fn });
}

class Expectation {
  constructor(actual, negate = false) {
    this.actual = actual;
    this.negate = negate;
  }
  get not() { return new Expectation(this.actual, !this.negate); }
  toBe(expected) {
    const pass = Object.is(this.actual, expected);
    if (this.negate ? pass : !pass) {
      throw new Error(`expected ${JSON.stringify(this.actual)} ${this.negate ? 'not ' : ''}to be ${JSON.stringify(expected)}`);
    }
  }
  toEqual(expected) {
    const a = JSON.stringify(this.actual);
    const e = JSON.stringify(expected);
    const pass = a === e;
    if (this.negate ? pass : !pass) {
      throw new Error(`expected ${a} ${this.negate ? 'not ' : ''}to equal ${e}`);
    }
  }
}
export function expect(actual) { return new Expectation(actual); }

// Runner — executa todos os suites e retorna resumo
export async function runAll() {
  let passed = 0, failed = 0;
  const results = [];
  for (const suite of suites) {
    const suiteResult = { name: suite.name, tests: [] };
    for (const test of suite.tests) {
      try {
        await test.fn();
        passed++;
        suiteResult.tests.push({ name: test.name, ok: true });
      } catch (err) {
        failed++;
        suiteResult.tests.push({ name: test.name, ok: false, error: err.message });
      }
    }
    results.push(suiteResult);
  }
  return { passed, failed, results };
}

// Pra Node — auto-run quando importado via CLI
const isNode = typeof process !== 'undefined' && process.versions && process.versions.node;
if (isNode && import.meta.url === `file://${process.argv[1]}`.replace(/\\/g, '/')) {
  // Caso especial: invocar direto. Mas testes são em outros arquivos, então
  // o entry-point real é tests/run.js que importa todos os *.test.js.
}
