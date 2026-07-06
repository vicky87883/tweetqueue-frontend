'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Settings, Sparkles } from 'lucide-react';

const links = [
  { href: '/dashboard', label: 'Home', icon: LayoutDashboard },
  { href: '/ai', label: 'xschedular', icon: Sparkles },
  { href: '/settings', label: 'Setup', icon: Settings },
];

export function AppMobileDock() {
  const pathname = usePathname();

  return (
    <nav className="mobile-app-dock lg:hidden" aria-label="App mobile navigation">
      <div className="mobile-dock-inner mx-auto grid max-w-sm grid-cols-3 gap-1">
        {links.map((link) => {
          const active = pathname === link.href;

          return (
            <Link
              key={link.href}
              href={link.href}
              className={`mobile-dock-item flex flex-col items-center justify-center gap-1 text-[11px] font-semibold transition ${
                active ? 'bg-[#1DA1F2] text-black' : 'text-gray-500 hover:bg-gray-900 hover:text-white'
              }`}
            >
              <link.icon className="h-5 w-5" />
              {link.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
