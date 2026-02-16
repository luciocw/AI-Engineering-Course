/**
 * Exercicio 4: Tools Encadeadas
 *
 * Claude chama multiplas tools em sequencia: dados → metricas → relatorio.
 * Execute: npx tsx exercicios/ex4-tool-encadeada.ts
 */

import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic();

// === Dados simulados de vendas ===
const vendasDB: Record<string, Array<{ produto: string; valor: number; data: string }>> = {
  '2026-01': [
    { produto: 'Plano Pro', valor: 299, data: '2026-01-05' },
    { produto: 'Plano Enterprise', valor: 999, data: '2026-01-12' },
    { produto: 'Plano Pro', valor: 299, data: '2026-01-20' },
    { produto: 'Plano Starter', valor: 49, data: '2026-01-25' },
  ],
  '2026-02': [
    { produto: 'Plano Enterprise', valor: 999, data: '2026-02-03' },
    { produto: 'Plano Pro', valor: 299, data: '2026-02-10' },
    { produto: 'Plano Pro', valor: 299, data: '2026-02-14' },
    { produto: 'Plano Enterprise', valor: 999, data: '2026-02-20' },
    { produto: 'Plano Starter', valor: 49, data: '2026-02-28' },
  ],
};

// === TODO 1: Defina 3 tools encadeadas ===
// Tool 1: buscar_vendas — recebe mes (YYYY-MM), retorna vendas do mes
// Tool 2: calcular_metricas — recebe array de vendas, retorna total, media, contagem por produto
// Tool 3: gerar_relatorio — recebe metricas de 2 meses, retorna analise comparativa

// const tools = [ ... ];

// === TODO 2: Implemente os handlers ===
// Cada handler usa dados do anterior:
// buscar_vendas('2026-01') → dados
// calcular_metricas(dados) → metricas
// gerar_relatorio(metricas_jan, metricas_fev) → relatorio

// === TODO 3: Faca Claude encadear as tools ===
// Pergunta: "Compare as vendas de janeiro e fevereiro de 2026.
//           Busque os dados, calcule metricas e gere um relatorio."

// Claude deve chamar as tools na ordem correta automaticamente.

console.log('\n--- Exercicio 4 completo! ---');
console.log('Dica: veja a solucao em solucoes/ex4-tool-encadeada.ts');
