/* 
  src/variables/data.ts
  Central de datos de la aplicación.
  Hoy lee de archivos JSON mock; cuando haya BBDD, se reemplaza
  la implementación interna de cada getter sin tocar los componentes.
*/

import type { TeamMember, Product, Client, FiltersOption } from './types.ts';
import teamMembersJson from './teamMembers.json';
import productsJson from './products.json';
import clientsJson from './clients.json';

/* ── Getters de entidades ─────────────────────────────────── */

export function getTeamMembers(): TeamMember[] {
  return teamMembersJson as TeamMember[];
}

export function getProducts(): Product[] {
  return productsJson as Product[];
}

export function getClients(): Client[] {
  return clientsJson as Client[];
}

/* ── Getters de filtros (derivados de los datos) ──────────── */

export function getTeamFilters(): FiltersOption[] {
  const members = getTeamMembers();
  const seen = new Set<string>();
  const filters: FiltersOption[] = [];

  for (const member of members) {
    if (!seen.has(member.name)) {
      seen.add(member.name);
      filters.push({
        id: member.name.toLowerCase().replace(/\s+/g, '-'),
        label: member.name,
        checked: true,
      });
    }
  }

  return filters;
}

export function getServiceFilters(): FiltersOption[] {
  const members = getTeamMembers();
  const seen = new Set<string>();
  const filters: FiltersOption[] = [];

  for (const member of members) {
    for (const service of member.services) {
      if (!seen.has(service)) {
        seen.add(service);
        filters.push({
          id: service.toLowerCase().replace(/\s+/g, '-'),
          label: service,
        });
      }
    }
  }

  return filters;
}

export function getClientFilters(): FiltersOption[] {
  const clients = getClients();
  const seen = new Set<string>();
  const filters: FiltersOption[] = [];

  for (const client of clients) {
    if (!seen.has(client.name)) {
      seen.add(client.name);
      filters.push({
        id: client.name.toLowerCase().replace(/\s+/g, '-'),
        label: client.name,
        checked: true,
      });
    }
  }

  return filters;
}

/* ── Utilidades compartidas ───────────────────────────────── */

/* currencyFormatter: formatea numeros como pesos argentinos, sin decimales */
export const currencyFormatter = new Intl.NumberFormat('es-AR', {
  style: 'currency',
  currency: 'ARS',
  maximumFractionDigits: 0,
});
