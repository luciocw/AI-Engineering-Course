/**
 * Exercicio 13: Error Handling em Pipelines
 *
 * Implemente retry, fallback e dead-letter queue para pipelines robustos.
 * Dificuldade: Avancado
 * Tempo estimado: 30 minutos
 * Execute: npx tsx exercicios/ex13-error-pipeline.ts
 */

// === TODO 1: Implemente retry com backoff exponencial ===
// Tente executar uma funcao ate N vezes, com delay crescente entre tentativas.
// interface RetryOptions {
//   maxRetries: number;
//   baseDelayMs: number;
//   onRetry?: (attempt: number, error: Error) => void;
// }
// async function withRetry<T>(fn: () => Promise<T>, options: RetryOptions): Promise<T> { ... }

// === TODO 2: Implemente fallback ===
// Se a funcao principal falhar, tente uma funcao alternativa.
// async function withFallback<T>(
//   primary: () => Promise<T>,
//   fallback: () => Promise<T>,
//   onFallback?: (error: Error) => void
// ): Promise<T> { ... }

// === TODO 3: Implemente dead-letter queue ===
// Registros que falharam apos todas as tentativas vao para uma fila de erros.
// interface DeadLetter<T> {
//   item: T;
//   error: string;
//   timestamp: string;
//   attempts: number;
// }
// class DeadLetterQueue<T> {
//   private queue: DeadLetter<T>[] = [];
//   add(item: T, error: string, attempts: number): void { ... }
//   getAll(): DeadLetter<T>[] { ... }
//   size(): number { ... }
// }

// === TODO 4: Crie um pipeline com error handling ===
// Simule um pipeline que:
// 1. Le dados (pode falhar: arquivo corrompido)
// 2. Valida (pode falhar: schema invalido)
// 3. Transforma (pode falhar: tipo incompativel)
// 4. Carrega (pode falhar: destino indisponivel)
// Use retry em cada etapa, fallback onde possivel, e DLQ para falhas totais.

// === TODO 5: Simule erros e teste o pipeline ===
// Crie dados que falham em diferentes etapas e verifique que o pipeline
// trata cada caso corretamente.

console.log('\n--- Exercicio 13 completo! ---');
console.log('Dica: veja a solucao em solucoes/ex13-error-pipeline.ts');
