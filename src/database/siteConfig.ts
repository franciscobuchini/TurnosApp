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
import { isHexColor } from '../site/design/colorUtils.ts';
import { SITE_FONTS } from '../site/design/fonts.ts';
import { SITE_HEADING_FONTS } from '../site/design/headingFonts.ts';
import { SITE_SERVICE_CARD_STYLES } from '../site/design/serviceCardStyles.ts';

const SITE_CONFIG_STORAGE_PREFIX = 'turnosapp.siteConfig.';

const DEFAULT_CLIENT_ID = 'default';

export function getClientId(business: Business = getBusiness()): string {
  return business.url?.trim() || DEFAULT_CLIENT_ID;
}

function createDefaultSiteConfig(clientId: string): SiteConfig {
  return {
    clientId,
    backgroundColor: '#0a0a0a',
    primaryColor: '#84cc16',
    borderRadius: 'medium',
    // El primer elemento de cada lista, no un id hardcodeado: si una fuente
    // se saca de site/design/(fonts|headingFonts).ts, el default sigue
    // siendo válido sin tener que acordarse de tocar este archivo también.
    headingFont: SITE_HEADING_FONTS[0].id,
    bodyFont: SITE_FONTS[0].id,
    serviceCardStyle: SITE_SERVICE_CARD_STYLES[0].id,
  };
}

export function getSiteConfig(clientId: string = getClientId()): SiteConfig {
  const seed = createDefaultSiteConfig(clientId);

  if (typeof localStorage === 'undefined') {
    return seed;
  }

  try {
    const raw = localStorage.getItem(SITE_CONFIG_STORAGE_PREFIX + clientId);
    if (raw) {
      const saved = JSON.parse(raw) as Partial<SiteConfig>;
      const merged = { ...seed, ...saved, clientId };

      // Los campos de color cambiaron de forma (antes ids como
      // "lime-500"/"theme-2", ahora hex libre) — un SiteConfig guardado con
      // el esquema anterior no debe colar un valor no-hex acá, o rompe todo
      // color derivado (ver colorUtils.ts). Cada campo se sanea por
      // separado en vez de todo o nada, así el resto de lo guardado
      // (fuente, bordes, etc.) no se pierde.
      return {
        ...merged,
        backgroundColor: isHexColor(merged.backgroundColor) ? merged.backgroundColor : seed.backgroundColor,
        primaryColor: isHexColor(merged.primaryColor) ? merged.primaryColor : seed.primaryColor,
      };
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
