'use client';

import { usePathname } from 'next/navigation';

import CrtShell from '@/components/ui/crt/CrtShell';

type CrtLayoutClientProps = {
  children: React.ReactNode;
};

/**
 * Thin client wrapper for the root layout.
 * Reads the current pathname and automatically expands the CRT shell
 * on the /database page (which needs a larger viewport).
 */
export default function CrtLayoutClient({ children }: CrtLayoutClientProps) {
  const pathname = usePathname();

  const expanded = pathname.startsWith('/database') || pathname.startsWith('/doc');

  return <CrtShell expanded={expanded}>{children}</CrtShell>;
}
