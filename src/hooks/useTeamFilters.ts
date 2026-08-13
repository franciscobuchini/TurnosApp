/*
  src/hooks/useTeamFilters.ts
  Helpers para derivar datos del filtro de equipo.
*/

import { useMemo, useState } from 'react';
import type { FiltersOption } from '../database/types';

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

export function removeTeamFilterChecked(
  teamFilters: FiltersOption[],
  label: string,
): FiltersOption[] {
  return teamFilters.filter((filter) => filter.label !== label);
}

export function useTeamFilters(initialFilters: () => FiltersOption[]) {
  const [teamFilters, setTeamFilters] = useState(initialFilters);

  const toggleTeamFilter = (id: string, checked: boolean) => {
    setTeamFilters((currentFilters) => toggleTeamFilterChecked(currentFilters, id, checked));
  };

  const removeTeamFilter = (label: string) => {
    setTeamFilters((currentFilters) => removeTeamFilterChecked(currentFilters, label));
  };

  /* Memoizado: si esta referencia cambiara en cada render, el Schedule
     re-ejecutaría su efecto de centrado (depende de members vía
     availablePreviewRegions) en cada render del Dashboard, saltando el scroll
     a la mitad del tramo libre más largo justo al hacer click en una celda. */
  const selectedMembers = useMemo(() => getSelectedMembers(teamFilters), [teamFilters]);

  return {
    teamFilters,
    selectedMembers,
    toggleTeamFilter,
    removeTeamFilter,
  };
}
