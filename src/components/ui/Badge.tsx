import type { ReactNode } from 'react';

type Tone = 'ember' | 'spark' | 'quench' | 'neutral';

const tones: Record<Tone, string> = {
  ember: 'bg-ember-500/15 text-ember-300 border-ember-500/40',
  spark: 'bg-spark/15 text-spark border-spark/40',
  quench: 'bg-quench-500/15 text-quench-400 border-quench-500/40',
  neutral: 'bg-iron-800 text-smoke-300 border-iron-700',
};

export default function Badge({
  children,
  tone = 'ember',
  className = '',
}: {
  children: ReactNode;
  tone?: Tone;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-widest px-3 py-1.5 rounded-full border ${tones[tone]} ${className}`}
    >
      {children}
    </span>
  );
}
