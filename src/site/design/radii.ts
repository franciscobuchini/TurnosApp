/*
  src/site/design/radii.ts
  Opciones de border-radius del sitio público. Afecta botones, cards, inputs
  y demás componentes del sitio vía la variable CSS --site-radius.
*/

import type { SiteRadiusId } from '@/database/types';

export type SiteRadiusDefinition = {
  id: SiteRadiusId;
  label: string;
  value: string;
};

export const SITE_RADII: SiteRadiusDefinition[] = [
  { id: 'sharp', label: 'Recto', value: '0.25rem' },
  { id: 'medium', label: 'Medio', value: '0.75rem' },
  { id: 'rounded', label: 'Redondeado', value: '1.75rem' },
];

export const SITE_RADIUS_BY_ID = Object.fromEntries(
  SITE_RADII.map((radius) => [radius.id, radius]),
) as Record<SiteRadiusId, SiteRadiusDefinition>;
