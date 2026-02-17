/**
 * Exercicio 9: Resultados Ricos com Dados Estruturados
 *
 * Retorne resultados complexos e estruturados das tools,
 * incluindo tabelas, listas hierarquicas e metadados.
 *
 * Dificuldade: Intermediario
 * Tempo estimado: 20 minutos
 * Execute: npx tsx exercicios/ex9-tool-resultados-ricos.ts
 */

import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic();

// === CONCEITO ===
// Tool results podem conter dados ricos e estruturados.
// O segredo e formatar de forma que Claude consiga interpretar e
// apresentar ao usuario de forma clara.
// Estrategias:
// - JSON estruturado com campos semanticos
// - Metadados (fonte, timestamp, confianca)
// - Dados hierarquicos (categorias > subcategorias > itens)

// === Dados simulados ===
const dashboardData = {
  vendas: {
    hoje: { total: 15680, pedidos: 42, ticket_medio: 373.33 },
    semana: { total: 98450, pedidos: 287, ticket_medio: 343.03 },
    mes: { total: 456000, pedidos: 1250, ticket_medio: 364.80 },
  },
  topProdutos: [
    { nome: 'Plano Enterprise', vendas: 45, receita: 44955 },
    { nome: 'Plano Pro', vendas: 120, receita: 35880 },
    { nome: 'Plano Starter', vendas: 350, receita: 17150 },
  ],
  alertas: [
    { tipo: 'warning', msg: 'Estoque baixo: Mouse Wireless (5 unidades)' },
    { tipo: 'info', msg: 'Novo recorde de vendas diarias atingido' },
    { tipo: 'error', msg: 'Falha no gateway de pagamento as 14:32' },
  ],
};

// === TODO 1: Crie a tool "dashboard_vendas" ===
// Retorna dados completos do dashboard com metricas, top produtos e alertas.

// const tools: Anthropic.Tool[] = [
//   {
//     name: 'dashboard_vendas',
//     description: 'Retorna o dashboard completo de vendas com metricas por periodo, ' +
//                  'ranking de produtos e alertas do sistema.',
//     input_schema: {
//       type: 'object' as const,
//       properties: {
//         periodo: {
//           type: 'string',
//           enum: ['hoje', 'semana', 'mes'],
//           description: 'Periodo para exibir metricas',
//         },
//         incluir_alertas: {
//           type: 'boolean',
//           description: 'Incluir alertas do sistema (default: true)',
//         },
//       },
//       required: ['periodo'],
//     },
//   },
// ];

// === TODO 2: Formate o resultado como JSON rico com metadados ===

// function handleDashboard(input: { periodo: string; incluir_alertas?: boolean }): string {
//   const metricas = dashboardData.vendas[input.periodo as keyof typeof dashboardData.vendas];
//   // Monte um objeto resultado com:
//   // - _meta: { fonte, timestamp, periodo }
//   // - metricas: { ... }
//   // - ranking: [ ... ] (top 3 produtos)
//   // - alertas: [ ... ] (se incluir_alertas !== false)
//   // Retorne JSON.stringify do objeto completo
// }

// === TODO 3: Rode o loop e veja como Claude interpreta dados ricos ===
// Pergunta: "Me mostre o dashboard de vendas do mes com alertas"

console.log('\n--- Exercicio 9 completo! ---');
console.log('Dica: veja a solucao em solucoes/ex9-tool-resultados-ricos.ts');
