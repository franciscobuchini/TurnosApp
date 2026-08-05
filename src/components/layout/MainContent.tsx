/* 
  src/components/layout/MainContent.tsx
  Es el contenido principal de la aplicación de admin, donde se renderizan todos los widgets.
*/
 
import type { ReactNode } from 'react';
import { twMerge } from 'tailwind-merge';
import { FiltersGroupProvider } from '../../functions/filtersGroupContext';
 
/* MainContentClasses*/
const MainContentClasses = {
  required: 'flex flex-1 min-h-0 min-w-0 flex-col items-start gap-(--size-m) overflow-hidden p-(--size-m)',
  style: 'rounded-l-4xl bg-[radial-gradient(circle_at_top_left,_rgba(231,252,111,0.95)_0%,_transparent_35%),radial-gradient(circle_at_85%_15%,_rgba(197,189,246,0.75)_0%,_transparent_40%),linear-gradient(135deg,_var(--primary-01)_0%,_var(--primary-02)_55%,_var(--primary-03)_100%)] shadow-[inset_0_1px_0_rgba(255,255,255,0.45)]',
};
 
interface MainContentProps {
  children?: ReactNode;
  className?: string;
}
 
export default function MainContent({ children, className }: MainContentProps) {
  return (
    <main className={twMerge(MainContentClasses.required, MainContentClasses.style, className)}>
      <FiltersGroupProvider value="maincontent">{children}</FiltersGroupProvider>
    </main>
  );
}
 