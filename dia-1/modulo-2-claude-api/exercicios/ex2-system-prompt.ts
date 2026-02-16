/**
 * Exercicio 2: System Prompts e Personas
 *
 * Aprenda como system prompts mudam completamente o comportamento do Claude.
 * Execute: npx tsx exercicios/ex2-system-prompt.ts
 */

import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic();

// === A mesma pergunta para 3 personas diferentes ===
const pergunta = 'Como funciona um vector database?';

// === TODO 1: Defina 3 system prompts com personas distintas ===
// Persona 1: Code reviewer senior (tecnico, critico, direto)
// Persona 2: Professor paciente (didatico, usa analogias)
// Persona 3: Redator tecnico (conciso, bullet points, estruturado)

const personas: Record<string, string> = {
  // 'Code Reviewer': '...',
  // 'Professor': '...',
  // 'Redator Tecnico': '...',
};

// === TODO 2: Crie funcao que faz chamada com system prompt ===
// Recebe: system (string), question (string)
// Retorna: texto da resposta

// async function askWithPersona(system: string, question: string): Promise<string> { ... }

// === TODO 3: Chame a funcao com cada persona ===
// Use um loop sobre as personas e exiba o resultado de cada uma.

// for (const [nome, system] of Object.entries(personas)) {
//   const resposta = await askWithPersona(system, pergunta);
//   console.log(`\n=== Persona: ${nome} ===`);
//   console.log(resposta);
// }

console.log('\n--- Exercicio 2 completo! ---');
console.log('Dica: veja a solucao em solucoes/ex2-system-prompt.ts');
