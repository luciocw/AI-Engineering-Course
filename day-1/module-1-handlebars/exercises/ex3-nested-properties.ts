/**
 * Exercise 3: Nested Properties
 *
 * Learn to access objects within objects using dot-notation.
 * You already know how to use {{variable}} (ex1-ex2). Now access {{obj.prop}}.
 * Run: npx tsx exercises/ex3-propriedades-aninhadas.ts
 */

import Handlebars from 'handlebars';

// === Company data with nested structure ===
const company = {
  name: 'AI Solutions',
  address: {
    street: 'Av. Paulista, 1000',
    city: 'Sao Paulo',
    state: 'SP',
  },
  contact: {
    email: 'contact@aisolutions.com',
    phone: '(11) 99999-0000',
  },
  ceo: {
    name: 'Carlos Mendes',
    role: 'CEO & Founder',
  },
};

// === TODO 1: Template with basic dot-notation ===
// Access nested properties using dot (.).
// Create a template that shows the company name and city.
//
// Expected output example:
// "Company: AI Solutions | City: Sao Paulo - SP"
//
// Tip: use {{name}} for the company name and {{address.city}} for the city.

const companyTemplate = `
TODO: Create template using dot-notation for name, address.city and address.state
`;

// === TODO 2: Business card template ===
// Create a "business card" accessing CEO and contact data.
//
// Expected output example:
// "--- Business Card ---
//  Carlos Mendes
//  CEO & Founder
//  contact@aisolutions.com
//  AI Solutions"
//
// Tip: use {{ceo.name}}, {{ceo.role}}, {{contact.email}}

const cardTemplate = `
TODO: Create business card template with ceo.name, ceo.role, contact.email
`;

// === TODO 3: Accessing a property that doesn't exist ===
// What happens when you try to access a property that doesn't exist?
// Try accessing {{address.zipCode}} and {{finance.revenue}} in the template.
//
// Create a template that mixes existing and non-existing properties.
// Observe how Handlebars handles this (no errors, just an empty string).
//
// Expected output example:
// "Address: Av. Paulista, 1000 | Zip Code:  | Revenue: "

const nonExistentTemplate = `
TODO: Create template accessing existing and non-existing properties
`;

// === Compile and test ===
// Uncomment and complete the code below:

// const compiled1 = Handlebars.compile(companyTemplate);
// console.log('=== Company Data ===');
// console.log(compiled1(company));

// const compiled2 = Handlebars.compile(cardTemplate);
// console.log('\n=== Business Card ===');
// console.log(compiled2(company));

// const compiled3 = Handlebars.compile(nonExistentTemplate);
// console.log('\n=== Non-Existing Properties ===');
// console.log(compiled3(company));

console.log('\n--- Exercise 3 complete! ---');
console.log('Tip: see the solution in solutions/ex3-propriedades-aninhadas.ts');
