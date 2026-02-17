/**
 * Exercicio 15: Composicao de Helpers
 *
 * Aprenda a usar subexpressoes para encadear helpers: (helper1 (helper2 arg)).
 * Voce ja domina helpers de comparacao e block helpers (ex13-ex14). Agora combine-os.
 * Execute: npx tsx exercicios/ex15-helpers-encadeados.ts
 */

import Handlebars from 'handlebars';

// === Dados de transacoes financeiras ===
const transacoes = [
  { descricao: 'venda curso ai', valor: 497.5, tipo: 'receita', data: new Date('2026-01-15') },
  { descricao: 'servidor cloud', valor: 89.9, tipo: 'despesa', data: new Date('2026-01-20') },
  { descricao: 'mentoria grupo', valor: 1200, tipo: 'receita', data: new Date('2026-02-01') },
  { descricao: 'licenca software', valor: 299, tipo: 'despesa', data: new Date('2026-02-10') },
];

// === TODO 1: Registre helpers basicos ===
// Crie os seguintes helpers:
//
//   uppercase - converte texto para maiusculas
//     Uso: {{uppercase descricao}} => "VENDA CURSO AI"
//
//   currency - formata numero como moeda brasileira
//     Uso: {{currency valor}} => "R$ 497,50"
//     Dica: use toFixed(2) e substitua '.' por ','
//
//   formatDate - formata Date para dd/mm/aaaa
//     Uso: {{formatDate data}} => "15/01/2026"
//     Dica: use toLocaleDateString('pt-BR')
//
//   eq - comparacao de igualdade
//     Uso: {{#if (eq tipo "receita")}}...{{/if}}

// TODO: Registre os 4 helpers aqui

// === TODO 2: Crie helper calcularTotal e use subexpressoes ===
// Crie um helper que recebe o array de transacoes e retorna a soma
// dos valores (receitas positivas, despesas negativas).
//
// Uso com subexpressao: {{currency (calcularTotal transacoes)}}
// Isso primeiro calcula o total, depois formata como moeda.
//
// Dica: o helper recebe o array como primeiro argumento.
// Some os valores: receita como positivo, despesa como negativo.

// TODO: Registre o helper 'calcularTotal' aqui

// === TODO 3: Template com subexpressoes aninhadas ===
// Crie um template que para cada transacao exiba:
// - Se receita: "+ R$ 497,50 | VENDA CURSO AI | 15/01/2026"
// - Se despesa: "- R$ 89,90  | SERVIDOR CLOUD | 20/01/2026"
//
// Use subexpressoes aninhadas:
//   {{#if (eq tipo "receita")}}+{{else}}-{{/if}} {{currency valor}} | {{uppercase descricao}} | {{formatDate data}}
//
// No final, mostre o total: "Saldo: R$ 1.308,60"
// Usando: {{currency (calcularTotal transacoes)}}

const templateExtrato = `
TODO: Crie template de extrato com subexpressoes aninhadas
Cada linha deve mostrar +/- valor | descricao em maiuscula | data formatada
No final mostre o saldo total
`;

// === TODO 4: Crie um helper 'pipe' que encadeia transformacoes ===
// O helper 'pipe' recebe um valor e uma lista de nomes de transformacoes.
// Cada transformacao e aplicada ao resultado da anterior.
//
// Uso: {{pipe descricao "uppercase" "truncate:10"}}
// 1. "venda curso ai" -> "VENDA CURSO AI" (uppercase)
// 2. "VENDA CURSO AI" -> "VENDA CURS..." (truncate:10)
//
// Dica: dentro do helper, mantenha um mapa de funcoes:
//   const transforms = {
//     uppercase: (val) => String(val).toUpperCase(),
//     lowercase: (val) => String(val).toLowerCase(),
//     'truncate:N': (val) => trunca para N caracteres + "..."
//   };
// Parse o nome da transformacao para separar "truncate" de "10".

// TODO: Registre o helper 'pipe' aqui

const templatePipe = `
TODO: Crie template que usa o helper pipe para encadear transformacoes
Mostre cada descricao com uppercase e truncada em 15 caracteres
`;

// === Compile e teste ===

console.log('=== Extrato Financeiro ===');
// TODO: compile templateExtrato e exiba

console.log('\n=== Pipe de Transformacoes ===');
// TODO: compile templatePipe e exiba

console.log('\n--- Exercicio 15 completo! ---');
console.log('Dica: veja a solucao em solucoes/ex15-helpers-encadeados.ts');
