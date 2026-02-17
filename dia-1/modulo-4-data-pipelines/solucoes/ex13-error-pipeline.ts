/**
 * Solucao 13: Error Handling em Pipelines
 *
 * Retry, fallback e dead-letter queue para pipelines robustos.
 * Execute: npx tsx solucoes/ex13-error-pipeline.ts
 */

// === 1: Retry com backoff exponencial ===
interface RetryOptions {
  maxRetries: number;
  baseDelayMs: number;
  onRetry?: (attempt: number, error: Error) => void;
}

async function withRetry<T>(fn: () => Promise<T>, options: RetryOptions): Promise<T> {
  const { maxRetries, baseDelayMs, onRetry } = options;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      if (attempt === maxRetries) throw error;

      const delay = baseDelayMs * Math.pow(2, attempt - 1);
      onRetry?.(attempt, error as Error);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  throw new Error('Retry esgotado');
}

// === 2: Fallback ===
async function withFallback<T>(
  primary: () => Promise<T>,
  fallback: () => Promise<T>,
  onFallback?: (error: Error) => void
): Promise<T> {
  try {
    return await primary();
  } catch (error) {
    onFallback?.(error as Error);
    return await fallback();
  }
}

// === 3: Dead-letter queue ===
interface DeadLetter<T> {
  item: T;
  error: string;
  timestamp: string;
  attempts: number;
}

class DeadLetterQueue<T> {
  private queue: DeadLetter<T>[] = [];

  add(item: T, error: string, attempts: number): void {
    this.queue.push({
      item,
      error,
      timestamp: new Date().toISOString(),
      attempts,
    });
  }

  getAll(): DeadLetter<T>[] {
    return [...this.queue];
  }

  size(): number {
    return this.queue.length;
  }

  clear(): void {
    this.queue = [];
  }
}

// === 4: Pipeline com error handling ===
interface PipelineRecord {
  id: number;
  nome: string;
  email: string;
  valor: string;
}

interface ProcessedRecord {
  id: number;
  nome: string;
  email: string;
  valor: number;
  processadoEm: string;
}

// Simula dados (alguns com problemas)
const dadosBrutos: PipelineRecord[] = [
  { id: 1, nome: 'TechCorp', email: 'tech@corp.com', valor: '999' },
  { id: 2, nome: '', email: 'invalido', valor: 'abc' },              // Falha na validacao
  { id: 3, nome: 'BigData', email: 'big@data.com', valor: '499' },
  { id: 4, nome: 'CloudFirst', email: 'cloud@first.com', valor: '-1' }, // Falha na transformacao
  { id: 5, nome: 'AILabs', email: 'ai@labs.com', valor: '799' },
];

const dlq = new DeadLetterQueue<PipelineRecord>();

// Etapa: Validacao
async function validar(record: PipelineRecord): Promise<PipelineRecord> {
  if (!record.nome || record.nome.length < 2) {
    throw new Error(`Nome invalido: "${record.nome}"`);
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(record.email)) {
    throw new Error(`Email invalido: "${record.email}"`);
  }
  return record;
}

// Etapa: Transformacao
async function transformar(record: PipelineRecord): Promise<ProcessedRecord> {
  const valor = parseInt(record.valor, 10);
  if (isNaN(valor) || valor <= 0) {
    throw new Error(`Valor invalido: "${record.valor}"`);
  }
  return {
    id: record.id,
    nome: record.nome,
    email: record.email,
    valor,
    processadoEm: new Date().toISOString(),
  };
}

// Etapa: Carregamento (simula falha intermitente)
let loadCallCount = 0;
async function carregar(record: ProcessedRecord): Promise<void> {
  loadCallCount++;
  // Simula falha intermitente (falha na 2a chamada)
  if (loadCallCount === 2) {
    throw new Error('Destino temporariamente indisponivel');
  }
}

// Pipeline principal
async function processarRegistro(record: PipelineRecord): Promise<ProcessedRecord | null> {
  try {
    // Validacao com retry
    const validado = await withRetry(
      () => validar(record),
      {
        maxRetries: 2,
        baseDelayMs: 50,
        onRetry: (attempt) =>
          console.log(`    Retry validacao #${attempt} para ${record.nome || record.id}`),
      }
    );

    // Transformacao com fallback
    const transformado = await withFallback(
      () => transformar(validado),
      async () => ({
        id: validado.id,
        nome: validado.nome,
        email: validado.email,
        valor: 0, // Fallback: valor zero
        processadoEm: new Date().toISOString(),
      }),
      (error) => console.log(`    Fallback ativado para ${record.nome}: ${error.message}`)
    );

    // Carregamento com retry
    await withRetry(
      () => carregar(transformado),
      {
        maxRetries: 3,
        baseDelayMs: 100,
        onRetry: (attempt) =>
          console.log(`    Retry carregamento #${attempt} para ${record.nome}`),
      }
    );

    return transformado;

  } catch (error) {
    dlq.add(record, (error as Error).message, 3);
    return null;
  }
}

// === 5: Executa ===
async function main() {
  console.log('=== Pipeline com Error Handling ===\n');

  const resultados: ProcessedRecord[] = [];
  let sucesso = 0;
  let falha = 0;

  for (const record of dadosBrutos) {
    console.log(`Processando #${record.id}: ${record.nome || '(vazio)'}...`);

    const resultado = await processarRegistro(record);

    if (resultado) {
      resultados.push(resultado);
      sucesso++;
      console.log(`  OK: ${resultado.nome} -> R$${resultado.valor}`);
    } else {
      falha++;
      console.log(`  FALHA: enviado para DLQ`);
    }
    console.log('');
  }

  // Relatorio
  console.log('=== Resultado do Pipeline ===');
  console.log(`Sucesso: ${sucesso}/${dadosBrutos.length}`);
  console.log(`Falhas: ${falha}/${dadosBrutos.length}`);
  console.log(`Dead Letter Queue: ${dlq.size()} registros`);

  if (dlq.size() > 0) {
    console.log('\n--- Dead Letter Queue ---');
    for (const dl of dlq.getAll()) {
      const item = dl.item as PipelineRecord;
      console.log(`  #${item.id} ${item.nome || '(vazio)'}: ${dl.error} (${dl.attempts} tentativas)`);
    }
  }

  console.log('\n--- Registros processados ---');
  for (const r of resultados) {
    console.log(`  ${r.nome}: R$${r.valor} (processado em ${r.processadoEm})`);
  }

  console.log('\n--- Exercicio 13 completo! ---');
}

main().catch(console.error);
