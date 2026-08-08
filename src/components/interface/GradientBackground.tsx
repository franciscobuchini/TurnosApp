import type { ReactNode } from 'react';
import { twMerge } from 'tailwind-merge';

/*
  src/components/interface/GradientBackground.tsx
  Fondo de gradiente decorativo basado en las variables CSS --primary-01/02/03.
  Se usa como fondo de pantalla de las vistas (contenido principal).
*/

const GRADIENT_CLASS =
  'relative isolate before:absolute before:inset-0 before:-z-10 before:opacity-90 before:bg-[radial-gradient(ellipse_at_10%_10%,_rgba(231,252,111,1)_0%,_rgba(231,252,111,1)_1%,_transparent_20%),radial-gradient(ellipse_at_82%_12%,_rgba(196,222,235,1),_rgba(196,222,235,1)_24%,_transparent_80%),radial-gradient(ellipse_at_15%_88%,_rgba(197,189,246,1)_0%,_rgba(197,189,246,1)_40%,_transparent_60%),radial-gradient(ellipse_at_82%_88%,_rgba(231,252,111,0.95)_0%,_rgba(231,252,111,1)_24%,_transparent_60%),linear-gradient(135deg,_var(--primary-01)_0%,_var(--primary-02)_55%,_var(--primary-03)_100%)]';

export { GRADIENT_CLASS };

interface GradientBackgroundProps {
  children?: ReactNode;
  className?: string;
}

export default function GradientBackground({ children, className }: GradientBackgroundProps) {
  return <div className={twMerge(GRADIENT_CLASS, className)}>{children}</div>;
}