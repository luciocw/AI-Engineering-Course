# Troubleshooting

## "Cannot find module" ao rodar exercicios
```bash
# Verifique se instalou dependencias
npm install

# Use tsx para rodar TypeScript
npx tsx exercicios/ex1-email-basico.ts
```

## Erro de API key
```bash
# Verifique se .env existe e tem a key
cat .env | grep ANTHROPIC

# Recarregue variaveis
source .env
```

## Docker nao conecta ao Qdrant
```bash
# Verifique se container esta rodando
docker ps | grep qdrant

# Reinicie
docker-compose down && docker-compose up -d
```

## Testes falhando
```bash
# Execute com verbose
npm test -- --reporter=verbose
```
