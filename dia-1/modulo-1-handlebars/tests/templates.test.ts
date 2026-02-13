/**
 * Testes para o Modulo 1: Handlebars
 *
 * Valida que os conceitos ensinados nos exercicios funcionam.
 * Execute: npm test
 */

import { describe, it, expect, beforeEach } from 'vitest';
import Handlebars from 'handlebars';

describe('Handlebars Basics', () => {
  it('renders variables correctly', () => {
    const template = Handlebars.compile('Ola {{nome}}!');
    const result = template({ nome: 'Maria' });

    expect(result).toBe('Ola Maria!');
  });

  it('handles missing variables gracefully', () => {
    const template = Handlebars.compile('Ola {{nome}}!');
    const result = template({});

    expect(result).toBe('Ola !');
  });

  it('renders nested properties', () => {
    const template = Handlebars.compile('{{cliente.nome}} - {{cliente.email}}');
    const result = template({
      cliente: { nome: 'Ana', email: 'ana@test.com' },
    });

    expect(result).toBe('Ana - ana@test.com');
  });
});

describe('Conditionals', () => {
  it('renders if block when truthy', () => {
    const template = Handlebars.compile('{{#if ativo}}Ativo{{else}}Inativo{{/if}}');

    expect(template({ ativo: true })).toBe('Ativo');
    expect(template({ ativo: false })).toBe('Inativo');
  });

  it('treats empty string as falsy', () => {
    const template = Handlebars.compile('{{#if plano}}{{plano}}{{else}}Sem plano{{/if}}');

    expect(template({ plano: '' })).toBe('Sem plano');
    expect(template({ plano: 'premium' })).toBe('premium');
  });

  it('renders unless block when falsy', () => {
    const template = Handlebars.compile('{{#unless creditos}}Sem creditos{{/unless}}');

    expect(template({ creditos: 0 })).toBe('Sem creditos');
    expect(template({ creditos: 10 })).toBe('');
  });
});

describe('Loops with each', () => {
  it('iterates over arrays', () => {
    const template = Handlebars.compile('{{#each items}}{{this}} {{/each}}');
    const result = template({ items: ['a', 'b', 'c'] });

    expect(result.trim()).toBe('a b c');
  });

  it('provides @index in each', () => {
    const template = Handlebars.compile('{{#each items}}{{@index}}:{{this}} {{/each}}');
    const result = template({ items: ['x', 'y'] });

    expect(result.trim()).toBe('0:x 1:y');
  });

  it('iterates over object keys', () => {
    const template = Handlebars.compile('{{#each obj}}{{@key}}={{this}} {{/each}}');
    const result = template({ obj: { a: 1, b: 2 } });

    expect(result.trim()).toBe('a=1 b=2');
  });

  it('handles nested each', () => {
    const template = Handlebars.compile(
      '{{#each produtos}}{{nome}}: {{#each tags}}[{{this}}]{{/each}} {{/each}}'
    );
    const result = template({
      produtos: [{ nome: 'P1', tags: ['a', 'b'] }],
    });

    expect(result.trim()).toBe('P1: [a][b]');
  });
});

describe('Custom Helpers', () => {
  beforeEach(() => {
    // Registra helpers frescos para cada teste
    Handlebars.registerHelper('testUppercase', (text: string) => text.toUpperCase());

    Handlebars.registerHelper('testCurrency', (value: number) => {
      return `R$ ${value.toFixed(2).replace('.', ',')}`;
    });

    Handlebars.registerHelper('testTruncate', (text: string, length: number) => {
      if (text.length <= length) return text;
      return `${text.substring(0, length)}...`;
    });

    Handlebars.registerHelper('testFormatDate', (date: Date) => {
      const day = String(date.getUTCDate()).padStart(2, '0');
      const month = String(date.getUTCMonth() + 1).padStart(2, '0');
      const year = date.getUTCFullYear();
      return `${day}/${month}/${year}`;
    });
  });

  it('uppercase helper transforms text', () => {
    const template = Handlebars.compile('{{testUppercase nome}}');
    expect(template({ nome: 'joao' })).toBe('JOAO');
  });

  it('currency helper formats BRL', () => {
    const template = Handlebars.compile('{{testCurrency preco}}');
    expect(template({ preco: 497.5 })).toBe('R$ 497,50');
  });

  it('truncate helper cuts long text', () => {
    const template = Handlebars.compile('{{testTruncate texto 10}}');
    expect(template({ texto: 'Este e um texto muito longo' })).toBe('Este e um ...');
  });

  it('truncate helper keeps short text intact', () => {
    const template = Handlebars.compile('{{testTruncate texto 100}}');
    expect(template({ texto: 'Curto' })).toBe('Curto');
  });

  it('formatDate helper formats correctly', () => {
    const template = Handlebars.compile('{{testFormatDate data}}');
    expect(template({ data: new Date('2026-02-15') })).toBe('15/02/2026');
  });
});

describe('AI Prompt Templates', () => {
  it('builds system prompt with variables', () => {
    const systemTemplate = Handlebars.compile(
      'Voce e assistente da {{empresa}}. Responda em {{idioma}}.'
    );
    const result = systemTemplate({ empresa: 'TechCo', idioma: 'portugues' });

    expect(result).toContain('TechCo');
    expect(result).toContain('portugues');
  });

  it('builds user prompt with few-shot examples', () => {
    const template = Handlebars.compile(
      `{{#each exemplos}}P: {{this.pergunta}} R: {{this.resposta}}\n{{/each}}Pergunta: {{pergunta}}`
    );

    const result = template({
      exemplos: [
        { pergunta: 'Oi', resposta: 'Ola!' },
      ],
      pergunta: 'Como funciona?',
    });

    expect(result).toContain('P: Oi R: Ola!');
    expect(result).toContain('Pergunta: Como funciona?');
  });

  it('adapts prompt based on user plan', () => {
    Handlebars.registerHelper('planEq', (a: string, b: string) => a === b);

    const template = Handlebars.compile(
      '{{#if (planEq plano "premium")}}VIP{{else}}Standard{{/if}}'
    );

    expect(template({ plano: 'premium' })).toBe('VIP');
    expect(template({ plano: 'basico' })).toBe('Standard');
  });
});
