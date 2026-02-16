/**
 * Exercicio 3: Tool com API Real (ViaCEP)
 *
 * Crie uma tool que busca enderecos reais usando a API ViaCEP.
 * Execute: npx tsx exercicios/ex3-api-real.ts
 */

import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic();

// === TODO 1: Defina a tool "buscar_cep" ===
// Recebe: cep (string, formato 00000-000 ou 00000000)
// Retorna: endereco completo (logradouro, bairro, cidade, estado)
//
// API: https://viacep.com.br/ws/{cep}/json/

// const buscarCepTool = { ... };

// === TODO 2: Implemente o handler que chama a API ===
// Use fetch() para chamar https://viacep.com.br/ws/{cep}/json/
// Trate erros: CEP invalido, API offline, formato incorreto.

// async function handleBuscarCep(input: { cep: string }): Promise<string> {
//   const cepLimpo = input.cep.replace(/\D/g, '');
//   const response = await fetch(`https://viacep.com.br/ws/${cepLimpo}/json/`);
//   const data = await response.json();
//   if (data.erro) return 'CEP nao encontrado';
//   return `${data.logradouro}, ${data.bairro}, ${data.localidade}-${data.uf}`;
// }

// === TODO 3: Rode o loop de tool use com perguntas sobre CEPs ===
// Pergunta: "Qual o endereco do CEP 01001-000? E do CEP 20040-020?"

// Dica: o handler e async, entao use await no dispatch.

console.log('\n--- Exercicio 3 completo! ---');
console.log('Dica: veja a solucao em solucoes/ex3-api-real.ts');
