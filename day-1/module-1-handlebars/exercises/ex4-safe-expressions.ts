/**
 * Exercise 4: HTML Escaping and Triple-Stash
 *
 * Understand the difference between {{}} (escaped) and {{{}}} (raw HTML).
 * Security is fundamental - Handlebars escapes HTML by default to prevent XSS.
 * Run: npx tsx exercises/ex4-expressoes-seguras.ts
 */

import Handlebars from 'handlebars';

// === Data with HTML content ===
const content = {
  title: 'Learn AI Engineering',
  description: '<strong>Complete course</strong> on AI with <em>real practice</em>',
  maliciousScript: '<script>alert("hacked!")</script>',
  link: '<a href="https://example.com">Click here</a>',
};

// === TODO 1: Use {{description}} (escaped) ===
// Create a template that uses {{description}} with double braces (default).
// Observe that the HTML appears as text (HTML entities).
//
// Expected output example:
// "Description: &lt;strong&gt;Complete course&lt;/strong&gt; on AI with &lt;em&gt;real practice&lt;/em&gt;"
//
// Tip: {{variable}} ESCAPES HTML automatically. This is safe.

const escapedTemplate = `
TODO: Create template using {{description}} with double braces
`;

// === TODO 2: Use {{{description}}} (raw HTML) ===
// Create a template that uses {{{description}}} with TRIPLE braces.
// Now the HTML is rendered as actual HTML.
//
// Expected output example:
// "Description: <strong>Complete course</strong> on AI with <em>real practice</em>"
//
// Tip: {{{variable}}} does NOT escape HTML. Use with caution!

const rawTemplate = `
TODO: Create template using {{{description}}} with triple braces
`;

// === TODO 3: Security test with malicious script ===
// Create TWO templates for the maliciousScript field:
// 1. One with {{maliciousScript}} (escaped - SAFE)
// 2. One with {{{maliciousScript}}} (raw - DANGEROUS)
//
// Compare the outputs and understand why {{}} is the safe default.
// In a browser, the raw template would execute the malicious script!
//
// Also test with the `link` field to see the difference.

const safeTemplate = `
TODO: Create escaped template for maliciousScript and link
`;

const dangerousTemplate = `
TODO: Create raw template for maliciousScript and link
`;

// === Compile and test ===
// Uncomment and complete the code below:

// console.log('=== TODO 1: Escaped HTML (Safe) ===');
// const comp1 = Handlebars.compile(escapedTemplate);
// console.log(comp1(content));

// console.log('\n=== TODO 2: Raw HTML (No escape) ===');
// const comp2 = Handlebars.compile(rawTemplate);
// console.log(comp2(content));

// console.log('\n=== TODO 3: Security - Malicious Script ===');
// console.log('Escaped (safe):');
// const comp3 = Handlebars.compile(safeTemplate);
// console.log(comp3(content));

// console.log('\nRaw (dangerous):');
// const comp4 = Handlebars.compile(dangerousTemplate);
// console.log(comp4(content));

console.log('\n--- Exercise 4 complete! ---');
console.log('Tip: see the solution in solutions/ex4-expressoes-seguras.ts');
