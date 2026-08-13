/*
  src/site/sections/SiteFooter.tsx
  Copyright del negocio + atribución a la plataforma ("Creado con Minube"),
  como suelen mostrar los sitios armados con un builder — invita a otros
  negocios que ven el sitio a crear el suyo.
*/

import Logo from '@/components/ui/logo';
import type { SiteBusinessData } from '@/database/siteData';

interface SiteFooterProps {
  business: SiteBusinessData;
}

export default function SiteFooter({ business }: SiteFooterProps) {
  return (
    <footer className="w-full border-t border-(--site-border) px-6 py-8 text-sm text-(--site-text-muted)">
      <div className="mx-auto flex max-w-5xl flex-col items-center gap-3 text-center sm:flex-row sm:justify-between sm:text-left">
        <span>
          © {new Date().getFullYear()} {business.name}
        </span>
        <div className="flex items-center gap-2">
          <Logo className="h-5 w-auto shrink-0" />
          <span>Creado con Minube · Creá la tuya en minube.site</span>
        </div>
      </div>
    </footer>
  );
}
