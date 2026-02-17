/**
 * Exercicio 19: Sanitizacao e Seguranca
 *
 * Aprenda a validar dados ANTES de renderizar templates usando Zod.
 * Voce ja domina heranca de templates (ex18). Agora adicione seguranca.
 * Padroes que serao reutilizados no Modulo 3 (Tool Use) e Modulo 4 (Data Pipelines).
 * Execute: npx tsx exercicios/ex19-template-seguranca.ts
 */

import Handlebars from 'handlebars';
import { z } from 'zod';

// === Seguranca em templates: validar dados ANTES de renderizar ===
// Templates recebem dados de diversas fontes (APIs, usuarios, bancos de dados).
// Renderizar dados sem validacao pode causar XSS, quebra de layout, ou erros.
// Zod nos permite definir schemas de validacao type-safe.

// === Dados seguros (validos) ===
const dadosSeguros = {
  nome: 'Maria Silva',
  email: 'maria@exemplo.com',
  bio: 'Desenvolvedora com 5 anos de experiencia em AI.',
  website: 'https://maria.dev',
};

// === Dados inseguros (invalidos ou maliciosos) ===
const dadosInseguros = {
  nome: '<script>alert("xss")</script>',
  email: 'invalido-sem-arroba',
  bio: '<img src=x onerror=alert("hack")>Texto normal',
  website: 'javascript:alert(1)',
};

// === TODO 1: Crie um schema Zod para validacao de perfil ===
// O schema deve validar:
// - nome: string, minimo 2 caracteres, maximo 100
// - email: string no formato de email
// - bio: string, maximo 500 caracteres
// - website: string no formato URL, deve comecar com "https://"
//
// Dica:
// const perfilSchema = z.object({
//   nome: z.string().min(2).max(100),
//   email: z.string().email(),
//   bio: z.string().max(500),
//   website: z.string().url().startsWith('https://'),
// });

// TODO: Defina o perfilSchema aqui

// === TODO 2: Crie a funcao renderSeguro ===
// A funcao deve:
// 1. Receber um schema Zod, um template string e dados
// 2. Validar os dados usando o schema
// 3. Se a validacao passar: compilar e renderizar o template
// 4. Se a validacao falhar: retornar as mensagens de erro formatadas
//
// Assinatura sugerida:
// function renderSeguro<T>(
//   schema: z.ZodSchema<T>,
//   templateStr: string,
//   dados: unknown,
// ): { sucesso: boolean; resultado?: string; erros?: string[] }
//
// Dica: use schema.safeParse(dados) para validacao sem throw.
// O retorno de safeParse tem { success, data, error }.
// Use error.issues para acessar as mensagens de erro.

// TODO: Implemente a funcao renderSeguro aqui

// === TODO 3: Crie um helper "sanitizar" que remove tags HTML ===
// O helper deve remover qualquer tag HTML de uma string.
// Isso e uma camada extra de seguranca alem do escape padrao do Handlebars.
//
// Exemplo: "<script>alert('xss')</script>Texto" -> "alert('xss')Texto"
//
// Dica: use regex /<[^>]*>/g para remover tags
// Handlebars.registerHelper('sanitizar', function(texto) {
//   return typeof texto === 'string' ? texto.replace(/<[^>]*>/g, '') : texto;
// });

// TODO: Registre o helper 'sanitizar' aqui

// === Template de perfil de usuario ===
const templatePerfil = `=== Perfil de Usuario ===
Nome: {{nome}}
Email: {{email}}
Bio: {{bio}}
Website: {{website}}`;

// === TODO 4: Teste com dados seguros e inseguros ===
// Use a funcao renderSeguro para:
// 1. Renderizar dadosSeguros (deve funcionar)
// 2. Tentar renderizar dadosInseguros (deve falhar com erros)
//
// Para cada resultado, exiba:
// - Se sucesso: o HTML renderizado
// - Se falha: a lista de erros de validacao

console.log('=== Teste com dados SEGUROS ===');
// TODO: renderize dadosSeguros e exiba o resultado

console.log('\n=== Teste com dados INSEGUROS ===');
// TODO: renderize dadosInseguros e exiba os erros

// === TODO 5: Padrao "Safe Template" ===
// Crie uma funcao que compoe schema + template + helpers em uma unidade reutilizavel.
//
// Assinatura sugerida:
// function criarTemplateSafe<T>(config: {
//   schema: z.ZodSchema<T>;
//   template: string;
//   helpers?: Record<string, (...args: any[]) => any>;
// }): (dados: unknown) => { sucesso: boolean; resultado?: string; erros?: string[] }
//
// Exemplo de uso:
// const renderPerfil = criarTemplateSafe({
//   schema: perfilSchema,
//   template: templatePerfil,
//   helpers: { sanitizar: (t) => t.replace(/<[^>]*>/g, '') },
// });
// const resultado = renderPerfil(dadosSeguros);

// TODO: Implemente criarTemplateSafe aqui

console.log('\n=== Teste com Safe Template Pattern ===');
// TODO: use criarTemplateSafe para criar e testar um template seguro

console.log('\n--- Exercicio 19 completo! ---');
console.log('Dica: veja a solucao em solucoes/ex19-template-seguranca.ts');
