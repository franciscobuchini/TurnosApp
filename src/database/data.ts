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

// Los horarios pueden llegar en dos formatos distintos:
//  - OpeningHoursEntry[]: { dayOfWeek, startTime, endTime } con "HH:mm".
//  - Formato "Día y horas" del seed: { day: "L", hours: ["9:00 - 18:00"] }.
// Esta función normaliza cualquier valor al formato OpeningHoursEntry para que
// el componente EntityWeekSchedule coincida siempre con lo guardado en la BBDD.
const DAY_LETTER_TO_NUMBER: Record<string, number> = {
  L: 1, M: 2, X: 3, J: 4, V: 5, S: 6, D: 0,
};

function padTime(time: string): string {
  const [hours, minutes = '00'] = time.split(':');
  return `${hours.padStart(2, '0')}:${minutes.padStart(2, '0')}`;
}

export function normalizeOpeningHours(schedule: unknown): OpeningHoursEntry[] {
  if (!Array.isArray(schedule)) {
    return [];
  }

  const result: OpeningHoursEntry[] = [];

  for (const entry of schedule as Array<Record<string, unknown>>) {
    if (!entry || typeof entry !== 'object') {
      continue;
    }

    if (typeof entry.dayOfWeek === 'number' && typeof entry.startTime === 'string' && typeof entry.endTime === 'string') {
      const startTime = padTime(entry.startTime);
      const endTime = padTime(entry.endTime);
      result.push({ dayOfWeek: entry.dayOfWeek, startTime, endTime });
      continue;
    }

    const dayNumber = DAY_LETTER_TO_NUMBER[String(entry.day ?? '')];
    if (dayNumber === undefined || !Array.isArray(entry.hours)) {
      continue;
    }

    for (const hour of entry.hours as unknown[]) {
      if (typeof hour !== 'string') {
        continue;
      }
      const [startTime, endTime] = hour.split('-').map((part) => part.trim());
      if (startTime && endTime) {
        result.push({ dayOfWeek: dayNumber, startTime: padTime(startTime), endTime: padTime(endTime) });
      }
    }
  }

  return result;
}

export function getTeamMembers(): TeamMember[] {
  const members = readCollection(TEAM_MEMBERS_STORAGE_KEY, teamMembersJson as unknown as TeamMember[]);
  return members.map((member) => ({
    ...member,
    schedule: normalizeOpeningHours(member.schedule),
  }));
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
