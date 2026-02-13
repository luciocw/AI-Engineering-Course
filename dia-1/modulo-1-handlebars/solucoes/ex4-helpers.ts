/**
 * Solucao - Exercicio 4: Helpers Customizados
 */

import Handlebars from 'handlebars';

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

// Solucao TODO 1: Helper "uppercase"
Handlebars.registerHelper('uppercase', (text: string) => {
  return text.toUpperCase();
});

// Solucao TODO 2: Helper "currency"
Handlebars.registerHelper('currency', (value: number) => {
  return `R$ ${value.toFixed(2).replace('.', ',')}`;
});

// Solucao TODO 3: Helper "truncate"
Handlebars.registerHelper('truncate', (text: string, length: number) => {
  if (text.length <= length) return text;
  return `${text.substring(0, length)}...`;
});

// Solucao TODO 4: Helper "formatDate"
Handlebars.registerHelper('formatDate', (date: Date) => {
  const day = String(date.getUTCDate()).padStart(2, '0');
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  const year = date.getUTCFullYear();
  return `${day}/${month}/${year}`;
});

// Solucao TODO 5: Helper "total"
type Item = { nome: string; preco: number };
Handlebars.registerHelper('total', (itens: Item[]) => {
  const soma = itens.reduce((acc, item) => acc + item.preco, 0);
  return `R$ ${soma.toFixed(2).replace('.', ',')}`;
});

// Template completo
const templatePedido = `=== Recibo ===
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

const compilado = Handlebars.compile(templatePedido);
console.log(compilado(pedido));
