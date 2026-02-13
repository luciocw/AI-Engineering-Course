/**
 * Solucao - Exercicio 3: Loops com {{#each}}
 */

import Handlebars from 'handlebars';

const catalogo = {
  loja: 'AI Tools Store',
  produtos: [
    { nome: 'Claude API Credits', preco: 50, estoque: true, tags: ['ai', 'api'] },
    { nome: 'Vector DB Hosting', preco: 70, estoque: true, tags: ['database', 'cloud'] },
    { nome: 'GPU Training Hours', preco: 200, estoque: false, tags: ['training', 'gpu'] },
    { nome: 'LangSmith Pro', preco: 35, estoque: true, tags: ['monitoring', 'observability'] },
  ],
  categorias: {
    ai: 'Inteligencia Artificial',
    database: 'Banco de Dados',
    training: 'Treinamento',
    monitoring: 'Monitoramento',
  },
};

// Helper para incrementar index ({{@index}} comeca em 0)
Handlebars.registerHelper('inc', (value: number) => value + 1);

// Solucao TODO 1: Lista de produtos
const templateLista = `=== {{loja}} ===
{{#each produtos}}
{{inc @index}}. {{nome}} - R\${{preco}}
{{/each}}`;

// Solucao TODO 2: Filtrar em estoque
const templateEstoque = `=== Produtos Disponiveis ===
{{#each produtos}}
{{#if estoque}}  [OK] {{nome}} - R\${{preco}}
{{else}}  [ESGOTADO] {{nome}}
{{/if}}{{/each}}`;

// Solucao TODO 3: Tags aninhadas
const templateTags = `=== Produtos com Tags ===
{{#each produtos}}
{{nome}}: {{#each tags}}[{{this}}] {{/each}}
{{/each}}`;

// Solucao TODO 4: Iterar sobre objeto
const templateCategorias = `=== Categorias ===
{{#each categorias}}
{{@key}} -> {{this}}
{{/each}}`;

// Compile e exiba
const compiladoLista = Handlebars.compile(templateLista);
console.log(compiladoLista(catalogo));

const compiladoEstoque = Handlebars.compile(templateEstoque);
console.log(compiladoEstoque(catalogo));

const compiladoTags = Handlebars.compile(templateTags);
console.log(compiladoTags(catalogo));

const compiladoCategorias = Handlebars.compile(templateCategorias);
console.log(compiladoCategorias(catalogo));
