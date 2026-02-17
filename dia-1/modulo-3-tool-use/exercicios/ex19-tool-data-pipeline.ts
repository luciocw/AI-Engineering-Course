/**
 * Exercicio 19: Tools como Data Pipeline
 *
 * Use tools para criar um pipeline de dados onde a saida de uma
 * tool alimenta a entrada da proxima, formando um fluxo ETL.
 *
 * Dificuldade: Expert
 * Tempo estimado: 25 minutos
 * Execute: npx tsx exercicios/ex19-tool-data-pipeline.ts
 */

import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic();

// === CONCEITO ===
// Pipeline de dados com tools:
// Extract -> Transform -> Load
//
// 1. EXTRACT: Tool busca dados brutos de uma fonte
// 2. TRANSFORM: Tool processa/limpa/agrega os dados
// 3. LOAD: Tool salva/envia o resultado processado
//
// Claude orquestra o pipeline automaticamente,
// passando a saida de cada etapa como entrada da proxima.

// === Dados brutos simulados ===
const dadosBrutos = {
  vendas_csv: [
    'data,produto,valor,regiao',
    '2026-01-05,Plano Pro,299,Sudeste',
    '2026-01-05,Plano Starter,49,Sul',
    '2026-01-10,Plano Enterprise,999,Sudeste',
    '2026-01-15,Plano Pro,299,Nordeste',
    '2026-01-20,Plano Enterprise,999,Sudeste',
    '2026-01-25,Plano Starter,49,Sul',
    '2026-02-01,Plano Pro,299,Norte',
    '2026-02-05,Plano Enterprise,999,Sudeste',
    '2026-02-10,Plano Pro,299,Nordeste',
    '2026-02-15,Plano Starter,49,Centro-Oeste',
  ],
};

// === TODO 1: Defina as tools do pipeline ===
// Tool 1: extrair_dados — le dados brutos (simula leitura de CSV/API)
// Tool 2: transformar_dados — agrega, filtra e calcula metricas
// Tool 3: carregar_dados — salva resultado (simula escrita em banco/arquivo)

// const tools: Anthropic.Tool[] = [
//   {
//     name: 'extrair_dados',
//     description: 'Extrai dados brutos de uma fonte. Retorna dados em formato JSON.',
//     input_schema: { ... },
//   },
//   {
//     name: 'transformar_dados',
//     description: 'Transforma dados: agrupa, filtra, calcula metricas.',
//     input_schema: { ... },
//   },
//   {
//     name: 'carregar_dados',
//     description: 'Carrega dados processados em um destino.',
//     input_schema: { ... },
//   },
// ];

// === TODO 2: Implemente os handlers do pipeline ===

// function handleExtrair(input: { fonte: string }): string {
//   // Parse CSV para JSON
// }

// function handleTransformar(input: {
//   dados: unknown[];
//   operacao: string;  // 'agrupar_por_regiao' | 'agrupar_por_produto' | 'filtrar'
//   filtro?: { campo: string; valor: string };
// }): string {
//   // Realiza a transformacao pedida
// }

// function handleCarregar(input: {
//   destino: string;  // 'console' | 'json' | 'relatorio'
//   dados: unknown;
//   titulo?: string;
// }): string {
//   // Salva os dados no destino
// }

// === TODO 3: Rode o pipeline com Claude ===
// Pergunta: "Extraia os dados de vendas, agrupe por regiao,
//           e gere um relatorio com o total por regiao."

console.log('\n--- Exercicio 19 completo! ---');
console.log('Dica: veja a solucao em solucoes/ex19-tool-data-pipeline.ts');
