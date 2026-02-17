/**
 * Solucao - Exercicio 11: Helpers de Formatacao
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

// Solucao TODO 1: Helper 'uppercase'
Handlebars.registerHelper('uppercase', function (text: string) {
  return String(text).toUpperCase();
});

// Solucao TODO 2: Helper 'currency'
Handlebars.registerHelper('currency', function (value: number) {
  const formatted = value.toFixed(2).replace('.', ',');
  // Adiciona separador de milhares
  const parts = formatted.split(',');
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return `R$ ${parts.join(',')}`;
});

// Solucao TODO 3: Helper 'truncate'
Handlebars.registerHelper('truncate', function (text: string, limit: number) {
  if (String(text).length <= limit) return text;
  return String(text).substring(0, limit) + '...';
});

// Solucao TODO 4: Helper 'formatDate'
Handlebars.registerHelper('formatDate', function (date: Date) {
  const dia = String(date.getDate()).padStart(2, '0');
  const mes = String(date.getMonth() + 1).padStart(2, '0');
  const ano = date.getFullYear();
  return `${dia}/${mes}/${ano}`;
});

// Solucao TODO 5: Helper 'total'
Handlebars.registerHelper('total', function (itens: Array<{ preco: number }>) {
  return itens.reduce((sum, item) => sum + item.preco, 0);
});

// Helper adicional: calcula total com desconto
Handlebars.registerHelper('totalComDesconto', function (itens: Array<{ preco: number }>, desconto: number) {
  const totalBruto = itens.reduce((sum, item) => sum + item.preco, 0);
  return totalBruto * (1 - desconto);
});

// Template usando todos os helpers
const templatePedido = `=== PEDIDO ===
Cliente: {{uppercase cliente}}
Data: {{formatDate data}}

Itens:
{{#each itens}}- {{nome}}: {{currency preco}}
{{/each}}
Subtotal: {{currency (total itens)}}
Desconto: {{multiply desconto 100}}%
Total com desconto: {{currency (totalComDesconto itens desconto)}}

Descricao: {{truncate descricaoLonga 50}}`;

// Helper para multiplicacao (usado no desconto)
Handlebars.registerHelper('multiply', function (a: number, b: number) {
  return a * b;
});

// Compile e teste
const compilado = Handlebars.compile(templatePedido);
console.log(compilado(pedido));

// Teste com outro pedido
const pedido2 = {
  cliente: 'ana costa',
  itens: [
    { nome: 'Workshop LangChain', preco: 250 },
    { nome: 'Certificado Digital', preco: 50 },
  ],
  desconto: 0.1,
  data: new Date('2026-03-01'),
  descricaoLonga: 'Workshop intensivo de 2 dias sobre LangChain',
};

console.log('\n=== Segundo Pedido ===');
console.log(compilado(pedido2));
