/**
 * Solution 6: Memory Management
 *
 * Long conversation with automatic summarization of old messages.
 * Run: npx tsx solutions/ex6-conversacao-memoria.ts
 */

import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic();

type MessageParam = { role: 'user' | 'assistant'; content: string };

const systemPrompt =
  'You are a technical support assistant specialized in Linux servers. Be helpful and technical.';

// Simulated technical support conversation
const simulatedConversation: string[] = [
  'My server is very slow, the load average is at 12 with 4 cores.',
  'I ran top and saw that the mysql process is using 85% of the CPU.',
  'MySQL is version 5.7, running on Ubuntu 20.04 with 16GB of RAM.',
  'There are about 200 active connections to MySQL right now.',
  'I already tried restarting MySQL but the problem comes back after 10 minutes.',
  'The slow query log shows queries with JOINs across 5 tables without indexes.',
];

const CHARACTER_LIMIT = 1000;
let messages: MessageParam[] = [];
let summariesDone = 0;

function countCharacters(msgs: MessageParam[]): number {
  return msgs.reduce((total, m) => total + m.content.length, 0);
}

async function summarizeConversation(
  msgs: MessageParam[]
): Promise<string> {
  const formattedConversation = msgs
    .map((m) => `${m.role === 'user' ? 'USER' : 'ASSISTANT'}: ${m.content}`)
    .join('\n\n');

  const response = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 300,
    messages: [
      {
        role: 'user',
        content: `Summarize the following technical support conversation concisely, keeping all important technical information (versions, numbers, diagnostics, attempted solutions):\n\n${formattedConversation}`,
      },
    ],
  });

  const text =
    response.content[0].type === 'text' ? response.content[0].text : '';
  return text;
}

async function sendMessage(userMessage: string): Promise<string> {
  // Check if we need to summarize before adding the new message
  const totalCharacters = countCharacters(messages) + userMessage.length;

  if (totalCharacters > CHARACTER_LIMIT && messages.length >= 4) {
    console.log(`\n  [MEMORY] Limit reached (${totalCharacters} characters)`);
    console.log(`  [MEMORY] Summarizing ${messages.length} messages...`);

    const summary = await summarizeConversation(messages);
    summariesDone++;

    console.log(`  [MEMORY] Summary created (${summary.length} characters)`);
    console.log(`  [MEMORY] Summary: "${summary.slice(0, 100)}..."\n`);

    // Replace history with summary as context
    messages = [
      {
        role: 'user',
        content: `[Context from previous conversation]: ${summary}`,
      },
      {
        role: 'assistant',
        content:
          'Understood, I have the context from the previous conversation. How can I continue helping?',
      },
    ];
  }

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

  return text;
}

// Run the full conversation
console.log('=== Memory Management in Conversations ===');
console.log(`Character limit: ${CHARACTER_LIMIT}\n`);

for (let i = 0; i < simulatedConversation.length; i++) {
  const turn = i + 1;
  const message = simulatedConversation[i];

  console.log(`--- Turn ${turn} ---`);
  console.log(`USER: ${message}`);

  const response = await sendMessage(message);
  console.log(`ASSISTANT: ${response.slice(0, 200)}${response.length > 200 ? '...' : ''}`);

  const totalChars = countCharacters(messages);
  console.log(
    `  [State] ${messages.length} messages, ${totalChars} characters\n`
  );
}

// Final summary
console.log('=== Statistics ===');
console.log(`Total turns: ${simulatedConversation.length}`);
console.log(`Summaries performed: ${summariesDone}`);
console.log(`Final messages in history: ${messages.length}`);
console.log(`Final characters: ${countCharacters(messages)}`);
console.log(
  '\nNote: without memory management, the history would grow'
);
console.log(
  'indefinitely and eventually exceed the API context limit.'
);

console.log('\n--- Exercise 6 complete! ---');
