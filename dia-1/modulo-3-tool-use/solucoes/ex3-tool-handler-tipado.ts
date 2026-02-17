/**
 * Solucao 3: Handlers Tipados
 *
 * Discriminated unions e dispatcher tipado para tool handlers.
 * Execute: npx tsx solucoes/ex3-tool-handler-tipado.ts
 */

import Anthropic from '@anthropic-ai/sdk';

// === Tipos de input com discriminated union ===

type CalculadoraInput = {
  tool_name: 'calculadora';
  operacao: 'soma' | 'subtracao' | 'multiplicacao' | 'divisao';
  a: number;
  b: number;
};

type TraducaoInput = {
  tool_name: 'traduzir';
  texto: string;
  idioma_destino: string;
};

type FormatadorInput = {
  tool_name: 'formatar_data';
  data: string;
  formato: 'curto' | 'longo' | 'iso';
};

type ToolInput = CalculadoraInput | TraducaoInput | FormatadorInput;

// === Handlers tipados ===

function handleCalculadora(input: CalculadoraInput): string {
  switch (input.operacao) {
    case 'soma':
      return String(input.a + input.b);
    case 'subtracao':
      return String(input.a - input.b);
    case 'multiplicacao':
      return String(input.a * input.b);
    case 'divisao':
      if (input.b === 0) return 'Erro: divisao por zero';
      return String(input.a / input.b);
  }
}

function handleTraduzir(input: TraducaoInput): string {
  // Simulacao simples de traducao
  const traducoes: Record<string, Record<string, string>> = {
    pt: { 'Hello world': 'Ola mundo', 'Good morning': 'Bom dia' },
    es: { 'Hello world': 'Hola mundo', 'Good morning': 'Buenos dias' },
    fr: { 'Hello world': 'Bonjour le monde', 'Good morning': 'Bonjour' },
  };

  const traduzido = traducoes[input.idioma_destino]?.[input.texto];
  return traduzido || `[Traducao simulada de "${input.texto}" para ${input.idioma_destino}]`;
}

function handleFormatarData(input: FormatadorInput): string {
  const date = new Date(input.data + 'T12:00:00');
  if (isNaN(date.getTime())) return 'Data invalida';

  const meses = [
    'janeiro', 'fevereiro', 'marco', 'abril', 'maio', 'junho',
    'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro',
  ];

  switch (input.formato) {
    case 'curto':
      return `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`;
    case 'longo':
      return `${date.getDate()} de ${meses[date.getMonth()]} de ${date.getFullYear()}`;
    case 'iso':
      return date.toISOString().split('T')[0];
  }
}

// === Dispatcher com tipagem segura ===

function dispatch(input: ToolInput): string {
  switch (input.tool_name) {
    case 'calculadora':
      return handleCalculadora(input); // TS sabe que e CalculadoraInput
    case 'traduzir':
      return handleTraduzir(input);    // TS sabe que e TraducaoInput
    case 'formatar_data':
      return handleFormatarData(input); // TS sabe que e FormatadorInput
    default:
      // Exhaustive check: se adicionar novo tipo, TS reclama aqui
      const _exhaustive: never = input;
      return `Tool desconhecida`;
  }
}

// === Testes ===

const testes: ToolInput[] = [
  { tool_name: 'calculadora', operacao: 'soma', a: 10, b: 20 },
  { tool_name: 'calculadora', operacao: 'multiplicacao', a: 7, b: 8 },
  { tool_name: 'calculadora', operacao: 'divisao', a: 100, b: 0 },
  { tool_name: 'traduzir', texto: 'Hello world', idioma_destino: 'pt' },
  { tool_name: 'traduzir', texto: 'Good morning', idioma_destino: 'es' },
  { tool_name: 'formatar_data', data: '2026-03-15', formato: 'longo' },
  { tool_name: 'formatar_data', data: '2026-12-25', formato: 'curto' },
  { tool_name: 'formatar_data', data: '2026-07-04', formato: 'iso' },
];

console.log('=== Testando Dispatcher Tipado ===\n');

for (const teste of testes) {
  const resultado = dispatch(teste);
  console.log(`${teste.tool_name} -> ${resultado}`);
}

console.log('\n--- Exercicio 3 completo! ---');
