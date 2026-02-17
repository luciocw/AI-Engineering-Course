/**
 * Solucao 4: Instrucoes Estruturadas
 *
 * System prompts ricos com secoes de papel, regras e formato de saida.
 * Execute: npx tsx solucoes/ex4-instrucoes-estruturadas.ts
 */

import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic();

// System prompt estruturado para code reviewer
const systemPromptReviewer = `[Papel]
Voce e um code reviewer senior especializado em TypeScript/Node.js com 10 anos de experiencia.

[Regras]
1. Sempre aponte problemas de seguranca primeiro
2. Sugira melhorias de performance quando relevante
3. Verifique tratamento de erros
4. Limite sua review a no maximo 5 pontos
5. Seja direto e objetivo

[Formato de Resposta]
## Resumo
(1 frase sobre a qualidade geral)

## Problemas Encontrados
- [SEVERIDADE] Descricao do problema
  Sugestao: como corrigir

## Pontos Positivos
- O que esta bom no codigo`;

// System prompt alternativo com tom didatico
const systemPromptProfessor = `[Papel]
Voce e um professor de programacao que faz code reviews educativas.
Seu objetivo e ensinar boas praticas, nao apenas apontar erros.

[Regras]
1. Explique o PORQUE de cada problema, nao apenas o QUE
2. Use analogias simples quando possivel
3. Sempre sugira um exemplo corrigido
4. Encoraje o que esta bom
5. Maximo 5 pontos

[Formato de Resposta]
## Nota Geral
(1 frase resumindo + nota de 1 a 10)

## O que Aprender
- Topico: Explicacao didatica
  Antes: codigo com problema
  Depois: codigo corrigido

## Parabens por
- O que o aluno fez bem`;

// Trechos de codigo para review
const codigosParaReview: Record<string, string> = {
  'API sem tratamento de erros': `
async function getUser(id) {
  const response = await fetch('http://api.example.com/users/' + id);
  const data = await response.json();
  return data;
}

app.get('/user/:id', async (req, res) => {
  const user = await getUser(req.params.id);
  res.json(user);
});
`,
  'Insercao sem validacao': `
app.post('/save', async (req, res) => {
  const { name, email, age } = req.body;
  await db.collection('users').insertOne({ name, email, age });
  res.json({ success: true });
});
`,
  'SQL injection vulneravel': `
async function searchProducts(query) {
  const sql = "SELECT * FROM products WHERE name LIKE '%" + query + "%'";
  const results = await db.execute(sql);
  return results;
}
`,
};

// Funcao auxiliar para fazer review
async function fazerReview(
  system: string,
  codigo: string
): Promise<string> {
  const response = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 800,
    system,
    messages: [
      {
        role: 'user',
        content: `Faca a review do seguinte codigo:\n\`\`\`\n${codigo}\n\`\`\``,
      },
    ],
  });

  const text =
    response.content[0].type === 'text' ? response.content[0].text : '';
  return text;
}

// Teste com os 3 codigos usando o reviewer senior
console.log('========================================');
console.log('  ABORDAGEM 1: Code Reviewer Senior');
console.log('========================================\n');

for (const [nome, codigo] of Object.entries(codigosParaReview)) {
  console.log(`=== Review: ${nome} ===`);
  const review = await fazerReview(systemPromptReviewer, codigo);
  console.log(review);
  console.log('\n' + '-'.repeat(50) + '\n');
}

// Comparacao: mesmo codigo com abordagem de professor
console.log('========================================');
console.log('  ABORDAGEM 2: Professor Didatico');
console.log('========================================\n');

const primeiroCodigoNome = Object.keys(codigosParaReview)[0];
const primeiroCodigo = codigosParaReview[primeiroCodigoNome];

console.log(`=== Review Didatica: ${primeiroCodigoNome} ===`);
const reviewProfessor = await fazerReview(systemPromptProfessor, primeiroCodigo);
console.log(reviewProfessor);

console.log('\n' + '-'.repeat(50));
console.log('\nObservacao: Compare como o mesmo codigo recebe reviews');
console.log('diferentes dependendo da estrutura do system prompt.');
console.log('O formato de resposta se mantem consistente dentro de cada abordagem.');

console.log('\n--- Exercicio 4 completo! ---');
