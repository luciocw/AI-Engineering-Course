/**
 * Solution - Exercise 18: Template Inheritance
 */

import Handlebars from 'handlebars';

// === Home page data ===
const homePage = {
  title: 'AI Engineering Course',
  description: 'Learn AI Engineering hands-on',
  content: [
    { type: 'hero', text: 'Master AI Engineering in 15 days' },
    { type: 'features', items: ['Handlebars', 'Claude API', 'Tool Use', 'Data Pipelines'] },
    { type: 'cta', text: 'Start Free', link: '/signup' },
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

// Solution TODO 1: Partial "layout"
Handlebars.registerPartial(
  'layout',
  `<!DOCTYPE html>
<html>
<head><title>{{title}}</title></head>
<body>
  <header>{{title}}</header>
  <main>{{> @partial-block}}</main>
  <footer>(c) {{footer.year}} {{footer.company}}</footer>
</body>
</html>`
);

// Solution TODO 2: Content partials for each type
Handlebars.registerPartial(
  'hero',
  `<section class="hero"><h1>{{text}}</h1></section>`
);

Handlebars.registerPartial(
  'features',
  `<section class="features"><ul>{{#each items}}<li>{{this}}</li>{{/each}}</ul></section>`
);

Handlebars.registerPartial(
  'cta',
  `<section class="cta"><a href="{{link}}">{{text}}</a></section>`
);

Handlebars.registerPartial(
  'breadcrumb',
  `<nav>{{#each path}}{{#unless @first}} > {{/unless}}{{this}}{{/each}}</nav>`
);

Handlebars.registerPartial(
  'lesson',
  `<section class="lesson"><h2>{{title}}</h2><progress value="{{progress}}" max="100"></progress> {{progress}}%</section>`
);

// Solution TODO 3: Helper to render content blocks
Handlebars.registerHelper('renderBlock', function (block: { type: string }) {
  const partial = Handlebars.partials[block.type];
  if (partial) {
    const template = typeof partial === 'string' ? Handlebars.compile(partial) : partial;
    return new Handlebars.SafeString(template(block));
  }
  return '';
});

// Solution TODO 4: Home page template using the layout
const homeTemplate = `{{#> layout}}
{{#each content}}
    {{{renderBlock this}}}
{{/each}}
{{/layout}}`;

// Solution TODO 5: Course page template using the same layout
const courseTemplate = `{{#> layout}}
{{#each content}}
    {{{renderBlock this}}}
{{/each}}
{{/layout}}`;

// Compile and test
const compiledHome = Handlebars.compile(homeTemplate);
console.log('=== Home Page ===');
console.log(compiledHome(homePage));

const compiledCourse = Handlebars.compile(courseTemplate);
console.log('\n=== Course Page ===');
console.log(compiledCourse(coursePage));

// Demonstration: the same structure (layout) with different content
console.log('\n=== Reuse Demonstration ===');
console.log('Both pages use the same layout partial.');
console.log('The layout defines header, main and footer.');
console.log('The content is injected via @partial-block.');
console.log('Each block type (hero, features, cta, breadcrumb, lesson) is an independent partial.');
