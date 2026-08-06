/* 
  src/database/data.ts
  Central de datos de la aplicación.
  Lee de archivos JSON mock y persiste los cambios en localStorage,
  de modo que lo creado/guardado sobrevive a recargas.
*/

import type { TeamMember, service, Client, FiltersOption, OpeningHoursEntry } from './types.ts';
import teamMembersJson from './teamMembers.json';
import servicesJson from './service.json';
import clientsJson from './client.json';
import openingHoursJson from './openingHours.json';

const CLIENTS_STORAGE_KEY = 'turnosapp.clients';
const SERVICES_STORAGE_KEY = 'turnosapp.services';
const TEAM_MEMBERS_STORAGE_KEY = 'turnosapp.teamMembers';

function readCollection<T>(key: string, seed: T[]): T[] {
  if (typeof localStorage === 'undefined') {
    return seed;
  }

  try {
    const raw = localStorage.getItem(key);
    if (raw) {
      return JSON.parse(raw) as T[];
    }
  } catch {
    // ignorar datos corruptos y usar el seed
  }

  return seed;
}

function writeCollection<T>(key: string, value: T[]) {
  if (typeof localStorage === 'undefined') {
    return;
  }

  localStorage.setItem(key, JSON.stringify(value));
}

/* ── Getters y mutaciones de entidades ─────────────────────── */

export function getTeamMembers(): TeamMember[] {
  return readCollection(TEAM_MEMBERS_STORAGE_KEY, teamMembersJson as unknown as TeamMember[]);
}

export function saveTeamMembers(members: TeamMember[]) {
  writeCollection(TEAM_MEMBERS_STORAGE_KEY, members);
}

export function addTeamMember(member: TeamMember): TeamMember[] {
  const current = getTeamMembers();
  const next = [...current, member];
  saveTeamMembers(next);
  return next;
}

export function updateTeamMember(previousName: string, member: TeamMember): TeamMember[] {
  const current = getTeamMembers();
  const next = current.map((existing) =>
    existing.name.toLowerCase() === previousName.toLowerCase() ? member : existing,
  );
  saveTeamMembers(next);
  return next;
}

export function removeTeamMember(name: string): TeamMember[] {
  const current = getTeamMembers();
  const next = current.filter((existing) => existing.name.toLowerCase() !== name.toLowerCase());
  saveTeamMembers(next);
  return next;
}

export function getservices(): service[] {
  return readCollection(SERVICES_STORAGE_KEY, servicesJson as service[]);
}

export function saveServices(services: service[]) {
  writeCollection(SERVICES_STORAGE_KEY, services);
}

export function addService(newService: service): service[] {
  const current = getservices();
  const next = [...current, newService];
  saveServices(next);
  return next;
}

export function updateService(previousName: string, updated: service): service[] {
  const current = getservices();
  const next = current.map((existing) =>
    existing.name.toLowerCase() === previousName.toLowerCase() ? updated : existing,
  );
  saveServices(next);
  return next;
}

export function removeService(name: string): service[] {
  const current = getservices();
  const next = current.filter((existing) => existing.name.toLowerCase() !== name.toLowerCase());
  saveServices(next);
  return next;
}

export function getClients(): Client[] {
  return readCollection(CLIENTS_STORAGE_KEY, clientsJson as Client[]);
}

export function saveClients(clients: Client[]) {
  writeCollection(CLIENTS_STORAGE_KEY, clients);
}

export function addClient(client: Client): Client[] {
  const current = getClients();
  const next = [...current, client];
  saveClients(next);
  return next;
}

export function updateClient(previousName: string, client: Client): Client[] {
  const current = getClients();
  const next = current.map((existing) =>
    existing.name.toLowerCase() === previousName.toLowerCase() ? client : existing,
  );
  saveClients(next);
  return next;
}

export function removeClient(name: string): Client[] {
  const current = getClients();
  const next = current.filter((existing) => existing.name.toLowerCase() !== name.toLowerCase());
  saveClients(next);
  return next;
}

export function getOpeningHours(): OpeningHoursEntry[] {
  return openingHoursJson as OpeningHoursEntry[];
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
