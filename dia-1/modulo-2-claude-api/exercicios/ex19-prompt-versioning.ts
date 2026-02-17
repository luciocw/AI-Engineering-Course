/**
 * Exercicio 19: Versionamento de Prompts
 *
 * Gerencie e compare versoes de prompts ao longo do tempo.
 * Voce ja domina avaliacao de qualidade (ex18) e cost tracking (ex17) —
 * agora vai criar um sistema para versionar, testar e comparar prompts.
 *
 * Dificuldade: avancado | Tempo estimado: 25 min
 * Execute: npx tsx exercicios/ex19-prompt-versioning.ts
 */

import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic();

// === Tipos ===

type PromptVersion = {
  version: string;
  template: string;
  changelog: string;
  createdAt: Date;
};

type TestResult = {
  version: string;
  input: string;
  output: string;
  inputTokens: number;
  outputTokens: number;
  latencyMs: number;
};

type VersionComparison = {
  version: string;
  avgTokens: number;
  avgLatencyMs: number;
  resultados: string[];
};

// === TODO 1: Crie o tipo PromptVersion e a classe PromptVersionManager ===
// A classe deve armazenar um array de PromptVersion.
// Metodos:
// - addVersion(version, template, changelog): adiciona nova versao
// - getVersion(version): retorna uma versao especifica
// - getLatest(): retorna a versao mais recente
// - listVersions(): retorna todas as versoes com changelog
// - compareVersions(v1, v2, inputs): testa ambas versoes contra mesmos inputs

// class PromptVersionManager {
//   private versions: PromptVersion[] = [];
//
//   addVersion(version: string, template: string, changelog: string): void { ... }
//   getVersion(version: string): PromptVersion | undefined { ... }
//   getLatest(): PromptVersion | undefined { ... }
//   listVersions(): PromptVersion[] { ... }
// }

// === TODO 2: Crie 3 versoes de um prompt de classificacao ===
// Tarefa: classificar tickets de suporte em categorias (bug, feature, pergunta, urgente)
//
// v1.0 — Basico: "Classifique o ticket na categoria correta."
// v1.1 — Com exemplos: adiciona few-shot examples
// v2.0 — Estruturado: pede JSON com categoria, confianca e justificativa
//
// Cada versao deve ser progressivamente melhor.

// === TODO 3: Crie inputs de teste ===
// 5 tickets de suporte para testar todas as versoes:
// const ticketsTeste = [
//   'O sistema travou quando tentei exportar o relatorio em PDF.',
//   'Seria otimo ter integracao com o Slack para notificacoes.',
//   'Como faco para mudar o idioma da interface?',
//   'URGENTE: Todos os dados de producao foram apagados!',
//   'O botao de salvar nao responde no Firefox.',
// ];

// === TODO 4: Teste todas as versoes contra os mesmos inputs ===
// Para cada versao e cada input:
// 1. Substitua o placeholder no template pelo input
// 2. Chame a API e meça latencia (Date.now antes e depois)
// 3. Armazene TestResult

// async function testarVersao(version: PromptVersion, inputs: string[]): Promise<TestResult[]> { ... }

// === TODO 5: Gere relatorio de comparacao de versoes ===
// Formato:
// Versao | Avg Tokens | Avg Latencia | Changelog
// v1.0   | 45         | 320ms        | Versao inicial
// v1.1   | 52         | 350ms        | Adicionados exemplos
// v2.0   | 78         | 410ms        | Output JSON estruturado
//
// Tambem mostre as respostas lado a lado para cada input.

// async function executarComparacao() { ... }
// executarComparacao();

console.log('\n--- Exercicio 19 completo! ---');
console.log('Dica: veja a solucao em solucoes/ex19-prompt-versioning.ts');
