/**
 * Solution 5: Multi-Turn Conversation
 *
 * Multi-turn conversation with accumulated context.
 * Run: npx tsx solutions/ex5-conversacao.ts
 */

import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic();

const systemPrompt =
  'You are a technical support assistant for TechStore. Be helpful and ask follow-up questions when needed.';

type MessageParam = { role: 'user' | 'assistant'; content: string };

const messages: MessageParam[] = [];
const tokenLog: Array<{ turn: number; input: number; output: number }> = [];

async function sendMessage(userMessage: string): Promise<string> {
  messages.push({ role: 'user', content: userMessage });

  const response = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 500,
    system: systemPrompt,
    messages,
  });

  const text =
    response.content[0].type === 'text' ? response.content[0].text : '';

  messages.push({ role: 'assistant', content: text });

  tokenLog.push({
    turn: tokenLog.length + 1,
    input: response.usage.input_tokens,
    output: response.usage.output_tokens,
  });

  return text;
}

// Turn 1
console.log('=== Turn 1 ===');
console.log(
  'USER: My SmartWatch X1 stopped syncing after the update'
);
const response1 = await sendMessage(
  'My SmartWatch X1 stopped syncing after the update'
);
console.log(`ASSISTANT: ${response1}\n`);

// Turn 2
console.log('=== Turn 2 ===');
console.log(
  'USER: I already tried restarting bluetooth, but it did not work'
);
const response2 = await sendMessage(
  'I already tried restarting bluetooth, but it did not work'
);
console.log(`ASSISTANT: ${response2}\n`);

// Turn 3
console.log('=== Turn 3 ===');
console.log('USER: The watch is on firmware version 2.1.4');
const response3 = await sendMessage(
  'The watch is on firmware version 2.1.4'
);
console.log(`ASSISTANT: ${response3}\n`);

// Token summary
console.log('=== Token Summary ===');
let totalInput = 0;
let totalOutput = 0;
for (const log of tokenLog) {
  console.log(
    `Turn ${log.turn}: input=${log.input}, output=${log.output}`
  );
  totalInput += log.input;
  totalOutput += log.output;
}
console.log(`Total: input=${totalInput}, output=${totalOutput}`);
console.log(
  `Note: input tokens grow with each turn because they include the full history.`
);

console.log('\n--- Exercise 5 complete! ---');
