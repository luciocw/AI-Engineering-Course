/**
 * Solution - Exercise 14: Block Helpers
 */

import Handlebars from 'handlebars';

// === Application data ===
const data = {
  user: { name: 'Pedro', role: 'admin', authenticated: true },
  items: [
    { name: 'Laptop', price: 4500, available: true },
    { name: 'Monitor', price: 2200, available: false },
    { name: 'Keyboard', price: 350, available: true },
    { name: 'Mouse', price: 150, available: true },
  ],
  config: { debug: false, theme: 'dark' },
};

// Solution TODO 1: Block helper #authorized
Handlebars.registerHelper('authorized', function (
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

// Solution TODO 2: Block helper #list
Handlebars.registerHelper('list', function (
  this: unknown,
  items: unknown[],
  options: Handlebars.HelperOptions,
) {
  const title = (options.hash.title as string) || 'List';
  let result = `=== ${title} (${items.length} items) ===\n`;

  for (const item of items) {
    result += options.fn(item);
  }

  result += '=== End ===';
  return result;
});

// Solution TODO 3: Block helper #repeat
Handlebars.registerHelper('repeat', function (
  this: unknown,
  n: number,
  options: Handlebars.HelperOptions,
) {
  let result = '';
  for (let i = 0; i < n; i++) {
    const frame = Handlebars.createFrame(options.data);
    frame.index = i;
    result += options.fn(this, { data: frame });
  }
  return result;
});

// Solution TODO 4: Block helper #filterBy
Handlebars.registerHelper('filterBy', function (
  this: unknown,
  items: Record<string, unknown>[],
  property: string,
  value: unknown,
  options: Handlebars.HelperOptions,
) {
  const filtered = items.filter((item) => item[property] === value);

  if (filtered.length > 0) {
    let result = '';
    for (const item of filtered) {
      result += options.fn(item);
    }
    return result;
  }
  return options.inverse(this);
});

// Main template using all block helpers
const mainTemplate = `{{#authorized user role="admin"}}Admin Panel - Welcome, {{user.name}}!

{{#list items title="Products"}}  - {{name}} - R${{price}}
{{/list}}

Separator:
{{#repeat 3}}---[{{@index}}]---
{{/repeat}}
Available items:
{{#filterBy items "available" true}}  [OK] {{name}} - R${{price}}
{{else}}  No items available.
{{/filterBy}}{{else}}Access denied. Required role: admin
You are logged in as: {{user.name}} ({{user.role}}){{/authorized}}`;

// Compile and test
const compiled = Handlebars.compile(mainTemplate);

console.log('=== Block Helpers ===');
console.log(compiled(data));

// Test with user without permission
const dataNoPermission = {
  ...data,
  user: { name: 'Julia', role: 'viewer', authenticated: true },
};

console.log('\n=== Test without Permission ===');
console.log(compiled(dataNoPermission));

// Test filterBy with no results
const dataNoAvailable = {
  ...data,
  items: data.items.map((item) => ({ ...item, available: false })),
};

console.log('\n=== Test No Available Items ===');
const filterTemplate = `{{#filterBy items "available" true}}  [OK] {{name}}
{{else}}  No items available at the moment.
{{/filterBy}}`;
const compiledFilter = Handlebars.compile(filterTemplate);
console.log(compiledFilter(dataNoAvailable));
