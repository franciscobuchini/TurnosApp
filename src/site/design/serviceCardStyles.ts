/*
  src/site/design/serviceCardStyles.ts
  Opciones de estilo visual para las cards de servicio del turnero (paso
  "Elegí un servicio" — ver ServiceStep.tsx). A diferencia de radii/fonts,
  no son un valor CSS: cada estilo es un layout distinto, así que acá sólo
  vive el id + label (el layout de cada uno se implementa en ServiceStep).
*/

import type { SiteServiceCardStyleId } from '@/database/types';

export type SiteServiceCardStyleDefinition = {
  id: SiteServiceCardStyleId;
  label: string;
};

export const SITE_SERVICE_CARD_STYLES: SiteServiceCardStyleDefinition[] = [
  { id: 'photo-top', label: 'Foto grande' },
  { id: 'compact-row', label: 'Compacta' },
  { id: 'minimal-list', label: 'Minimalista' },
  { id: 'photo-overlay', label: 'Foto de fondo' },
];

export const SITE_SERVICE_CARD_STYLE_BY_ID = Object.fromEntries(
  SITE_SERVICE_CARD_STYLES.map((style) => [style.id, style]),
) as Record<SiteServiceCardStyleId, SiteServiceCardStyleDefinition>;
