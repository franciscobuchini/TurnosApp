/* 
  src/components/MainContent.tsx
  Es el contenido principal de la aplicación de admin, donde se renderizan todos los widgets.
*/

export default function MainContent({ children }: { children?: React.ReactNode }) {
  return (
    <main className="flex flex-1 gap-(--size-xl) w-full flex-col items-start overflow-y-auto p-(--size-xl)">
      {children}
    </main>
  );
}
