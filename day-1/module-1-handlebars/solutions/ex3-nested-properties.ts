/**
 * Solution - Exercise 3: Nested Properties
 */

import Handlebars from 'handlebars';

const company = {
  name: 'AI Solutions',
  address: {
    street: 'Av. Paulista, 1000',
    city: 'Sao Paulo',
    state: 'SP',
  },
  contact: {
    email: 'contato@aisolutions.com',
    phone: '(11) 99999-0000',
  },
  ceo: {
    name: 'Carlos Mendes',
    role: 'CEO & Founder',
  },
};

// Solution TODO 1: Template with basic dot-notation
const companyTemplate = `Company: {{name}} | City: {{address.city}} - {{address.state}}`;

const compiled1 = Handlebars.compile(companyTemplate);
console.log('=== Company Data ===');
console.log(compiled1(company));
// Output: "Company: AI Solutions | City: Sao Paulo - SP"

// Solution TODO 2: Business card template
const businessCardTemplate = `--- Business Card ---
{{ceo.name}}
{{ceo.role}}
{{contact.email}}
{{name}}`;

const compiled2 = Handlebars.compile(businessCardTemplate);
console.log('\n=== Business Card ===');
console.log(compiled2(company));

// You can also access the full address:
const fullTemplate = `{{name}}
{{address.street}}
{{address.city}} - {{address.state}}
Phone: {{contact.phone}} | Email: {{contact.email}}`;

const compiled2b = Handlebars.compile(fullTemplate);
console.log('\n=== Full Address ===');
console.log(compiled2b(company));

// Solution TODO 3: Accessing a property that doesn't exist
// Handlebars does NOT throw an error - it simply returns an empty string.
// This is a feature: templates are resilient to incomplete data.
const missingTemplate = `Address: {{address.street}} | ZIP: {{address.zip}} | Revenue: {{financial.revenue}}`;

const compiled3 = Handlebars.compile(missingTemplate);
console.log('\n=== Missing Properties ===');
console.log(compiled3(company));
// Output: "Address: Av. Paulista, 1000 | ZIP:  | Revenue: "
// Note: {{address.zip}} and {{financial.revenue}} become empty string, no error.

// This is useful for AI templates where not all data is available.
// The template renders even with partial data.
