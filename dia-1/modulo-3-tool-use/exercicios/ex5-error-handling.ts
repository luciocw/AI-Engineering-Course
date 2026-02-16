/**
 * Exercicio 5: Error Handling em Tool Use
 *
 * Implemente retries, timeouts e degradacao graceful.
 * Execute: npx tsx exercicios/ex5-error-handling.ts
 */

import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic();

// === TODO 1: Tool com retry automatico ===
// Crie uma tool "buscar_preco" que simula falhas intermitentes.
// O handler deve falhar 50% das vezes (Math.random() < 0.5).
// Implemente retry com ate 3 tentativas.

// function handleBuscarPreco(input: { produto: string }): string {
//   if (Math.random() < 0.5) throw new Error('Servico temporariamente indisponivel');
//   const precos: Record<string, number> = { laptop: 4500, mouse: 89, teclado: 250 };
//   return JSON.stringify({ produto: input.produto, preco: precos[input.produto] ?? 0 });
// }

// async function withRetry<T>(fn: () => T, maxRetries = 3): Promise<T> {
//   for (let i = 0; i < maxRetries; i++) {
//     try { return fn(); }
//     catch (e) { console.log(`  Tentativa ${i + 1} falhou: ${e.message}`); }
//   }
//   throw new Error('Todas as tentativas falharam');
// }

// === TODO 2: Tool com timeout ===
// Crie uma tool "buscar_dados_externos" que simula lentidao.
// Use Promise.race() com um timeout de 3 segundos.

// async function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
//   const timeout = new Promise<never>((_, reject) =>
//     setTimeout(() => reject(new Error(`Timeout apos ${ms}ms`)), ms)
//   );
//   return Promise.race([promise, timeout]);
// }

// === TODO 3: Degradacao graceful ===
// Quando uma tool falha, retorne tool_result com is_error: true.
// Claude deve continuar a conversa e informar o usuario sobre o erro.

// Dica: o campo tool_result aceita is_error para sinalizar falha.

// === TODO 4: Rode o loop com error handling completo ===
// Pergunta: "Busque o preco do laptop, mouse e teclado"
// Algumas buscas vao falhar — Claude deve lidar gracefully.

console.log('\n--- Exercicio 5 completo! ---');
console.log('Dica: veja a solucao em solucoes/ex5-error-handling.ts');
