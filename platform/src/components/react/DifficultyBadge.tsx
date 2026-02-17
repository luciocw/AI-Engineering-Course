type Props = {
  difficulty: 'beginner' | 'intermediate' | 'advanced';
};

const config = {
  beginner: { label: 'Beginner', color: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20' },
  intermediate: { label: 'Intermediate', color: 'bg-amber-500/15 text-amber-400 border-amber-500/20' },
  advanced: { label: 'Advanced', color: 'bg-red-500/15 text-red-400 border-red-500/20' },
};

export default function DifficultyBadge({ difficulty }: Props) {
  const { label, color } = config[difficulty];
  return (
    <span className={`inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-full border ${color}`}>
      {label}
    </span>
  );
}
