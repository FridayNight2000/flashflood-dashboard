'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

// Navigation configuration array
const navItems = [
  { label: 'Introduction', href: '/document/intro' },
  { label: 'Data Pipeline', href: '/document/datasource' },
  { label: 'Core Extraction', href: '/document/algorithm' },
  { label: 'Benchmarks', href: '/document/fields' },
  { label: 'Developer Guide', href: '/document/python' },
];

export default function DocSidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex w-48 shrink-0 flex-col overflow-y-auto bg-white">
      {/* Navigation List */}
      <nav className="flex-1 px-6 py-13">
        <ul className="flex flex-col items-start gap-0.5">
          {navItems.map((item) => {
            const isActive = pathname === item.href;

            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`group flex items-center gap-3 rounded-md px-2 py-2 text-sm transition-colors ${
                    isActive
                      ? 'bg-slate-100 font-medium text-slate-900'
                      : 'font-normal text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
}
