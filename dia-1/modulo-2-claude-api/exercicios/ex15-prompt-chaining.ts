/**
 * Exercicio 15: Prompt Chaining
 *
 * Encadeie multiplas chamadas a Claude onde a saida de cada etapa
 * alimenta a entrada da proxima. Voce ja domina CoT (ex7) e few-shot (ex6) —
 * agora vai orquestrar chamadas sequenciais para transformar dados brutos
 * em conteudo final refinado.
 *
 * Dificuldade: avancado | Tempo estimado: 25 min
 * Execute: npx tsx exercicios/ex15-prompt-chaining.ts
 */

import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic();

// === Tipos ===

type FatosExtraidos = {
  nome: string;
  setor: string;
  fundacao: string;
  produtos: string[];
  metricas: string[];
  diferenciais: string[];
};

type ResumoEmpresa = {
  titulo: string;
  resumo: string;
  pontosChave: string[];
};

type PostSocial = {
  plataforma: 'Twitter' | 'LinkedIn' | 'Instagram';
  conteudo: string;
  hashtags: string[];
};

type EtapaChain = {
  nome: string;
  inputTokens: number;
  outputTokens: number;
  resultado: string;
};

// === Texto bruto sobre a empresa ===
const textoEmpresa = `
A NovaTech Solutions foi fundada em 2019 em Sao Paulo por dois engenheiros
ex-Google. A empresa desenvolve plataformas de automacao com IA para o setor
financeiro. Seu principal produto, o FinBot Pro, processa mais de 2 milhoes
de transacoes por dia e ja atende 45 bancos na America Latina. Em 2024, a
empresa captou uma Serie B de R$120 milhoes liderada pelo SoftBank. A NovaTech
se diferencia por usar modelos de linguagem proprietarios treinados
especificamente para compliance bancario. A equipe cresceu de 15 para 280
funcionarios em 3 anos. O produto tambem inclui o RiskGuard, uma ferramenta
de deteccao de fraudes em tempo real com precisao de 99.7%. A empresa planeja
expansao para Europa em 2025.
`;

// === TODO 1: Step 1 — Extrair fatos estruturados ===
// Chame Claude para extrair fatos do texto bruto.
// O prompt deve pedir um JSON no formato FatosExtraidos.
// Use temperature: 0 para consistencia.
// Armazene inputTokens e outputTokens desta etapa.

// async function step1ExtrairFatos(texto: string): Promise<{ fatos: FatosExtraidos; etapa: EtapaChain }> {
//   ...
// }

// === TODO 2: Step 2 — Gerar resumo executivo ===
// Use os fatos extraidos no Step 1 como input.
// Peca a Claude para gerar um resumo executivo de 3-4 frases.
// O prompt deve receber os fatos como JSON e retornar ResumoEmpresa em JSON.

// async function step2GerarResumo(fatos: FatosExtraidos): Promise<{ resumo: ResumoEmpresa; etapa: EtapaChain }> {
//   ...
// }

// === TODO 3: Step 3 — Criar posts para redes sociais ===
// Use o resumo do Step 2 como input.
// Peca 3 posts: Twitter (max 280 chars), LinkedIn (profissional), Instagram (casual).
// Retorne um array de PostSocial.

// async function step3CriarPosts(resumo: ResumoEmpresa): Promise<{ posts: PostSocial[]; etapa: EtapaChain }> {
//   ...
// }

// === TODO 4: Executar chain completa e rastrear custos ===
// 1. Execute os 3 steps em sequencia
// 2. Acumule tokens totais (input + output) de todas as etapas
// 3. Calcule custo total (Haiku: $0.25/M input, $1.25/M output)
// 4. Exiba:
//    - Resultado de cada etapa
//    - Tabela de tokens por etapa
//    - Custo total acumulado

// async function executarChain() {
//   console.log('=== Prompt Chaining: Texto -> Fatos -> Resumo -> Posts ===\n');
//   ...
// }

// executarChain();

console.log('\n--- Exercicio 15 completo! ---');
console.log('Dica: veja a solucao em solucoes/ex15-prompt-chaining.ts');
