/**
 * Solution - Exercise 4: HTML Escaping and Triple-Stash
 */

import Handlebars from 'handlebars';

const content = {
  title: 'Learn AI Engineering',
  description: '<strong>Complete course</strong> on AI with <em>real practice</em>',
  maliciousScript: '<script>alert("hacked!")</script>',
  link: '<a href="https://exemplo.com">Click here</a>',
};

// Solution TODO 1: {{description}} - HTML escaped (SAFE)
// Double braces {{}} automatically escape HTML characters.
// < becomes &lt;  > becomes &gt;  " becomes &quot;  & becomes &amp;
const escapedTemplate = `Title: {{title}}
Description: {{description}}`;

console.log('=== TODO 1: HTML Escaped (Safe) ===');
const comp1 = Handlebars.compile(escapedTemplate);
console.log(comp1(content));
// The HTML appears as text - tags are visible but not executed.

// Solution TODO 2: {{{description}}} - raw HTML (no escaping)
// Triple braces {{{}}} render the HTML as-is.
// Use ONLY when you trust the data source.
const rawTemplate = `Title: {{title}}
Description: {{{description}}}`;

console.log('\n=== TODO 2: Raw HTML (No escaping) ===');
const comp2 = Handlebars.compile(rawTemplate);
console.log(comp2(content));
// The HTML appears as real HTML - tags are interpreted.

// Solution TODO 3: Security test
// IMPORTANT: This is the main reason for automatic escaping.
// If a user injected a <script>, it would be executed in a browser!

const safeTemplate = `Script (escaped): {{maliciousScript}}
Link (escaped): {{link}}`;

const dangerousTemplate = `Script (raw): {{{maliciousScript}}}
Link (raw): {{{link}}}`;

console.log('\n=== TODO 3: Security Comparison ===');

console.log('\n--- ESCAPED (safe) ---');
const comp3 = Handlebars.compile(safeTemplate);
console.log(comp3(content));
// The script appears as harmless text: &lt;script&gt;alert(...)&lt;/script&gt;

console.log('\n--- RAW (dangerous) ---');
const comp4 = Handlebars.compile(dangerousTemplate);
console.log(comp4(content));
// The script appears as real HTML: <script>alert("hacked!")</script>
// In a browser, this WOULD EXECUTE the malicious JavaScript!

// === Security Summary ===
console.log('\n=== Summary ===');
console.log('{{variable}}   -> Escapes HTML (SAFE - use by default)');
console.log('{{{variable}}} -> Raw HTML (DANGEROUS - use only with trusted data)');
console.log('');
console.log('Rule: ALWAYS use {{}} unless you are absolutely certain');
console.log('that the content is safe and you NEED the rendered HTML.');
console.log('This prevents XSS (Cross-Site Scripting) attacks.');
