import type { ReactNode } from 'react';

type Tone = 'ember' | 'spark' | 'quench' | 'neutral';

const tones: Record<Tone, string> = {
  ember: 'bg-orange-500/15 text-orange-600 border-orange-500/40',
  spark: 'bg-rose-500/15 text-rose-500 border-spark/40',
  quench: 'bg-black/15 text-black border-quench-500/40',
  neutral: 'bg-slate-100 text-slate-700 border-slate-300',
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

