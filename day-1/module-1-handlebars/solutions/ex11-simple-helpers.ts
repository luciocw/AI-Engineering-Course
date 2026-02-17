/**
 * Solution - Exercise 11: Formatting Helpers
 */

import Handlebars from 'handlebars';

const order = {
  client: 'joao pereira',
  items: [
    { name: 'AI Engineering Course', price: 497.5 },
    { name: 'Individual Mentorship', price: 1200 },
    { name: 'Advanced RAG Ebook', price: 89.9 },
  ],
  discount: 0.15,
  date: new Date('2026-02-15'),
  longDescription:
    'This package includes full access to the AI Engineering course with all modules, individual mentorship with a specialist and exclusive ebook on advanced RAG with practical examples',
};

// Solution TODO 1: Helper 'uppercase'
Handlebars.registerHelper('uppercase', function (text: string) {
  return String(text).toUpperCase();
});

// Solution TODO 2: Helper 'currency'
Handlebars.registerHelper('currency', function (value: number) {
  const formatted = value.toFixed(2).replace('.', ',');
  // Add thousands separator
  const parts = formatted.split(',');
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return `R$ ${parts.join(',')}`;
});

// Solution TODO 3: Helper 'truncate'
Handlebars.registerHelper('truncate', function (text: string, limit: number) {
  if (String(text).length <= limit) return text;
  return String(text).substring(0, limit) + '...';
});

// Solution TODO 4: Helper 'formatDate'
Handlebars.registerHelper('formatDate', function (date: Date) {
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
});

// Solution TODO 5: Helper 'total'
Handlebars.registerHelper('total', function (items: Array<{ price: number }>) {
  return items.reduce((sum, item) => sum + item.price, 0);
});

// Additional helper: calculates total with discount
Handlebars.registerHelper('totalWithDiscount', function (items: Array<{ price: number }>, discount: number) {
  const grossTotal = items.reduce((sum, item) => sum + item.price, 0);
  return grossTotal * (1 - discount);
});

// Template using all helpers
const orderTemplate = `=== ORDER ===
Client: {{uppercase client}}
Date: {{formatDate date}}

Items:
{{#each items}}- {{name}}: {{currency price}}
{{/each}}
Subtotal: {{currency (total items)}}
Discount: {{multiply discount 100}}%
Total with discount: {{currency (totalWithDiscount items discount)}}

Description: {{truncate longDescription 50}}`;

// Helper for multiplication (used for discount)
Handlebars.registerHelper('multiply', function (a: number, b: number) {
  return a * b;
});

// Compile and test
const compiled = Handlebars.compile(orderTemplate);
console.log(compiled(order));

// Test with another order
const order2 = {
  client: 'ana costa',
  items: [
    { name: 'LangChain Workshop', price: 250 },
    { name: 'Digital Certificate', price: 50 },
  ],
  discount: 0.1,
  date: new Date('2026-03-01'),
  longDescription: 'Intensive 2-day workshop on LangChain',
};

console.log('\n=== Second Order ===');
console.log(compiled(order2));
