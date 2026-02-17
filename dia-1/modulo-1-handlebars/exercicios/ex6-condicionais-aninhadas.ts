/**
 * Exercicio 6: Condicionais Complexas
 *
 * Combine condicionais aninhadas com helpers para logica multi-branch.
 * Voce ja conhece {{#if}} basico (ex5). Agora domine condicionais complexas.
 * Execute: npx tsx exercicios/ex6-condicionais-aninhadas.ts
 */

import Handlebars from 'handlebars';

// === Dados de pedidos ===
const pedidos = [
  { id: 1, status: 'entregue', pago: true, valor: 150, avaliacao: 5 },
  { id: 2, status: 'enviado', pago: true, valor: 89, avaliacao: null },
  { id: 3, status: 'processando', pago: false, valor: 320, avaliacao: null },
  { id: 4, status: 'cancelado', pago: true, valor: 45, avaliacao: null },
];

// === TODO 1: Crie um helper "eq" para comparacao de igualdade ===
// Handlebars nao tem comparacao de igualdade nativa.
// Crie um helper que compare dois valores e retorne true/false.
//
// Uso no template: {{#if (eq status "entregue")}}...{{/if}}
//
// Dica: Handlebars.registerHelper('eq', (a, b) => a === b);

// TODO: registre o helper eq aqui

// === TODO 2: Template com condicionais aninhadas ===
// Para CADA pedido, mostre uma mensagem diferente baseada no status:
//
// - Se "entregue" E tem avaliacao:
//   "Pedido #1 entregue - Avaliacao: 5 estrelas"
//
// - Se "entregue" sem avaliacao:
//   "Pedido #1 entregue - Avalie agora!"
//
// - Se "enviado":
//   "Pedido #2 a caminho"
//
// - Se "processando" E nao pago:
//   "Pedido #3 aguardando pagamento"
//
// - Se "cancelado":
//   "Pedido #4 cancelado - Reembolso: processando" (se pago)
//   "Pedido #4 cancelado - Reembolso: N/A" (se nao pago)
//
// Dica: use {{#if (eq status "entregue")}} para comparar strings
// e {{#if avaliacao}} para verificar se existe avaliacao.

const templatePedido = `
TODO: Crie template com condicionais aninhadas para cada status
`;

// === TODO 3: Envolva tudo com {{#each}} ===
// Use {{#each pedidos}} para iterar sobre todos os pedidos.
// O template do TODO 2 deve funcionar DENTRO do each.
//
// Dica: dentro de {{#each}}, o contexto muda para cada item.
// Entao {{id}} ja se refere ao id do pedido atual.

const templateTodos = `
TODO: Envolva o template do TODO 2 com {{#each pedidos}}
`;

// === Compile e teste ===
// Descomente e complete o codigo abaixo:

// const compilado = Handlebars.compile(templateTodos);
// const resultado = compilado({ pedidos });
// console.log(resultado);

console.log('\n--- Exercicio 6 completo! ---');
console.log('Dica: veja a solucao em solucoes/ex6-condicionais-aninhadas.ts');
