/**
 * Solucao 9: Streaming / Processamento em Chunks
 *
 * Processa grandes volumes de dados em lotes (chunks) para simular streaming.
 * Execute: npx tsx solucoes/ex9-streaming-dados.ts
 */

import { readFileSync } from 'fs';
import { parse } from 'csv-parse/sync';

// === 1: Generator de chunks ===
function* chunked<T>(items: T[], chunkSize: number): Generator<T[], void, unknown> {
  for (let i = 0; i < items.length; i += chunkSize) {
    yield items.slice(i, i + chunkSize);
  }
}

// === 2: Processador de chunks ===
interface ChunkResult<T> {
  chunkIndex: number;
  processed: number;
  results: T[];
  durationMs: number;
}

function processChunks<T, R>(
  items: T[],
  chunkSize: number,
  processor: (chunk: T[], index: number) => R[]
): ChunkResult<R>[] {
  const results: ChunkResult<R>[] = [];
  let chunkIndex = 0;

  for (const chunk of chunked(items, chunkSize)) {
    const start = performance.now();
    const chunkResults = processor(chunk, chunkIndex);
    const duration = performance.now() - start;

    results.push({
      chunkIndex,
      processed: chunk.length,
      results: chunkResults,
      durationMs: Math.round(duration * 100) / 100,
    });

    chunkIndex++;
  }

  return results;
}

// === 3: Pipeline de streaming ===
interface RawCustomer {
  id: string;
  nome: string;
  email: string;
  plano: string;
  mrr: string;
  data_inicio: string;
  status: string;
  industria: string;
}

interface ProcessedCustomer {
  id: number;
  nome: string;
  email: string;
  plano: string;
  mrr: number;
  data_inicio: string;
  status: string;
  industria: string;
  idadeDias: number;
}

// Carrega dados
const csvContent = readFileSync('data/samples/customers.csv', 'utf-8');
const rawRecords = parse(csvContent, { columns: true, skip_empty_lines: true }) as RawCustomer[];

console.log('=== Processamento em Chunks ===\n');
console.log(`Total de registros: ${rawRecords.length}`);

// Etapa 1: Parse e valide (chunks de 4)
console.log('\n--- Etapa 1: Parse e Validacao ---');
const parseResults = processChunks(rawRecords, 4, (chunk, idx) => {
  console.log(`  Processando chunk ${idx + 1}: ${chunk.length} registros`);
  return chunk
    .filter((r) => r.nome && r.email && r.plano)
    .map((r) => ({
      id: parseInt(r.id, 10),
      nome: r.nome,
      email: r.email,
      plano: r.plano,
      mrr: parseInt(r.mrr, 10),
      data_inicio: r.data_inicio,
      status: r.status,
      industria: r.industria,
    }));
});

const allParsed = parseResults.flatMap((r) => r.results);
console.log(`  Total validos: ${allParsed.length}`);

// Etapa 2: Enriqueca (chunks de 4)
console.log('\n--- Etapa 2: Enriquecimento ---');
const enrichResults = processChunks(allParsed, 4, (chunk, idx) => {
  console.log(`  Enriquecendo chunk ${idx + 1}: ${chunk.length} registros`);
  const hoje = Date.now();
  return chunk.map((c) => ({
    ...c,
    idadeDias: Math.floor((hoje - new Date(c.data_inicio).getTime()) / (1000 * 60 * 60 * 24)),
  }));
});

const allEnriched: ProcessedCustomer[] = enrichResults.flatMap((r) => r.results);

// Etapa 3: Agregue (chunks de 4)
console.log('\n--- Etapa 3: Agregacao ---');
const mrrPorPlano = new Map<string, number>();

const aggResults = processChunks(allEnriched, 4, (chunk, idx) => {
  console.log(`  Agregando chunk ${idx + 1}: ${chunk.length} registros`);
  for (const c of chunk) {
    if (c.status === 'ativo') {
      mrrPorPlano.set(c.plano, (mrrPorPlano.get(c.plano) || 0) + c.mrr);
    }
  }
  return chunk;
});

console.log('\n  MRR por plano:');
for (const [plano, mrr] of mrrPorPlano.entries()) {
  console.log(`    ${plano}: R$${mrr.toLocaleString('pt-BR')}`);
}

// === 4: Backpressure simulado ===
console.log('\n--- Etapa 4: Backpressure Simulado ---');

async function processWithBackpressure<T>(
  items: T[],
  chunkSize: number,
  processor: (chunk: T[]) => Promise<void>,
  delayMs: number
): Promise<{ totalMs: number; chunks: number }> {
  const start = performance.now();
  let chunkCount = 0;

  for (const chunk of chunked(items, chunkSize)) {
    await processor(chunk);
    chunkCount++;
    // Simula backpressure com delay
    await new Promise((resolve) => setTimeout(resolve, delayMs));
  }

  return {
    totalMs: Math.round(performance.now() - start),
    chunks: chunkCount,
  };
}

// Executa com backpressure
const bpResult = await processWithBackpressure(
  allEnriched,
  3,
  async (chunk) => {
    console.log(`  Processando lote de ${chunk.length} com backpressure...`);
  },
  50 // 50ms delay entre chunks
);

console.log(`  Backpressure: ${bpResult.chunks} chunks em ${bpResult.totalMs}ms`);

// === 5: Metricas ===
console.log('\n=== Metricas de Processamento ===');

const allChunkResults = [...parseResults, ...enrichResults, ...aggResults];
const totalDuration = allChunkResults.reduce((sum, r) => sum + r.durationMs, 0);
const totalItems = allChunkResults.reduce((sum, r) => sum + r.processed, 0);
const avgDuration = totalDuration / allChunkResults.length;

console.log(`Tempo total: ${totalDuration.toFixed(2)}ms`);
console.log(`Chunks processados: ${allChunkResults.length}`);
console.log(`Tempo medio por chunk: ${avgDuration.toFixed(2)}ms`);
console.log(`Items processados: ${totalItems}`);
console.log(`Items/segundo: ${totalDuration > 0 ? Math.round((totalItems / totalDuration) * 1000) : 'N/A'}`);

console.log('\n--- Exercicio 9 completo! ---');
