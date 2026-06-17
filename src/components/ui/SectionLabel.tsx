export default function SectionLabel({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <p
      className={`font-mono text-xs uppercase tracking-[0.2em] text-ember-400 mb-3 flex items-center gap-2 ${className}`}
    >
      <span className="w-2 h-2 bg-ember-500 rounded-sm rotate-45" />
      {children}
    </p>
  );
}
