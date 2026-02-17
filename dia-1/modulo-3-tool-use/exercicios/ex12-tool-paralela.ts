/**
 * Exercicio 12: Execucao Paralela de Tools
 *
 * Quando Claude retorna multiplas tool_use em uma resposta,
 * podemos executar os handlers em paralelo com Promise.all().
 *
 * Dificuldade: Avancado
 * Tempo estimado: 20 minutos
 * Execute: npx tsx exercicios/ex12-tool-paralela.ts
 */

import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic();

// === CONCEITO ===
// Claude pode retornar MULTIPLOS blocos tool_use em uma unica resposta.
// Isso acontece quando as tools sao independentes entre si.
// Em vez de executar sequencialmente, podemos usar Promise.all()
// para rodar todas em paralelo, reduzindo o tempo total.

// === Dados simulados ===
// Simular latencias diferentes para cada servico
// async function buscarClima(cidade: string): Promise<string> {
//   await new Promise(r => setTimeout(r, 1000 + Math.random() * 2000));
//   const climas = { 'SP': 28, 'RJ': 32, 'BH': 25 };
//   return JSON.stringify({ cidade, temp: climas[cidade] || 20, condicao: 'ensolarado' });
// }

// async function buscarCotacao(moeda: string): Promise<string> {
//   await new Promise(r => setTimeout(r, 500 + Math.random() * 1500));
//   const cotacoes = { USD: 5.12, EUR: 5.56, GBP: 6.48 };
//   return JSON.stringify({ moeda, valor: cotacoes[moeda] || 1 });
// }

// async function buscarNoticias(tema: string): Promise<string> {
//   await new Promise(r => setTimeout(r, 800 + Math.random() * 1200));
//   return JSON.stringify([{ titulo: `Novidades sobre ${tema}`, resumo: 'Lorem ipsum...' }]);
// }

// === TODO 1: Defina 3 tools independentes ===
// Tool 1: buscar_clima — busca temperatura de uma cidade
// Tool 2: buscar_cotacao — busca cotacao de moeda
// Tool 3: buscar_noticias — busca noticias sobre um tema

// const tools: Anthropic.Tool[] = [ ... ];

// === TODO 2: Implemente o dispatcher assincrono ===
// Cada handler e async e tem latencia diferente.

// async function dispatchToolAsync(name: string, input: Record<string, unknown>): Promise<string> {
//   switch (name) { ... }
// }

// === TODO 3: Implemente execucao paralela vs sequencial ===
// Compare o tempo de execucao usando Promise.all() vs for...of

// async function executarParalelo(toolCalls: Array<{ name: string; input: unknown; id: string }>): Promise<...> {
//   const inicio = Date.now();
//   const resultados = await Promise.all(
//     toolCalls.map(tc => dispatchToolAsync(tc.name, tc.input))
//   );
//   console.log(`  Paralelo: ${Date.now() - inicio}ms`);
//   return resultados;
// }

// async function executarSequencial(toolCalls: Array<{ name: string; input: unknown; id: string }>): Promise<...> {
//   const inicio = Date.now();
//   const resultados = [];
//   for (const tc of toolCalls) {
//     resultados.push(await dispatchToolAsync(tc.name, tc.input));
//   }
//   console.log(`  Sequencial: ${Date.now() - inicio}ms`);
//   return resultados;
// }

// === TODO 4: Rode o loop de tool use com execucao paralela ===
// Pergunta: "Me diga a temperatura em SP, a cotacao do dolar e as noticias de tecnologia"

console.log('\n--- Exercicio 12 completo! ---');
console.log('Dica: veja a solucao em solucoes/ex12-tool-paralela.ts');
