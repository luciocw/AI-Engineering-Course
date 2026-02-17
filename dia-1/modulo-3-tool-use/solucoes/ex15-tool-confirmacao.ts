/**
 * Solucao 15: Confirmacao do Usuario Antes de Executar
 *
 * Human-in-the-loop para tools sensiveis.
 * Execute: npx tsx solucoes/ex15-tool-confirmacao.ts
 */

import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic();

// === Sistema de arquivos simulado ===

const arquivosDB: Record<string, string> = {
  'relatorio.txt': 'Relatorio de vendas Q1 2026...',
  'config.json': '{"theme": "dark", "lang": "pt"}',
  'notas.md': '# Notas da reuniao\n- Ponto 1\n- Ponto 2',
  'rascunho.txt': 'Texto provisorio para deletar depois',
};

// === Classificacao de risco ===

type ToolRisco = 'segura' | 'sensivel';

const toolRiscos: Record<string, ToolRisco> = {
  listar_arquivos: 'segura',
  ler_arquivo: 'segura',
  deletar_arquivo: 'sensivel',
  enviar_email: 'sensivel',
  renomear_arquivo: 'sensivel',
};

// === Tools ===

const tools: Anthropic.Tool[] = [
  {
    name: 'listar_arquivos',
    description: 'Lista todos os arquivos disponiveis no diretorio. Operacao segura de leitura.',
    input_schema: {
      type: 'object' as const,
      properties: {},
      required: [],
    },
  },
  {
    name: 'ler_arquivo',
    description: 'Le o conteudo de um arquivo pelo nome. Operacao segura de leitura.',
    input_schema: {
      type: 'object' as const,
      properties: {
        nome: { type: 'string', description: 'Nome do arquivo para ler' },
      },
      required: ['nome'],
    },
  },
  {
    name: 'deletar_arquivo',
    description:
      'Deleta permanentemente um arquivo. ATENCAO: operacao irreversivel que requer confirmacao.',
    input_schema: {
      type: 'object' as const,
      properties: {
        nome: { type: 'string', description: 'Nome do arquivo para deletar' },
      },
      required: ['nome'],
    },
  },
  {
    name: 'enviar_email',
    description:
      'Envia um email. Operacao sensivel que requer confirmacao antes de enviar.',
    input_schema: {
      type: 'object' as const,
      properties: {
        para: { type: 'string', description: 'Email do destinatario' },
        assunto: { type: 'string', description: 'Assunto do email' },
        corpo: { type: 'string', description: 'Corpo do email' },
      },
      required: ['para', 'assunto', 'corpo'],
    },
  },
  {
    name: 'renomear_arquivo',
    description: 'Renomeia um arquivo. Operacao sensivel que requer confirmacao.',
    input_schema: {
      type: 'object' as const,
      properties: {
        nome_atual: { type: 'string', description: 'Nome atual do arquivo' },
        nome_novo: { type: 'string', description: 'Novo nome para o arquivo' },
      },
      required: ['nome_atual', 'nome_novo'],
    },
  },
];

// === Handlers ===

function handleListarArquivos(): string {
  return JSON.stringify({
    arquivos: Object.keys(arquivosDB),
    total: Object.keys(arquivosDB).length,
  });
}

function handleLerArquivo(input: { nome: string }): string {
  const conteudo = arquivosDB[input.nome];
  if (!conteudo) return JSON.stringify({ erro: `Arquivo "${input.nome}" nao encontrado` });
  return JSON.stringify({ nome: input.nome, conteudo, tamanho: conteudo.length });
}

function handleDeletarArquivo(input: { nome: string }): string {
  if (!arquivosDB[input.nome]) {
    return JSON.stringify({ erro: `Arquivo "${input.nome}" nao encontrado` });
  }
  delete arquivosDB[input.nome];
  return JSON.stringify({ deletado: input.nome, status: 'sucesso' });
}

function handleEnviarEmail(input: { para: string; assunto: string; corpo: string }): string {
  return JSON.stringify({
    status: 'enviado',
    para: input.para,
    assunto: input.assunto,
    timestamp: new Date().toISOString(),
  });
}

function handleRenomearArquivo(input: { nome_atual: string; nome_novo: string }): string {
  if (!arquivosDB[input.nome_atual]) {
    return JSON.stringify({ erro: `Arquivo "${input.nome_atual}" nao encontrado` });
  }
  arquivosDB[input.nome_novo] = arquivosDB[input.nome_atual];
  delete arquivosDB[input.nome_atual];
  return JSON.stringify({ renomeado: { de: input.nome_atual, para: input.nome_novo } });
}

function executarTool(name: string, input: Record<string, unknown>): string {
  switch (name) {
    case 'listar_arquivos':
      return handleListarArquivos();
    case 'ler_arquivo':
      return handleLerArquivo(input as { nome: string });
    case 'deletar_arquivo':
      return handleDeletarArquivo(input as { nome: string });
    case 'enviar_email':
      return handleEnviarEmail(input as { para: string; assunto: string; corpo: string });
    case 'renomear_arquivo':
      return handleRenomearArquivo(input as { nome_atual: string; nome_novo: string });
    default:
      return `Tool desconhecida: ${name}`;
  }
}

// === Fluxo de confirmacao ===

// Set para rastrear tools que ja foram confirmadas neste turno
const toolsConfirmadas = new Set<string>();

function processarToolCall(
  name: string,
  input: Record<string, unknown>,
  toolUseId: string
): { content: string; isError: boolean } {
  const risco = toolRiscos[name] || 'sensivel';

  if (risco === 'sensivel' && !toolsConfirmadas.has(toolUseId)) {
    // Retorna pedido de confirmacao como resultado da tool
    const descricao = gerarDescricaoAcao(name, input);
    return {
      content: `CONFIRMACAO_NECESSARIA: ${descricao}. Por favor, peca ao usuario para confirmar esta acao.`,
      isError: false,
    };
  }

  const resultado = executarTool(name, input);
  return { content: resultado, isError: false };
}

function gerarDescricaoAcao(name: string, input: Record<string, unknown>): string {
  switch (name) {
    case 'deletar_arquivo':
      return `Deletar permanentemente o arquivo "${input.nome}"`;
    case 'enviar_email':
      return `Enviar email para "${input.para}" com assunto "${input.assunto}"`;
    case 'renomear_arquivo':
      return `Renomear arquivo de "${input.nome_atual}" para "${input.nome_novo}"`;
    default:
      return `Executar ${name}`;
  }
}

// === Loop com confirmacao ===

async function runWithConfirmation(perguntas: string[]): Promise<void> {
  const messages: Anthropic.MessageParam[] = [];

  const systemPrompt = `Voce e um assistente de gerenciamento de arquivos.
Quando uma tool retornar "CONFIRMACAO_NECESSARIA", voce DEVE:
1. Informar ao usuario exatamente o que sera feito
2. Pedir confirmacao explicita antes de prosseguir
3. Se o usuario confirmar, executar a tool novamente
4. Se o usuario negar, cancelar a operacao`;

  for (const pergunta of perguntas) {
    console.log(`\n${'='.repeat(50)}`);
    console.log(`Usuario: ${pergunta}`);
    console.log('='.repeat(50));

    messages.push({ role: 'user', content: pergunta });

    let continueLoop = true;

    while (continueLoop) {
      const response = await client.messages.create({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 1024,
        system: systemPrompt,
        tools,
        messages,
      });

      const toolResults: Anthropic.ToolResultBlockParam[] = [];

      for (const block of response.content) {
        if (block.type === 'text') {
          console.log(`\nClaude: ${block.text}`);
        } else if (block.type === 'tool_use') {
          const risco = toolRiscos[block.name] || 'sensivel';
          console.log(`  [Tool: ${block.name} (risco: ${risco})]`);

          const { content, isError } = processarToolCall(
            block.name,
            block.input as Record<string, unknown>,
            block.id
          );

          console.log(`  [${content.startsWith('CONFIRMACAO') ? 'PEDE CONFIRMACAO' : 'Executado'}: ${content.slice(0, 80)}...]`);

          toolResults.push({
            type: 'tool_result',
            tool_use_id: block.id,
            content,
            is_error: isError,
          });
        }
      }

      if (response.stop_reason === 'tool_use') {
        messages.push({ role: 'assistant', content: response.content });
        messages.push({ role: 'user', content: toolResults });
      } else {
        messages.push({ role: 'assistant', content: response.content });
        continueLoop = false;
      }
    }
  }
}

// Simula conversa com confirmacao
await runWithConfirmation([
  'Liste os arquivos disponiveis',
  'Leia o conteudo do arquivo notas.md',
  'Delete o arquivo rascunho.txt',
  'Sim, pode deletar o rascunho.txt',
]);

console.log('\n\nArquivos restantes:', Object.keys(arquivosDB));
console.log('\n--- Exercicio 15 completo! ---');
