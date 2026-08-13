/*
  src/components/widgets/siteEditorWidgets/ContentSection.tsx
  Único contenido editable a mano del sitio: título y descripción. Todo lo
  demás (servicios, horarios, ubicación, etc.) viene de la BBDD del negocio.
*/

import { Input } from '@/components/ui/input';
import type { SiteConfig } from '@/database/types';

interface ContentSectionProps {
  config: Pick<SiteConfig, 'title' | 'description'>;
  onChange: (patch: Partial<SiteConfig>) => void;
}

export default function ContentSection({ config, onChange }: ContentSectionProps) {
  return (
    <div className="flex flex-col gap-4">
      <Input
        label="Título"
        value={config.title}
        onChange={(event) => onChange({ title: event.target.value })}
        placeholder="Nombre de tu negocio"
      />
      <Input
        label="Descripción"
        textarea
        optional
        value={config.description}
        onChange={(event) => onChange({ description: event.target.value })}
        placeholder="Contá brevemente qué ofrecés"
      />
    </div>
  );
}
