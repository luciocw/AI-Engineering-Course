type Props = {
  output: string[];
  error: string | null;
  isRunning: boolean;
  duration?: number;
};

export default function OutputPanel({ output, error, isRunning, duration }: Props) {
  const hasContent = output.length > 0 || error;

  return (
    <div className="rounded-xl border border-[var(--color-border)] bg-[#0d1117] overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2 border-b border-[var(--color-border)] bg-[var(--color-surface)]">
        <div className="flex items-center gap-2">
          <div className="flex gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-[var(--color-error)]/60" />
            <div className="w-2.5 h-2.5 rounded-full bg-[var(--color-warning)]/60" />
            <div className="w-2.5 h-2.5 rounded-full bg-[var(--color-success)]/60" />
          </div>
          <span className="text-xs font-mono text-[var(--color-text-muted)]">Output</span>
        </div>
        {duration !== undefined && duration > 0 && (
          <span className="text-xs font-mono text-[var(--color-text-muted)]">{duration}ms</span>
        )}
      </div>

      <div className="p-4 min-h-[120px] max-h-[300px] overflow-y-auto font-mono text-sm leading-relaxed">
        {isRunning && (
          <div className="flex items-center gap-2 text-[var(--color-accent)]">
            <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            Running...
          </div>
        )}

        {!isRunning && !hasContent && (
          <p className="text-[var(--color-text-muted)] italic">
            Click "Run" to execute your code
          </p>
        )}

        {!isRunning && output.map((line, i) => (
          <div key={i} className="text-[var(--color-text-secondary)]">
            <span className="text-[var(--color-text-muted)] select-none mr-2">&gt;</span>
            <span className="whitespace-pre-wrap">{line}</span>
          </div>
        ))}

        {!isRunning && error && (
          <div className="mt-2 p-3 rounded-lg bg-[var(--color-error)]/10 border border-[var(--color-error)]/20 text-[var(--color-error)]">
            <span className="font-semibold">Error: </span>
            <span className="whitespace-pre-wrap">{error}</span>
          </div>
        )}
      </div>
    </div>
  );
}
