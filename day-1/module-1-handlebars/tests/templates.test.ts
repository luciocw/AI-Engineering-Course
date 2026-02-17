/**
 * Complete Tests for Module 1: Handlebars
 *
 * Covers all 20 exercises with ~3 tests per exercise.
 * Run: npm test
 */

import { describe, it, expect, beforeEach } from 'vitest';
import Handlebars from 'handlebars';
import { z } from 'zod';

// ============================================================
// Ex1: Hello Template
// ============================================================
describe('Ex1: Hello Template', () => {
  it('compiles and executes a simple template', () => {
    const template = Handlebars.compile('Hello, {{name}}!');
    const result = template({ name: 'World' });
    expect(result).toBe('Hello, World!');
  });

  it('reuses a compiled template with different data', () => {
    const template = Handlebars.compile('Hello, {{name}}!');
    expect(template({ name: 'TypeScript' })).toBe('Hello, TypeScript!');
    expect(template({ name: 'AI Engineering' })).toBe('Hello, AI Engineering!');
  });

  it('renders multiple variables in a single template', () => {
    const template = Handlebars.compile("I'm learning {{framework}} with {{language}}!");
    const result = template({ language: 'TypeScript', framework: 'Handlebars' });
    expect(result).toBe("I'm learning Handlebars with TypeScript!");
  });

  it('renders empty string for missing variables', () => {
    const template = Handlebars.compile('Hello, {{name}}!');
    expect(template({})).toBe('Hello, !');
  });
});

// ============================================================
// Ex2: Email Template
// ============================================================
describe('Ex2: Email Template', () => {
  it('renders a multi-variable email template', () => {
    const template = Handlebars.compile(
      'Hello {{name}}!\nThank you for purchasing {{product}}.\nAmount: ${{price}}.\nWe will send details to {{email}}.'
    );
    const result = template({
      name: 'Maria Silva',
      email: 'maria@example.com',
      product: 'AI Engineering Course',
      price: 497,
    });
    expect(result).toContain('Maria Silva');
    expect(result).toContain('AI Engineering Course');
    expect(result).toContain('$497');
    expect(result).toContain('maria@example.com');
  });

  it('handles missing variables gracefully in email', () => {
    const template = Handlebars.compile('Hello {{name}}! Product: {{product}}.');
    const result = template({ name: 'Ana' });
    expect(result).toBe('Hello Ana! Product: .');
  });

  it('renders a reminder template reusing the same data', () => {
    const template = Handlebars.compile('{{name}}, your access to {{product}} expires in 7 days!');
    const result = template({ name: 'Maria', product: 'AI Course' });
    expect(result).toBe('Maria, your access to AI Course expires in 7 days!');
  });
});

// ============================================================
// Ex3: Nested Properties
// ============================================================
describe('Ex3: Nested Properties', () => {
  const company = {
    name: 'AI Solutions',
    address: { street: 'Av. Paulista, 1000', city: 'Sao Paulo', state: 'SP' },
    contact: { email: 'contact@ai.com', phone: '(11) 99999-0000' },
    ceo: { name: 'Carlos Mendes', role: 'CEO & Founder' },
  };

  it('accesses nested properties with dot-notation', () => {
    const template = Handlebars.compile('{{address.city}} - {{address.state}}');
    expect(template(company)).toBe('Sao Paulo - SP');
  });

  it('accesses deeply nested properties across different branches', () => {
    const template = Handlebars.compile('{{ceo.name}} | {{contact.email}} | {{name}}');
    expect(template(company)).toBe('Carlos Mendes | contact@ai.com | AI Solutions');
  });

  it('returns empty string for missing nested properties without error', () => {
    const template = Handlebars.compile('ZIP: {{address.zip}} | Revenue: {{financial.revenue}}');
    expect(template(company)).toBe('ZIP:  | Revenue: ');
  });
});

// ============================================================
// Ex4: HTML Escaping
// ============================================================
describe('Ex4: HTML Escaping', () => {
  it('escapes HTML by default with double braces', () => {
    const template = Handlebars.compile('{{content}}');
    const result = template({ content: '<strong>Bold</strong>' });
    expect(result).toBe('&lt;strong&gt;Bold&lt;/strong&gt;');
    expect(result).not.toContain('<strong>');
  });

  it('renders raw HTML with triple braces', () => {
    const template = Handlebars.compile('{{{content}}}');
    const result = template({ content: '<strong>Bold</strong>' });
    expect(result).toBe('<strong>Bold</strong>');
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
// Ex5: Conditionals
// ============================================================
describe('Ex5: Conditionals', () => {
  it('renders if block when value is truthy', () => {
    const template = Handlebars.compile('{{#if active}}Active{{else}}Inactive{{/if}}');
    expect(template({ active: true })).toBe('Active');
    expect(template({ active: false })).toBe('Inactive');
  });

  it('treats empty string as falsy in #if', () => {
    const template = Handlebars.compile('{{#if plan}}{{plan}}{{else}}No plan{{/if}}');
    expect(template({ plan: '' })).toBe('No plan');
    expect(template({ plan: 'premium' })).toBe('premium');
  });

  it('renders unless block when value is falsy', () => {
    const template = Handlebars.compile(
      '{{#unless credits}}No credits{{else}}Credits: {{credits}}{{/unless}}'
    );
    expect(template({ credits: 0 })).toBe('No credits');
    expect(template({ credits: 10 })).toBe('Credits: 10');
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
// Ex6: Nested Conditionals
// ============================================================
describe('Ex6: Nested Conditionals', () => {
  let hbs: typeof Handlebars;

  beforeEach(() => {
    hbs = Handlebars.create();
    hbs.registerHelper('eq6', (a: unknown, b: unknown) => a === b);
  });

  it('uses eq helper for string comparison in conditionals', () => {
    const template = hbs.compile(
      '{{#if (eq6 status "delivered")}}Delivered{{else}}Other{{/if}}'
    );
    expect(template({ status: 'delivered' })).toBe('Delivered');
    expect(template({ status: 'shipped' })).toBe('Other');
  });

  it('handles nested if/else if branches', () => {
    const template = hbs.compile(
      '{{#if (eq6 status "delivered")}}Delivered{{else if (eq6 status "shipped")}}Shipped{{else if (eq6 status "cancelled")}}Cancelled{{else}}Processing{{/if}}'
    );
    expect(template({ status: 'delivered' })).toBe('Delivered');
    expect(template({ status: 'shipped' })).toBe('Shipped');
    expect(template({ status: 'cancelled' })).toBe('Cancelled');
    expect(template({ status: 'processing' })).toBe('Processing');
  });

  it('combines nested conditionals with #unless', () => {
    const template = hbs.compile(
      '{{#if (eq6 status "processing")}}{{#unless paid}}Awaiting payment{{else}}Processing{{/unless}}{{/if}}'
    );
    expect(template({ status: 'processing', paid: false })).toBe('Awaiting payment');
    expect(template({ status: 'processing', paid: true })).toBe('Processing');
    expect(template({ status: 'other' })).toBe('');
  });
});

// ============================================================
// Ex7: Basic Loops
// ============================================================
describe('Ex7: Basic Loops', () => {
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
      '{{#each items}}{{this}}{{else}}No items found.{{/each}}'
    );
    expect(template({ items: [] })).toBe('No items found.');
    expect(template({ items: ['a'] })).toBe('a');
  });
});

// ============================================================
// Ex8: Object Loops
// ============================================================
describe('Ex8: Object Loops', () => {
  it('iterates over object keys with @key and this', () => {
    const template = Handlebars.compile('{{#each obj}}{{@key}}={{this}} {{/each}}');
    expect(template({ obj: { a: 1, b: 2 } }).trim()).toBe('a=1 b=2');
  });

  it('iterates over a metrics object', () => {
    const template = Handlebars.compile('{{#each metrics}}{{@key}}: {{this}}\n{{/each}}');
    const result = template({
      metrics: { users: 1250, revenue: 45000 },
    });
    expect(result).toContain('users: 1250');
    expect(result).toContain('revenue: 45000');
  });

  it('uses a custom label helper with @key inside object iteration', () => {
    const hbs = Handlebars.create();
    hbs.registerHelper('labelFor8', function (key: string, options: Handlebars.HelperOptions) {
      const labels = options.data.root.labels as Record<string, string>;
      return labels[key] || key;
    });
    const template = hbs.compile('{{#each metrics}}{{labelFor8 @key}}: {{this}}\n{{/each}}');
    const result = template({
      metrics: { users: 100 },
      labels: { users: 'Active Users' },
    });
    expect(result).toContain('Active Users: 100');
  });
});

// ============================================================
// Ex9: Nested Loops
// ============================================================
describe('Ex9: Nested Loops', () => {
  const school = {
    name: 'AI Academy',
    classes: [
      {
        name: 'Class A',
        teacher: 'Prof. Ana',
        students: [
          { name: 'Carlos', grade: 8.5 },
          { name: 'Diana', grade: 9.2 },
        ],
      },
      {
        name: 'Class B',
        teacher: 'Prof. Bruno',
        students: [{ name: 'Fernanda', grade: 9.8 }],
      },
    ],
  };

  it('renders nested each loops', () => {
    const template = Handlebars.compile(
      '{{#each classes}}{{name}}: {{#each students}}{{name}} {{/each}}{{/each}}'
    );
    const result = template(school);
    expect(result).toContain('Class A: Carlos Diana');
    expect(result).toContain('Class B: Fernanda');
  });

  it('accesses parent context with ../', () => {
    const template = Handlebars.compile(
      '{{#each classes}}{{#each students}}{{name}} ({{../teacher}}) {{/each}}{{/each}}'
    );
    const result = template(school);
    expect(result).toContain('Carlos (Prof. Ana)');
    expect(result).toContain('Fernanda (Prof. Bruno)');
  });

  it('accesses grandparent context with ../../', () => {
    const template = Handlebars.compile(
      '{{#each classes}}{{#each students}}{{name}} - {{../../name}} {{/each}}{{/each}}'
    );
    const result = template(school);
    expect(result).toContain('Carlos - AI Academy');
    expect(result).toContain('Fernanda - AI Academy');
  });
});

// ============================================================
// Ex10: Each + If Combined
// ============================================================
describe('Ex10: Each + If Combined', () => {
  let hbs: typeof Handlebars;

  beforeEach(() => {
    hbs = Handlebars.create();
    hbs.registerHelper('gte10', (a: number, b: number) => a >= b);
    hbs.registerHelper('subtract10', (a: number, b: number) => a - b);
  });

  it('combines #each with #if using gte helper', () => {
    const template = hbs.compile(
      '{{#each sellers}}{{#if (gte10 sales target)}}[HIT] {{name}}{{else}}[MISS] {{name}}{{/if}} {{/each}}'
    );
    const result = template({
      sellers: [
        { name: 'Alice', sales: 45, target: 40 },
        { name: 'Bob', sales: 32, target: 40 },
      ],
    });
    expect(result).toContain('[HIT] Alice');
    expect(result).toContain('[MISS] Bob');
  });

  it('uses subtract helper to show remaining', () => {
    const template = hbs.compile(
      '{{#each sellers}}{{#if (gte10 sales target)}}OK{{else}}Remaining {{subtract10 target sales}}{{/if}} {{/each}}'
    );
    const result = template({
      sellers: [{ name: 'Bob', sales: 32, target: 40 }],
    });
    expect(result).toContain('Remaining 8');
  });

  it('handles exact target boundary correctly', () => {
    const template = hbs.compile(
      '{{#if (gte10 sales target)}}HIT{{else}}NO{{/if}}'
    );
    expect(template({ sales: 40, target: 40 })).toBe('HIT');
    expect(template({ sales: 39, target: 40 })).toBe('NO');
  });
});

// ============================================================
// Ex11: Simple Helpers
// ============================================================
describe('Ex11: Simple Helpers', () => {
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
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const year = date.getFullYear();
      return `${day}/${month}/${year}`;
    });
    hbs.registerHelper('total11', (items: Array<{ price: number }>) => {
      return items.reduce((sum, item) => sum + item.price, 0);
    });
  });

  it('uppercase helper transforms text to uppercase', () => {
    const template = hbs.compile('{{uppercase11 name}}');
    expect(template({ name: 'joao pereira' })).toBe('JOAO PEREIRA');
  });

  it('currency helper formats BRL correctly', () => {
    const template = hbs.compile('{{currency11 price}}');
    expect(template({ price: 497.5 })).toBe('R$ 497,50');
    expect(template({ price: 1200 })).toBe('R$ 1200,00');
  });

  it('truncate helper cuts long text and keeps short text intact', () => {
    const template = hbs.compile('{{truncate11 text 10}}');
    expect(template({ text: 'This is a very long text' })).toBe('This is a ...');
    expect(template({ text: 'Short' })).toBe('Short');
  });

  it('formatDate helper formats date as dd/mm/yyyy', () => {
    const template = hbs.compile('{{formatDate11 date}}');
    const result = template({ date: new Date(2026, 1, 15) }); // Feb 15 2026 local
    expect(result).toBe('15/02/2026');
  });

  it('total helper sums item prices', () => {
    const template = hbs.compile('{{total11 items}}');
    const result = template({
      items: [{ price: 100 }, { price: 200 }, { price: 50 }],
    });
    expect(result).toBe('350');
  });
});

// ============================================================
// Ex12: Multi-Parameter Helpers
// ============================================================
describe('Ex12: Multi-Parameter Helpers', () => {
  let hbs: typeof Handlebars;

  beforeEach(() => {
    hbs = Handlebars.create();
    hbs.registerHelper('formatPrice12', (price: number, currency: string) => {
      switch (currency) {
        case 'BRL': return `R$ ${price.toFixed(2).replace('.', ',')}`;
        case 'USD': return `$ ${price.toFixed(2)}`;
        default: return `${price.toFixed(2)} ${currency}`;
      }
    });
    hbs.registerHelper('badge12', (text: string, options: Handlebars.HelperOptions) => {
      const { type, color } = options.hash as { type?: string; color?: string };
      switch (type) {
        case 'pill': return `[${color || 'gray'}: ${text}]`;
        case 'tag': return `#${text}`;
        default: return `(${text})`;
      }
    });
  });

  it('formats price with multiple positional parameters', () => {
    const template = hbs.compile('{{formatPrice12 price currency}}');
    expect(template({ price: 50, currency: 'BRL' })).toBe('R$ 50,00');
    expect(template({ price: 50, currency: 'USD' })).toBe('$ 50.00');
  });

  it('uses hash arguments for badge helper', () => {
    const template = hbs.compile('{{badge12 name type="pill" color="blue"}}');
    expect(template({ name: 'API Credits' })).toBe('[blue: API Credits]');
  });

  it('uses default values when hash arguments are missing', () => {
    const pill = hbs.compile('{{badge12 name type="pill"}}');
    expect(pill({ name: 'Test' })).toBe('[gray: Test]');

    const defaultBadge = hbs.compile('{{badge12 name}}');
    expect(defaultBadge({ name: 'Test' })).toBe('(Test)');
  });
});

// ============================================================
// Ex13: Comparison Helpers
// ============================================================
describe('Ex13: Comparison Helpers', () => {
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
    const template = hbs.compile('{{#if (eq13 status "active")}}YES{{else}}NO{{/if}}');
    expect(template({ status: 'active' })).toBe('YES');
    expect(template({ status: 'inactive' })).toBe('NO');
  });

  it('numeric comparison helpers work correctly', () => {
    const gtTpl = hbs.compile('{{#if (gt13 grade 7)}}above{{else}}below{{/if}}');
    expect(gtTpl({ grade: 8 })).toBe('above');
    expect(gtTpl({ grade: 7 })).toBe('below');

    const gteTpl = hbs.compile('{{#if (gte13 grade 7)}}passed{{else}}failed{{/if}}');
    expect(gteTpl({ grade: 7 })).toBe('passed');
    expect(gteTpl({ grade: 6.9 })).toBe('failed');

    const ltTpl = hbs.compile('{{#if (lt13 grade 5)}}critical{{else}}ok{{/if}}');
    expect(ltTpl({ grade: 4 })).toBe('critical');
    expect(ltTpl({ grade: 5 })).toBe('ok');

    const lteTpl = hbs.compile('{{#if (lte13 grade 5)}}low{{else}}ok{{/if}}');
    expect(lteTpl({ grade: 5 })).toBe('low');
    expect(lteTpl({ grade: 6 })).toBe('ok');
  });

  it('logical helpers (and, or, not) compose conditions', () => {
    const andTpl = hbs.compile('{{#if (and13 active premium)}}VIP{{else}}normal{{/if}}');
    expect(andTpl({ active: true, premium: true })).toBe('VIP');
    expect(andTpl({ active: true, premium: false })).toBe('normal');

    const orTpl = hbs.compile('{{#if (or13 admin moderator)}}allowed{{else}}denied{{/if}}');
    expect(orTpl({ admin: false, moderator: true })).toBe('allowed');
    expect(orTpl({ admin: false, moderator: false })).toBe('denied');

    const notTpl = hbs.compile('{{#if (not13 blocked)}}free{{else}}blocked{{/if}}');
    expect(notTpl({ blocked: false })).toBe('free');
    expect(notTpl({ blocked: true })).toBe('blocked');
  });
});

// ============================================================
// Ex14: Block Helpers
// ============================================================
describe('Ex14: Block Helpers', () => {
  let hbs: typeof Handlebars;

  beforeEach(() => {
    hbs = Handlebars.create();

    // Block helper #authorized14
    hbs.registerHelper('authorized14', function (
      this: unknown,
      user: { role: string },
      options: Handlebars.HelperOptions,
    ) {
      const requiredRole = options.hash.role as string;
      if (user && user.role === requiredRole) {
        return options.fn(this);
      }
      return options.inverse(this);
    });

    // Block helper #repeat14
    hbs.registerHelper('repeat14', function (
      this: unknown,
      n: number,
      options: Handlebars.HelperOptions,
    ) {
      let result = '';
      for (let i = 0; i < n; i++) {
        const data = Handlebars.createFrame(options.data);
        data.index = i;
        result += options.fn(this, { data });
      }
      return result;
    });

    // Block helper #filterBy14
    hbs.registerHelper('filterBy14', function (
      this: unknown,
      items: Record<string, unknown>[],
      property: string,
      value: unknown,
      options: Handlebars.HelperOptions,
    ) {
      const filtered = items.filter((item) => item[property] === value);
      if (filtered.length > 0) {
        return filtered.map((item) => options.fn(item)).join('');
      }
      return options.inverse(this);
    });
  });

  it('authorized block helper renders fn for matching role', () => {
    const template = hbs.compile(
      '{{#authorized14 user role="admin"}}Admin Panel{{else}}Access Denied{{/authorized14}}'
    );
    expect(template({ user: { role: 'admin' } })).toBe('Admin Panel');
    expect(template({ user: { role: 'viewer' } })).toBe('Access Denied');
  });

  it('repeat block helper iterates n times with @index', () => {
    const template = hbs.compile('{{#repeat14 3}}[{{@index}}]{{/repeat14}}');
    expect(template({})).toBe('[0][1][2]');
  });

  it('filterBy block helper filters items and uses inverse for empty', () => {
    const template = hbs.compile(
      '{{#filterBy14 items "available" true}}{{name}} {{else}}None{{/filterBy14}}'
    );
    const withAvailable = {
      items: [
        { name: 'A', available: true },
        { name: 'B', available: false },
        { name: 'C', available: true },
      ],
    };
    expect(template(withAvailable)).toBe('A C ');

    const noneAvailable = {
      items: [{ name: 'X', available: false }],
    };
    expect(template(noneAvailable)).toBe('None');
  });
});

// ============================================================
// Ex15: Helper Composition (Subexpressions)
// ============================================================
describe('Ex15: Helper Composition', () => {
  let hbs: typeof Handlebars;

  beforeEach(() => {
    hbs = Handlebars.create();
    hbs.registerHelper('uppercase15', (text: string) => String(text).toUpperCase());
    hbs.registerHelper('currency15', (value: number) => {
      return `R$ ${Number(value).toFixed(2).replace('.', ',')}`;
    });
    hbs.registerHelper('eq15', (a: unknown, b: unknown) => a === b);
    hbs.registerHelper('calcTotal15', (list: Array<{ amount: number; type: string }>) => {
      return list.reduce((total, item) => {
        return item.type === 'income' ? total + item.amount : total - item.amount;
      }, 0);
    });
  });

  it('uses subexpressions to compose helpers', () => {
    const template = hbs.compile('Balance: {{currency15 (calcTotal15 transactions)}}');
    const result = template({
      transactions: [
        { amount: 500, type: 'income' },
        { amount: 100, type: 'expense' },
      ],
    });
    expect(result).toBe('Balance: R$ 400,00');
  });

  it('combines eq subexpression with if for branching', () => {
    const template = hbs.compile(
      '{{#if (eq15 type "income")}}+{{currency15 amount}}{{else}}-{{currency15 amount}}{{/if}}'
    );
    expect(template({ type: 'income', amount: 100 })).toBe('+R$ 100,00');
    expect(template({ type: 'expense', amount: 50 })).toBe('-R$ 50,00');
  });

  it('chains uppercase and currency in template', () => {
    const template = hbs.compile('{{uppercase15 description}} | {{currency15 amount}}');
    const result = template({ description: 'course sale', amount: 497.5 });
    expect(result).toBe('COURSE SALE | R$ 497,50');
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
    hbs.registerPartial('header16', '=== {{title}} ===');
    const template = hbs.compile('{{> header16}}');
    expect(template({ title: 'Dashboard' })).toBe('=== Dashboard ===');
  });

  it('renders a partial with specific context', () => {
    hbs.registerPartial('userCard16', '[{{avatar}}] {{name}} ({{role}})');
    const template = hbs.compile('{{> userCard16 user}}');
    const result = template({
      user: { name: 'Maria', avatar: 'M', role: 'admin' },
    });
    expect(result).toBe('[M] Maria (admin)');
  });

  it('renders dynamic partials using lookup', () => {
    hbs.registerPartial('viewAdmin16', 'Admin Panel: {{metrics.models}} models');
    hbs.registerPartial('viewUser16', 'User View: Welcome!');
    const template = hbs.compile('{{> (lookup . "partialType")}}');
    expect(template({ partialType: 'viewAdmin16', metrics: { models: 12 } }))
      .toBe('Admin Panel: 12 models');
    expect(template({ partialType: 'viewUser16' }))
      .toBe('User View: Welcome!');
  });

  it('passes hash arguments to partials', () => {
    hbs.registerPartial('metric16', '[ {{label}} ]: {{value}}');
    const template = hbs.compile('{{> metric16 label="Models" value=metrics.total}}');
    expect(template({ metrics: { total: 42 } })).toBe('[ Models ]: 42');
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
      { config: { name: string; template: string; description: string }; compiled: Handlebars.TemplateDelegate }
    >();
    private handlebars: typeof Handlebars;

    constructor() {
      this.handlebars = Handlebars.create();
    }

    register(config: { name: string; template: string; description: string }): void {
      const compiled = this.handlebars.compile(config.template);
      this.templates.set(config.name, { config, compiled });
    }

    render(name: string, data: Record<string, unknown>): string {
      const entry = this.templates.get(name);
      if (!entry) {
        throw new Error(`Template "${name}" not found. Available: ${this.list().join(', ')}`);
      }
      return entry.compiled(data);
    }

    list(): string[] {
      return Array.from(this.templates.keys());
    }

    has(name: string): boolean {
      return this.templates.has(name);
    }

    registerHelper(name: string, fn: Handlebars.HelperDelegate): void {
      this.handlebars.registerHelper(name, fn);
    }
  }

  it('registers templates and checks with has/list', () => {
    const registry = new TemplateRegistry();
    registry.register({ name: 'email', template: 'Hello {{name}}!', description: 'Email' });
    registry.register({ name: 'alert', template: 'Alert: {{msg}}', description: 'Alert' });

    expect(registry.has('email')).toBe(true);
    expect(registry.has('nonexistent')).toBe(false);
    expect(registry.list()).toEqual(['email', 'alert']);
  });

  it('renders a registered template with data', () => {
    const registry = new TemplateRegistry();
    registry.register({
      name: 'welcome',
      template: 'Hello {{name}}! Plan: {{plan}}.',
      description: 'Welcome email',
    });

    const result = registry.render('welcome', { name: 'Ana', plan: 'Premium' });
    expect(result).toBe('Hello Ana! Plan: Premium.');
  });

  it('throws error for non-existent template', () => {
    const registry = new TemplateRegistry();
    expect(() => registry.render('does-not-exist', {})).toThrow('Template "does-not-exist" not found');
  });

  it('supports isolated helpers via registerHelper', () => {
    const registry = new TemplateRegistry();
    registry.registerHelper('shout', (text: string) => String(text).toUpperCase());
    registry.register({
      name: 'shout',
      template: '{{shout name}}!',
      description: 'Shout template',
    });
    expect(registry.render('shout', { name: 'hello' })).toBe('HELLO!');
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
      '<html><head><title>{{title}}</title></head><body><header>{{title}}</header><main>{{> @partial-block}}</main><footer>(c) {{footer.year}}</footer></body></html>'
    );
  });

  it('renders a layout with @partial-block', () => {
    const template = hbs.compile('{{#> layout18}}<p>Content here</p>{{/layout18}}');
    const result = template({ title: 'Home', footer: { year: 2026 } });
    expect(result).toContain('<title>Home</title>');
    expect(result).toContain('<header>Home</header>');
    expect(result).toContain('<main><p>Content here</p></main>');
    expect(result).toContain('<footer>(c) 2026</footer>');
  });

  it('different pages use the same layout with different content', () => {
    const templateHome = hbs.compile('{{#> layout18}}<h1>Home Page</h1>{{/layout18}}');
    const templateCourse = hbs.compile('{{#> layout18}}<h2>Module 1</h2>{{/layout18}}');

    const home = templateHome({ title: 'Home', footer: { year: 2026 } });
    const course = templateCourse({ title: 'Course', footer: { year: 2026 } });

    expect(home).toContain('<header>Home</header>');
    expect(home).toContain('<h1>Home Page</h1>');

    expect(course).toContain('<header>Course</header>');
    expect(course).toContain('<h2>Module 1</h2>');
  });

  it('composes content partials within a layout', () => {
    hbs.registerPartial('hero18', '<section class="hero">{{text}}</section>');
    hbs.registerHelper('renderBlock18', function (block: { type: string; text?: string }) {
      const partial = hbs.partials[block.type + '18'];
      if (partial) {
        const tpl = typeof partial === 'string' ? hbs.compile(partial) : partial;
        return new Handlebars.SafeString(tpl(block));
      }
      return '';
    });

    const template = hbs.compile(
      '{{#> layout18}}{{#each content}}{{{renderBlock18 this}}}{{/each}}{{/layout18}}'
    );
    const result = template({
      title: 'Test',
      footer: { year: 2026 },
      content: [{ type: 'hero', text: 'Master AI' }],
    });
    expect(result).toContain('<section class="hero">Master AI</section>');
  });
});

// ============================================================
// Ex19: Security (Zod + Sanitization)
// ============================================================
describe('Ex19: Security', () => {
  const profileSchema = z.object({
    name: z.string().min(2).max(100),
    email: z.string().email(),
    bio: z.string().max(500),
    website: z.string().url().startsWith('https://'),
  });

  function renderSafe<T>(
    schema: z.ZodSchema<T>,
    templateStr: string,
    data: unknown,
  ): { success: boolean; result?: string; errors?: string[] } {
    const validation = schema.safeParse(data);
    if (!validation.success) {
      const errors = validation.error.issues.map(
        (issue) => `[${issue.path.join('.')}] ${issue.message}`
      );
      return { success: false, errors };
    }
    const template = Handlebars.compile(templateStr);
    const result = template(validation.data);
    return { success: true, result };
  }

  it('validates and renders with valid data', () => {
    const result = renderSafe(profileSchema, 'Name: {{name}} | Email: {{email}}', {
      name: 'Maria Silva',
      email: 'maria@example.com',
      bio: 'AI Developer',
      website: 'https://maria.dev',
    });
    expect(result.success).toBe(true);
    expect(result.result).toBe('Name: Maria Silva | Email: maria@example.com');
  });

  it('rejects invalid data and returns errors', () => {
    const result = renderSafe(profileSchema, 'Name: {{name}}', {
      name: 'X', // too short (min 2)
      email: 'invalid',
      bio: 'ok',
      website: 'http://insecure.com',
    });
    expect(result.success).toBe(false);
    expect(result.errors).toBeDefined();
    expect(result.errors!.length).toBeGreaterThan(0);
  });

  it('sanitize helper removes HTML tags', () => {
    const hbs = Handlebars.create();
    hbs.registerHelper('sanitize19', (text: unknown) => {
      if (typeof text === 'string') {
        return text.replace(/<[^>]*>/g, '');
      }
      return text;
    });

    const template = hbs.compile('{{sanitize19 bio}}');
    const result = template({ bio: '<img src=x onerror=alert("hack")>Normal text' });
    expect(result).toBe('Normal text');
    expect(result).not.toContain('<img');
  });

  it('safe template pattern composes validation + rendering', () => {
    function createSafeTemplate<T>(config: {
      schema: z.ZodSchema<T>;
      template: string;
    }): (data: unknown) => { success: boolean; result?: string; errors?: string[] } {
      return (data: unknown) => renderSafe(config.schema, config.template, data);
    }

    const renderProfile = createSafeTemplate({
      schema: profileSchema,
      template: '{{name}} <{{email}}>',
    });

    const valid = renderProfile({
      name: 'Ana',
      email: 'ana@test.com',
      bio: 'Dev',
      website: 'https://ana.dev',
    });
    expect(valid.success).toBe(true);
    expect(valid.result).toContain('Ana');

    const invalid = renderProfile({ name: 'A' });
    expect(invalid.success).toBe(false);
  });
});

// ============================================================
// Ex20: AI Prompt
// ============================================================
describe('Ex20: AI Prompt', () => {
  let hbs: typeof Handlebars;

  beforeEach(() => {
    hbs = Handlebars.create();
    hbs.registerHelper('eq20', (a: string, b: string) => a === b);
  });

  it('builds a system prompt with variables', () => {
    const systemTemplate = hbs.compile(
      'You are an assistant for {{company}}. Respond in {{language}} with a {{tone}} tone.'
    );
    const result = systemTemplate({
      company: 'TechStore',
      language: 'english',
      tone: 'professional',
    });
    expect(result).toContain('TechStore');
    expect(result).toContain('english');
    expect(result).toContain('professional');
  });

  it('builds a user prompt with few-shot examples', () => {
    const template = hbs.compile(
      '{{#each faq}}Q: {{this.question}}\nA: {{this.answer}}\n{{/each}}Question: {{question}}'
    );
    const result = template({
      faq: [
        { question: 'How to sync?', answer: 'Open the app > Bluetooth' },
      ],
      question: 'My watch does not sync',
    });
    expect(result).toContain('Q: How to sync?');
    expect(result).toContain('A: Open the app &gt; Bluetooth');
    expect(result).toContain('Question: My watch does not sync');
  });

  it('adapts prompt based on user plan (premium vs basic)', () => {
    const template = hbs.compile(
      '{{#if (eq20 customer.plan "premium")}}NOTE: Premium customer. Prioritize.{{else}}NOTE: Basic customer. Suggest upgrade.{{/if}}'
    );
    expect(template({ customer: { plan: 'premium' } })).toBe(
      'NOTE: Premium customer. Prioritize.'
    );
    expect(template({ customer: { plan: 'basic' } })).toBe(
      'NOTE: Basic customer. Suggest upgrade.'
    );
  });

  it('builds complete prompt with system + user parts', () => {
    const systemTpl = 'You are an assistant for {{company}}.';
    const userTpl = 'Customer: {{customer.name}} ({{customer.plan}})\nQuestion: {{question}}';

    function buildPrompt(ctx: Record<string, unknown>) {
      return {
        system: hbs.compile(systemTpl)(ctx),
        user: hbs.compile(userTpl)(ctx),
      };
    }

    const prompt = buildPrompt({
      company: 'TechStore',
      customer: { name: 'Pedro', plan: 'premium' },
      question: 'How to reset?',
    });

    expect(prompt.system).toBe('You are an assistant for TechStore.');
    expect(prompt.user).toContain('Pedro');
    expect(prompt.user).toContain('premium');
    expect(prompt.user).toContain('How to reset?');
  });
});
