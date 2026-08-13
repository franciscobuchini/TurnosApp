/*
  src/pages/clients/Site.tsx
  Página web pública del negocio para sus clientes. A diferencia del resto
  de la app, no usa el Layout/MainContent del admin (menubar, tarjeta con
  borde, etc.) — es una página real, no una vista del panel interno.
  SiteRenderer es el mismo componente que usa la preview de Personalización.
*/

import SiteRenderer from '../../site/SiteRenderer';
import { getClientId, getSiteConfig } from '../../database/siteConfig';
import { getSiteData } from '../../database/siteData';

function Site() {
  const clientId = getClientId();
  const config = getSiteConfig(clientId);
  const data = getSiteData();

  return (
    <div className="h-dvh w-dvw overflow-y-auto">
      <SiteRenderer config={config} data={data} className="min-h-full w-full" />
    </div>
  );
}
export default Site;
