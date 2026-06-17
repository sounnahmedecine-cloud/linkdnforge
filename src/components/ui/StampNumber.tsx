export default function StampNumber({
  n,
  active = true,
  size = 'md',
}: {
  n: number | string;
  active?: boolean;
  size?: 'md' | 'lg';
}) {
  const dims = size === 'lg' ? 'w-14 h-14 text-sm' : 'w-10 h-10 text-xs';
  return (
    <div
      className={`shrink-0 ${dims} rounded-lg border flex items-center justify-center font-mono font-semibold transition ${
        active
          ? 'bg-ember-500/10 border-ember-500/50 text-ember-400'
          : 'bg-iron-900 border-iron-700 text-smoke-500'
      }`}
    >
      {typeof n === 'number' ? String(n).padStart(2, '0') : n}
    </div>
  );
}
