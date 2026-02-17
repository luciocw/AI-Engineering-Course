# Modulo 2: Claude API + Prompt Engineering Avancado

**Duracao:** 2 horas
**Objetivo:** Dominar a Claude API e tecnicas avancadas de prompt engineering

## Por que Claude API?

Todo AI Engineer precisa dominar chamadas a LLMs. A Claude API e a base de tudo que vem depois: RAG, agents, tool use. Neste modulo voce vai de "hello world" a chain-of-thought.

Tecnicas cobertas:
- System prompts para controlar comportamento
- Conversacoes multi-turn com contexto
- Parametros (temperature, max_tokens, stop_sequences)
- Few-shot learning para classificacao
- Chain-of-thought para raciocinio complexo

## Pre-requisitos

- Modulo 1 completo
- `ANTHROPIC_API_KEY` configurada no `.env`

## Exercicios

| # | Arquivo | Topico | Dificuldade |
|---|---------|--------|-------------|
| 1 | `ex1-hello-world.ts` | Primeira chamada, response shape, tokens | Iniciante |
| 2 | `ex2-system-prompt.ts` | 3 personas, comparar outputs | Iniciante |
| 3 | `ex3-conversacao.ts` | Multi-turn, acumular contexto | Intermediario |
| 4 | `ex4-parametros.ts` | Temperature, max_tokens, stop_sequences | Intermediario |
| 5 | `ex5-handlebars-integration.ts` | Templates Handlebars + API | Intermediario |
| 6 | `ex6-few-shot.ts` | Zero-shot vs few-shot classificador | Avancado |
| 7 | `ex7-chain-of-thought.ts` | Direto vs CoT vs CoT estruturado | Avancado |

## Como Usar

```bash
npm install
npx tsx exercicios/ex1-hello-world.ts
npx tsx solucoes/ex1-hello-world.ts
npm test
```

## Conceitos

### Chamada basica
```typescript
import Anthropic from '@anthropic-ai/sdk';
const client = new Anthropic();
const response = await client.messages.create({
  model: 'claude-haiku-4-5-20251001',
  max_tokens: 300,
  messages: [{ role: 'user', content: 'Ola!' }],
});
console.log(response.content[0].text);
```

### System prompt
```typescript
const response = await client.messages.create({
  model: 'claude-haiku-4-5-20251001',
  max_tokens: 300,
  system: 'Voce e um assistente tecnico. Responda em portugues.',
  messages: [{ role: 'user', content: pergunta }],
});
```

### Multi-turn
```typescript
const messages = [
  { role: 'user', content: 'Meu app crashou' },
  { role: 'assistant', content: 'Qual o erro?' },
  { role: 'user', content: 'TypeError: undefined' },
];
```

## Checklist

- [ ] Exercicio 1: Hello World com Claude API
- [ ] Exercicio 2: System prompts e personas
- [ ] Exercicio 3: Conversacao multi-turn
- [ ] Exercicio 4: Parametros (temperature, tokens)
- [ ] Exercicio 5: Integracao Handlebars + API
- [ ] Exercicio 6: Few-shot learning
- [ ] Exercicio 7: Chain-of-thought
- [ ] Desafio: Framework de A/B testing de prompts
- [ ] Testes passando

## Proximo

Ao completar, siga para o [Modulo 3: Tool Use](../modulo-3-tool-use/).
