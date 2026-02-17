/**
 * Exercicio 4: Instrucoes Estruturadas
 *
 * Construa system prompts ricos com secoes de papel, regras e formato de saida.
 * Veja como instrucoes bem estruturadas produzem respostas mais consistentes.
 * Execute: npx tsx exercicios/ex4-instrucoes-estruturadas.ts
 *
 * Tempo estimado: 15 min
 * Dificuldade: iniciante
 */

import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic();

// === TODO 1: Crie um system prompt estruturado com secoes ===
// Monte um system prompt para um "AI Code Reviewer" com estas secoes:
//
// [Papel]
// Voce e um code reviewer senior especializado em TypeScript/Node.js.
//
// [Regras]
// 1. Sempre aponte problemas de seguranca primeiro
// 2. Sugira melhorias de performance quando relevante
// 3. Verifique tratamento de erros
// 4. Limite sua review a no maximo 5 pontos
// 5. Seja direto e objetivo
//
// [Formato de Resposta]
// ## Resumo
// (1 frase sobre a qualidade geral)
//
// ## Problemas Encontrados
// - [SEVERIDADE] Descricao do problema
//   Sugestao: como corrigir
//
// ## Pontos Positivos
// - O que esta bom no codigo

// const systemPromptReviewer = `...`;

// === TODO 2: Chame a API com o system prompt estruturado ===
// Envie um trecho de codigo para review:
const codigoParaReview = `
async function getUser(id) {
  const response = await fetch('http://api.example.com/users/' + id);
  const data = await response.json();
  return data;
}

app.get('/user/:id', async (req, res) => {
  const user = await getUser(req.params.id);
  res.json(user);
});
`;

// const review = await client.messages.create({ ... });

// === TODO 3: Teste com 3 perguntas diferentes para ver consistencia ===
// Envie 3 trechos de codigo diferentes usando o mesmo system prompt.
// Verifique se o formato de resposta se mantem consistente.
//
// Codigo 2: funcao que salva dados sem validacao
// Codigo 3: funcao com SQL inline

const codigoSemValidacao = `
app.post('/save', async (req, res) => {
  const { name, email, age } = req.body;
  await db.collection('users').insertOne({ name, email, age });
  res.json({ success: true });
});
`;

const codigoComSQL = `
async function searchProducts(query) {
  const sql = "SELECT * FROM products WHERE name LIKE '%" + query + "%'";
  const results = await db.execute(sql);
  return results;
}
`;

// for (const [nome, codigo] of Object.entries({ ... })) {
//   const resultado = await client.messages.create({ ... });
//   console.log(`=== Review: ${nome} ===`);
//   console.log(resultado.content[0].text);
// }

// === TODO 4: Crie uma segunda variante do system prompt e compare ===
// Crie um system prompt alternativo com tom mais didatico (como professor).
// Envie o mesmo codigo e compare as duas abordagens.

// const systemPromptProfessor = `...`;

console.log('\n--- Exercicio 4 completo! ---');
console.log('Dica: veja a solucao em solucoes/ex4-instrucoes-estruturadas.ts');
