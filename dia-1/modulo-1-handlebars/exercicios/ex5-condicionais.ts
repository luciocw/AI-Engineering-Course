/**
 * Exercicio 5: Condicionais Basicas
 *
 * Aprenda a usar {{#if}}, {{else}} e {{#unless}} para logica condicional.
 * Voce ja domina variaveis e dot-notation (ex1-ex4). Agora adicione logica.
 * Execute: npx tsx exercicios/ex5-condicionais.ts
 */

import Handlebars from 'handlebars';

// === Dados de usuarios com diferentes planos ===
const usuarios = [
  { nome: 'Ana', plano: 'premium', ativo: true, creditos: 100 },
  { nome: 'Bruno', plano: 'basico', ativo: true, creditos: 10 },
  { nome: 'Carla', plano: 'premium', ativo: false, creditos: 0 },
  { nome: 'Diego', plano: '', ativo: false, creditos: 0 },
];

// === TODO 1: Template com {{#if}} basico ===
// Se o usuario tiver plano, mostre "Plano: [plano]"
// Se nao tiver, mostre "Sem plano ativo"
//
// Dica: {{#if plano}}...{{else}}...{{/if}}

const templatePlano = `
TODO: Crie template com condicional para plano
`;

// === TODO 2: Template com multiplas condicoes ===
// 1. Se premium E ativo: "Acesso VIP liberado"
// 2. Se premium mas inativo: "Renove seu plano premium"
// 3. Se basico: "Faca upgrade para premium"
// 4. Se sem plano: "Assine agora"
//
// Dica: Handlebars nao suporta && diretamente.
// Use {{#if}} aninhados ou crie um helper.

const templateAcesso = `
TODO: Crie template com multiplas condicoes
`;

// === TODO 3: Template com {{#unless}} ===
// {{#unless}} e o inverso de {{#if}}
// Se o usuario NAO tiver creditos, mostre um alerta.
//
// Dica: {{#unless creditos}}Sem creditos!{{/unless}}

const templateCreditos = `
TODO: Crie template usando unless
`;

// === Compile e teste com todos usuarios ===
// Para cada usuario, compile os 3 templates e mostre o resultado.

for (const usuario of usuarios) {
  console.log(`\n=== ${usuario.nome} ===`);
  // TODO: compile e exiba cada template
}

console.log('\n--- Exercicio 5 completo! ---');
console.log('Dica: veja a solucao em solucoes/ex5-condicionais.ts');
