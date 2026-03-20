'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navItems = [
  { label: 'Introduction', href: '/doc/introduction' },
  { label: 'Data Pipeline', href: '/doc/data-pipeline' },
  { label: 'Event Extraction', href: '/doc/event-extraction' },
  { label: 'Validation', href: '/doc/validation' },
  { label: 'Developer Guide', href: '/doc/developer-guide' },
];

export default function DocumentSidebar({
  topOffset,
  bottomOffset,
}: {
  topOffset: number;
  bottomOffset: number;
}) {
  const pathname = usePathname();

  return (
    <aside className="flex min-h-0 w-48 shrink-0 flex-col overflow-y-auto bg-white [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      {/* Navigation List */}
      <nav
        className="flex-1 px-6"
        style={{ paddingTop: topOffset, paddingBottom: bottomOffset }}
      >
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
