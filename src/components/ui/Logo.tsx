import Link from 'next/link';

interface LogoProps {
  href?: string;
  className?: string;
  showBeta?: boolean;
}

export function AnvilMark({ className = 'w-7 h-[21px]' }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 48" className={className} aria-hidden="true">
      <polygon points="6,14 54,14 46,26 14,26" fill="#FF5A1F" />
      <polygon points="48,15 62,19.5 48,25" fill="#FFC15E" />
      <rect x="24" y="26" width="14" height="9" fill="#FF5A1F" />
      <rect x="8" y="35" width="46" height="6" rx="2.5" fill="#FF5A1F" />
    </svg>
  );
}

export default function Logo({ href = '/', className = '', showBeta = true }: LogoProps) {
  return (
    <Link href={href} className={`flex items-center gap-2.5 hover:opacity-85 transition ${className}`}>
      <AnvilMark />
      <span className="font-display font-bold text-xl tracking-tight text-smoke-100">
        LinkedInForge
      </span>
      {showBeta && (
        <span className="font-mono text-[10px] uppercase tracking-widest bg-iron-800 text-spark border border-iron-700 px-2 py-1 rounded">
          Beta
        </span>
      )}
    </Link>
  );
}
