/*
  src/site/components/SiteField.tsx
  Campo de formulario del sitio, hermano de components/ui/input.tsx pero con
  los colores del SiteConfig en vez de los del panel admin.
*/

import type { ReactNode } from 'react';

interface SiteFieldProps {
  label: string;
  children: ReactNode;
}

export const SITE_INPUT_CLASS =
  'w-full rounded-(--site-radius) border border-(--site-border) bg-(--site-bg) px-4 py-2.5 text-(--site-text) outline-none placeholder:text-(--site-text-muted) focus:border-(--site-primary)';

export default function SiteField({ label, children }: SiteFieldProps) {
  return (
    <label className="flex flex-col gap-1.5 text-sm">
      <span className="text-(--site-text-muted)">{label}</span>
      {children}
    </label>
  );
}
