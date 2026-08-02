/* 
  src/components/layout/MainContent.tsx
  Es el contenido principal de la aplicación de admin, donde se renderizan todos los widgets.
*/
 
import { twMerge } from 'tailwind-merge';
import { FiltersGroupProvider } from '../../functions/filtersGroupContext';
 
/* MainContentClasses*/
const MainContentClasses = {
  required: 'flex flex-1 min-h-0 min-w-0 flex-col items-start gap-(--size-2xl) overflow-hidden p-(--size-m)',
  style: 'bg-cyan-100 rounded-l-4xl',
};
 
export default function MainContent({ children }: { children?: React.ReactNode }) {
  return (
    <main className={twMerge(MainContentClasses.required, MainContentClasses.style)}>
      <FiltersGroupProvider value="maincontent">{children}</FiltersGroupProvider>
    </main>
  );
}
 