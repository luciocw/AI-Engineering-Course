/**
 * Solucao - Exercicio 12: Helpers Multi-Parametro
 */

import Handlebars from 'handlebars';

const dados = {
  produtos: [
    { nome: 'API Credits', preco: 50, categoria: 'servico', lancamento: new Date('2025-06-01') },
    { nome: 'GPU Hours', preco: 200, categoria: 'infraestrutura', lancamento: new Date('2025-01-15') },
    { nome: 'LangSmith', preco: 35, categoria: 'servico', lancamento: new Date('2026-01-10') },
    { nome: 'Vector DB', preco: 70, categoria: 'infraestrutura', lancamento: new Date('2024-11-20') },
  ],
  moeda: 'BRL',
  idioma: 'pt-BR',
};

// Solucao TODO 1: Helper 'formatPreco' com 2 parametros
Handlebars.registerHelper('formatPreco', function (preco: number, moeda: string) {
  switch (moeda) {
    case 'BRL': {
      const formatted = preco.toFixed(2).replace('.', ',');
      const parts = formatted.split(',');
      parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, '.');
      return `R$ ${parts.join(',')}`;
    }
    case 'USD':
      return `$ ${preco.toFixed(2)}`;
    case 'EUR':
      return `E ${preco.toFixed(2)}`;
    default:
      return `${preco.toFixed(2)} ${moeda}`;
  }
});

// Solucao TODO 2: Helper 'diasDesde'
Handlebars.registerHelper('diasDesde', function (date: Date) {
  const agora = new Date();
  const diffMs = agora.getTime() - date.getTime();
  const dias = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  return `${dias} dias`;
});

// Solucao TODO 3: Helper 'badge' com hash arguments
Handlebars.registerHelper('badge', function (texto: string, options: Handlebars.HelperOptions) {
  const { tipo, cor } = options.hash as { tipo?: string; cor?: string };

  switch (tipo) {
    case 'pill':
      return `[${cor || 'cinza'}: ${texto}]`;
    case 'tag':
      return `#${texto}`;
    default:
      return `(${texto})`;
  }
});

// Solucao TODO 4: Block helper 'filtrar' com hash arguments
Handlebars.registerHelper('filtrar', function (array: Array<Record<string, unknown>>, options: Handlebars.HelperOptions) {
  const hash = options.hash as Record<string, unknown>;

  // Filtra o array baseado em todos os hash arguments
  const filtrado = array.filter((item) => {
    return Object.entries(hash).every(([chave, valor]) => item[chave] === valor);
  });

  if (filtrado.length === 0) {
    return options.inverse(this);
  }

  return filtrado.map((item) => options.fn(item)).join('');
});

// Template usando todos os helpers
const templateProdutos = `=== Catalogo de Produtos ===

Todos os produtos:
{{#each produtos}}  {{badge nome tipo="pill" cor="azul"}} - {{formatPreco preco ../moeda}} (lancado ha {{diasDesde lancamento}})
{{/each}}

=== Apenas Servicos ===
{{#filtrar produtos categoria="servico"}}  - {{nome}}: {{formatPreco preco @root.moeda}}
{{else}}  Nenhum servico encontrado.
{{/filtrar}}

=== Apenas Infraestrutura ===
{{#filtrar produtos categoria="infraestrutura"}}  - {{badge nome tipo="tag"}} - {{formatPreco preco @root.moeda}}
{{else}}  Nenhum produto de infraestrutura encontrado.
{{/filtrar}}`;

// Compile e teste
const compilado = Handlebars.compile(templateProdutos);
console.log(compilado(dados));

// Teste com moeda diferente
const dadosUSD = {
  ...dados,
  moeda: 'USD',
};

console.log('\n=== Em Dolares ===');
console.log(compilado(dadosUSD));
