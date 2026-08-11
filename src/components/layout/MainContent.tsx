/*
  src/components/layout/MainContent.tsx
  Es el contenido principal de la aplicación de admin, donde se renderizan todos los widgets.
*/

import type { ReactNode } from 'react';
import { twMerge } from 'tailwind-merge';
import { FiltersGroupProvider } from '@/hooks/useFiltersGroup';

const MAIN_CONTENT_CLASS =
  'rounded-4xl h-full w-full flex flex-1 flex-col overflow-hidden gap-3 bg-card border border-border';

interface MainContentProps {
  children?: ReactNode;
  className?: string;
}

export default function MainContent({ children, className }: MainContentProps) {
  return (
    <main className={twMerge(MAIN_CONTENT_CLASS, className)}>
      <FiltersGroupProvider value="maincontent">{children}</FiltersGroupProvider>
    </main>
  );
}
