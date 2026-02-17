/**
 * Exercicio 12: Helpers Multi-Parametro
 *
 * Aprenda a criar helpers com multiplos argumentos e hash arguments (options.hash).
 * Voce ja criou helpers simples de formatacao (ex11). Agora avance para parametros complexos.
 * Execute: npx tsx exercicios/ex12-helpers-parametros.ts
 */

import Handlebars from 'handlebars';

// === Dados dos produtos ===
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

// === TODO 1: Helper 'formatPreco' com 2 parametros ===
// Recebe preco e moeda, formata de acordo:
// - BRL: "R$ 50,00"
// - USD: "$ 50.00"
// - EUR: "E 50.00" (E como simbolo simplificado)
//
// Uso no template: {{formatPreco preco moeda}}
//
// Dica: o helper recebe (preco, moeda) como argumentos posicionais

// TODO: Registre o helper 'formatPreco' aqui

// === TODO 2: Helper 'diasDesde' ===
// Calcula quantos dias se passaram desde uma data ate hoje.
// Uso: {{diasDesde lancamento}} => "260 dias"
//
// Dica: new Date().getTime() - date.getTime() / (1000 * 60 * 60 * 24)

// TODO: Registre o helper 'diasDesde' aqui

// === TODO 3: Helper 'badge' com hash arguments ===
// Hash arguments sao parametros nomeados acessados via options.hash.
// Uso: {{badge nome tipo="pill" cor="verde"}}
//
// Output baseado no tipo:
// - tipo="pill": "[verde: API Credits]"
// - tipo="tag": "#API Credits"
// - default: "(API Credits)"
//
// Dica: function(texto, options) { const { tipo, cor } = options.hash; }

// TODO: Registre o helper 'badge' aqui

// === TODO 4: Block helper 'filtrar' com hash arguments ===
// Filtra um array por uma propriedade e renderiza o bloco para cada item.
// Uso: {{#filtrar produtos categoria="servico"}}...{{/filtrar}}
//
// Dentro do bloco, o contexto e cada produto filtrado.
// O helper deve iterar sobre os itens filtrados e renderizar options.fn(item).
//
// Dica: block helpers recebem options.fn (bloco) e options.hash (parametros nomeados)
// function(array, options) {
//   const filtrado = array.filter(item => ...);
//   return filtrado.map(item => options.fn(item)).join('');
// }

// TODO: Registre o block helper 'filtrar' aqui

// === Template usando todos os helpers ===
const templateProdutos = `
TODO: Crie template que use os 4 helpers:
- Liste todos os produtos com formatPreco e diasDesde
- Use badge para mostrar a categoria
- Use filtrar para mostrar apenas servicos
`;

// === Compile e teste ===
// TODO: compile o template e exiba o resultado

console.log('\n--- Exercicio 12 completo! ---');
console.log('Dica: veja a solucao em solucoes/ex12-helpers-parametros.ts');
