import Link from 'next/link';
import { twMerge } from 'tailwind-merge';
import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from 'react';

type Variant = 'primary' | 'secondary' | 'outline' | 'ghost';
type Size = 'md' | 'lg';

const base =
  'inline-flex items-center justify-center gap-2 font-semibold transition rounded-lg disabled:opacity-50 disabled:cursor-not-allowed';

const variants: Record<Variant, string> = {
  primary: 'bg-ember-500 hover:bg-ember-400 text-iron-950',
  secondary: 'bg-quench-500 hover:bg-quench-400 text-iron-950',
  outline: 'border border-iron-600 text-smoke-100 hover:border-smoke-500 hover:bg-iron-900',
  ghost: 'text-quench-400 hover:text-quench-400/80',
};

const sizes: Record<Size, string> = {
  md: 'px-5 py-2.5 text-sm',
  lg: 'px-8 py-4 text-base',
};

interface StyleProps {
  variant?: Variant;
  size?: Size;
  className?: string;
  children: ReactNode;
}

type LinkButtonProps = StyleProps &
  Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'className' | 'href'> & { href: string };

type NativeButtonProps = StyleProps &
  Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'className'> & { href?: undefined };

export function Button(props: LinkButtonProps | NativeButtonProps) {
  const { variant = 'primary', size = 'md', className, children } = props;
  const classes = twMerge(base, variants[variant], sizes[size], className);

  if (props.href) {
    const { variant: _v, size: _s, className: _c, children: _ch, href, ...rest } = props;
    return (
      <Link href={href} className={classes} {...rest}>
        {children}
      </Link>
    );
  }

  const { variant: _v2, size: _s2, className: _c2, children: _ch2, href: _h2, ...rest } =
    props as NativeButtonProps;
  return (
    <button className={classes} {...rest}>
      {children}
    </button>
  );
}
