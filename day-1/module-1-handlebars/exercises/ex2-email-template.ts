/**
 * Exercise 2: Email Template
 *
 * Learn to use Handlebars variables to create personalized emails.
 * You already know how to compile a template (ex1). Now use multiple variables.
 * Run: npx tsx exercises/ex2-email-basico.ts
 */

import Handlebars from 'handlebars';

// === User data ===
const user = {
  name: 'Maria Silva',
  email: 'maria@example.com',
  product: 'AI Engineering Course',
  price: 497,
};

// === TODO 1: Create a welcome email template ===
// Use {{variable}} to insert the user data.
// The template should contain: name, product and price.
//
// Expected output example:
// "Hello Maria Silva! Thank you for purchasing AI Engineering Course.
//  Price: $497. We will send details to maria@example.com."

const emailTemplate = `
TODO: Write your template here using {{name}}, {{product}}, {{price}} and {{email}}
`;

// === TODO 2: Compile the template and generate the result ===
// 1. Use Handlebars.compile() to compile the template
// 2. Pass the user data to the compiled template
// 3. Print the result with console.log()

// const compiled = ...
// const result = ...
// console.log(result);

// === TODO 3: Create a second template for a reminder email ===
// Reuse the same data but with a different message.
// Example: "Maria Silva, your access to AI Engineering Course expires in 7 days!"

console.log('\n--- Exercise 2 complete! ---');
console.log('Tip: see the solution in solutions/ex2-email-basico.ts');
