/*
  src/components/widgets/siteEditorWidgets/SitePersonalizationSidebar.tsx
  Sidebar de la pestaña Personalización: Contenido (título/descripción) y
  Apariencia (fondo/botones/títulos/bordes/fuentes), cada control en su
  propio DetailsPanel — el mismo acordeón colapsable que usa AdminSidebar
  (Equipo/Servicios/Clientes), así que abrir uno cierra los demás. Fondo,
  botones y títulos son los 3 únicos colores que se eligen a mano (mismo
  HexColorPicker reutilizado) — el resto de las superficies del sitio se
  derivan del color de fondo (ver colorUtils.ts). El botón Guardar persiste
  el SiteConfig — hasta ahí, los cambios sólo viven en el borrador de
  Personalizacion.tsx y ya se ven reflejados en la preview.
*/

import Sidebar from '@/components/layout/Sidebar';
import DetailsPanel from '@/components/widgets/sidebarWidgets/DetailsPanel';
import ConfirmButton from '@/components/buttons/ConfirmButton';
import ContentSection from './ContentSection';
import HexColorPicker from './HexColorPicker';
import { BodyFontPicker, BorderRadiusPicker, HeadingFontPicker } from './AppearancePickers';
import type { SiteConfig } from '@/database/types';

interface SitePersonalizationSidebarProps {
  config: SiteConfig;
  onChange: (patch: Partial<SiteConfig>) => void;
  onSave: () => void;
  hasChanges: boolean;
}

const PANEL_BODY_CLASS = 'flex flex-col gap-4 px-2 pb-2';

export default function SitePersonalizationSidebar({
  config,
  onChange,
  onSave,
  hasChanges,
}: SitePersonalizationSidebarProps) {
  return (
    <Sidebar
      footer={
        <ConfirmButton
          text="Guardar cambios"
          onClick={onSave}
          disabled={!hasChanges}
          className="w-full"
        />
      }
    >
      <DetailsPanel title="Contenido" open>
        <div className={PANEL_BODY_CLASS}>
          <ContentSection config={config} onChange={onChange} />
        </div>
      </DetailsPanel>

      <DetailsPanel title="Color de fondo">
        <div className={PANEL_BODY_CLASS}>
          <HexColorPicker
            value={config.backgroundColor}
            onChange={(backgroundColor) => onChange({ backgroundColor })}
          />
        </div>
      </DetailsPanel>

      <DetailsPanel title="Color de los botones">
        <div className={PANEL_BODY_CLASS}>
          <HexColorPicker value={config.primaryColor} onChange={(primaryColor) => onChange({ primaryColor })} />
        </div>
      </DetailsPanel>

      <DetailsPanel title="Color de los títulos">
        <div className={PANEL_BODY_CLASS}>
          <HexColorPicker value={config.headingColor} onChange={(headingColor) => onChange({ headingColor })} />
        </div>
      </DetailsPanel>

      <DetailsPanel title="Bordes">
        <div className={PANEL_BODY_CLASS}>
          <BorderRadiusPicker value={config.borderRadius} onChange={(borderRadius) => onChange({ borderRadius })} />
        </div>
      </DetailsPanel>

      <DetailsPanel title="Fuente del título">
        <div className={PANEL_BODY_CLASS}>
          <HeadingFontPicker value={config.headingFont} onChange={(headingFont) => onChange({ headingFont })} />
        </div>
      </DetailsPanel>

      <DetailsPanel title="Fuente del texto">
        <div className={PANEL_BODY_CLASS}>
          <BodyFontPicker value={config.bodyFont} onChange={(bodyFont) => onChange({ bodyFont })} />
        </div>
      </DetailsPanel>
    </Sidebar>
  );
}
