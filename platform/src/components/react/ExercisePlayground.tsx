import { useState, useCallback, useRef, useEffect } from 'react';
import CodeEditor from './CodeEditor';
import OutputPanel from './OutputPanel';
import DifficultyBadge from './DifficultyBadge';
import { runExercise, type RunResult } from '@/lib/course/runner';
import { saveCode, getSavedCode, markCompleted, markIncomplete, isCompleted as checkCompleted } from '@/lib/course/progress';

type Props = {
  exerciseCode: string;
  solutionCode: string;
  exerciseSlug: string;
  moduleSlug: string;
  title: string;
  description: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimatedMinutes: number;
  canRunInBrowser: boolean;
  prevExercise: { slug: string; title: string; href: string } | null;
  nextExercise: { slug: string; title: string; href: string } | null;
};

export default function ExercisePlayground({
  exerciseCode,
  solutionCode,
  exerciseSlug,
  moduleSlug,
  title,
  description,
  difficulty,
  estimatedMinutes,
  canRunInBrowser,
  prevExercise,
  nextExercise,
}: Props) {
  // Load saved code or use exercise template
  const [code, setCode] = useState(() => {
    if (typeof window !== 'undefined') {
      return getSavedCode(moduleSlug, exerciseSlug) ?? exerciseCode;
    }
    return exerciseCode;
  });

  const [output, setOutput] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [duration, setDuration] = useState(0);
  const [showSolution, setShowSolution] = useState(false);
  const [completed, setCompleted] = useState(false);

  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Check completion on mount
  useEffect(() => {
    setCompleted(checkCompleted(moduleSlug, exerciseSlug));
  }, [moduleSlug, exerciseSlug]);

  // Auto-save code with debounce
  const handleCodeChange = useCallback(
    (newCode: string) => {
      setCode(newCode);
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
      saveTimeoutRef.current = setTimeout(() => {
        saveCode(moduleSlug, exerciseSlug, newCode);
      }, 500);
    },
    [moduleSlug, exerciseSlug]
  );

  // Run exercise
  const handleRun = useCallback(async () => {
    if (!canRunInBrowser) return;
    setIsRunning(true);
    setOutput([]);
    setError(null);

    try {
      const result: RunResult = await runExercise(code, moduleSlug);
      setOutput(result.output);
      setError(result.error);
      setDuration(result.duration);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsRunning(false);
    }
  }, [code, canRunInBrowser, moduleSlug]);

  // Reset to original
  const handleReset = useCallback(() => {
    setCode(exerciseCode);
    saveCode(moduleSlug, exerciseSlug, exerciseCode);
    setOutput([]);
    setError(null);
    setShowSolution(false);
  }, [exerciseCode, moduleSlug, exerciseSlug]);

  // Toggle completion
  const handleToggleComplete = useCallback(() => {
    if (completed) {
      markIncomplete(moduleSlug, exerciseSlug);
      setCompleted(false);
    } else {
      markCompleted(moduleSlug, exerciseSlug);
      setCompleted(true);
    }
  }, [completed, moduleSlug, exerciseSlug]);

  // Extract instructions from exercise code comments
  const instructions = extractInstructions(exerciseCode);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-[var(--color-text)]">
            {title}
          </h1>
          <p className="mt-1 text-[var(--color-text-secondary)]">{description}</p>
        </div>
        <div className="flex items-center gap-3">
          <DifficultyBadge difficulty={difficulty} />
          <span className="text-xs text-[var(--color-text-muted)] font-mono">~{estimatedMinutes}min</span>
        </div>
      </div>

      {/* Instructions */}
      {instructions.length > 0 && (
        <details className="group rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)]" open>
          <summary className="cursor-pointer px-4 py-3 text-sm font-medium text-[var(--color-text)] flex items-center justify-between">
            <span>📋 Instructions</span>
            <svg className="w-4 h-4 text-[var(--color-text-muted)] group-open:rotate-180 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </summary>
          <div className="px-4 pb-4 text-sm text-[var(--color-text-secondary)] font-mono leading-relaxed whitespace-pre-wrap border-t border-[var(--color-border)] pt-3">
            {instructions.join('\n')}
          </div>
        </details>
      )}

      {/* Not-runnable banner for M2-M4 */}
      {!canRunInBrowser && (
        <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 px-4 py-3 text-sm text-amber-400 flex items-center gap-2">
          <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>This exercise requires a local environment. Run with: <code className="bg-amber-500/10 px-1.5 py-0.5 rounded">npm run {exerciseSlug.replace(/^ex/, 'ex').split('-')[0]}</code></span>
        </div>
      )}

      {/* Code Editor */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-mono text-[var(--color-text-muted)]">
            {exerciseSlug}.ts
          </span>
          <span className="text-xs text-[var(--color-text-muted)]">
            {showSolution ? '👁 Viewing solution' : '✏️ Your code'}
          </span>
        </div>
        {showSolution ? (
          <CodeEditor code={solutionCode} readOnly height="450px" />
        ) : (
          <CodeEditor code={code} onChange={handleCodeChange} height="450px" />
        )}
      </div>

      {/* Action Bar */}
      <div className="flex flex-wrap items-center gap-3">
        {canRunInBrowser && (
          <button
            onClick={handleRun}
            disabled={isRunning}
            className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium rounded-xl bg-[var(--color-accent)] text-white hover:brightness-110 disabled:opacity-50 transition-all"
          >
            {isRunning ? (
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            ) : (
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
              </svg>
            )}
            {isRunning ? 'Running...' : 'Run'}
          </button>
        )}

        <button
          onClick={handleReset}
          className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-xl border border-[var(--color-border)] text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-hover)] transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Reset
        </button>

        <button
          onClick={() => setShowSolution(!showSolution)}
          className={`inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-xl border transition-colors ${
            showSolution
              ? 'border-[var(--color-accent)]/30 bg-[var(--color-accent)]/10 text-[var(--color-accent)]'
              : 'border-[var(--color-border)] text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-hover)]'
          }`}
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d={showSolution ? 'M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21' : 'M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z'} />
          </svg>
          {showSolution ? 'Hide Solution' : 'Show Solution'}
        </button>

        <div className="flex-1" />

        <button
          onClick={handleToggleComplete}
          className={`inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-xl border transition-colors ${
            completed
              ? 'border-[var(--color-success)]/30 bg-[var(--color-success)]/10 text-[var(--color-success)]'
              : 'border-[var(--color-border)] text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-hover)]'
          }`}
        >
          {completed ? (
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
          ) : (
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <circle cx="12" cy="12" r="9" />
            </svg>
          )}
          {completed ? 'Completed' : 'Mark Complete'}
        </button>
      </div>

      {/* Output Panel */}
      <OutputPanel output={output} error={error} isRunning={isRunning} duration={duration} />

      {/* Navigation */}
      <div className="flex items-center justify-between pt-4 border-t border-[var(--color-border)]">
        {prevExercise ? (
          <a
            href={prevExercise.href}
            className="inline-flex items-center gap-2 text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-accent)] transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            {prevExercise.title}
          </a>
        ) : <div />}

        {nextExercise ? (
          <a
            href={nextExercise.href}
            className="inline-flex items-center gap-2 text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-accent)] transition-colors"
          >
            {nextExercise.title}
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </a>
        ) : <div />}
      </div>
    </div>
  );
}

/**
 * Extracts TODO instructions from exercise code comments
 */
function extractInstructions(code: string): string[] {
  const lines = code.split('\n');
  const instructions: string[] = [];
  let inTodo = false;

  for (const line of lines) {
    const trimmed = line.trim();

    if (trimmed.startsWith('// === TODO') || trimmed.startsWith('// TODO')) {
      inTodo = true;
      instructions.push(trimmed.replace(/^\/\/\s*/, ''));
    } else if (inTodo && trimmed.startsWith('//')) {
      const content = trimmed.replace(/^\/\/\s*/, '');
      if (content) instructions.push(content);
    } else if (inTodo && !trimmed.startsWith('//')) {
      inTodo = false;
    }
  }

  return instructions;
}
