/**
 * Solution - Exercise 12: Multi-Parameter Helpers
 */

import Handlebars from 'handlebars';

const data = {
  products: [
    { name: 'API Credits', price: 50, category: 'service', launchDate: new Date('2025-06-01') },
    { name: 'GPU Hours', price: 200, category: 'infrastructure', launchDate: new Date('2025-01-15') },
    { name: 'LangSmith', price: 35, category: 'service', launchDate: new Date('2026-01-10') },
    { name: 'Vector DB', price: 70, category: 'infrastructure', launchDate: new Date('2024-11-20') },
  ],
  currency: 'BRL',
  locale: 'pt-BR',
};

// Solution TODO 1: Helper 'formatPrice' with 2 parameters
Handlebars.registerHelper('formatPrice', function (price: number, currency: string) {
  switch (currency) {
    case 'BRL': {
      const formatted = price.toFixed(2).replace('.', ',');
      const parts = formatted.split(',');
      parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, '.');
      return `R$ ${parts.join(',')}`;
    }
    case 'USD':
      return `$ ${price.toFixed(2)}`;
    case 'EUR':
      return `E ${price.toFixed(2)}`;
    default:
      return `${price.toFixed(2)} ${currency}`;
  }
});

// Solution TODO 2: Helper 'daysSince'
Handlebars.registerHelper('daysSince', function (date: Date) {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  return `${days} days`;
});

// Solution TODO 3: Helper 'badge' with hash arguments
Handlebars.registerHelper('badge', function (text: string, options: Handlebars.HelperOptions) {
  const { type, color } = options.hash as { type?: string; color?: string };

  switch (type) {
    case 'pill':
      return `[${color || 'gray'}: ${text}]`;
    case 'tag':
      return `#${text}`;
    default:
      return `(${text})`;
  }
});

// Solution TODO 4: Block helper 'filter' with hash arguments
Handlebars.registerHelper('filter', function (array: Array<Record<string, unknown>>, options: Handlebars.HelperOptions) {
  const hash = options.hash as Record<string, unknown>;

  // Filter the array based on all hash arguments
  const filtered = array.filter((item) => {
    return Object.entries(hash).every(([key, value]) => item[key] === value);
  });

  if (filtered.length === 0) {
    return options.inverse(this);
  }

  return filtered.map((item) => options.fn(item)).join('');
});

// Template using all helpers
const productsTemplate = `=== Product Catalog ===

All products:
{{#each products}}  {{badge name type="pill" color="blue"}} - {{formatPrice price ../currency}} (launched {{daysSince launchDate}} ago)
{{/each}}

=== Services Only ===
{{#filter products category="service"}}  - {{name}}: {{formatPrice price @root.currency}}
{{else}}  No services found.
{{/filter}}

=== Infrastructure Only ===
{{#filter products category="infrastructure"}}  - {{badge name type="tag"}} - {{formatPrice price @root.currency}}
{{else}}  No infrastructure products found.
{{/filter}}`;

// Compile and test
const compiled = Handlebars.compile(productsTemplate);
console.log(compiled(data));

// Test with different currency
const dataUSD = {
  ...data,
  currency: 'USD',
};

console.log('\n=== In Dollars ===');
console.log(compiled(dataUSD));
