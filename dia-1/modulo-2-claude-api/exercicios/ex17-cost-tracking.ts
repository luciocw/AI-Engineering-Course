/**
 * Exercicio 17: Rastreamento de Custos
 *
 * Construa uma classe utilitaria CostTracker para monitorar custos de API
 * em tempo real. Voce ja viu custos em exercicios anteriores (ex1, ex15) —
 * agora vai criar uma ferramenta reutilizavel para os modulos M3 e M4.
 *
 * Dificuldade: avancado | Tempo estimado: 20 min
 * Execute: npx tsx exercicios/ex17-cost-tracking.ts
 */

import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic();

// === Tipos ===

type ModeloSuportado = 'claude-haiku-4-5-20251001' | 'claude-sonnet-4-20250514';

type RegistroCusto = {
  modelo: ModeloSuportado;
  inputTokens: number;
  outputTokens: number;
  custoInput: number;
  custoOutput: number;
  custoTotal: number;
  timestamp: Date;
  descricao?: string;
};

type RelatorioCusto = {
  totalChamadas: number;
  totalInputTokens: number;
  totalOutputTokens: number;
  custoTotalInput: number;
  custoTotalOutput: number;
  custoTotal: number;
  porModelo: Record<string, {
    chamadas: number;
    inputTokens: number;
    outputTokens: number;
    custo: number;
  }>;
};

// === TODO 1: Crie a classe CostTracker ===
// A classe deve ter:
// - priceMap: precos por modelo (input e output por milhao de tokens)
//   - haiku: $0.25 input, $1.25 output
//   - sonnet: $3.00 input, $15.00 output
// - registros: array de RegistroCusto
// - limiteOrcamento: number | null
//
// Metodos:
// - track(modelo, inputTokens, outputTokens, descricao?): registra uma chamada
// - getCost(): retorna custo total acumulado
// - getReport(): retorna RelatorioCusto completo

// class CostTracker {
//   private priceMap = ...;
//   private registros: RegistroCusto[] = [];
//   private limiteOrcamento: number | null = null;
//
//   track(...) { ... }
//   getCost(): number { ... }
//   getReport(): RelatorioCusto { ... }
// }

// === TODO 2: Implemente o mapa de precos ===
// Haiku 4.5:  $0.25/M input, $1.25/M output
// Sonnet 4:   $3.00/M input, $15.00/M output
// O calculo e: (tokens / 1_000_000) * preco

// === TODO 3: Faca 5+ chamadas a API e rastreie custos ===
// Use o tracker para registrar cada chamada.
// Varie entre perguntas curtas e longas.
// Exemplo:
//   const response = await client.messages.create({ ... });
//   tracker.track('claude-haiku-4-5-20251001', response.usage.input_tokens, response.usage.output_tokens, 'descricao');

// === TODO 4: Gere relatorio formatado ===
// Use getReport() e exiba:
// - Total de chamadas
// - Tokens totais (input + output)
// - Custo por modelo (tabela)
// - Custo total

// === TODO 5: Implemente limite de orcamento ===
// Adicione metodo setLimit(valor: number)
// No metodo track(), lance um Error se o custo acumulado ultrapassar o limite.
// Teste com um limite baixo para ver o erro.

// === IMPORTANTE: Exporte a classe ===
// export { CostTracker };
// Esta classe sera reutilizada nos modulos M3 e M4.

console.log('\n--- Exercicio 17 completo! ---');
console.log('Dica: veja a solucao em solucoes/ex17-cost-tracking.ts');
