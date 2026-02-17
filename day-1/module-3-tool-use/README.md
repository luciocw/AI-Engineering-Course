# Modulo 3: Tool Use & Function Calling

Aprenda a dar "superpoderes" ao Claude: ferramentas que ele pode chamar para buscar dados, fazer calculos e interagir com APIs reais.

## Exercicios

| # | Arquivo | Topico | Dificuldade |
|---|---------|--------|-------------|
| 1 | `ex1-primeira-tool.ts` | Calculadora — loop completo de tool use | Iniciante |
| 2 | `ex2-multiplas-tools.ts` | 3 tools: calc, conversor, data | Intermediario |
| 3 | `ex3-api-real.ts` | Tool que chama API real (ViaCEP) | Intermediario |
| 4 | `ex4-tool-encadeada.ts` | Chaining: dados → metricas → relatorio | Avancado |
| 5 | `ex5-error-handling.ts` | Retries, timeouts, degradacao graceful | Avancado |

## Conceitos

### O que e Tool Use?

O Claude pode "chamar funcoes" que voce define. O fluxo e:

1. Voce define tools (schema JSON) na chamada da API
2. Claude decide quando usar uma tool e retorna `tool_use` com os parametros
3. Voce executa a funcao localmente e retorna o resultado como `tool_result`
4. Claude usa o resultado para formular a resposta final

### Anatomia de uma Tool

```typescript
const tool = {
  name: 'calculadora',
  description: 'Faz calculos matematicos',
  input_schema: {
    type: 'object',
    properties: {
      expressao: { type: 'string', description: 'Expressao matematica' },
    },
    required: ['expressao'],
  },
};
```

### O Loop de Tool Use

```
Usuario pergunta → Claude decide usar tool → Voce executa →
Claude recebe resultado → Claude responde
```

## Como executar

```bash
npm install
npx tsx exercicios/ex1-primeira-tool.ts   # Exercicio com TODOs
npx tsx solucoes/ex1-primeira-tool.ts      # Solucao completa
npm test                                    # Testes (sem API)
```

## Checklist

- [ ] Entendi o fluxo request → tool_use → tool_result → response
- [ ] Sei definir input_schema com JSON Schema
- [ ] Consigo lidar com multiplas tools
- [ ] Sei encadear tools (output de uma → input de outra)
- [ ] Implementei error handling robusto
