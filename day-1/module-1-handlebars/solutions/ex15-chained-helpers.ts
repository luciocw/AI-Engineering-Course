/**
 * Solution - Exercise 15: Helper Composition
 */

import Handlebars from 'handlebars';

// === Financial transaction data ===
const transactions = [
  { description: 'ai course sale', amount: 497.5, type: 'revenue', date: new Date('2026-01-15') },
  { description: 'cloud server', amount: 89.9, type: 'expense', date: new Date('2026-01-20') },
  { description: 'group mentorship', amount: 1200, type: 'revenue', date: new Date('2026-02-01') },
  { description: 'software license', amount: 299, type: 'expense', date: new Date('2026-02-10') },
];

// Solution TODO 1: Basic helpers
Handlebars.registerHelper('uppercase', (text: string) => {
  return String(text).toUpperCase();
});

Handlebars.registerHelper('currency', (amount: number) => {
  const formatted = Number(amount).toFixed(2).replace('.', ',');
  return `R$ ${formatted}`;
});

Handlebars.registerHelper('formatDate', (date: Date) => {
  return date.toLocaleDateString('pt-BR');
});

Handlebars.registerHelper('eq', (a: unknown, b: unknown) => a === b);

// Solution TODO 2: Helper calculateTotal with subexpression
Handlebars.registerHelper(
  'calculateTotal',
  (list: Array<{ amount: number; type: string }>) => {
    return list.reduce((total, item) => {
      return item.type === 'revenue' ? total + item.amount : total - item.amount;
    }, 0);
  },
);

// Solution TODO 3: Template with nested subexpressions
const statementTemplate = `=== Financial Statement ===
{{#each transactions}}
{{#if (eq type "revenue")}}  + {{currency amount}}{{else}}  - {{currency amount}}{{/if}} | {{uppercase description}} | {{formatDate date}}
{{/each}}
---------------------------------
Balance: {{currency (calculateTotal transactions)}}`;

// Solution TODO 4: Helper pipe
Handlebars.registerHelper('pipe', function (...args: unknown[]) {
  // The last argument is always the Handlebars options
  const options = args.pop();
  // The first argument is the initial value
  let value = args.shift();
  // The rest are transformation names
  const transforms = args as string[];

  const transformMap: Record<string, (val: string, param?: string) => string> = {
    uppercase: (val) => String(val).toUpperCase(),
    lowercase: (val) => String(val).toLowerCase(),
    trim: (val) => String(val).trim(),
    truncate: (val, param) => {
      const limit = parseInt(param || '20', 10);
      const str = String(val);
      return str.length > limit ? str.substring(0, limit) + '...' : str;
    },
    capitalize: (val) => {
      const str = String(val);
      return str
        .split(' ')
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
    },
  };

  let result = String(value);

  for (const transform of transforms) {
    const [name, param] = transform.split(':');
    const fn = transformMap[name];
    if (fn) {
      result = fn(result, param);
    }
  }

  return result;
});

// Template using pipe
const pipeTemplate = `=== Transformations with Pipe ===
{{#each transactions}}
  {{pipe description "uppercase" "truncate:15"}} | {{currency amount}}
{{/each}}`;

// Compile and test
const compiledStatement = Handlebars.compile(statementTemplate);
console.log('=== Financial Statement ===');
console.log(compiledStatement({ transactions }));

const compiledPipe = Handlebars.compile(pipeTemplate);
console.log('\n=== Pipe Transformations ===');
console.log(compiledPipe({ transactions }));

// Bonus: advanced combination of subexpressions
const advancedTemplate = `=== Summary by Type ===
Revenue:
{{#each transactions}}{{#if (eq type "revenue")}}  {{pipe description "capitalize"}} - {{currency amount}}
{{/if}}{{/each}}
Expenses:
{{#each transactions}}{{#if (eq type "expense")}}  {{pipe description "capitalize"}} - {{currency amount}}
{{/if}}{{/each}}`;

const compiledAdvanced = Handlebars.compile(advancedTemplate);
console.log('\n');
console.log(compiledAdvanced({ transactions }));
