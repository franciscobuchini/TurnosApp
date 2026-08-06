/* 
  src/components/layout/MainContent.tsx
  Es el contenido principal de la aplicación de admin, donde se renderizan todos los widgets.
*/

import { isValidElement, type ReactNode } from 'react';
import { twMerge } from 'tailwind-merge';
import { FiltersGroupProvider } from '../../functions/filtersGroupContext';
import ScheduleView from '../views/mainViews/ScheduleView';

const MAIN_CONTENT_CLASS =
  'rounded-4xl flex flex-1 min-h-0 min-w-0 flex-col items-start gap-(--size-m) overflow-hidden p-(--size-m)';
const SCHEDULE_BACKGROUND_CLASS =
  'bg-[radial-gradient(ellipse_at_10%_10%,_rgba(231,252,111,1)_0%,_rgba(231,252,111,1)_1%,_transparent_20%),radial-gradient(ellipse_at_82%_12%,_rgba(196,222,235,1),_rgba(196,222,235,1)_24%,_transparent_80%),radial-gradient(ellipse_at_15%_88%,_rgba(197,189,246,1)_0%,_rgba(197,189,246,1)_40%,_transparent_60%),radial-gradient(ellipse_at_82%_88%,_rgba(231,252,111,0.95)_0%,_rgba(231,252,111,1)_24%,_transparent_60%),linear-gradient(135deg,_var(--primary-01)_0%,_var(--primary-02)_55%,_var(--primary-03)_100%)]';
const DEFAULT_BACKGROUND_CLASS = 'bg-neutral-50';

interface MainContentProps {
  children?: ReactNode;
  className?: string;
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

export default function MainContent({ children, className }: MainContentProps) {
  const isScheduleView = isScheduleViewContent(children);

  return (
    <main
      className={twMerge(
        MAIN_CONTENT_CLASS,
        isScheduleView ? SCHEDULE_BACKGROUND_CLASS : DEFAULT_BACKGROUND_CLASS,
        className,
      )}
    >
      <FiltersGroupProvider value="maincontent">{children}</FiltersGroupProvider>
    </main>
  );
}
