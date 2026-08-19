/*
  src/components/layout/MainContent.tsx
  Es el contenido principal de la aplicación de admin, donde se renderizan todos los widgets.
*/

import type { ReactNode } from 'react';
import { twMerge } from 'tailwind-merge';
import { FiltersGroupProvider } from '@/hooks/useFiltersGroup';

/* overflow-y-auto (no overflow-hidden): ScheduleView/AdminPlaceholderPage
   nunca llenan este alto (Schedule tiene su propio scroll interno, ver
   Schedule.tsx), así que no se nota ahí — pero ViewLayout lo necesita para
   que su columna de contenido scrollee acá (con header/footer sticky). El
   scrollbar no se ve (regla global en Index.css). */
const MAIN_CONTENT_CLASS =
  'rounded-none sm:rounded-4xl h-full w-full flex flex-1 flex-col overflow-y-auto gap-3 bg-card sm:border border-border';

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
