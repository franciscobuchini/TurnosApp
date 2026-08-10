/* 
  src/components/layout/MainContent.tsx
  Es el contenido principal de la aplicación de admin, donde se renderizan todos los widgets.
*/

import { isValidElement, type ReactNode } from 'react';
import { twMerge } from 'tailwind-merge';
import { FiltersGroupProvider } from '@/hooks/useFiltersGroup';
import ScheduleView from '../views/ScheduleView';
import { GRADIENT_CLASS } from '@/components/ui/gradient-background';

const MAIN_CONTENT_CLASS =
  'rounded-4xl h-full w-full flex flex-1 flex-col overflow-hidden gap-6';
const DEFAULT_BACKGROUND_CLASS = 'bg-card';

interface MainContentProps {
  children?: ReactNode;
  className?: string;
  variant?: 'default' | 'schedule';
}

function isScheduleViewContent(children: ReactNode) {
  if (!children) {
    return false;
  }

  const childArray = Array.isArray(children) ? children : [children];

  return childArray.some((child) => {
    if (!isValidElement(child)) {
      return false;
    }

    return child.type === ScheduleView;
  });
}

export default function MainContent({ children, className, variant = 'default' }: MainContentProps) {
  const isScheduleView = variant === 'schedule' || isScheduleViewContent(children);

  return (
    <main
      className={twMerge(
        MAIN_CONTENT_CLASS,
        isScheduleView ? GRADIENT_CLASS : DEFAULT_BACKGROUND_CLASS,
        className,
      )}
    >
      <FiltersGroupProvider value="maincontent">{children}</FiltersGroupProvider>
    </main>
  );
}
