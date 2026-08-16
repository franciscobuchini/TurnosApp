/*
  src/database/siteData.ts
  Capa de lectura para el sitio público: traduce las entidades internas de
  data.ts (Business, TeamMember, service) a las formas que el sitio necesita,
  sin exponer datos que no corresponden mostrar públicamente (email/teléfono
  personal del equipo, credenciales del negocio) ni la forma cruda del JSON.

  site/ y Site.tsx sólo deberían importar de acá (y de bookingAvailability.ts
  para disponibilidad) — nunca directo de data.ts ni de los .json.
*/

import type { OpeningHoursEntry, service } from './types.ts';
import { getBusiness, getOpeningHours, getservices, getTeamMembers } from './data.ts';

export type SiteBusinessData = {
  name: string;
  logo: string;
  location: string;
  latitude?: number;
  longitude?: number;
  whatsapp: string;
  instagram: string;
  schedule: OpeningHoursEntry[];
};

export type SitePublicTeamMember = {
  name: string;
  photo?: string;
  role: string;
  services: string[];
};

export function getSiteBusinessData(): SiteBusinessData {
  const business = getBusiness();

  return {
    name: business.name,
    logo: business.image,
    location: business.location,
    latitude: business.latitude,
    longitude: business.longitude,
    whatsapp: business.whatsapp,
    instagram: business.instagram,
    schedule: getOpeningHours(),
  };
}

/** Sólo los servicios activos: uno desactivado no aparece en "Elegí un
    servicio" del turnero, así que no se puede reservar — ver comentario en
    service.active (types.ts). No filtra para el admin (getservices()
    sigue devolviendo todos, ahí se puede seguir agregando turnos a mano). */
export function getSiteServices(): service[] {
  return getservices().filter((s) => s.active !== false);
}

export function getSiteTeam(): SitePublicTeamMember[] {
  return getTeamMembers().map(({ name, photo, role, services }) => ({
    name,
    photo,
    role,
    services,
  }));
}

export type SiteData = {
  business: SiteBusinessData;
  services: service[];
  team: SitePublicTeamMember[];
};

/** Junta todo lo que SiteRenderer necesita en una sola llamada. */
export function getSiteData(): SiteData {
  return {
    business: getSiteBusinessData(),
    services: getSiteServices(),
    team: getSiteTeam(),
  };
}
