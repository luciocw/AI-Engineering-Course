import { useState, useEffect } from 'react';
import { isCompleted, getCompletedCount } from '@/lib/course/progress';

type ExerciseItem = {
  slug: string;
  title: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
};

type Props = {
  exercises: ExerciseItem[];
  currentSlug: string;
  moduleSlug: string;
  moduleTitle: string;
  basePath?: string;
};

const difficultyDot: Record<string, string> = {
  beginner: 'bg-emerald-400',
  intermediate: 'bg-amber-400',
  advanced: 'bg-red-400',
};

export default function ExerciseSidebar({ exercises, currentSlug, moduleSlug, moduleTitle, basePath = '' }: Props) {
  const [completedMap, setCompletedMap] = useState<Record<string, boolean>>({});
  const [completed, setCompleted] = useState(0);

  useEffect(() => {
    const map: Record<string, boolean> = {};
    for (const ex of exercises) {
      map[ex.slug] = isCompleted(moduleSlug, ex.slug);
    }
    setCompletedMap(map);
    setCompleted(getCompletedCount(moduleSlug));
  }, [exercises, moduleSlug]);

  return (
    <div className="py-4">
      {/* Module header */}
      <div className="px-4 pb-3 border-b border-[var(--color-border)]">
        <a
          href={`${basePath}/day-1/${moduleSlug}`}
          className="text-sm font-semibold text-[var(--color-text)] hover:text-[var(--color-accent)] transition-colors"
        >
          ← {moduleTitle}
        </a>
        <div className="mt-1 text-xs text-[var(--color-text-muted)]">
          {completed}/{exercises.length} completed
        </div>
        {/* Progress bar */}
        <div className="mt-2 h-1 rounded-full bg-[var(--color-border)]">
          <div
            className="h-full rounded-full bg-[var(--color-accent)] transition-all duration-500"
            style={{ width: `${(completed / exercises.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Exercise list */}
      <nav className="mt-2">
        {exercises.map((ex, i) => {
          const isCurrent = ex.slug === currentSlug;
          const done = completedMap[ex.slug] ?? false;

          return (
            <a
              key={ex.slug}
              href={`${basePath}/day-1/${moduleSlug}/${ex.slug}`}
              className={`flex items-center gap-3 px-4 py-2.5 text-sm transition-colors ${
                isCurrent
                  ? 'bg-[var(--color-accent)]/10 border-l-2 border-[var(--color-accent)] text-[var(--color-text)]'
                  : 'hover:bg-[var(--color-surface-hover)] text-[var(--color-text-secondary)] border-l-2 border-transparent'
              }`}
            >
              {/* Status icon */}
              <span className="flex-shrink-0 w-5 h-5 flex items-center justify-center">
                {done ? (
                  <svg className="w-4 h-4 text-[var(--color-success)]" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <span className="text-xs font-mono text-[var(--color-text-muted)]">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                )}
              </span>

              {/* Title + difficulty */}
              <span className="flex-1 truncate">{ex.title}</span>
              <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${difficultyDot[ex.difficulty]}`} />
            </a>
          );
        })}
      </nav>
    </div>
  );
}
