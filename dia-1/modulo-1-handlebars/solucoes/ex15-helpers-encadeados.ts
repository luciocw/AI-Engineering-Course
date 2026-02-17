/**
 * Solucao - Exercicio 15: Composicao de Helpers
 */

import Handlebars from 'handlebars';

// === Dados de transacoes financeiras ===
const transacoes = [
  { descricao: 'venda curso ai', valor: 497.5, tipo: 'receita', data: new Date('2026-01-15') },
  { descricao: 'servidor cloud', valor: 89.9, tipo: 'despesa', data: new Date('2026-01-20') },
  { descricao: 'mentoria grupo', valor: 1200, tipo: 'receita', data: new Date('2026-02-01') },
  { descricao: 'licenca software', valor: 299, tipo: 'despesa', data: new Date('2026-02-10') },
];

// Solucao TODO 1: Helpers basicos
Handlebars.registerHelper('uppercase', (texto: string) => {
  return String(texto).toUpperCase();
});

Handlebars.registerHelper('currency', (valor: number) => {
  const formatado = Number(valor).toFixed(2).replace('.', ',');
  return `R$ ${formatado}`;
});

Handlebars.registerHelper('formatDate', (data: Date) => {
  return data.toLocaleDateString('pt-BR');
});

Handlebars.registerHelper('eq', (a: unknown, b: unknown) => a === b);

// Solucao TODO 2: Helper calcularTotal com subexpressao
Handlebars.registerHelper(
  'calcularTotal',
  (lista: Array<{ valor: number; tipo: string }>) => {
    return lista.reduce((total, item) => {
      return item.tipo === 'receita' ? total + item.valor : total - item.valor;
    }, 0);
  },
);

// Solucao TODO 3: Template com subexpressoes aninhadas
const templateExtrato = `=== Extrato Financeiro ===
{{#each transacoes}}
{{#if (eq tipo "receita")}}  + {{currency valor}}{{else}}  - {{currency valor}}{{/if}} | {{uppercase descricao}} | {{formatDate data}}
{{/each}}
---------------------------------
Saldo: {{currency (calcularTotal transacoes)}}`;

// Solucao TODO 4: Helper pipe
Handlebars.registerHelper('pipe', function (...args: unknown[]) {
  // O ultimo argumento e sempre options do Handlebars
  const options = args.pop();
  // O primeiro argumento e o valor inicial
  let valor = args.shift();
  // Os demais sao nomes de transformacoes
  const transforms = args as string[];

  const transformMap: Record<string, (val: string, param?: string) => string> = {
    uppercase: (val) => String(val).toUpperCase(),
    lowercase: (val) => String(val).toLowerCase(),
    trim: (val) => String(val).trim(),
    truncate: (val, param) => {
      const limite = parseInt(param || '20', 10);
      const str = String(val);
      return str.length > limite ? str.substring(0, limite) + '...' : str;
    },
    capitalize: (val) => {
      const str = String(val);
      return str
        .split(' ')
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
    },
  };

  let resultado = String(valor);

  for (const transform of transforms) {
    const [nome, param] = transform.split(':');
    const fn = transformMap[nome];
    if (fn) {
      resultado = fn(resultado, param);
    }
  }

  return resultado;
});

// Template usando pipe
const templatePipe = `=== Transformacoes com Pipe ===
{{#each transacoes}}
  {{pipe descricao "uppercase" "truncate:15"}} | {{currency valor}}
{{/each}}`;

// Compile e teste
const compiladoExtrato = Handlebars.compile(templateExtrato);
console.log('=== Extrato Financeiro ===');
console.log(compiladoExtrato({ transacoes }));

const compiladoPipe = Handlebars.compile(templatePipe);
console.log('\n=== Pipe de Transformacoes ===');
console.log(compiladoPipe({ transacoes }));

// Bonus: combinacao avancada de subexpressoes
const templateAvancado = `=== Resumo por Tipo ===
Receitas:
{{#each transacoes}}{{#if (eq tipo "receita")}}  {{pipe descricao "capitalize"}} - {{currency valor}}
{{/if}}{{/each}}
Despesas:
{{#each transacoes}}{{#if (eq tipo "despesa")}}  {{pipe descricao "capitalize"}} - {{currency valor}}
{{/if}}{{/each}}`;

const compiladoAvancado = Handlebars.compile(templateAvancado);
console.log('\n');
console.log(compiladoAvancado({ transacoes }));
