export default function ForgeLoader({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className="relative w-8 h-8 shrink-0 flex items-center justify-center">
        <span className="absolute w-6 h-6 rounded-full bg-ember-500 animate-glow" />
        <svg viewBox="0 0 24 24" className="relative w-5 h-5 text-smoke-100 animate-strike" style={{ transformOrigin: '85% 15%' }}>
          <rect x="2" y="2" width="9" height="6" rx="1" fill="currentColor" />
          <rect x="9" y="9" width="3" height="13" rx="1" fill="currentColor" />
        </svg>
      </div>
      <span className="text-sm text-smoke-500 font-medium">{label}</span>
    </div>
  );
}
