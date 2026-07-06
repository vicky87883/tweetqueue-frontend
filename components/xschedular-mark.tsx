import { Sparkles } from 'lucide-react';

type XschedularMarkProps = {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
};

const sizes = {
  sm: 'h-8 w-8 rounded-2xl text-base',
  md: 'h-11 w-11 rounded-2xl text-xl',
  lg: 'h-14 w-14 rounded-3xl text-2xl',
};

const badgeSizes = {
  sm: 'h-4 w-4 -right-1 -top-1',
  md: 'h-5 w-5 -right-1.5 -top-1.5',
  lg: 'h-6 w-6 -right-1.5 -top-1.5',
};

const sparkleSizes = {
  sm: 'h-2.5 w-2.5',
  md: 'h-3 w-3',
  lg: 'h-3.5 w-3.5',
};

export function XschedularMark({ size = 'md', className = '' }: XschedularMarkProps) {
  return (
    <span
      aria-hidden="true"
      className={`relative inline-flex shrink-0 items-center justify-center border border-[#1DA1F2]/40 bg-[#1DA1F2]/10 font-black text-[#1DA1F2] shadow-[0_0_34px_rgba(29,161,242,0.22)] ${sizes[size]} ${className}`}
    >
      <span className="-ml-0.5 tracking-tighter">𝕏</span>
      <span
        className={`absolute flex items-center justify-center rounded-full bg-[#1DA1F2] text-black ring-4 ring-black ${badgeSizes[size]}`}
      >
        <Sparkles className={sparkleSizes[size]} />
      </span>
    </span>
  );
}
