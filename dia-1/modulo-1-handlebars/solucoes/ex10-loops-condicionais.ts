/**
 * Solucao - Exercicio 10: Each + If Combinados
 */

import Handlebars from 'handlebars';

const relatorioVendas = {
  mes: 'Janeiro 2026',
  vendedores: [
    { nome: 'Alice', vendas: 45, meta: 40, regiao: 'Sul', destaque: true },
    { nome: 'Bob', vendas: 32, meta: 40, regiao: 'Norte', destaque: false },
    { nome: 'Carol', vendas: 51, meta: 40, regiao: 'Sudeste', destaque: true },
    { nome: 'Daniel', vendas: 38, meta: 40, regiao: 'Centro-Oeste', destaque: false },
    { nome: 'Eva', vendas: 40, meta: 40, regiao: 'Nordeste', destaque: false },
  ],
};

// Solucao TODO 1: Helpers de comparacao e calculo
Handlebars.registerHelper('gte', function (a: number, b: number) {
  return a >= b;
});

Handlebars.registerHelper('percentage', function (a: number, b: number) {
  return ((a / b) * 100).toFixed(1);
});

Handlebars.registerHelper('subtract', function (a: number, b: number) {
  return a - b;
});

// Solucao TODO 2: Template com loop + condicionais
const templateRelatorio = `Relatorio de Vendas - {{mes}}
========================================
{{#each vendedores}}{{#if (gte vendas meta)}}[BATEU] {{nome}} ({{regiao}}) - META BATIDA ({{percentage vendas meta}}%){{#if destaque}} ⭐{{/if}}
{{else}}[    ] {{nome}} ({{regiao}}) - Faltam {{subtract meta vendas}} vendas
{{/if}}{{/each}}`;

// Solucao TODO 3: Helper de contagem e template de resumo
Handlebars.registerHelper(
  'countMetaBatida',
  function (vendedores: Array<{ vendas: number; meta: number }>) {
    return vendedores.filter((v) => v.vendas >= v.meta).length;
  },
);

Handlebars.registerHelper(
  'countMetaNaoBatida',
  function (vendedores: Array<{ vendas: number; meta: number }>) {
    return vendedores.filter((v) => v.vendas < v.meta).length;
  },
);

Handlebars.registerHelper(
  'totalVendas',
  function (vendedores: Array<{ vendas: number }>) {
    return vendedores.reduce((sum, v) => sum + v.vendas, 0);
  },
);

Handlebars.registerHelper(
  'melhorVendedor',
  function (vendedores: Array<{ nome: string; vendas: number }>) {
    const melhor = vendedores.reduce((best, v) => (v.vendas > best.vendas ? v : best));
    return `${melhor.nome} (${melhor.vendas} vendas)`;
  },
);

const templateResumo = `========================================
Resumo:
  Total de vendedores: {{vendedores.length}}
  Bateram meta: {{countMetaBatida vendedores}}
  Nao bateram: {{countMetaNaoBatida vendedores}}
  Total de vendas: {{totalVendas vendedores}}
  Melhor vendedor: {{melhorVendedor vendedores}}`;

// Compile e teste
const compiladoRelatorio = Handlebars.compile(templateRelatorio);
console.log(compiladoRelatorio(relatorioVendas));

const compiladoResumo = Handlebars.compile(templateResumo);
console.log(compiladoResumo(relatorioVendas));
