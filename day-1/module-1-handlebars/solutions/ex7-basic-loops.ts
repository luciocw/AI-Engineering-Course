/**
 * Solution - Exercise 7: Loops with Each
 */

import Handlebars from 'handlebars';

const catalog = {
  store: 'AI Tools Store',
  products: [
    { name: 'Claude API Credits', price: 50, inStock: true, tags: ['ai', 'api'] },
    { name: 'Vector DB Hosting', price: 70, inStock: true, tags: ['database', 'cloud'] },
    { name: 'GPU Training Hours', price: 200, inStock: false, tags: ['training', 'gpu'] },
    { name: 'LangSmith Pro', price: 35, inStock: true, tags: ['monitoring', 'observability'] },
  ],
};

// Solution TODO 1: List with {{#each}} and {{@index}}
const listTemplate = `Catalog: {{store}}
{{#each products}}
{{@index}}. {{name}} - R\${{price}}
{{/each}}`;

console.log('=== TODO 1: List with @index ===');
const comp1 = Handlebars.compile(listTemplate);
console.log(comp1(catalog));

// Solution TODO 2: Filter with {{#if}} inside {{#each}}
const filteredTemplate = `Available products:
{{#each products}}
{{#if inStock}}
  - {{name}} (R\${{price}}) - IN STOCK
{{/if}}
{{/each}}
Out of stock products:
{{#each products}}
{{#unless inStock}}
  - {{name}} (R\${{price}}) - OUT OF STOCK
{{/unless}}
{{/each}}`;

console.log('=== TODO 2: Filtered by stock ===');
const comp2 = Handlebars.compile(filteredTemplate);
console.log(comp2(catalog));

// Solution TODO 3: {{@first}} and {{@last}} for special formatting
const formattedTemplate = `{{#each products}}
{{#if @first}}[FEATURED] {{/if}}{{#if @last}}[LAST] {{/if}}{{name}} - R\${{price}}
{{/each}}`;

console.log('=== TODO 3: @first and @last ===');
const comp3 = Handlebars.compile(formattedTemplate);
console.log(comp3(catalog));

// Solution TODO 4: {{else}} inside {{#each}} for empty array
// The {{else}} block is executed when the list is empty.
const templateWithElse = `{{store}}:
{{#each products}}
  - {{name}} (R\${{price}})
{{else}}
  No products found.
{{/each}}`;

const emptyCatalog = {
  store: 'New Store',
  products: [],
};

console.log('=== TODO 4: Empty array ===');
const comp4 = Handlebars.compile(templateWithElse);
console.log('With products:');
console.log(comp4(catalog));
console.log('\nWithout products:');
console.log(comp4(emptyCatalog));

// Bonus: iterating over tags (nested array inside each)
const tagsTemplate = `{{#each products}}
{{name}}: {{#each tags}}[{{this}}] {{/each}}
{{/each}}`;

console.log('\n=== Bonus: Tags (nested each) ===');
const compTags = Handlebars.compile(tagsTemplate);
console.log(compTags(catalog));
// Note: inside {{#each tags}}, use {{this}} to access
// the current item value (simple strings, not objects).
