/*
  src/hooks/useLayoutTier.ts
  Punto único desde donde se decide qué formato de layout corresponde
  según el ancho de la ventana ("pc", y más adelante "tablet"/"mobile" a
  medida que se vayan agregando de a uno) — en vez de que cada componente
  tenga su propio criterio suelto para saber en qué resolución está.

  Se refleja como data-layout-tier en <html> (mismo patrón que data-theme,
  ver useTheme.ts), así que se puede usar tanto desde JS (useLayoutTier())
  como desde CSS ([data-layout-tier="mobile"] { ... }) sin duplicar la
  lógica en dos lugares. No necesita Context: como con useTheme, cada
  componente que llame a este hook escucha resize por su cuenta y todos
  quedan de acuerdo porque calculan el mismo tier a partir del mismo
  ancho.

  IMPORTANTE: esto es sobre el ancho de LA VENTANA (formato general de la
  app: sidebar, menubar, disposición de las vistas). Es un criterio
  distinto del que ya usa Schedule.tsx para su propio modo compacto
  (columnas de miembros, ResizeObserver sobre el ANCHO DISPONIBLE del
  propio Schedule, no de la ventana) — ese es contenido reaccionando al
  espacio que le tocó, esto es la apps entera reaccionando a la
  resolución real del dispositivo. No hace falta unificarlos.

  Hoy existen "pc" y "mobile" — "tablet" se va a insertar en el medio más
  adelante, cuando se pida puntualmente.
*/

import { useEffect, useState } from 'react';

export type LayoutTier = 'pc' | 'mobile';

/* Ancho mínimo (px) de cada tier, de MAYOR a MENOR — gana el primero
   cuyo mínimo el ancho actual cumple. El corte de "mobile" (768) es el
   breakpoint "md" por defecto de Tailwind, así que las clases responsive
   (md:, lg:, etc.) y este hook están de acuerdo en dónde arranca cada
   resolución. Al sumar "tablet" más adelante, va entre los dos:
     ['pc', 1024],
     ['tablet', 768],
     ['mobile', 0],
*/
const LAYOUT_TIER_MIN_WIDTH: [LayoutTier, number][] = [
  ['pc', 768],
  ['mobile', 0],
];

function computeLayoutTier(width: number): LayoutTier {
  const match = LAYOUT_TIER_MIN_WIDTH.find(([, minWidth]) => width >= minWidth);
  return match ? match[0] : LAYOUT_TIER_MIN_WIDTH[LAYOUT_TIER_MIN_WIDTH.length - 1][0];
}

function readWindowWidth(): number {
  return typeof window === 'undefined' ? 0 : window.innerWidth;
}

export function useLayoutTier(): LayoutTier {
  const [tier, setTier] = useState<LayoutTier>(() => computeLayoutTier(readWindowWidth()));

  useEffect(() => {
    const sync = () => setTier(computeLayoutTier(window.innerWidth));
    sync();
    window.addEventListener('resize', sync);
    return () => window.removeEventListener('resize', sync);
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute('data-layout-tier', tier);
  }, [tier]);

  return tier;
}
