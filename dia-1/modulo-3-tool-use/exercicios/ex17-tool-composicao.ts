/**
 * Exercicio 17: Composicao de Tools
 *
 * Crie tools de alto nivel que internamente compoe operacoes menores.
 * Uma unica tool call do Claude pode disparar multiplas operacoes.
 *
 * Dificuldade: Expert
 * Tempo estimado: 25 minutos
 * Execute: npx tsx exercicios/ex17-tool-composicao.ts
 */

import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic();

// === CONCEITO ===
// Composicao de tools = combinar operacoes primitivas em operacoes complexas.
// Em vez de Claude precisar chamar 5 tools em sequencia,
// oferecemos 1 tool composta que faz tudo internamente.
//
// Vantagens:
// - Menos iteracoes no loop (menos custo)
// - Operacoes atomicas (tudo ou nada)
// - Menos chance de erro na sequencia
//
// Exemplo: "criar_pedido_completo" = validar estoque + calcular frete +
//          aplicar desconto + criar pedido + enviar confirmacao

// === TODO 1: Defina operacoes primitivas (funcoes internas) ===

// function validarEstoque(produto: string, quantidade: number): { ok: boolean; msg: string } { ... }
// function calcularFrete(cidade: string): number { ... }
// function aplicarDesconto(total: number, cupom?: string): number { ... }
// function criarPedido(dados: { ... }): { id: string; ... } { ... }
// function enviarConfirmacao(email: string, pedidoId: string): boolean { ... }

// === TODO 2: Crie a tool composta ===
// Uma unica tool que orquestra todas as operacoes.

// const tools: Anthropic.Tool[] = [
//   {
//     name: 'criar_pedido_completo',
//     description: 'Cria um pedido completo: valida estoque, calcula frete, ' +
//                  'aplica desconto, cria o pedido e envia confirmacao.',
//     input_schema: {
//       type: 'object' as const,
//       properties: {
//         cliente_email: { type: 'string' },
//         produtos: { type: 'array', items: { type: 'object', ... } },
//         cidade_entrega: { type: 'string' },
//         cupom_desconto: { type: 'string' },
//       },
//       required: ['cliente_email', 'produtos', 'cidade_entrega'],
//     },
//   },
// ];

// === TODO 3: Implemente o handler composto ===
// Orquestre as operacoes primitivas em sequencia.
// Se alguma falhar, aborte e retorne o erro.

// function handleCriarPedidoCompleto(input: { ... }): string {
//   // 1. Validar estoque de cada produto
//   // 2. Calcular subtotal
//   // 3. Calcular frete
//   // 4. Aplicar desconto (se tiver cupom)
//   // 5. Criar o pedido
//   // 6. Enviar confirmacao
//   // Retornar resumo completo
// }

// === TODO 4: Rode o loop de tool use ===
// Pergunta: "Crie um pedido para joao@email.com com 2 notebooks e 3 mouses,
//           entrega em Sao Paulo, cupom DESCONTO10"

console.log('\n--- Exercicio 17 completo! ---');
console.log('Dica: veja a solucao em solucoes/ex17-tool-composicao.ts');
