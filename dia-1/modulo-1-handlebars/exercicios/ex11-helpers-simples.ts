/**
 * Exercicio 11: Helpers de Formatacao
 *
 * Aprenda a criar helpers simples com registerHelper() para formatar valores.
 * Voce ja usou helpers dentro de loops (ex8-ex10). Agora crie seus proprios helpers de valor.
 * Execute: npx tsx exercicios/ex11-helpers-simples.ts
 */

import Handlebars from 'handlebars';

// === Dados do pedido ===
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

// === TODO 1: Helper 'uppercase' ===
// Transforma texto para MAIUSCULAS.
// Uso: {{uppercase cliente}} => "JOAO PEREIRA"
//
// Dica: use String.prototype.toUpperCase()

// TODO: Registre o helper 'uppercase' aqui

// === TODO 2: Helper 'currency' ===
// Formata numero como moeda brasileira: "R$ 497,50"
// Uso: {{currency preco}} => "R$ 497,50"
//
// Dica: use Number.prototype.toFixed(2) e substitua '.' por ','

// TODO: Registre o helper 'currency' aqui

// === TODO 3: Helper 'truncate' ===
// Corta texto no limite de N caracteres e adiciona "..."
// Uso: {{truncate descricaoLonga 50}} => "Este pacote inclui acesso completo ao curso de AI..."
//
// Dica: o helper recebe (texto, limite) como parametros

// TODO: Registre o helper 'truncate' aqui

// === TODO 4: Helper 'formatDate' ===
// Formata Date como "DD/MM/YYYY"
// Uso: {{formatDate data}} => "15/02/2026"
//
// Dica: use getDate(), getMonth() + 1, getFullYear()
// Lembre de adicionar zero a esquerda para dia e mes (01, 02...)

// TODO: Registre o helper 'formatDate' aqui

// === TODO 5: Helper 'total' ===
// Soma o campo 'preco' de um array de itens.
// Uso: {{total itens}} => 1787.4
//
// Dica: use Array.prototype.reduce() para somar os precos

// TODO: Registre o helper 'total' aqui

// === Template usando todos os helpers ===
// Crie um template que use todos os 5 helpers para exibir o pedido.
//
// Exemplo de output esperado:
// "=== PEDIDO ===
//  Cliente: JOAO PEREIRA
//  Data: 15/02/2026
//
//  Itens:
//  - Curso AI Engineering: R$ 497,50
//  - Mentoria Individual: R$ 1.200,00
//  - Ebook RAG Avancado: R$ 89,90
//
//  Total: R$ 1.787,40
//  Descricao: Este pacote inclui acesso completo ao curso de AI..."

const templatePedido = `
TODO: Crie template usando os 5 helpers
`;

// === Compile e teste ===
// TODO: compile o template e exiba o resultado

console.log('\n--- Exercicio 11 completo! ---');
console.log('Dica: veja a solucao em solucoes/ex11-helpers-simples.ts');
