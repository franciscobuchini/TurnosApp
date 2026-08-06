/* 
  src/components/layout/Layout.tsx
  Layout principal de la aplicación. children ahora se compone libre (Sidebar + MainContent).
*/

import { twMerge } from 'tailwind-merge';

interface LayoutProps {
  children: React.ReactNode;
}

const LayoutClasses = {
  required: 'h-dvh w-dvw overflow-hidden flex flex-col',
  style: 'bg-black',
};

const LayoutContentClasses = {
  required: 'flex flex-1 min-h-0 overflow-hidden pr-0',
  style: '',
};

export default function Layout({ children }: LayoutProps) {
  return (
    <div className={twMerge(LayoutClasses.required, LayoutClasses.style)}>
      <div className={twMerge(LayoutContentClasses.required, LayoutContentClasses.style)}>
        {children}
      </div>
    </div>
  );
}