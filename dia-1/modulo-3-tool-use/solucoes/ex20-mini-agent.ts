/**
 * Solucao 20: Mini Agente Autonomo (Capstone)
 *
 * Agente que gerencia projetos usando tools de forma autonoma.
 * Execute: npx tsx solucoes/ex20-mini-agent.ts
 */

import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic();

// === Ambiente simulado: Gerenciamento de Projetos ===

interface Tarefa {
  id: string;
  titulo: string;
  descricao: string;
  status: 'pendente' | 'em_andamento' | 'concluida';
  prioridade: 'baixa' | 'media' | 'alta' | 'critica';
  responsavel?: string;
  prazo?: string;
}

interface Projeto {
  id: string;
  nome: string;
  descricao: string;
  tarefas: Tarefa[];
  criadoEm: string;
}

interface Membro {
  id: string;
  nome: string;
  cargo: string;
  disponivel: boolean;
  habilidades: string[];
}

const projetosDB: Projeto[] = [
  {
    id: 'proj-1',
    nome: 'Launch v2',
    descricao: 'Lancamento da versao 2.0 do produto',
    tarefas: [
      { id: 't1', titulo: 'Design do novo dashboard', descricao: 'Redesenhar interface', status: 'concluida', prioridade: 'alta', responsavel: 'Julia' },
    ],
    criadoEm: '2026-01-15',
  },
  {
    id: 'proj-2',
    nome: 'Infra Migration',
    descricao: 'Migracao para nova infraestrutura cloud',
    tarefas: [
      { id: 't2', titulo: 'Setup Kubernetes', descricao: 'Configurar cluster K8s', status: 'em_andamento', prioridade: 'critica', responsavel: 'Pedro' },
    ],
    criadoEm: '2026-02-01',
  },
];

const equipeDB: Membro[] = [
  { id: 'm1', nome: 'Ana', cargo: 'Backend Developer', disponivel: true, habilidades: ['Node.js', 'Python', 'APIs'] },
  { id: 'm2', nome: 'Carlos', cargo: 'Frontend Developer', disponivel: true, habilidades: ['React', 'TypeScript', 'CSS'] },
  { id: 'm3', nome: 'Julia', cargo: 'UX Designer', disponivel: false, habilidades: ['Figma', 'UX Research', 'Design Systems'] },
  { id: 'm4', nome: 'Pedro', cargo: 'DevOps Engineer', disponivel: false, habilidades: ['Docker', 'Kubernetes', 'CI/CD'] },
  { id: 'm5', nome: 'Marina', cargo: 'QA Engineer', disponivel: true, habilidades: ['Testes', 'Automacao', 'Cypress'] },
  { id: 'm6', nome: 'Rafael', cargo: 'Tech Lead', disponivel: true, habilidades: ['Arquitetura', 'Code Review', 'Mentoria'] },
];

let nextTarefaId = 100;

// === Tools ===

const tools: Anthropic.Tool[] = [
  {
    name: 'listar_projetos',
    description: 'Lista todos os projetos ativos com nome, descricao e quantidade de tarefas.',
    input_schema: {
      type: 'object' as const,
      properties: {},
      required: [],
    },
  },
  {
    name: 'ver_tarefas',
    description: 'Lista todas as tarefas de um projeto especifico com status, prioridade e responsavel.',
    input_schema: {
      type: 'object' as const,
      properties: {
        projeto_id: { type: 'string', description: 'ID do projeto (ex: proj-1)' },
      },
      required: ['projeto_id'],
    },
  },
  {
    name: 'criar_tarefa',
    description: 'Cria uma nova tarefa em um projeto. Retorna a tarefa criada com ID gerado.',
    input_schema: {
      type: 'object' as const,
      properties: {
        projeto_id: { type: 'string', description: 'ID do projeto' },
        titulo: { type: 'string', description: 'Titulo da tarefa' },
        descricao: { type: 'string', description: 'Descricao detalhada' },
        prioridade: { type: 'string', enum: ['baixa', 'media', 'alta', 'critica'], description: 'Nivel de prioridade' },
        prazo: { type: 'string', description: 'Prazo no formato YYYY-MM-DD (opcional)' },
      },
      required: ['projeto_id', 'titulo', 'descricao', 'prioridade'],
    },
  },
  {
    name: 'atribuir_tarefa',
    description: 'Atribui uma tarefa existente a um membro da equipe.',
    input_schema: {
      type: 'object' as const,
      properties: {
        projeto_id: { type: 'string', description: 'ID do projeto' },
        tarefa_id: { type: 'string', description: 'ID da tarefa' },
        membro_nome: { type: 'string', description: 'Nome do membro da equipe' },
      },
      required: ['projeto_id', 'tarefa_id', 'membro_nome'],
    },
  },
  {
    name: 'listar_equipe',
    description: 'Lista todos os membros da equipe com cargo, disponibilidade e habilidades.',
    input_schema: {
      type: 'object' as const,
      properties: {
        apenas_disponiveis: {
          type: 'boolean',
          description: 'Se true, retorna apenas membros disponiveis (default: false)',
        },
      },
      required: [],
    },
  },
  {
    name: 'atualizar_tarefa',
    description: 'Atualiza o status ou prioridade de uma tarefa existente.',
    input_schema: {
      type: 'object' as const,
      properties: {
        projeto_id: { type: 'string', description: 'ID do projeto' },
        tarefa_id: { type: 'string', description: 'ID da tarefa' },
        status: { type: 'string', enum: ['pendente', 'em_andamento', 'concluida'], description: 'Novo status' },
        prioridade: { type: 'string', enum: ['baixa', 'media', 'alta', 'critica'], description: 'Nova prioridade' },
      },
      required: ['projeto_id', 'tarefa_id'],
    },
  },
  {
    name: 'gerar_relatorio_projeto',
    description: 'Gera um relatorio completo do estado atual de um projeto com metricas.',
    input_schema: {
      type: 'object' as const,
      properties: {
        projeto_id: { type: 'string', description: 'ID do projeto' },
      },
      required: ['projeto_id'],
    },
  },
];

// === Handlers ===

function handleListarProjetos(): string {
  return JSON.stringify(projetosDB.map((p) => ({
    id: p.id,
    nome: p.nome,
    descricao: p.descricao,
    total_tarefas: p.tarefas.length,
    criado_em: p.criadoEm,
  })));
}

function handleVerTarefas(input: { projeto_id: string }): string {
  const projeto = projetosDB.find((p) => p.id === input.projeto_id);
  if (!projeto) return JSON.stringify({ erro: `Projeto "${input.projeto_id}" nao encontrado` });
  return JSON.stringify({
    projeto: projeto.nome,
    tarefas: projeto.tarefas,
    resumo: {
      total: projeto.tarefas.length,
      pendentes: projeto.tarefas.filter((t) => t.status === 'pendente').length,
      em_andamento: projeto.tarefas.filter((t) => t.status === 'em_andamento').length,
      concluidas: projeto.tarefas.filter((t) => t.status === 'concluida').length,
    },
  });
}

function handleCriarTarefa(input: {
  projeto_id: string;
  titulo: string;
  descricao: string;
  prioridade: 'baixa' | 'media' | 'alta' | 'critica';
  prazo?: string;
}): string {
  const projeto = projetosDB.find((p) => p.id === input.projeto_id);
  if (!projeto) return JSON.stringify({ erro: `Projeto "${input.projeto_id}" nao encontrado` });

  const tarefa: Tarefa = {
    id: `t${nextTarefaId++}`,
    titulo: input.titulo,
    descricao: input.descricao,
    status: 'pendente',
    prioridade: input.prioridade,
    prazo: input.prazo,
  };

  projeto.tarefas.push(tarefa);
  return JSON.stringify({ criada: tarefa, projeto: projeto.nome });
}

function handleAtribuirTarefa(input: {
  projeto_id: string;
  tarefa_id: string;
  membro_nome: string;
}): string {
  const projeto = projetosDB.find((p) => p.id === input.projeto_id);
  if (!projeto) return JSON.stringify({ erro: `Projeto nao encontrado` });

  const tarefa = projeto.tarefas.find((t) => t.id === input.tarefa_id);
  if (!tarefa) return JSON.stringify({ erro: `Tarefa "${input.tarefa_id}" nao encontrada` });

  const membro = equipeDB.find((m) => m.nome.toLowerCase() === input.membro_nome.toLowerCase());
  if (!membro) return JSON.stringify({ erro: `Membro "${input.membro_nome}" nao encontrado` });

  tarefa.responsavel = membro.nome;
  if (tarefa.status === 'pendente') tarefa.status = 'em_andamento';

  return JSON.stringify({
    atribuida: {
      tarefa: tarefa.titulo,
      responsavel: membro.nome,
      cargo: membro.cargo,
      status: tarefa.status,
    },
  });
}

function handleListarEquipe(input: { apenas_disponiveis?: boolean }): string {
  let membros = equipeDB;
  if (input.apenas_disponiveis) {
    membros = membros.filter((m) => m.disponivel);
  }
  return JSON.stringify(membros.map((m) => ({
    nome: m.nome,
    cargo: m.cargo,
    disponivel: m.disponivel,
    habilidades: m.habilidades,
  })));
}

function handleAtualizarTarefa(input: {
  projeto_id: string;
  tarefa_id: string;
  status?: string;
  prioridade?: string;
}): string {
  const projeto = projetosDB.find((p) => p.id === input.projeto_id);
  if (!projeto) return JSON.stringify({ erro: `Projeto nao encontrado` });

  const tarefa = projeto.tarefas.find((t) => t.id === input.tarefa_id);
  if (!tarefa) return JSON.stringify({ erro: `Tarefa nao encontrada` });

  if (input.status) tarefa.status = input.status as Tarefa['status'];
  if (input.prioridade) tarefa.prioridade = input.prioridade as Tarefa['prioridade'];

  return JSON.stringify({ atualizada: tarefa });
}

function handleGerarRelatorio(input: { projeto_id: string }): string {
  const projeto = projetosDB.find((p) => p.id === input.projeto_id);
  if (!projeto) return JSON.stringify({ erro: `Projeto nao encontrado` });

  const tarefas = projeto.tarefas;
  const porStatus = {
    pendentes: tarefas.filter((t) => t.status === 'pendente'),
    em_andamento: tarefas.filter((t) => t.status === 'em_andamento'),
    concluidas: tarefas.filter((t) => t.status === 'concluida'),
  };

  const porPrioridade = {
    critica: tarefas.filter((t) => t.prioridade === 'critica').length,
    alta: tarefas.filter((t) => t.prioridade === 'alta').length,
    media: tarefas.filter((t) => t.prioridade === 'media').length,
    baixa: tarefas.filter((t) => t.prioridade === 'baixa').length,
  };

  const progresso = tarefas.length > 0
    ? Math.round((porStatus.concluidas.length / tarefas.length) * 100)
    : 0;

  return JSON.stringify({
    projeto: projeto.nome,
    descricao: projeto.descricao,
    criado_em: projeto.criadoEm,
    metricas: {
      total_tarefas: tarefas.length,
      progresso: `${progresso}%`,
      por_status: {
        pendentes: porStatus.pendentes.length,
        em_andamento: porStatus.em_andamento.length,
        concluidas: porStatus.concluidas.length,
      },
      por_prioridade: porPrioridade,
    },
    tarefas_pendentes: porStatus.pendentes.map((t) => ({
      id: t.id,
      titulo: t.titulo,
      prioridade: t.prioridade,
      responsavel: t.responsavel || 'Nao atribuida',
    })),
    tarefas_em_andamento: porStatus.em_andamento.map((t) => ({
      id: t.id,
      titulo: t.titulo,
      responsavel: t.responsavel,
    })),
  }, null, 2);
}

function dispatchTool(name: string, input: Record<string, unknown>): string {
  switch (name) {
    case 'listar_projetos':
      return handleListarProjetos();
    case 'ver_tarefas':
      return handleVerTarefas(input as { projeto_id: string });
    case 'criar_tarefa':
      return handleCriarTarefa(input as {
        projeto_id: string;
        titulo: string;
        descricao: string;
        prioridade: 'baixa' | 'media' | 'alta' | 'critica';
        prazo?: string;
      });
    case 'atribuir_tarefa':
      return handleAtribuirTarefa(input as {
        projeto_id: string;
        tarefa_id: string;
        membro_nome: string;
      });
    case 'listar_equipe':
      return handleListarEquipe(input as { apenas_disponiveis?: boolean });
    case 'atualizar_tarefa':
      return handleAtualizarTarefa(input as {
        projeto_id: string;
        tarefa_id: string;
        status?: string;
        prioridade?: string;
      });
    case 'gerar_relatorio_projeto':
      return handleGerarRelatorio(input as { projeto_id: string });
    default:
      return `Tool desconhecida: ${name}`;
  }
}

// === System Prompt do Agente ===

const systemPrompt = `Voce e um agente gerente de projetos autonomo e metodico.

Seu processo de trabalho:
1. SEMPRE comece listando projetos e equipe para entender o contexto
2. Verifique tarefas existentes antes de criar novas (evite duplicatas)
3. Ao atribuir tarefas, considere habilidades e disponibilidade dos membros
4. Crie tarefas com descricoes claras e prioridades adequadas
5. Ao final, SEMPRE gere um relatorio do projeto para mostrar o resultado

Regras:
- Nao atribua tarefas a membros indisponiveis
- Tarefas de backend vao para backend developers
- Tarefas de frontend vao para frontend developers
- Tarefas de QA vao para QA engineers
- Se ninguem adequado estiver disponivel, deixe a tarefa sem atribuicao

Formato de resposta:
- Explique cada decisao tomada
- No final, faca um resumo do que foi realizado`;

// === Loop do Agente ===

async function runAgent(objetivo: string, maxIteracoes = 15): Promise<void> {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`AGENTE: Iniciando...`);
  console.log(`Objetivo: "${objetivo}"`);
  console.log(`Max iteracoes: ${maxIteracoes}`);
  console.log('='.repeat(60));

  const messages: Anthropic.MessageParam[] = [
    { role: 'user', content: objetivo },
  ];

  for (let iteracao = 1; iteracao <= maxIteracoes; iteracao++) {
    console.log(`\n--- Iteracao ${iteracao}/${maxIteracoes} ---`);

    const response = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 2048,
      system: systemPrompt,
      tools,
      messages,
    });

    const toolResults: Anthropic.ToolResultBlockParam[] = [];

    for (const block of response.content) {
      if (block.type === 'text') {
        console.log(`\nAgente: ${block.text}`);
      } else if (block.type === 'tool_use') {
        console.log(`  [Acao: ${block.name}(${JSON.stringify(block.input).slice(0, 80)}...)]`);
        const result = dispatchTool(block.name, block.input as Record<string, unknown>);
        console.log(`  [Resultado: ${result.slice(0, 100)}...]`);
        toolResults.push({
          type: 'tool_result',
          tool_use_id: block.id,
          content: result,
        });
      }
    }

    if (response.stop_reason === 'tool_use') {
      messages.push({ role: 'assistant', content: response.content });
      messages.push({ role: 'user', content: toolResults });
    } else {
      console.log(`\n[Agente finalizou na iteracao ${iteracao}]`);
      break;
    }

    if (iteracao === maxIteracoes) {
      console.log('\n[Limite de iteracoes atingido]');
    }
  }
}

// === Executar o agente ===

await runAgent(
  'Organize o projeto "Launch v2" (proj-1): crie tarefas para implementar a API do backend, ' +
  'desenvolver a interface frontend e configurar testes automatizados de QA. ' +
  'Atribua cada tarefa para o membro mais adequado da equipe que estiver disponivel. ' +
  'No final, gere um relatorio completo do projeto.'
);

console.log('\n--- Exercicio 20 completo! ---');
