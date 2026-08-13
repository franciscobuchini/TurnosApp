/*
  src/database/siteConfig.ts
  Persistencia de la personalización del sitio público (SiteConfig), separada
  de data.ts porque es la única entidad de esta capa que necesita aislarse
  por cliente: la clave de localStorage se namespacea con clientId.

  Hoy el proyecto es de un solo negocio por instancia (ver getBusiness() en
  data.ts) — no hay múltiples negocios conviviendo. clientId usa el dato más
  cercano a un identificador de negocio que ya existe (business.url, el slug
  de "minube.site/<url>"). Esto no vuelve multi-tenant al resto de la app:
  sólo asegura que, cuando eso pase, la config del sitio ya está guardada de
  forma aislada por cliente y no hay que migrarla.
*/

import type { Business, SiteConfig } from './types.ts';
import { getBusiness } from './data.ts';

const SITE_CONFIG_STORAGE_PREFIX = 'turnosapp.siteConfig.';

const DEFAULT_CLIENT_ID = 'default';

export function getClientId(business: Business = getBusiness()): string {
  return business.url?.trim() || DEFAULT_CLIENT_ID;
}

function createDefaultSiteConfig(clientId: string, business: Business): SiteConfig {
  return {
    clientId,
    title: business.name || '',
    description: '',
    theme: 'theme-2',
    primaryColor: 'lime-500',
    headingColor: 'lime-500',
    borderRadius: 'medium',
    headingFont: 'heading-1',
    bodyFont: 'font-1',
  };
}

export function getSiteConfig(clientId: string = getClientId()): SiteConfig {
  const business = getBusiness();
  const seed = createDefaultSiteConfig(clientId, business);

  if (typeof localStorage === 'undefined') {
    return seed;
  }

  try {
    const raw = localStorage.getItem(SITE_CONFIG_STORAGE_PREFIX + clientId);
    if (raw) {
      return { ...seed, ...(JSON.parse(raw) as SiteConfig), clientId };
    }
  } catch {
    // ignorar datos corruptos y usar el seed
  }

  return seed;
}

export function saveSiteConfig(config: SiteConfig) {
  if (typeof localStorage === 'undefined') {
    return;
  }

  localStorage.setItem(SITE_CONFIG_STORAGE_PREFIX + config.clientId, JSON.stringify(config));
}
