/**
 * Exercise 7: Tool with Real API (ViaCEP)
 *
 * Create a tool that fetches real addresses using the ViaCEP API.
 * Run: npx tsx exercises/ex7-api-real.ts
 */

import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic();

// === TODO 1: Define the "lookup_zipcode" tool ===
// Receives: zipcode (string, format 00000-000 or 00000000)
// Returns: full address (street, neighborhood, city, state)
//
// API: https://viacep.com.br/ws/{zipcode}/json/

// const lookupZipcodeTool = { ... };

// === TODO 2: Implement the handler that calls the API ===
// Use fetch() to call https://viacep.com.br/ws/{zipcode}/json/
// Handle errors: invalid zipcode, API offline, incorrect format.

// async function handleLookupZipcode(input: { zipcode: string }): Promise<string> {
//   const cleanZipcode = input.zipcode.replace(/\D/g, '');
//   const response = await fetch(`https://viacep.com.br/ws/${cleanZipcode}/json/`);
//   const data = await response.json();
//   if (data.erro) return 'Zipcode not found';
//   return `${data.logradouro}, ${data.bairro}, ${data.localidade}-${data.uf}`;
// }

// === TODO 3: Run the tool use loop with questions about zipcodes ===
// Question: "What is the address for zipcode 01001-000? And for zipcode 20040-020?"

// Hint: the handler is async, so use await in the dispatch.

console.log('\n--- Exercise 7 complete! ---');
console.log('Hint: see the solution in solutions/ex7-api-real.ts');
