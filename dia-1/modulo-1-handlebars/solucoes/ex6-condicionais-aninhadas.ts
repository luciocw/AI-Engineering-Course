/**
 * Solucao - Exercicio 6: Condicionais Complexas
 */

import Handlebars from 'handlebars';

const pedidos = [
  { id: 1, status: 'entregue', pago: true, valor: 150, avaliacao: 5 },
  { id: 2, status: 'enviado', pago: true, valor: 89, avaliacao: null },
  { id: 3, status: 'processando', pago: false, valor: 320, avaliacao: null },
  { id: 4, status: 'cancelado', pago: true, valor: 45, avaliacao: null },
];

// Solucao TODO 1: Helper "eq" para comparacao de igualdade
Handlebars.registerHelper('eq', (a: unknown, b: unknown) => {
  return a === b;
});

// Solucao TODO 2 e TODO 3: Template com condicionais aninhadas + each
const templateTodos = `{{#each pedidos}}{{#if (eq status "entregue")}}{{#if avaliacao}}Pedido #{{id}} entregue - Avaliacao: {{avaliacao}} estrelas{{else}}Pedido #{{id}} entregue - Avalie agora!{{/if}}{{else if (eq status "enviado")}}Pedido #{{id}} a caminho{{else if (eq status "processando")}}{{#unless pago}}Pedido #{{id}} aguardando pagamento{{else}}Pedido #{{id}} em processamento{{/unless}}{{else if (eq status "cancelado")}}Pedido #{{id}} cancelado - Reembolso: {{#if pago}}processando{{else}}N/A{{/if}}{{/if}}
{{/each}}`;

const compilado = Handlebars.compile(templateTodos);
const resultado = compilado({ pedidos });

console.log('=== Status dos Pedidos ===');
console.log(resultado);

// Versao alternativa com template mais legivel usando \n explicito:
// Em templates reais, a legibilidade importa mais que uma unica linha.
const templateLegivel = `{{#each pedidos}}
---
{{#if (eq status "entregue")}}
  {{#if avaliacao}}
    Pedido #{{id}} entregue - Avaliacao: {{avaliacao}} estrelas (R\${{valor}})
  {{else}}
    Pedido #{{id}} entregue - Avalie agora! (R\${{valor}})
  {{/if}}
{{else if (eq status "enviado")}}
    Pedido #{{id}} a caminho (R\${{valor}})
{{else if (eq status "processando")}}
  {{#unless pago}}
    Pedido #{{id}} aguardando pagamento de R\${{valor}}
  {{else}}
    Pedido #{{id}} em processamento (R\${{valor}})
  {{/unless}}
{{else if (eq status "cancelado")}}
    Pedido #{{id}} cancelado - Reembolso: {{#if pago}}processando R\${{valor}}{{else}}N/A{{/if}}
{{/if}}
{{/each}}`;

console.log('\n=== Versao Detalhada ===');
const compiladoLegivel = Handlebars.compile(templateLegivel);
console.log(compiladoLegivel({ pedidos }));

// Teste com pedido extra para cobertura
const pedidoExtra = [
  ...pedidos,
  { id: 5, status: 'cancelado', pago: false, valor: 60, avaliacao: null },
];

console.log('\n=== Com Pedido Extra (cancelado, nao pago) ===');
console.log(compilado({ pedidos: pedidoExtra }));
