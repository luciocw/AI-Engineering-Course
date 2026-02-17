/**
 * Solucao - Exercicio 7: Loops com Each
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
};

// Solucao TODO 1: Lista com {{#each}} e {{@index}}
const templateLista = `Catalogo: {{loja}}
{{#each produtos}}
{{@index}}. {{nome}} - R\${{preco}}
{{/each}}`;

console.log('=== TODO 1: Lista com @index ===');
const comp1 = Handlebars.compile(templateLista);
console.log(comp1(catalogo));

// Solucao TODO 2: Filtro com {{#if}} dentro de {{#each}}
const templateFiltrado = `Produtos disponiveis:
{{#each produtos}}
{{#if estoque}}
  - {{nome}} (R\${{preco}}) - EM ESTOQUE
{{/if}}
{{/each}}
Produtos esgotados:
{{#each produtos}}
{{#unless estoque}}
  - {{nome}} (R\${{preco}}) - ESGOTADO
{{/unless}}
{{/each}}`;

console.log('=== TODO 2: Filtrado por estoque ===');
const comp2 = Handlebars.compile(templateFiltrado);
console.log(comp2(catalogo));

// Solucao TODO 3: {{@first}} e {{@last}} para formatacao especial
const templateFormatado = `{{#each produtos}}
{{#if @first}}[DESTAQUE] {{/if}}{{#if @last}}[ULTIMO] {{/if}}{{nome}} - R\${{preco}}
{{/each}}`;

console.log('=== TODO 3: @first e @last ===');
const comp3 = Handlebars.compile(templateFormatado);
console.log(comp3(catalogo));

// Solucao TODO 4: {{else}} dentro de {{#each}} para array vazia
// O bloco {{else}} e executado quando a lista esta vazia.
const templateComElse = `{{loja}}:
{{#each produtos}}
  - {{nome}} (R\${{preco}})
{{else}}
  Nenhum produto encontrado.
{{/each}}`;

const catalogoVazio = {
  loja: 'Loja Nova',
  produtos: [],
};

console.log('=== TODO 4: Array vazia ===');
const comp4 = Handlebars.compile(templateComElse);
console.log('Com produtos:');
console.log(comp4(catalogo));
console.log('\nSem produtos:');
console.log(comp4(catalogoVazio));

// Bonus: iterando sobre tags (array aninhado dentro de each)
const templateTags = `{{#each produtos}}
{{nome}}: {{#each tags}}[{{this}}] {{/each}}
{{/each}}`;

console.log('\n=== Bonus: Tags (each aninhado) ===');
const compTags = Handlebars.compile(templateTags);
console.log(compTags(catalogo));
// Nota: dentro de {{#each tags}}, use {{this}} para acessar
// o valor do item atual (strings simples, nao objetos).
