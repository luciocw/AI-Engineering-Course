/**
 * Exercicio 20: A/B Testing de Prompts (Capstone)
 *
 * Construa um framework completo de A/B testing para otimizar prompts.
 * Este e o exercicio capstone — voce vai unir tudo: chaining (ex15),
 * routing (ex16), cost tracking (ex17), avaliacao LLM-as-judge (ex18)
 * e versionamento (ex19) em um sistema integrado de experimentacao.
 *
 * Dificuldade: avancado | Tempo estimado: 30 min
 * Execute: npx tsx exercicios/ex20-ab-testing.ts
 */

import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic();

// === Tipos ===

type PromptVariant = {
  name: string;
  systemPrompt: string;
  userPromptTemplate: string;
};

type VariantResult = {
  variantName: string;
  input: string;
  output: string;
  inputTokens: number;
  outputTokens: number;
  latencyMs: number;
  score: number;
  judgeJustificativa: string;
};

type ABTest = {
  name: string;
  variants: PromptVariant[];
  results: VariantResult[];
};

type ABTestSummary = {
  variantName: string;
  avgScore: number;
  avgTokens: number;
  avgLatencyMs: number;
  totalCost: number;
  wins: number;
};

// === Tarefa: Resumir textos tecnicos ===
// Duas estrategias diferentes para a mesma tarefa.

// === TODO 1: Crie a classe ABTest ===
// A classe deve armazenar:
// - name: nome do experimento
// - variants: array de PromptVariant
// - results: array de VariantResult
//
// Metodos:
// - addVariant(variant: PromptVariant): void
// - addResult(result: VariantResult): void
// - getSummary(): ABTestSummary[]

// class ABTestRunner {
//   private test: ABTest;
//
//   constructor(name: string) { ... }
//   addVariant(variant: PromptVariant): void { ... }
//   ...
// }

// === TODO 2: Crie o runner que executa todas as variantes ===
// Para cada input de teste:
// 1. Execute todas as variantes
// 2. Meça latencia (Date.now antes/depois)
// 3. Armazene tokens e resposta
//
// async function runVariant(variant: PromptVariant, input: string): Promise<{ output: string; inputTokens: number; outputTokens: number; latencyMs: number }> { ... }

// === TODO 3: Crie 2 variantes de prompt para resumo de textos ===
// Variante A — "Direto": system prompt conciso, pede resumo em 2-3 frases
// Variante B — "Estruturado": system prompt detalhado com CoT,
//   pede resumo com: topico principal, pontos-chave, conclusao

// const varianteA: PromptVariant = { ... };
// const varianteB: PromptVariant = { ... };

// === Inputs de teste ===
const inputsTeste = [
  `Kubernetes e um sistema de orquestracao de containers open-source que automatiza
o deployment, scaling e gerenciamento de aplicacoes em containers. Criado pelo
Google, hoje e mantido pela CNCF. Ele usa conceitos como pods, services e
deployments para abstrair a infraestrutura subjacente.`,

  `O padrao CQRS (Command Query Responsibility Segregation) separa as operacoes
de leitura e escrita em modelos distintos. Isso permite otimizar cada lado
independentemente: queries podem usar views desnormalizadas para performance,
enquanto commands passam por validacao rigorosa e event sourcing.`,

  `WebAssembly (Wasm) e um formato binario de instrucoes para uma maquina virtual
baseada em stack. Permite executar codigo C, Rust e Go no navegador com
performance proxima ao nativo. Casos de uso incluem jogos, editores de imagem
e ferramentas de compilacao rodando inteiramente no cliente.`,

  `Observabilidade em sistemas distribuidos envolve tres pilares: logs (registros
de eventos), metricas (dados numericos ao longo do tempo) e traces (rastreamento
de requisicoes entre servicos). Ferramentas como OpenTelemetry unificam a
coleta desses sinais para facilitar debugging em arquiteturas complexas.`,

  `Transfer Learning e uma tecnica de ML onde um modelo pre-treinado em uma
tarefa ampla (como classificacao de imagens no ImageNet) e reutilizado como
ponto de partida para uma tarefa especifica. Isso reduz drasticamente o tempo
de treinamento e a quantidade de dados necessarios.`,
];

// === TODO 4: Use LLM-as-Judge para pontuar cada resposta ===
// O juiz (Sonnet) deve avaliar de 0-10:
// - qualidade geral do resumo
// Retorne JSON: { "score": N, "justificativa": "..." }
//
// IMPORTANTE: O juiz nao deve saber qual variante gerou a resposta.

// async function julgarResposta(inputOriginal: string, resumo: string): Promise<{ score: number; justificativa: string }> { ... }

// === TODO 5: Gere relatorio estatistico ===
// Formato:
// Variante     | Avg Score | Avg Tokens | Avg Latencia | Custo Total | Wins
// Direto       | 7.2       | 120        | 350ms        | $0.000XXX   | 2
// Estruturado  | 8.5       | 185        | 420ms        | $0.000XXX   | 3
//
// "Wins" = em quantos inputs esta variante teve score maior.
// Declare o vencedor no final.

// async function executarABTest() { ... }
// executarABTest();

console.log('\n--- Exercicio 20 completo! ---');
console.log('Dica: veja a solucao em solucoes/ex20-ab-testing.ts');
