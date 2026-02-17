/**
 * Testes Completos para o Modulo 1: Handlebars
 *
 * Cobre todos os 20 exercicios com ~3 testes por exercicio.
 * Execute: npm test
 */

import { describe, it, expect, beforeEach } from 'vitest';
import Handlebars from 'handlebars';
import { z } from 'zod';

// ============================================================
// Ex1: Primeiro Template
// ============================================================
describe('Ex1: Primeiro Template', () => {
  it('compiles and executes a simple template', () => {
    const template = Handlebars.compile('Ola, {{nome}}!');
    const result = template({ nome: 'Mundo' });
    expect(result).toBe('Ola, Mundo!');
  });

  it('reuses a compiled template with different data', () => {
    const template = Handlebars.compile('Ola, {{nome}}!');
    expect(template({ nome: 'TypeScript' })).toBe('Ola, TypeScript!');
    expect(template({ nome: 'AI Engineering' })).toBe('Ola, AI Engineering!');
  });

  it('renders multiple variables in a single template', () => {
    const template = Handlebars.compile('Estou aprendendo {{framework}} com {{linguagem}}!');
    const result = template({ linguagem: 'TypeScript', framework: 'Handlebars' });
    expect(result).toBe('Estou aprendendo Handlebars com TypeScript!');
  });

  it('renders empty string for missing variables', () => {
    const template = Handlebars.compile('Ola, {{nome}}!');
    expect(template({})).toBe('Ola, !');
  });
});

// ============================================================
// Ex2: Template de Email
// ============================================================
describe('Ex2: Template de Email', () => {
  it('renders a multi-variable email template', () => {
    const template = Handlebars.compile(
      'Ola {{nome}}!\nObrigado por comprar {{produto}}.\nValor: R${{preco}}.\nEnviaremos detalhes para {{email}}.'
    );
    const result = template({
      nome: 'Maria Silva',
      email: 'maria@exemplo.com',
      produto: 'Curso AI Engineering',
      preco: 497,
    });
    expect(result).toContain('Maria Silva');
    expect(result).toContain('Curso AI Engineering');
    expect(result).toContain('R$497');
    expect(result).toContain('maria@exemplo.com');
  });

  it('handles missing variables gracefully in email', () => {
    const template = Handlebars.compile('Ola {{nome}}! Produto: {{produto}}.');
    const result = template({ nome: 'Ana' });
    expect(result).toBe('Ola Ana! Produto: .');
  });

  it('renders a reminder template reusing the same data', () => {
    const template = Handlebars.compile('{{nome}}, seu acesso ao {{produto}} expira em 7 dias!');
    const result = template({ nome: 'Maria', produto: 'Curso AI' });
    expect(result).toBe('Maria, seu acesso ao Curso AI expira em 7 dias!');
  });
});

// ============================================================
// Ex3: Propriedades Aninhadas
// ============================================================
describe('Ex3: Propriedades Aninhadas', () => {
  const empresa = {
    nome: 'AI Solutions',
    endereco: { rua: 'Av. Paulista, 1000', cidade: 'Sao Paulo', estado: 'SP' },
    contato: { email: 'contato@ai.com', telefone: '(11) 99999-0000' },
    ceo: { nome: 'Carlos Mendes', cargo: 'CEO & Fundador' },
  };

  it('accesses nested properties with dot-notation', () => {
    const template = Handlebars.compile('{{endereco.cidade}} - {{endereco.estado}}');
    expect(template(empresa)).toBe('Sao Paulo - SP');
  });

  it('accesses deeply nested properties across different branches', () => {
    const template = Handlebars.compile('{{ceo.nome}} | {{contato.email}} | {{nome}}');
    expect(template(empresa)).toBe('Carlos Mendes | contato@ai.com | AI Solutions');
  });

  it('returns empty string for missing nested properties without error', () => {
    const template = Handlebars.compile('CEP: {{endereco.cep}} | Receita: {{financeiro.receita}}');
    expect(template(empresa)).toBe('CEP:  | Receita: ');
  });
});

// ============================================================
// Ex4: HTML Escaping
// ============================================================
describe('Ex4: HTML Escaping', () => {
  it('escapes HTML by default with double braces', () => {
    const template = Handlebars.compile('{{conteudo}}');
    const result = template({ conteudo: '<strong>Negrito</strong>' });
    expect(result).toBe('&lt;strong&gt;Negrito&lt;/strong&gt;');
    expect(result).not.toContain('<strong>');
  });

  it('renders raw HTML with triple braces', () => {
    const template = Handlebars.compile('{{{conteudo}}}');
    const result = template({ conteudo: '<strong>Negrito</strong>' });
    expect(result).toBe('<strong>Negrito</strong>');
  });

  it('prevents XSS by escaping script tags', () => {
    const template = Handlebars.compile('{{input}}');
    const result = template({ input: '<script>alert("xss")</script>' });
    expect(result).toContain('&lt;script&gt;');
    expect(result).not.toContain('<script>');
  });

  it('does NOT prevent XSS with triple braces', () => {
    const template = Handlebars.compile('{{{input}}}');
    const result = template({ input: '<script>alert("xss")</script>' });
    expect(result).toContain('<script>');
  });
});

// ============================================================
// Ex5: Condicionais
// ============================================================
describe('Ex5: Condicionais', () => {
  it('renders if block when value is truthy', () => {
    const template = Handlebars.compile('{{#if ativo}}Ativo{{else}}Inativo{{/if}}');
    expect(template({ ativo: true })).toBe('Ativo');
    expect(template({ ativo: false })).toBe('Inativo');
  });

  it('treats empty string as falsy in #if', () => {
    const template = Handlebars.compile('{{#if plano}}{{plano}}{{else}}Sem plano{{/if}}');
    expect(template({ plano: '' })).toBe('Sem plano');
    expect(template({ plano: 'premium' })).toBe('premium');
  });

  it('renders unless block when value is falsy', () => {
    const template = Handlebars.compile(
      '{{#unless creditos}}Sem creditos{{else}}Creditos: {{creditos}}{{/unless}}'
    );
    expect(template({ creditos: 0 })).toBe('Sem creditos');
    expect(template({ creditos: 10 })).toBe('Creditos: 10');
  });

  it('treats 0, null, undefined as falsy', () => {
    const template = Handlebars.compile('{{#if val}}yes{{else}}no{{/if}}');
    expect(template({ val: 0 })).toBe('no');
    expect(template({ val: null })).toBe('no');
    expect(template({ val: undefined })).toBe('no');
    expect(template({})).toBe('no');
  });
});

// ============================================================
// Ex6: Condicionais Aninhadas
// ============================================================
describe('Ex6: Condicionais Aninhadas', () => {
  let hbs: typeof Handlebars;

  beforeEach(() => {
    hbs = Handlebars.create();
    hbs.registerHelper('eq6', (a: unknown, b: unknown) => a === b);
  });

  it('uses eq helper for string comparison in conditionals', () => {
    const template = hbs.compile(
      '{{#if (eq6 status "entregue")}}Entregue{{else}}Outro{{/if}}'
    );
    expect(template({ status: 'entregue' })).toBe('Entregue');
    expect(template({ status: 'enviado' })).toBe('Outro');
  });

  it('handles nested if/else if branches', () => {
    const template = hbs.compile(
      '{{#if (eq6 status "entregue")}}Entregue{{else if (eq6 status "enviado")}}Enviado{{else if (eq6 status "cancelado")}}Cancelado{{else}}Processando{{/if}}'
    );
    expect(template({ status: 'entregue' })).toBe('Entregue');
    expect(template({ status: 'enviado' })).toBe('Enviado');
    expect(template({ status: 'cancelado' })).toBe('Cancelado');
    expect(template({ status: 'processando' })).toBe('Processando');
  });

  it('combines nested conditionals with #unless', () => {
    const template = hbs.compile(
      '{{#if (eq6 status "processando")}}{{#unless pago}}Aguardando pagamento{{else}}Em processamento{{/unless}}{{/if}}'
    );
    expect(template({ status: 'processando', pago: false })).toBe('Aguardando pagamento');
    expect(template({ status: 'processando', pago: true })).toBe('Em processamento');
    expect(template({ status: 'outro' })).toBe('');
  });
});

// ============================================================
// Ex7: Loops Basico
// ============================================================
describe('Ex7: Loops Basico', () => {
  it('iterates over arrays with #each', () => {
    const template = Handlebars.compile('{{#each items}}{{this}} {{/each}}');
    expect(template({ items: ['a', 'b', 'c'] }).trim()).toBe('a b c');
  });

  it('provides @index in each loop', () => {
    const template = Handlebars.compile('{{#each items}}{{@index}}:{{this}} {{/each}}');
    expect(template({ items: ['x', 'y'] }).trim()).toBe('0:x 1:y');
  });

  it('provides @first and @last flags', () => {
    const template = Handlebars.compile(
      '{{#each items}}{{#if @first}}[FIRST]{{/if}}{{#if @last}}[LAST]{{/if}}{{this}} {{/each}}'
    );
    const result = template({ items: ['a', 'b', 'c'] });
    expect(result).toContain('[FIRST]a');
    expect(result).toContain('[LAST]c');
    expect(result).not.toContain('[FIRST]b');
    expect(result).not.toContain('[LAST]b');
  });

  it('renders else block for empty array', () => {
    const template = Handlebars.compile(
      '{{#each items}}{{this}}{{else}}Nenhum item encontrado.{{/each}}'
    );
    expect(template({ items: [] })).toBe('Nenhum item encontrado.');
    expect(template({ items: ['a'] })).toBe('a');
  });
});

// ============================================================
// Ex8: Loops Objetos
// ============================================================
describe('Ex8: Loops Objetos', () => {
  it('iterates over object keys with @key and this', () => {
    const template = Handlebars.compile('{{#each obj}}{{@key}}={{this}} {{/each}}');
    expect(template({ obj: { a: 1, b: 2 } }).trim()).toBe('a=1 b=2');
  });

  it('iterates over a metrics object', () => {
    const template = Handlebars.compile('{{#each metricas}}{{@key}}: {{this}}\n{{/each}}');
    const result = template({
      metricas: { usuarios: 1250, receita: 45000 },
    });
    expect(result).toContain('usuarios: 1250');
    expect(result).toContain('receita: 45000');
  });

  it('uses a custom label helper with @key inside object iteration', () => {
    const hbs = Handlebars.create();
    hbs.registerHelper('labelFor8', function (key: string, options: Handlebars.HelperOptions) {
      const labels = options.data.root.labels as Record<string, string>;
      return labels[key] || key;
    });
    const template = hbs.compile('{{#each metricas}}{{labelFor8 @key}}: {{this}}\n{{/each}}');
    const result = template({
      metricas: { users: 100 },
      labels: { users: 'Usuarios Ativos' },
    });
    expect(result).toContain('Usuarios Ativos: 100');
  });
});

// ============================================================
// Ex9: Loops Aninhados
// ============================================================
describe('Ex9: Loops Aninhados', () => {
  const escola = {
    nome: 'AI Academy',
    turmas: [
      {
        nome: 'Turma A',
        professor: 'Prof. Ana',
        alunos: [
          { nome: 'Carlos', nota: 8.5 },
          { nome: 'Diana', nota: 9.2 },
        ],
      },
      {
        nome: 'Turma B',
        professor: 'Prof. Bruno',
        alunos: [{ nome: 'Fernanda', nota: 9.8 }],
      },
    ],
  };

  it('renders nested each loops', () => {
    const template = Handlebars.compile(
      '{{#each turmas}}{{nome}}: {{#each alunos}}{{nome}} {{/each}}{{/each}}'
    );
    const result = template(escola);
    expect(result).toContain('Turma A: Carlos Diana');
    expect(result).toContain('Turma B: Fernanda');
  });

  it('accesses parent context with ../', () => {
    const template = Handlebars.compile(
      '{{#each turmas}}{{#each alunos}}{{nome}} ({{../professor}}) {{/each}}{{/each}}'
    );
    const result = template(escola);
    expect(result).toContain('Carlos (Prof. Ana)');
    expect(result).toContain('Fernanda (Prof. Bruno)');
  });

  it('accesses grandparent context with ../../', () => {
    const template = Handlebars.compile(
      '{{#each turmas}}{{#each alunos}}{{nome}} - {{../../nome}} {{/each}}{{/each}}'
    );
    const result = template(escola);
    expect(result).toContain('Carlos - AI Academy');
    expect(result).toContain('Fernanda - AI Academy');
  });
});

// ============================================================
// Ex10: Each + If Combinados
// ============================================================
describe('Ex10: Each + If Combinados', () => {
  let hbs: typeof Handlebars;

  beforeEach(() => {
    hbs = Handlebars.create();
    hbs.registerHelper('gte10', (a: number, b: number) => a >= b);
    hbs.registerHelper('subtract10', (a: number, b: number) => a - b);
  });

  it('combines #each with #if using gte helper', () => {
    const template = hbs.compile(
      '{{#each vendedores}}{{#if (gte10 vendas meta)}}[BATEU] {{nome}}{{else}}[MISS] {{nome}}{{/if}} {{/each}}'
    );
    const result = template({
      vendedores: [
        { nome: 'Alice', vendas: 45, meta: 40 },
        { nome: 'Bob', vendas: 32, meta: 40 },
      ],
    });
    expect(result).toContain('[BATEU] Alice');
    expect(result).toContain('[MISS] Bob');
  });

  it('uses subtract helper to show remaining', () => {
    const template = hbs.compile(
      '{{#each vendedores}}{{#if (gte10 vendas meta)}}OK{{else}}Faltam {{subtract10 meta vendas}}{{/if}} {{/each}}'
    );
    const result = template({
      vendedores: [{ nome: 'Bob', vendas: 32, meta: 40 }],
    });
    expect(result).toContain('Faltam 8');
  });

  it('handles exact meta boundary correctly', () => {
    const template = hbs.compile(
      '{{#if (gte10 vendas meta)}}BATEU{{else}}NAO{{/if}}'
    );
    expect(template({ vendas: 40, meta: 40 })).toBe('BATEU');
    expect(template({ vendas: 39, meta: 40 })).toBe('NAO');
  });
});

// ============================================================
// Ex11: Helpers Simples
// ============================================================
describe('Ex11: Helpers Simples', () => {
  let hbs: typeof Handlebars;

  beforeEach(() => {
    hbs = Handlebars.create();
    hbs.registerHelper('uppercase11', (text: string) => String(text).toUpperCase());
    hbs.registerHelper('currency11', (value: number) => {
      const formatted = value.toFixed(2).replace('.', ',');
      return `R$ ${formatted}`;
    });
    hbs.registerHelper('truncate11', (text: string, limit: number) => {
      if (String(text).length <= limit) return text;
      return String(text).substring(0, limit) + '...';
    });
    hbs.registerHelper('formatDate11', (date: Date) => {
      const dia = String(date.getDate()).padStart(2, '0');
      const mes = String(date.getMonth() + 1).padStart(2, '0');
      const ano = date.getFullYear();
      return `${dia}/${mes}/${ano}`;
    });
    hbs.registerHelper('total11', (itens: Array<{ preco: number }>) => {
      return itens.reduce((sum, item) => sum + item.preco, 0);
    });
  });

  it('uppercase helper transforms text to uppercase', () => {
    const template = hbs.compile('{{uppercase11 nome}}');
    expect(template({ nome: 'joao pereira' })).toBe('JOAO PEREIRA');
  });

  it('currency helper formats BRL correctly', () => {
    const template = hbs.compile('{{currency11 preco}}');
    expect(template({ preco: 497.5 })).toBe('R$ 497,50');
    expect(template({ preco: 1200 })).toBe('R$ 1200,00');
  });

  it('truncate helper cuts long text and keeps short text intact', () => {
    const template = hbs.compile('{{truncate11 texto 10}}');
    expect(template({ texto: 'Este e um texto muito longo' })).toBe('Este e um ...');
    expect(template({ texto: 'Curto' })).toBe('Curto');
  });

  it('formatDate helper formats date as dd/mm/yyyy', () => {
    const template = hbs.compile('{{formatDate11 data}}');
    const result = template({ data: new Date(2026, 1, 15) }); // Feb 15 2026 local
    expect(result).toBe('15/02/2026');
  });

  it('total helper sums item prices', () => {
    const template = hbs.compile('{{total11 itens}}');
    const result = template({
      itens: [{ preco: 100 }, { preco: 200 }, { preco: 50 }],
    });
    expect(result).toBe('350');
  });
});

// ============================================================
// Ex12: Helpers Multi-Parametro
// ============================================================
describe('Ex12: Helpers Multi-Parametro', () => {
  let hbs: typeof Handlebars;

  beforeEach(() => {
    hbs = Handlebars.create();
    hbs.registerHelper('formatPreco12', (preco: number, moeda: string) => {
      switch (moeda) {
        case 'BRL': return `R$ ${preco.toFixed(2).replace('.', ',')}`;
        case 'USD': return `$ ${preco.toFixed(2)}`;
        default: return `${preco.toFixed(2)} ${moeda}`;
      }
    });
    hbs.registerHelper('badge12', (texto: string, options: Handlebars.HelperOptions) => {
      const { tipo, cor } = options.hash as { tipo?: string; cor?: string };
      switch (tipo) {
        case 'pill': return `[${cor || 'cinza'}: ${texto}]`;
        case 'tag': return `#${texto}`;
        default: return `(${texto})`;
      }
    });
  });

  it('formats price with multiple positional parameters', () => {
    const template = hbs.compile('{{formatPreco12 preco moeda}}');
    expect(template({ preco: 50, moeda: 'BRL' })).toBe('R$ 50,00');
    expect(template({ preco: 50, moeda: 'USD' })).toBe('$ 50.00');
  });

  it('uses hash arguments for badge helper', () => {
    const template = hbs.compile('{{badge12 nome tipo="pill" cor="azul"}}');
    expect(template({ nome: 'API Credits' })).toBe('[azul: API Credits]');
  });

  it('uses default values when hash arguments are missing', () => {
    const pill = hbs.compile('{{badge12 nome tipo="pill"}}');
    expect(pill({ nome: 'Test' })).toBe('[cinza: Test]');

    const defaultBadge = hbs.compile('{{badge12 nome}}');
    expect(defaultBadge({ nome: 'Test' })).toBe('(Test)');
  });
});

// ============================================================
// Ex13: Helpers de Comparacao
// ============================================================
describe('Ex13: Helpers de Comparacao', () => {
  let hbs: typeof Handlebars;

  beforeEach(() => {
    hbs = Handlebars.create();
    hbs.registerHelper('eq13', (a: unknown, b: unknown) => a === b);
    hbs.registerHelper('gt13', (a: number, b: number) => a > b);
    hbs.registerHelper('gte13', (a: number, b: number) => a >= b);
    hbs.registerHelper('lt13', (a: number, b: number) => a < b);
    hbs.registerHelper('lte13', (a: number, b: number) => a <= b);
    hbs.registerHelper('and13', (a: unknown, b: unknown) => a && b);
    hbs.registerHelper('or13', (a: unknown, b: unknown) => a || b);
    hbs.registerHelper('not13', (a: unknown) => !a);
  });

  it('eq helper compares values correctly', () => {
    const template = hbs.compile('{{#if (eq13 status "ativo")}}SIM{{else}}NAO{{/if}}');
    expect(template({ status: 'ativo' })).toBe('SIM');
    expect(template({ status: 'inativo' })).toBe('NAO');
  });

  it('numeric comparison helpers work correctly', () => {
    const gtTpl = hbs.compile('{{#if (gt13 nota 7)}}acima{{else}}abaixo{{/if}}');
    expect(gtTpl({ nota: 8 })).toBe('acima');
    expect(gtTpl({ nota: 7 })).toBe('abaixo');

    const gteTpl = hbs.compile('{{#if (gte13 nota 7)}}aprovado{{else}}reprovado{{/if}}');
    expect(gteTpl({ nota: 7 })).toBe('aprovado');
    expect(gteTpl({ nota: 6.9 })).toBe('reprovado');

    const ltTpl = hbs.compile('{{#if (lt13 nota 5)}}critico{{else}}ok{{/if}}');
    expect(ltTpl({ nota: 4 })).toBe('critico');
    expect(ltTpl({ nota: 5 })).toBe('ok');

    const lteTpl = hbs.compile('{{#if (lte13 nota 5)}}baixo{{else}}ok{{/if}}');
    expect(lteTpl({ nota: 5 })).toBe('baixo');
    expect(lteTpl({ nota: 6 })).toBe('ok');
  });

  it('logical helpers (and, or, not) compose conditions', () => {
    const andTpl = hbs.compile('{{#if (and13 ativo premium)}}VIP{{else}}normal{{/if}}');
    expect(andTpl({ ativo: true, premium: true })).toBe('VIP');
    expect(andTpl({ ativo: true, premium: false })).toBe('normal');

    const orTpl = hbs.compile('{{#if (or13 admin moderador)}}pode{{else}}nao{{/if}}');
    expect(orTpl({ admin: false, moderador: true })).toBe('pode');
    expect(orTpl({ admin: false, moderador: false })).toBe('nao');

    const notTpl = hbs.compile('{{#if (not13 bloqueado)}}livre{{else}}bloqueado{{/if}}');
    expect(notTpl({ bloqueado: false })).toBe('livre');
    expect(notTpl({ bloqueado: true })).toBe('bloqueado');
  });
});

// ============================================================
// Ex14: Block Helpers
// ============================================================
describe('Ex14: Block Helpers', () => {
  let hbs: typeof Handlebars;

  beforeEach(() => {
    hbs = Handlebars.create();

    // Block helper #autorizado14
    hbs.registerHelper('autorizado14', function (
      this: unknown,
      usuario: { papel: string },
      options: Handlebars.HelperOptions,
    ) {
      const papelExigido = options.hash.papel as string;
      if (usuario && usuario.papel === papelExigido) {
        return options.fn(this);
      }
      return options.inverse(this);
    });

    // Block helper #repetir14
    hbs.registerHelper('repetir14', function (
      this: unknown,
      n: number,
      options: Handlebars.HelperOptions,
    ) {
      let resultado = '';
      for (let i = 0; i < n; i++) {
        const data = Handlebars.createFrame(options.data);
        data.index = i;
        resultado += options.fn(this, { data });
      }
      return resultado;
    });

    // Block helper #filtrarPor14
    hbs.registerHelper('filtrarPor14', function (
      this: unknown,
      itens: Record<string, unknown>[],
      propriedade: string,
      valor: unknown,
      options: Handlebars.HelperOptions,
    ) {
      const filtrados = itens.filter((item) => item[propriedade] === valor);
      if (filtrados.length > 0) {
        return filtrados.map((item) => options.fn(item)).join('');
      }
      return options.inverse(this);
    });
  });

  it('autorizado block helper renders fn for matching role', () => {
    const template = hbs.compile(
      '{{#autorizado14 usuario papel="admin"}}Admin Panel{{else}}Access Denied{{/autorizado14}}'
    );
    expect(template({ usuario: { papel: 'admin' } })).toBe('Admin Panel');
    expect(template({ usuario: { papel: 'viewer' } })).toBe('Access Denied');
  });

  it('repetir block helper iterates n times with @index', () => {
    const template = hbs.compile('{{#repetir14 3}}[{{@index}}]{{/repetir14}}');
    expect(template({})).toBe('[0][1][2]');
  });

  it('filtrarPor block helper filters items and uses inverse for empty', () => {
    const template = hbs.compile(
      '{{#filtrarPor14 itens "disponivel" true}}{{nome}} {{else}}Nenhum{{/filtrarPor14}}'
    );
    const withAvailable = {
      itens: [
        { nome: 'A', disponivel: true },
        { nome: 'B', disponivel: false },
        { nome: 'C', disponivel: true },
      ],
    };
    expect(template(withAvailable)).toBe('A C ');

    const noneAvailable = {
      itens: [{ nome: 'X', disponivel: false }],
    };
    expect(template(noneAvailable)).toBe('Nenhum');
  });
});

// ============================================================
// Ex15: Composicao de Helpers (Subexpressions)
// ============================================================
describe('Ex15: Composicao de Helpers', () => {
  let hbs: typeof Handlebars;

  beforeEach(() => {
    hbs = Handlebars.create();
    hbs.registerHelper('uppercase15', (texto: string) => String(texto).toUpperCase());
    hbs.registerHelper('currency15', (valor: number) => {
      return `R$ ${Number(valor).toFixed(2).replace('.', ',')}`;
    });
    hbs.registerHelper('eq15', (a: unknown, b: unknown) => a === b);
    hbs.registerHelper('calcularTotal15', (lista: Array<{ valor: number; tipo: string }>) => {
      return lista.reduce((total, item) => {
        return item.tipo === 'receita' ? total + item.valor : total - item.valor;
      }, 0);
    });
  });

  it('uses subexpressions to compose helpers', () => {
    const template = hbs.compile('Saldo: {{currency15 (calcularTotal15 transacoes)}}');
    const result = template({
      transacoes: [
        { valor: 500, tipo: 'receita' },
        { valor: 100, tipo: 'despesa' },
      ],
    });
    expect(result).toBe('Saldo: R$ 400,00');
  });

  it('combines eq subexpression with if for branching', () => {
    const template = hbs.compile(
      '{{#if (eq15 tipo "receita")}}+{{currency15 valor}}{{else}}-{{currency15 valor}}{{/if}}'
    );
    expect(template({ tipo: 'receita', valor: 100 })).toBe('+R$ 100,00');
    expect(template({ tipo: 'despesa', valor: 50 })).toBe('-R$ 50,00');
  });

  it('chains uppercase and currency in template', () => {
    const template = hbs.compile('{{uppercase15 descricao}} | {{currency15 valor}}');
    const result = template({ descricao: 'venda curso', valor: 497.5 });
    expect(result).toBe('VENDA CURSO | R$ 497,50');
  });
});

// ============================================================
// Ex16: Partials
// ============================================================
describe('Ex16: Partials', () => {
  let hbs: typeof Handlebars;

  beforeEach(() => {
    hbs = Handlebars.create();
  });

  it('registers and uses a simple partial', () => {
    hbs.registerPartial('cabecalho16', '=== {{titulo}} ===');
    const template = hbs.compile('{{> cabecalho16}}');
    expect(template({ titulo: 'Dashboard' })).toBe('=== Dashboard ===');
  });

  it('renders a partial with specific context', () => {
    hbs.registerPartial('userCard16', '[{{avatar}}] {{nome}} ({{papel}})');
    const template = hbs.compile('{{> userCard16 usuario}}');
    const result = template({
      usuario: { nome: 'Maria', avatar: 'M', papel: 'admin' },
    });
    expect(result).toBe('[M] Maria (admin)');
  });

  it('renders dynamic partials using lookup', () => {
    hbs.registerPartial('viewAdmin16', 'Admin Panel: {{metricas.modelos}} modelos');
    hbs.registerPartial('viewUser16', 'User View: Bem-vindo!');
    const template = hbs.compile('{{> (lookup . "tipoParcial")}}');
    expect(template({ tipoParcial: 'viewAdmin16', metricas: { modelos: 12 } }))
      .toBe('Admin Panel: 12 modelos');
    expect(template({ tipoParcial: 'viewUser16' }))
      .toBe('User View: Bem-vindo!');
  });

  it('passes hash arguments to partials', () => {
    hbs.registerPartial('metrica16', '[ {{label}} ]: {{valor}}');
    const template = hbs.compile('{{> metrica16 label="Modelos" valor=metricas.total}}');
    expect(template({ metricas: { total: 42 } })).toBe('[ Modelos ]: 42');
  });
});

// ============================================================
// Ex17: Template Registry
// ============================================================
describe('Ex17: Template Registry', () => {
  // Inline TemplateRegistry class for testing (mirrors the solution pattern)
  class TemplateRegistry {
    private templates = new Map<
      string,
      { config: { nome: string; template: string; descricao: string }; compilado: Handlebars.TemplateDelegate }
    >();
    private handlebars: typeof Handlebars;

    constructor() {
      this.handlebars = Handlebars.create();
    }

    register(config: { nome: string; template: string; descricao: string }): void {
      const compilado = this.handlebars.compile(config.template);
      this.templates.set(config.nome, { config, compilado });
    }

    render(nome: string, dados: Record<string, unknown>): string {
      const entry = this.templates.get(nome);
      if (!entry) {
        throw new Error(`Template "${nome}" nao encontrado. Disponiveis: ${this.list().join(', ')}`);
      }
      return entry.compilado(dados);
    }

    list(): string[] {
      return Array.from(this.templates.keys());
    }

    has(nome: string): boolean {
      return this.templates.has(nome);
    }

    registerHelper(name: string, fn: Handlebars.HelperDelegate): void {
      this.handlebars.registerHelper(name, fn);
    }
  }

  it('registers templates and checks with has/list', () => {
    const registry = new TemplateRegistry();
    registry.register({ nome: 'email', template: 'Ola {{nome}}!', descricao: 'Email' });
    registry.register({ nome: 'alert', template: 'Alerta: {{msg}}', descricao: 'Alert' });

    expect(registry.has('email')).toBe(true);
    expect(registry.has('inexistente')).toBe(false);
    expect(registry.list()).toEqual(['email', 'alert']);
  });

  it('renders a registered template with data', () => {
    const registry = new TemplateRegistry();
    registry.register({
      nome: 'boas-vindas',
      template: 'Ola {{nome}}! Plano: {{plano}}.',
      descricao: 'Welcome email',
    });

    const result = registry.render('boas-vindas', { nome: 'Ana', plano: 'Premium' });
    expect(result).toBe('Ola Ana! Plano: Premium.');
  });

  it('throws error for non-existent template', () => {
    const registry = new TemplateRegistry();
    expect(() => registry.render('nao-existe', {})).toThrow('Template "nao-existe" nao encontrado');
  });

  it('supports isolated helpers via registerHelper', () => {
    const registry = new TemplateRegistry();
    registry.registerHelper('shout', (text: string) => String(text).toUpperCase());
    registry.register({
      nome: 'grito',
      template: '{{shout nome}}!',
      descricao: 'Shout template',
    });
    expect(registry.render('grito', { nome: 'hello' })).toBe('HELLO!');
  });
});

// ============================================================
// Ex18: Template Inheritance
// ============================================================
describe('Ex18: Template Inheritance', () => {
  let hbs: typeof Handlebars;

  beforeEach(() => {
    hbs = Handlebars.create();
    hbs.registerPartial(
      'layout18',
      '<html><head><title>{{titulo}}</title></head><body><header>{{titulo}}</header><main>{{> @partial-block}}</main><footer>(c) {{footer.ano}}</footer></body></html>'
    );
  });

  it('renders a layout with @partial-block', () => {
    const template = hbs.compile('{{#> layout18}}<p>Conteudo aqui</p>{{/layout18}}');
    const result = template({ titulo: 'Home', footer: { ano: 2026 } });
    expect(result).toContain('<title>Home</title>');
    expect(result).toContain('<header>Home</header>');
    expect(result).toContain('<main><p>Conteudo aqui</p></main>');
    expect(result).toContain('<footer>(c) 2026</footer>');
  });

  it('different pages use the same layout with different content', () => {
    const templateHome = hbs.compile('{{#> layout18}}<h1>Home Page</h1>{{/layout18}}');
    const templateCurso = hbs.compile('{{#> layout18}}<h2>Modulo 1</h2>{{/layout18}}');

    const home = templateHome({ titulo: 'Home', footer: { ano: 2026 } });
    const curso = templateCurso({ titulo: 'Curso', footer: { ano: 2026 } });

    expect(home).toContain('<header>Home</header>');
    expect(home).toContain('<h1>Home Page</h1>');

    expect(curso).toContain('<header>Curso</header>');
    expect(curso).toContain('<h2>Modulo 1</h2>');
  });

  it('composes content partials within a layout', () => {
    hbs.registerPartial('hero18', '<section class="hero">{{texto}}</section>');
    hbs.registerHelper('renderBloco18', function (bloco: { tipo: string; texto?: string }) {
      const partial = hbs.partials[bloco.tipo + '18'];
      if (partial) {
        const tpl = typeof partial === 'string' ? hbs.compile(partial) : partial;
        return new Handlebars.SafeString(tpl(bloco));
      }
      return '';
    });

    const template = hbs.compile(
      '{{#> layout18}}{{#each conteudo}}{{{renderBloco18 this}}}{{/each}}{{/layout18}}'
    );
    const result = template({
      titulo: 'Test',
      footer: { ano: 2026 },
      conteudo: [{ tipo: 'hero', texto: 'Domine AI' }],
    });
    expect(result).toContain('<section class="hero">Domine AI</section>');
  });
});

// ============================================================
// Ex19: Seguranca (Zod + Sanitizacao)
// ============================================================
describe('Ex19: Seguranca', () => {
  const perfilSchema = z.object({
    nome: z.string().min(2).max(100),
    email: z.string().email(),
    bio: z.string().max(500),
    website: z.string().url().startsWith('https://'),
  });

  function renderSeguro<T>(
    schema: z.ZodSchema<T>,
    templateStr: string,
    dados: unknown,
  ): { sucesso: boolean; resultado?: string; erros?: string[] } {
    const validacao = schema.safeParse(dados);
    if (!validacao.success) {
      const erros = validacao.error.issues.map(
        (issue) => `[${issue.path.join('.')}] ${issue.message}`
      );
      return { sucesso: false, erros };
    }
    const template = Handlebars.compile(templateStr);
    const resultado = template(validacao.data);
    return { sucesso: true, resultado };
  }

  it('validates and renders with valid data', () => {
    const result = renderSeguro(perfilSchema, 'Nome: {{nome}} | Email: {{email}}', {
      nome: 'Maria Silva',
      email: 'maria@exemplo.com',
      bio: 'Desenvolvedora AI',
      website: 'https://maria.dev',
    });
    expect(result.sucesso).toBe(true);
    expect(result.resultado).toBe('Nome: Maria Silva | Email: maria@exemplo.com');
  });

  it('rejects invalid data and returns errors', () => {
    const result = renderSeguro(perfilSchema, 'Nome: {{nome}}', {
      nome: 'X', // too short (min 2)
      email: 'invalido',
      bio: 'ok',
      website: 'http://insecure.com',
    });
    expect(result.sucesso).toBe(false);
    expect(result.erros).toBeDefined();
    expect(result.erros!.length).toBeGreaterThan(0);
  });

  it('sanitize helper removes HTML tags', () => {
    const hbs = Handlebars.create();
    hbs.registerHelper('sanitizar19', (texto: unknown) => {
      if (typeof texto === 'string') {
        return texto.replace(/<[^>]*>/g, '');
      }
      return texto;
    });

    const template = hbs.compile('{{sanitizar19 bio}}');
    const result = template({ bio: '<img src=x onerror=alert("hack")>Texto normal' });
    expect(result).toBe('Texto normal');
    expect(result).not.toContain('<img');
  });

  it('safe template pattern composes validation + rendering', () => {
    function criarTemplateSafe<T>(config: {
      schema: z.ZodSchema<T>;
      template: string;
    }): (dados: unknown) => { sucesso: boolean; resultado?: string; erros?: string[] } {
      return (dados: unknown) => renderSeguro(config.schema, config.template, dados);
    }

    const renderPerfil = criarTemplateSafe({
      schema: perfilSchema,
      template: '{{nome}} <{{email}}>',
    });

    const valid = renderPerfil({
      nome: 'Ana',
      email: 'ana@test.com',
      bio: 'Dev',
      website: 'https://ana.dev',
    });
    expect(valid.sucesso).toBe(true);
    expect(valid.resultado).toContain('Ana');

    const invalid = renderPerfil({ nome: 'A' });
    expect(invalid.sucesso).toBe(false);
  });
});

// ============================================================
// Ex20: Prompt AI
// ============================================================
describe('Ex20: Prompt AI', () => {
  let hbs: typeof Handlebars;

  beforeEach(() => {
    hbs = Handlebars.create();
    hbs.registerHelper('eq20', (a: string, b: string) => a === b);
  });

  it('builds a system prompt with variables', () => {
    const systemTemplate = hbs.compile(
      'Voce e um assistente da {{empresa}}. Responda em {{idioma}} com tom {{tomDeVoz}}.'
    );
    const result = systemTemplate({
      empresa: 'TechStore',
      idioma: 'portugues',
      tomDeVoz: 'profissional',
    });
    expect(result).toContain('TechStore');
    expect(result).toContain('portugues');
    expect(result).toContain('profissional');
  });

  it('builds a user prompt with few-shot examples', () => {
    const template = hbs.compile(
      '{{#each faq}}P: {{this.pergunta}}\nR: {{this.resposta}}\n{{/each}}Pergunta: {{pergunta}}'
    );
    const result = template({
      faq: [
        { pergunta: 'Como sincronizar?', resposta: 'Abra o app > Bluetooth' },
      ],
      pergunta: 'Meu relogio nao sincroniza',
    });
    expect(result).toContain('P: Como sincronizar?');
    expect(result).toContain('R: Abra o app &gt; Bluetooth');
    expect(result).toContain('Pergunta: Meu relogio nao sincroniza');
  });

  it('adapts prompt based on user plan (premium vs basico)', () => {
    const template = hbs.compile(
      '{{#if (eq20 cliente.plano "premium")}}NOTA: Cliente premium. Priorize.{{else}}NOTA: Cliente basico. Sugira upgrade.{{/if}}'
    );
    expect(template({ cliente: { plano: 'premium' } })).toBe(
      'NOTA: Cliente premium. Priorize.'
    );
    expect(template({ cliente: { plano: 'basico' } })).toBe(
      'NOTA: Cliente basico. Sugira upgrade.'
    );
  });

  it('builds complete prompt with system + user parts', () => {
    const systemTpl = 'Voce e assistente da {{empresa}}.';
    const userTpl = 'Cliente: {{cliente.nome}} ({{cliente.plano}})\nPergunta: {{pergunta}}';

    function buildPrompt(ctx: Record<string, unknown>) {
      return {
        system: hbs.compile(systemTpl)(ctx),
        user: hbs.compile(userTpl)(ctx),
      };
    }

    const prompt = buildPrompt({
      empresa: 'TechStore',
      cliente: { nome: 'Pedro', plano: 'premium' },
      pergunta: 'Como resetar?',
    });

    expect(prompt.system).toBe('Voce e assistente da TechStore.');
    expect(prompt.user).toContain('Pedro');
    expect(prompt.user).toContain('premium');
    expect(prompt.user).toContain('Como resetar?');
  });
});
