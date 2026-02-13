# Modulo 1: Templates Dinamicos com Handlebars

**Duracao:** 2 horas
**Objetivo:** Dominar templates dinamicos e aplicar na criacao de prompts para AI

## Por que Handlebars?

Prompts para LLMs sao templates com variaveis. Handlebars resolve isso de forma elegante:

```typescript
// Sem templates - concatenacao fragil
const prompt = "Ola " + nome + ", voce tem " + items.length + " itens";

// Com Handlebars - limpo e reutilizavel
const prompt = "Ola {{nome}}, voce tem {{items.length}} itens";
```

No mundo real, AI Engineers usam templates para:
- System prompts com variaveis de contexto
- Email templates personalizados por usuario
- Prompts com few-shot examples dinamicos
- Pipelines de dados com formatacao consistente

## Exercicios

| # | Arquivo | Topico | Dificuldade |
|---|---------|--------|-------------|
| 1 | `ex1-email-basico.ts` | Variaveis e templates basicos | Iniciante |
| 2 | `ex2-condicionais.ts` | If/else, unless | Iniciante |
| 3 | `ex3-loops.ts` | Each, arrays, objetos | Intermediario |
| 4 | `ex4-helpers.ts` | Helpers customizados | Intermediario |
| 5 | `ex5-prompt-ai.ts` | Templates para prompts de AI | Avancado |

## Como Usar

```bash
# 1. Instale dependencias
npm install

# 2. Execute cada exercicio na ordem
npx tsx exercicios/ex1-email-basico.ts

# 3. Tente resolver os TODOs antes de ver solucoes
# 4. Compare com a solucao
npx tsx solucoes/ex1-email-basico.ts

# 5. Rode os testes
npm test
```

## Conceitos

### Variaveis
```handlebars
Ola {{nome}}, bem-vindo ao {{curso}}!
```

### Condicionais
```handlebars
{{#if premium}}Acesso VIP{{else}}Acesso basico{{/if}}
```

### Loops
```handlebars
{{#each produtos}}
  - {{this.nome}}: R${{this.preco}}
{{/each}}
```

### Helpers Customizados
```typescript
Handlebars.registerHelper('uppercase', (text: string) => text.toUpperCase());
// Uso: {{uppercase nome}} -> "JOAO"
```

## Checklist

- [ ] Exercicio 1: Template de email basico
- [ ] Exercicio 2: Condicionais (if/else/unless)
- [ ] Exercicio 3: Loops com each
- [ ] Exercicio 4: Helpers customizados
- [ ] Exercicio 5: Templates para prompts de AI
- [ ] Desafio: Sistema de templates completo
- [ ] Testes passando

## Proximo

Ao completar, siga para o [Modulo 2: Claude API](../modulo-2-claude-api/).
