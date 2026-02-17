/**
 * Exercise 18: Template Inheritance
 *
 * Learn to create a layout system using partials + @partial-block.
 * You already master partials and helpers (ex10-ex17). Now build reusable layouts.
 * Run: npx tsx exercises/ex18-template-heranca.ts
 */

import Handlebars from 'handlebars';

// === Layout system: a common pattern in template engines ===
// Handlebars supports "inheritance" via partials + @partial-block.
// This allows defining a page structure (layout) and injecting
// different content in each page, keeping header/footer consistent.

// === Home page data ===
const homePage = {
  title: 'AI Engineering Course',
  description: 'Learn AI Engineering hands-on',
  content: [
    { type: 'hero', text: 'Master AI Engineering in 15 days' },
    { type: 'features', items: ['Handlebars', 'Claude API', 'Tool Use', 'Data Pipelines'] },
    { type: 'cta', text: 'Start for Free', link: '/signup' },
  ],
  footer: { year: 2026, company: 'AI Engineering Co.' },
};

// === Course page data ===
const coursePage = {
  title: 'Module 1 - Handlebars',
  description: 'Dynamic templates for AI',
  content: [
    { type: 'breadcrumb', path: ['Home', 'Day 1', 'Module 1'] },
    { type: 'lesson', title: 'Exercise 1', progress: 65 },
  ],
  footer: { year: 2026, company: 'AI Engineering Co.' },
};

// === TODO 1: Register the "layout" partial ===
// The layout defines the HTML page structure.
// Use {{> @partial-block}} to indicate where content will be injected.
//
// Expected structure:
// <!DOCTYPE html>
// <html>
// <head><title>{{title}}</title></head>
// <body>
//   <header>{{title}}</header>
//   <main>{{> @partial-block}}</main>
//   <footer>(c) {{footer.year}} {{footer.company}}</footer>
// </body>
// </html>
//
// Tip: Handlebars.registerPartial('layout', `...`)

// TODO: Register the 'layout' partial here

// === TODO 2: Register content partials for each type ===
// Create a partial for each type of content block:
//
// - "hero": displays the text prominently
//   Format: <section class="hero"><h1>{{text}}</h1></section>
//
// - "features": lists items as <ul><li>
//   Format: <section class="features"><ul>{{#each items}}<li>{{this}}</li>{{/each}}</ul></section>
//
// - "cta": call-to-action button
//   Format: <section class="cta"><a href="{{link}}">{{text}}</a></section>
//
// - "breadcrumb": navigation path
//   Format: <nav>{{#each path}}{{#unless @first}} > {{/unless}}{{this}}{{/each}}</nav>
//
// - "lesson": lesson progress
//   Format: <section class="lesson"><h2>{{title}}</h2><progress value="{{progress}}" max="100"></progress> {{progress}}%</section>
//
// Tip: Handlebars.registerPartial('hero', `...`) for each type

// TODO: Register the content partials here

// === TODO 3: Create a helper to render content blocks ===
// The "renderBlock" helper receives a content block and renders
// the corresponding partial based on its type.
//
// Tip: Handlebars.registerHelper('renderBlock', function(block) {
//   const partial = Handlebars.partials[block.type];
//   if (partial) {
//     const template = Handlebars.compile(partial);
//     return new Handlebars.SafeString(template(block));
//   }
//   return '';
// });

// TODO: Register the 'renderBlock' helper here

// === TODO 4: Render the Home page using the layout ===
// Use {{#> layout}} to "inherit" the layout and inject content.
// Inside the block, iterate over content and use the renderBlock helper.
//
// Format:
// {{#> layout}}
//   {{#each content}}
//     {{{renderBlock this}}}
//   {{/each}}
// {{/> layout}}
//
// Tip: note the use of {{{ }}} (triple-stache) to not escape HTML

const homeTemplate = `
TODO: Create Home page template using {{#> layout}}
`;

// === TODO 5: Render the Course page with the SAME layout ===
// Demonstrate reusability: same structure, different content.

const courseTemplate = `
TODO: Create Course page template using {{#> layout}}
`;

// === Compile and test ===

console.log('=== Home Page ===');
// TODO: compile homeTemplate and render with homePage

console.log('\n=== Course Page ===');
// TODO: compile courseTemplate and render with coursePage

console.log('\n--- Exercise 18 complete! ---');
console.log('Tip: see the solution in solutions/ex18-template-heranca.ts');
