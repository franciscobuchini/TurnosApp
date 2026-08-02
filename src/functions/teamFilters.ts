/*
  src/functions/teamFilters.ts
  Helpers para derivar datos del filtro de equipo.
*/

import type { FiltersOption } from '../variables/types';

/* getSelectedMembers: dado el array de filtros del equipo, devuelve los labels
   de los que están chequeados. */
export function getSelectedMembers(teamFilters: FiltersOption[]): string[] {
  return teamFilters.filter((f) => f.checked).map((f) => f.label);
}
