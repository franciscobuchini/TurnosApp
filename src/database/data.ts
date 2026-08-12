/* 
  src/database/data.ts
  Central de datos de la aplicación.
  Lee de archivos JSON mock y persiste los cambios en localStorage,
  de modo que lo creado/guardado sobrevive a recargas.
*/

import type { TeamMember, service, Client, FiltersOption, OpeningHoursEntry, Business, Appointment } from './types.ts';
import teamMembersJson from './teamMembers.json';
import servicesJson from './service.json';
import clientsJson from './client.json';
import businessJson from './business.json';
import appointmentsJson from './appointments.json';

const CLIENTS_STORAGE_KEY = 'turnosapp.clients';
const SERVICES_STORAGE_KEY = 'turnosapp.services';
const TEAM_MEMBERS_STORAGE_KEY = 'turnosapp.teamMembers';
const BUSINESS_STORAGE_KEY = 'turnosapp.business';
const APPOINTMENTS_STORAGE_KEY = 'turnosapp.appointments';

function readObject<T>(key: string, seed: T): T {
  if (typeof localStorage === 'undefined') {
    return seed;
  }

  try {
    const raw = localStorage.getItem(key);
    if (raw) {
      return JSON.parse(raw) as T;
    }
  } catch {
    // ignorar datos corruptos y usar el seed
  }

  return seed;
}

function writeObject<T>(key: string, value: T) {
  if (typeof localStorage === 'undefined') {
    return;
  }

  localStorage.setItem(key, JSON.stringify(value));
}

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
// el componente WeekSchedule coincida siempre con lo guardado en la BBDD.
// Una entrada con ambos horarios null (startTime/endTime) representa un día
// cerrado y se conserva; una entrada incompleta (solo un lado) se descarta:
// un horario incompleto nunca se persiste.
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

if (typeof entry.dayOfWeek === 'number') {
      if (typeof entry.startTime === 'string' && typeof entry.endTime === 'string') {
        const startTime = padTime(entry.startTime);
        const endTime = padTime(entry.endTime);
        result.push({ dayOfWeek: entry.dayOfWeek, startTime, endTime });
      } else if (entry.startTime === null && entry.endTime === null) {
        // Día cerrado: se conserva sin tramos.
        result.push({ dayOfWeek: entry.dayOfWeek, startTime: null, endTime: null });
      }
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

// Completa los días 0-6 ausentes del array como cerrados
// ({ startTime: null, endTime: null }). Un día ausente es indistinguible de
// "sin datos" para getBusinessHoursByDay (que lo interpreta como "sin
// restricción"), así que sin esto un día cerrado que no llegó a persistirse
// explícito parecería abierto 24h en el Schedule. Se usa tanto para el
// horario del negocio (getOpeningHours) como el de cada miembro del equipo.
function fillMissingDaysAsClosed(entries: OpeningHoursEntry[]): OpeningHoursEntry[] {
  const result = [...entries];

  for (let dayOfWeek = 0; dayOfWeek < 7; dayOfWeek++) {
    if (!result.some((entry) => entry.dayOfWeek === dayOfWeek)) {
      result.push({ dayOfWeek, startTime: null, endTime: null });
    }
  }

  return result;
}

export function getTeamMembers(): TeamMember[] {
  const members = readCollection(TEAM_MEMBERS_STORAGE_KEY, teamMembersJson as unknown as TeamMember[]);
  return members.map((member) => ({
    ...member,
    schedule: fillMissingDaysAsClosed(normalizeOpeningHours(member.schedule)),
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

/* ── Turnos (appointments) ────────────────────────────────── */

export function getAppointments(): Appointment[] {
  return readCollection(APPOINTMENTS_STORAGE_KEY, appointmentsJson as Appointment[]);
}

export function getAppointmentsByDate(date: Date): Appointment[] {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  const dateStr = `${yyyy}-${mm}-${dd}`;
  return getAppointments().filter((a) => a.date === dateStr);
}

export function saveAppointments(appointments: Appointment[]) {
  writeCollection(APPOINTMENTS_STORAGE_KEY, appointments);
}

export function addAppointment(appointment: Appointment): Appointment[] {
  const current = getAppointments();
  const next = [...current, appointment];
  saveAppointments(next);
  return next;
}

export function getOpeningHours(): OpeningHoursEntry[] {
  return fillMissingDaysAsClosed(normalizeOpeningHours(getBusiness().schedule));
}

export function saveOpeningHours(schedule: OpeningHoursEntry[]) {
  saveBusiness({ ...getBusiness(), schedule });
}

/* ── Datos del negocio (Ajustes: Negocio, Horarios, Seguridad) ── */

export function getBusiness(): Business {
  return readObject(BUSINESS_STORAGE_KEY, businessJson as Business);
}

export function saveBusiness(business: Business) {
  writeObject(BUSINESS_STORAGE_KEY, business);
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
