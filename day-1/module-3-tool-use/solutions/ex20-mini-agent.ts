/**
 * Solution 20: Mini Autonomous Agent (Capstone)
 *
 * Agent that manages projects using tools autonomously.
 * Run: npx tsx solutions/ex20-mini-agent.ts
 */

import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic();

// === Simulated environment: Project Management ===

interface Task {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'in_progress' | 'completed';
  priority: 'low' | 'medium' | 'high' | 'critical';
  assignee?: string;
  deadline?: string;
}

interface Project {
  id: string;
  name: string;
  description: string;
  tasks: Task[];
  createdAt: string;
}

interface TeamMember {
  id: string;
  name: string;
  role: string;
  available: boolean;
  skills: string[];
}

const projectsDB: Project[] = [
  {
    id: 'proj-1',
    name: 'Launch v2',
    description: 'Launch of product version 2.0',
    tasks: [
      { id: 't1', title: 'New dashboard design', description: 'Redesign the interface', status: 'completed', priority: 'high', assignee: 'Julia' },
    ],
    createdAt: '2026-01-15',
  },
  {
    id: 'proj-2',
    name: 'Infra Migration',
    description: 'Migration to new cloud infrastructure',
    tasks: [
      { id: 't2', title: 'Setup Kubernetes', description: 'Configure K8s cluster', status: 'in_progress', priority: 'critical', assignee: 'Pedro' },
    ],
    createdAt: '2026-02-01',
  },
];

const teamDB: TeamMember[] = [
  { id: 'm1', name: 'Ana', role: 'Backend Developer', available: true, skills: ['Node.js', 'Python', 'APIs'] },
  { id: 'm2', name: 'Carlos', role: 'Frontend Developer', available: true, skills: ['React', 'TypeScript', 'CSS'] },
  { id: 'm3', name: 'Julia', role: 'UX Designer', available: false, skills: ['Figma', 'UX Research', 'Design Systems'] },
  { id: 'm4', name: 'Pedro', role: 'DevOps Engineer', available: false, skills: ['Docker', 'Kubernetes', 'CI/CD'] },
  { id: 'm5', name: 'Marina', role: 'QA Engineer', available: true, skills: ['Testing', 'Automation', 'Cypress'] },
  { id: 'm6', name: 'Rafael', role: 'Tech Lead', available: true, skills: ['Architecture', 'Code Review', 'Mentoring'] },
];

let nextTaskId = 100;

// === Tools ===

const tools: Anthropic.Tool[] = [
  {
    name: 'list_projects',
    description: 'Lists all active projects with name, description, and task count.',
    input_schema: {
      type: 'object' as const,
      properties: {},
      required: [],
    },
  },
  {
    name: 'view_tasks',
    description: 'Lists all tasks for a specific project with status, priority, and assignee.',
    input_schema: {
      type: 'object' as const,
      properties: {
        project_id: { type: 'string', description: 'Project ID (e.g.: proj-1)' },
      },
      required: ['project_id'],
    },
  },
  {
    name: 'create_task',
    description: 'Creates a new task in a project. Returns the created task with a generated ID.',
    input_schema: {
      type: 'object' as const,
      properties: {
        project_id: { type: 'string', description: 'Project ID' },
        title: { type: 'string', description: 'Task title' },
        description: { type: 'string', description: 'Detailed description' },
        priority: { type: 'string', enum: ['low', 'medium', 'high', 'critical'], description: 'Priority level' },
        deadline: { type: 'string', description: 'Deadline in YYYY-MM-DD format (optional)' },
      },
      required: ['project_id', 'title', 'description', 'priority'],
    },
  },
  {
    name: 'assign_task',
    description: 'Assigns an existing task to a team member.',
    input_schema: {
      type: 'object' as const,
      properties: {
        project_id: { type: 'string', description: 'Project ID' },
        task_id: { type: 'string', description: 'Task ID' },
        member_name: { type: 'string', description: 'Team member name' },
      },
      required: ['project_id', 'task_id', 'member_name'],
    },
  },
  {
    name: 'list_team',
    description: 'Lists all team members with role, availability, and skills.',
    input_schema: {
      type: 'object' as const,
      properties: {
        available_only: {
          type: 'boolean',
          description: 'If true, returns only available members (default: false)',
        },
      },
      required: [],
    },
  },
  {
    name: 'update_task',
    description: 'Updates the status or priority of an existing task.',
    input_schema: {
      type: 'object' as const,
      properties: {
        project_id: { type: 'string', description: 'Project ID' },
        task_id: { type: 'string', description: 'Task ID' },
        status: { type: 'string', enum: ['pending', 'in_progress', 'completed'], description: 'New status' },
        priority: { type: 'string', enum: ['low', 'medium', 'high', 'critical'], description: 'New priority' },
      },
      required: ['project_id', 'task_id'],
    },
  },
  {
    name: 'generate_project_report',
    description: 'Generates a complete report of the current state of a project with metrics.',
    input_schema: {
      type: 'object' as const,
      properties: {
        project_id: { type: 'string', description: 'Project ID' },
      },
      required: ['project_id'],
    },
  },
];

// === Handlers ===

function handleListProjects(): string {
  return JSON.stringify(projectsDB.map((p) => ({
    id: p.id,
    name: p.name,
    description: p.description,
    total_tasks: p.tasks.length,
    created_at: p.createdAt,
  })));
}

function handleViewTasks(input: { project_id: string }): string {
  const project = projectsDB.find((p) => p.id === input.project_id);
  if (!project) return JSON.stringify({ error: `Project "${input.project_id}" not found` });
  return JSON.stringify({
    project: project.name,
    tasks: project.tasks,
    summary: {
      total: project.tasks.length,
      pending: project.tasks.filter((t) => t.status === 'pending').length,
      in_progress: project.tasks.filter((t) => t.status === 'in_progress').length,
      completed: project.tasks.filter((t) => t.status === 'completed').length,
    },
  });
}

function handleCreateTask(input: {
  project_id: string;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  deadline?: string;
}): string {
  const project = projectsDB.find((p) => p.id === input.project_id);
  if (!project) return JSON.stringify({ error: `Project "${input.project_id}" not found` });

  const task: Task = {
    id: `t${nextTaskId++}`,
    title: input.title,
    description: input.description,
    status: 'pending',
    priority: input.priority,
    deadline: input.deadline,
  };

  project.tasks.push(task);
  return JSON.stringify({ created: task, project: project.name });
}

function handleAssignTask(input: {
  project_id: string;
  task_id: string;
  member_name: string;
}): string {
  const project = projectsDB.find((p) => p.id === input.project_id);
  if (!project) return JSON.stringify({ error: `Project not found` });

  const task = project.tasks.find((t) => t.id === input.task_id);
  if (!task) return JSON.stringify({ error: `Task "${input.task_id}" not found` });

  const member = teamDB.find((m) => m.name.toLowerCase() === input.member_name.toLowerCase());
  if (!member) return JSON.stringify({ error: `Member "${input.member_name}" not found` });

  task.assignee = member.name;
  if (task.status === 'pending') task.status = 'in_progress';

  return JSON.stringify({
    assigned: {
      task: task.title,
      assignee: member.name,
      role: member.role,
      status: task.status,
    },
  });
}

function handleListTeam(input: { available_only?: boolean }): string {
  let members = teamDB;
  if (input.available_only) {
    members = members.filter((m) => m.available);
  }
  return JSON.stringify(members.map((m) => ({
    name: m.name,
    role: m.role,
    available: m.available,
    skills: m.skills,
  })));
}

function handleUpdateTask(input: {
  project_id: string;
  task_id: string;
  status?: string;
  priority?: string;
}): string {
  const project = projectsDB.find((p) => p.id === input.project_id);
  if (!project) return JSON.stringify({ error: `Project not found` });

  const task = project.tasks.find((t) => t.id === input.task_id);
  if (!task) return JSON.stringify({ error: `Task not found` });

  if (input.status) task.status = input.status as Task['status'];
  if (input.priority) task.priority = input.priority as Task['priority'];

  return JSON.stringify({ updated: task });
}

function handleGenerateReport(input: { project_id: string }): string {
  const project = projectsDB.find((p) => p.id === input.project_id);
  if (!project) return JSON.stringify({ error: `Project not found` });

  const tasks = project.tasks;
  const byStatus = {
    pending: tasks.filter((t) => t.status === 'pending'),
    in_progress: tasks.filter((t) => t.status === 'in_progress'),
    completed: tasks.filter((t) => t.status === 'completed'),
  };

  const byPriority = {
    critical: tasks.filter((t) => t.priority === 'critical').length,
    high: tasks.filter((t) => t.priority === 'high').length,
    medium: tasks.filter((t) => t.priority === 'medium').length,
    low: tasks.filter((t) => t.priority === 'low').length,
  };

  const progress = tasks.length > 0
    ? Math.round((byStatus.completed.length / tasks.length) * 100)
    : 0;

  return JSON.stringify({
    project: project.name,
    description: project.description,
    created_at: project.createdAt,
    metrics: {
      total_tasks: tasks.length,
      progress: `${progress}%`,
      by_status: {
        pending: byStatus.pending.length,
        in_progress: byStatus.in_progress.length,
        completed: byStatus.completed.length,
      },
      by_priority: byPriority,
    },
    pending_tasks: byStatus.pending.map((t) => ({
      id: t.id,
      title: t.title,
      priority: t.priority,
      assignee: t.assignee || 'Unassigned',
    })),
    in_progress_tasks: byStatus.in_progress.map((t) => ({
      id: t.id,
      title: t.title,
      assignee: t.assignee,
    })),
  }, null, 2);
}

function dispatchTool(name: string, input: Record<string, unknown>): string {
  switch (name) {
    case 'list_projects':
      return handleListProjects();
    case 'view_tasks':
      return handleViewTasks(input as { project_id: string });
    case 'create_task':
      return handleCreateTask(input as {
        project_id: string;
        title: string;
        description: string;
        priority: 'low' | 'medium' | 'high' | 'critical';
        deadline?: string;
      });
    case 'assign_task':
      return handleAssignTask(input as {
        project_id: string;
        task_id: string;
        member_name: string;
      });
    case 'list_team':
      return handleListTeam(input as { available_only?: boolean });
    case 'update_task':
      return handleUpdateTask(input as {
        project_id: string;
        task_id: string;
        status?: string;
        priority?: string;
      });
    case 'generate_project_report':
      return handleGenerateReport(input as { project_id: string });
    default:
      return `Unknown tool: ${name}`;
  }
}

// === Agent System Prompt ===

const systemPrompt = `You are an autonomous and methodical project manager agent.

Your work process:
1. ALWAYS start by listing projects and team to understand the context
2. Check existing tasks before creating new ones (avoid duplicates)
3. When assigning tasks, consider member skills and availability
4. Create tasks with clear descriptions and appropriate priorities
5. At the end, ALWAYS generate a project report to show the result

Rules:
- Do not assign tasks to unavailable members
- Backend tasks go to backend developers
- Frontend tasks go to frontend developers
- QA tasks go to QA engineers
- If no suitable member is available, leave the task unassigned

Response format:
- Explain each decision made
- At the end, provide a summary of what was accomplished`;

// === Agent Loop ===

async function runAgent(objective: string, maxIterations = 15): Promise<void> {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`AGENT: Starting...`);
  console.log(`Objective: "${objective}"`);
  console.log(`Max iterations: ${maxIterations}`);
  console.log('='.repeat(60));

  const messages: Anthropic.MessageParam[] = [
    { role: 'user', content: objective },
  ];

  for (let iteration = 1; iteration <= maxIterations; iteration++) {
    console.log(`\n--- Iteration ${iteration}/${maxIterations} ---`);

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
        console.log(`\nAgent: ${block.text}`);
      } else if (block.type === 'tool_use') {
        console.log(`  [Action: ${block.name}(${JSON.stringify(block.input).slice(0, 80)}...)]`);
        const result = dispatchTool(block.name, block.input as Record<string, unknown>);
        console.log(`  [Result: ${result.slice(0, 100)}...]`);
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
      console.log(`\n[Agent finished at iteration ${iteration}]`);
      break;
    }

    if (iteration === maxIterations) {
      console.log('\n[Iteration limit reached]');
    }
  }
}

// === Run the agent ===

await runAgent(
  'Organize the "Launch v2" project (proj-1): create tasks to implement the backend API, ' +
  'develop the frontend interface, and set up automated QA tests. ' +
  'Assign each task to the most suitable available team member. ' +
  'At the end, generate a complete project report.'
);

console.log('\n--- Exercise 20 complete! ---');
