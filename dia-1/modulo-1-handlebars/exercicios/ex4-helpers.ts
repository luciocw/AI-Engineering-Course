/**
 * Exercicio 4: Helpers Customizados
 *
 * Crie funcoes reutilizaveis que podem ser usadas dentro dos templates.
 * Execute: npx tsx exercicios/ex4-helpers.ts
 */

import Handlebars from 'handlebars';

// === Dados ===
const pedido = {
  cliente: 'joao pereira',
  itens: [
    { nome: 'Curso AI Engineering', preco: 497.5 },
    { nome: 'Mentoria Individual', preco: 1200 },
    { nome: 'Ebook RAG Avancado', preco: 89.9 },
  ],
  desconto: 0.15,
  data: new Date('2026-02-15'),
  descricaoLonga:
    'Este pacote inclui acesso completo ao curso de AI Engineering com todos os modulos, mentoria individual com especialista e ebook exclusivo sobre RAG avancado com exemplos praticos',
};

// === TODO 1: Helper "uppercase" ===
// Transforma texto em maiusculas.
// Uso no template: {{uppercase cliente}}
// Output: "JOAO PEREIRA"

// Handlebars.registerHelper('uppercase', ...);

// === TODO 2: Helper "currency" ===
// Formata numero como moeda brasileira.
// Uso: {{currency preco}}
// Output: "R$ 497,50"
//
// Dica: use toLocaleString('pt-BR') ou formate manualmente

// Handlebars.registerHelper('currency', ...);

// === TODO 3: Helper "truncate" ===
// Corta texto em N caracteres e adiciona "..."
// Uso: {{truncate descricaoLonga 50}}
// Output: "Este pacote inclui acesso completo ao curso de AI..."

// Handlebars.registerHelper('truncate', ...);

// === TODO 4: Helper "formatDate" ===
// Formata Date para "DD/MM/YYYY"
// Uso: {{formatDate data}}
// Output: "15/02/2026"

// Handlebars.registerHelper('formatDate', ...);

// === TODO 5: Helper "total" (block helper) ===
// Calcula total de um array de itens com preco.
// Uso: {{total itens}}
// Output: "1787.40"

// Handlebars.registerHelper('total', ...);

// === Template usando todos os helpers ===
const templatePedido = `
=== Recibo ===
Cliente: {{uppercase cliente}}
Data: {{formatDate data}}

Itens:
{{#each itens}}
  - {{nome}}: {{currency preco}}
{{/each}}

Total: {{total itens}}
Desconto: {{desconto}}%
Descricao: {{truncate descricaoLonga 60}}
`;

// TODO: compile e exiba o resultado
// const compilado = Handlebars.compile(templatePedido);
// console.log(compilado(pedido));

console.log('\n--- Exercicio 4 completo! ---');
console.log('Dica: veja a solucao em solucoes/ex4-helpers.ts');
