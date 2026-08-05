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
  style: 'bg-cyan-600 rounded-l-4xl',
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
 