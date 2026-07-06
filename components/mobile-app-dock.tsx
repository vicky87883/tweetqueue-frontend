'use client';

import Link from 'next/link';
import { BriefcaseBusiness, FileText, Home, LogIn } from 'lucide-react';

const links = [
  { href: '/', label: 'Home', icon: Home },
  { href: '/blog', label: 'Blog', icon: FileText },
  { href: '/careers', label: 'Careers', icon: BriefcaseBusiness },
  { href: '/login', label: 'Login', icon: LogIn },
];

export function MobileAppDock() {
  return (
    <nav className="mobile-app-dock md:hidden" aria-label="Mobile site navigation">
      <div className="mobile-dock-inner mx-auto grid max-w-md grid-cols-4 gap-1">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="mobile-dock-item flex flex-col items-center justify-center gap-1 text-[11px] font-semibold text-gray-500 transition hover:bg-gray-900 hover:text-white"
          >
            <link.icon className="h-5 w-5" />
            {link.label}
          </Link>
        ))}
      </div>
    </nav>
  );
}
