/* 
  src/components/MainContent.tsx
  Es el contenido principal de la aplicación de admin, donde se renderizan todos los widgets.
*/

import { twMerge } from 'tailwind-merge';

/* MainContentClasses:
   - required: estructura. No varía.
   - style: sin color por ahora, queda listo para usarse. */
const MainContentClasses = {
  required: 'flex flex-1 gap-(--size-xl) w-full flex-col items-start overflow-y-auto p-(--size-xl)',
  style: 'bg-stone-50 rounded-l-4xl',
};

export default function MainContent({ children }: { children?: React.ReactNode }) {
  return (
    <main className={twMerge(MainContentClasses.required, MainContentClasses.style)}>
      {children}
    </main>
  );
}