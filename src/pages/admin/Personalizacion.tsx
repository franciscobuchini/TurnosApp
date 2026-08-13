/*
  src/pages/admin/Personalizacion.tsx
  Editor del sitio web público: sidebar con los controles de Personalización
  (título/descripción/apariencia) + preview en vivo del sitio real.

  Flujo: cambiar un control → actualiza el SiteConfig en borrador (estado de
  React) → SiteRenderer, el mismo componente que usa Site.tsx, se re-renderiza
  al instante. "Guardar" recién ahí persiste el borrador — hasta entonces
  sólo vive en memoria de este componente.
*/

import { useState } from 'react';
import Layout from '../../components/layout/Layout';
import AppMenubar from '../../components/layout/AppMenubar';
import MainContent from '../../components/layout/MainContent';
import SitePersonalizationSidebar from '../../components/widgets/siteEditorWidgets/SitePersonalizationSidebar';
import SiteRenderer from '../../site/SiteRenderer';
import { getClientId, getSiteConfig, saveSiteConfig } from '../../database/siteConfig';
import { getSiteData } from '../../database/siteData';
import type { SiteConfig } from '../../database/types';

function Personalizacion() {
  const clientId = getClientId();
  const data = getSiteData();

  const [savedConfig, setSavedConfig] = useState<SiteConfig>(() => getSiteConfig(clientId));
  const [draft, setDraft] = useState<SiteConfig>(savedConfig);

  const updateDraft = (patch: Partial<SiteConfig>) => setDraft((current) => ({ ...current, ...patch }));

  const hasChanges = JSON.stringify(draft) !== JSON.stringify(savedConfig);

  const handleSave = () => {
    saveSiteConfig(draft);
    setSavedConfig(draft);
  };

  return (
    <Layout
      menubar={<AppMenubar />}
      sidebar={
        <SitePersonalizationSidebar
          config={draft}
          onChange={updateDraft}
          onSave={handleSave}
          hasChanges={hasChanges}
        />
      }
    >
      <MainContent>
        <div className="min-h-0 w-full flex-1 overflow-y-auto rounded-4xl">
          <SiteRenderer config={draft} data={data} />
        </div>
      </MainContent>
    </Layout>
  );
}
export default Personalizacion;
