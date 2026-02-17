/**
 * Solucao 17: Rastreamento de Custos
 *
 * Classe utilitaria CostTracker para monitorar custos de API em tempo real.
 * Execute: npx tsx solucoes/ex17-cost-tracking.ts
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

type PriceEntry = { input: number; output: number };

// === Classe CostTracker ===

class CostTracker {
  private priceMap: Record<ModeloSuportado, PriceEntry> = {
    'claude-haiku-4-5-20251001': { input: 0.25, output: 1.25 },
    'claude-sonnet-4-20250514': { input: 3.0, output: 15.0 },
  };

  private registros: RegistroCusto[] = [];
  private limiteOrcamento: number | null = null;

  track(
    modelo: ModeloSuportado,
    inputTokens: number,
    outputTokens: number,
    descricao?: string
  ): RegistroCusto {
    const precos = this.priceMap[modelo];
    if (!precos) {
      throw new Error(`Modelo nao suportado: ${modelo}`);
    }

    const custoInput = (inputTokens / 1_000_000) * precos.input;
    const custoOutput = (outputTokens / 1_000_000) * precos.output;
    const custoTotal = custoInput + custoOutput;

    // Verificar limite de orcamento ANTES de registrar
    const custoAcumulado = this.getCost();
    if (this.limiteOrcamento !== null && custoAcumulado + custoTotal > this.limiteOrcamento) {
      throw new Error(
        `Limite de orcamento excedido! ` +
        `Acumulado: $${custoAcumulado.toFixed(6)}, ` +
        `Esta chamada: $${custoTotal.toFixed(6)}, ` +
        `Limite: $${this.limiteOrcamento.toFixed(6)}`
      );
    }

    const registro: RegistroCusto = {
      modelo,
      inputTokens,
      outputTokens,
      custoInput,
      custoOutput,
      custoTotal,
      timestamp: new Date(),
      descricao,
    };

    this.registros.push(registro);
    return registro;
  }

  getCost(): number {
    return this.registros.reduce((sum, r) => sum + r.custoTotal, 0);
  }

  setLimit(valor: number): void {
    this.limiteOrcamento = valor;
  }

  getReport(): RelatorioCusto {
    const porModelo: RelatorioCusto['porModelo'] = {};

    for (const registro of this.registros) {
      if (!porModelo[registro.modelo]) {
        porModelo[registro.modelo] = {
          chamadas: 0,
          inputTokens: 0,
          outputTokens: 0,
          custo: 0,
        };
      }
      const entry = porModelo[registro.modelo];
      entry.chamadas++;
      entry.inputTokens += registro.inputTokens;
      entry.outputTokens += registro.outputTokens;
      entry.custo += registro.custoTotal;
    }

    return {
      totalChamadas: this.registros.length,
      totalInputTokens: this.registros.reduce((s, r) => s + r.inputTokens, 0),
      totalOutputTokens: this.registros.reduce((s, r) => s + r.outputTokens, 0),
      custoTotalInput: this.registros.reduce((s, r) => s + r.custoInput, 0),
      custoTotalOutput: this.registros.reduce((s, r) => s + r.custoOutput, 0),
      custoTotal: this.getCost(),
      porModelo,
    };
  }

  printReport(): void {
    const report = this.getReport();

    console.log('\n=== Relatorio de Custos ===');
    console.log(`Total de chamadas: ${report.totalChamadas}`);
    console.log(`Tokens: ${report.totalInputTokens} input + ${report.totalOutputTokens} output = ${report.totalInputTokens + report.totalOutputTokens} total`);

    console.log('\n--- Custo por Modelo ---');
    console.log(
      'Modelo'.padEnd(35) +
        'Chamadas'.padEnd(12) +
        'Input'.padEnd(12) +
        'Output'.padEnd(12) +
        'Custo'
    );
    console.log('-'.repeat(75));

    for (const [modelo, dados] of Object.entries(report.porModelo)) {
      console.log(
        modelo.padEnd(35) +
          String(dados.chamadas).padEnd(12) +
          String(dados.inputTokens).padEnd(12) +
          String(dados.outputTokens).padEnd(12) +
          `$${dados.custo.toFixed(6)}`
      );
    }

    console.log('-'.repeat(75));
    console.log(
      'TOTAL'.padEnd(35) +
        String(report.totalChamadas).padEnd(12) +
        String(report.totalInputTokens).padEnd(12) +
        String(report.totalOutputTokens).padEnd(12) +
        `$${report.custoTotal.toFixed(6)}`
    );

    console.log(`\n  Custo Input:  $${report.custoTotalInput.toFixed(6)}`);
    console.log(`  Custo Output: $${report.custoTotalOutput.toFixed(6)}`);
    console.log(`  Custo Total:  $${report.custoTotal.toFixed(6)}`);

    if (this.limiteOrcamento !== null) {
      const percentual = (report.custoTotal / this.limiteOrcamento) * 100;
      console.log(`\n  Orcamento: $${this.limiteOrcamento.toFixed(6)} (${percentual.toFixed(1)}% utilizado)`);
    }
  }
}

// Exportar para uso em M3 e M4
export { CostTracker };
export type { ModeloSuportado, RegistroCusto, RelatorioCusto };

// === Demonstracao ===

async function demonstrarCostTracker() {
  const tracker = new CostTracker();

  console.log('=== CostTracker: Rastreamento de Custos em Tempo Real ===\n');

  // 5 chamadas variadas
  const perguntas = [
    { texto: 'O que e machine learning? Responda em 1 frase.', desc: 'Pergunta curta - ML' },
    { texto: 'Liste 3 beneficios de TypeScript sobre JavaScript.', desc: 'Lista curta - TS vs JS' },
    { texto: 'Explique o padrao Observer em programacao orientada a objetos.', desc: 'Explicacao - Design Pattern' },
    { texto: 'Escreva uma funcao TypeScript que calcula o fatorial de um numero.', desc: 'Codigo - Fatorial' },
    { texto: 'Quais sao as diferencas entre REST e GraphQL? Faca uma comparacao breve.', desc: 'Comparacao - REST vs GraphQL' },
  ];

  for (const pergunta of perguntas) {
    console.log(`Chamada: ${pergunta.desc}...`);

    const response = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 300,
      messages: [{ role: 'user', content: pergunta.texto }],
    });

    const registro = tracker.track(
      'claude-haiku-4-5-20251001',
      response.usage.input_tokens,
      response.usage.output_tokens,
      pergunta.desc
    );

    console.log(`  -> ${registro.inputTokens} in + ${registro.outputTokens} out = $${registro.custoTotal.toFixed(6)}`);
  }

  // Relatorio completo
  tracker.printReport();

  // Testar limite de orcamento
  console.log('\n=== Teste de Limite de Orcamento ===');
  tracker.setLimit(0.001); // Limite muito baixo para demonstrar

  try {
    const response = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 300,
      messages: [{ role: 'user', content: 'Escreva um poema sobre programacao.' }],
    });

    tracker.track(
      'claude-haiku-4-5-20251001',
      response.usage.input_tokens,
      response.usage.output_tokens,
      'Teste limite'
    );
  } catch (error) {
    if (error instanceof Error) {
      console.log(`Limite atingido (esperado): ${error.message}`);
    }
  }
}

demonstrarCostTracker().then(() => {
  console.log('\n--- Exercicio 17 completo! ---');
});
