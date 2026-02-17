/**
 * Solucao 19: Versionamento de Prompts
 *
 * Gerencie e compare versoes de prompts ao longo do tempo.
 * Execute: npx tsx solucoes/ex19-prompt-versioning.ts
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

// === Classe PromptVersionManager ===

class PromptVersionManager {
  private versions: PromptVersion[] = [];

  addVersion(version: string, template: string, changelog: string): void {
    this.versions.push({
      version,
      template,
      changelog,
      createdAt: new Date(),
    });
  }

  getVersion(version: string): PromptVersion | undefined {
    return this.versions.find((v) => v.version === version);
  }

  getLatest(): PromptVersion | undefined {
    return this.versions[this.versions.length - 1];
  }

  listVersions(): PromptVersion[] {
    return [...this.versions];
  }
}

// === 3 versoes progressivas de um prompt de classificacao ===

const manager = new PromptVersionManager();

// v1.0 — Basico
manager.addVersion(
  'v1.0',
  `Classifique o seguinte ticket de suporte em uma das categorias: bug, feature, pergunta, urgente.
Responda apenas com a categoria.

Ticket: {{INPUT}}`,
  'Versao inicial — classificacao basica sem exemplos'
);

// v1.1 — Com exemplos few-shot
manager.addVersion(
  'v1.1',
  `Classifique o seguinte ticket de suporte em uma das categorias: bug, feature, pergunta, urgente.

Exemplos:
- "O app fecha sozinho ao abrir configuracoes" -> bug
- "Gostaria de poder exportar em CSV" -> feature
- "Onde encontro a pagina de cobranca?" -> pergunta
- "SISTEMA FORA DO AR, clientes sem acesso!" -> urgente

Responda apenas com a categoria.

Ticket: {{INPUT}}`,
  'Adicionados exemplos few-shot para cada categoria'
);

// v2.0 — Estruturado com JSON
manager.addVersion(
  'v2.0',
  `Classifique o seguinte ticket de suporte. Analise cuidadosamente o contexto e a urgencia.

Categorias disponiveis:
- bug: defeitos, erros, comportamento inesperado do sistema
- feature: solicitacoes de novas funcionalidades ou melhorias
- pergunta: duvidas sobre uso, documentacao, como fazer algo
- urgente: problemas criticos que afetam producao ou muitos usuarios

Exemplos:
- "O app fecha sozinho ao abrir configuracoes" -> bug
- "Gostaria de poder exportar em CSV" -> feature
- "Onde encontro a pagina de cobranca?" -> pergunta
- "SISTEMA FORA DO AR, clientes sem acesso!" -> urgente

Retorne APENAS um JSON valido:
{
  "categoria": "bug|feature|pergunta|urgente",
  "confianca": 0.0 a 1.0,
  "justificativa": "breve explicacao"
}

Ticket: {{INPUT}}`,
  'Output JSON estruturado com confianca e justificativa'
);

// === Inputs de teste ===
const ticketsTeste = [
  'O sistema travou quando tentei exportar o relatorio em PDF.',
  'Seria otimo ter integracao com o Slack para notificacoes.',
  'Como faco para mudar o idioma da interface?',
  'URGENTE: Todos os dados de producao foram apagados!',
  'O botao de salvar nao responde no Firefox.',
];

// Testar uma versao contra todos os inputs
async function testarVersao(version: PromptVersion, inputs: string[]): Promise<TestResult[]> {
  const results: TestResult[] = [];

  for (const input of inputs) {
    const prompt = version.template.replace('{{INPUT}}', input);
    const inicio = Date.now();

    const response = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 200,
      temperature: 0,
      messages: [{ role: 'user', content: prompt }],
    });

    const latencyMs = Date.now() - inicio;
    const text = response.content[0].type === 'text' ? response.content[0].text : '';

    results.push({
      version: version.version,
      input,
      output: text.trim(),
      inputTokens: response.usage.input_tokens,
      outputTokens: response.usage.output_tokens,
      latencyMs,
    });
  }

  return results;
}

// Executar comparacao
async function executarComparacao() {
  console.log('=== Versionamento de Prompts: Classificacao de Tickets ===\n');

  // Listar versoes
  console.log('--- Versoes Registradas ---');
  for (const v of manager.listVersions()) {
    console.log(`  ${v.version}: ${v.changelog}`);
  }

  // Testar todas as versoes
  const todosResultados: TestResult[] = [];
  const comparacoes: VersionComparison[] = [];

  for (const version of manager.listVersions()) {
    console.log(`\n--- Testando ${version.version}... ---`);
    const results = await testarVersao(version, ticketsTeste);
    todosResultados.push(...results);

    const totalTokens = results.reduce((s, r) => s + r.inputTokens + r.outputTokens, 0);
    const totalLatency = results.reduce((s, r) => s + r.latencyMs, 0);

    comparacoes.push({
      version: version.version,
      avgTokens: Math.round(totalTokens / results.length),
      avgLatencyMs: Math.round(totalLatency / results.length),
      resultados: results.map((r) => r.output),
    });
  }

  // Tabela resumo por versao
  console.log('\n=== Resumo por Versao ===');
  console.log(
    'Versao'.padEnd(10) +
      'Avg Tokens'.padEnd(14) +
      'Avg Latencia'.padEnd(16) +
      'Changelog'
  );
  console.log('-'.repeat(75));

  for (const comp of comparacoes) {
    const version = manager.getVersion(comp.version)!;
    console.log(
      comp.version.padEnd(10) +
        String(comp.avgTokens).padEnd(14) +
        `${comp.avgLatencyMs}ms`.padEnd(16) +
        version.changelog
    );
  }

  // Respostas lado a lado
  console.log('\n=== Respostas por Input ===');

  for (let i = 0; i < ticketsTeste.length; i++) {
    const ticketCurto = ticketsTeste[i].length > 55
      ? ticketsTeste[i].slice(0, 55) + '...'
      : ticketsTeste[i];
    console.log(`\nTicket: "${ticketCurto}"`);

    for (const comp of comparacoes) {
      const output = comp.resultados[i];
      const outputCurto = output.length > 60 ? output.slice(0, 60) + '...' : output;
      console.log(`  ${comp.version}: ${outputCurto}`);
    }
  }

  // Recomendacao
  console.log('\n=== Recomendacao ===');
  const latest = manager.getLatest()!;
  console.log(`Versao mais recente: ${latest.version}`);
  console.log(`A versao ${latest.version} oferece output estruturado (JSON) que facilita`);
  console.log(`integracao programatica, porem consome mais tokens.`);
  console.log(`Considere v1.1 para classificacao simples e v2.0 para pipelines automatizados.`);
}

executarComparacao().then(() => {
  console.log('\n--- Exercicio 19 completo! ---');
});
