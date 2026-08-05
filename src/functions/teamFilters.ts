/*
  src/functions/teamFilters.ts
  Helpers para derivar datos del filtro de equipo.
*/

import { useState } from 'react';
import type { FiltersOption } from '../variables/types';

/* getSelectedMembers: dado el array de filtros del equipo, devuelve los labels
   de los que están chequeados. */
export function getSelectedMembers(teamFilters: FiltersOption[]): string[] {
  return teamFilters.filter((f) => f.checked).map((f) => f.label);
}

export function toggleTeamFilterChecked(
  teamFilters: FiltersOption[],
  id: string,
  checked: boolean,
): FiltersOption[] {
  return teamFilters.map((filter) =>
    filter.id === id ? { ...filter, checked } : filter,
  );
}

export function useTeamFilters(initialFilters: () => FiltersOption[]) {
  const [teamFilters, setTeamFilters] = useState(initialFilters);

  const toggleTeamFilter = (id: string, checked: boolean) => {
    setTeamFilters((currentFilters) => toggleTeamFilterChecked(currentFilters, id, checked));
  };

  return {
    teamFilters,
    selectedMembers: getSelectedMembers(teamFilters),
    toggleTeamFilter,
  };
}
