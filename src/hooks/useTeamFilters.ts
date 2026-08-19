/*
  src/hooks/useTeamFilters.ts
  Helpers para derivar datos del filtro de equipo.

  columnCapacity: cuántas columnas de miembro entran en el ancho real del
  Schedule (lo mide y reporta Schedule.tsx vía setColumnCapacity — misma
  "lógica responsive" que ya usa DaySelectorButtons.tsx para las columnas de
  días, pero acá el ancho se mide de verdad en vez de breakpoints @container
  fijos, porque a diferencia de los 7 días fijos de la semana la cantidad de
  miembros tildados es variable). Mientras no se conoce (null, antes del
  primer render de Schedule) no se recorta nada.

  Tildar un miembro nuevo que hace desbordar el cupo destapa lugar
  destildando el primero de los ya tildados (ver makeRoomFor) — así "querer
  mostrar a alguien" siempre implica "ocultar a otro" (pedido explícito), en
  vez de un choque silencioso o columnas más angostas que el mínimo legible.

  El cupo achicándose SOLO (la ventana se angosta, un panel de la sidebar
  tapa más ancho) NO destilda a nadie acá — a propósito: `teamFilters` sigue
  siendo "lo que la persona pidió ver", y es Schedule.tsx el que recorta
  nada más que el RENDER a `visibleColumnCount` (ver visibleMembers ahí).
  Si achicáramos `checked` acá cada vez que el cupo baja, agrandar la
  ventana de nuevo no traería de vuelta solas a las columnas que
  desaparecieron — habría que volver a tildarlas a mano. Al no tocar el
  estado, sólo dejar de mostrarlas, agrandar el cupo alcanza para que
  reaparezcan sin ninguna acción extra.
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

/** Si tildar `keepId` hizo desbordar el cupo, destilda tantos otros tildados
    como haga falta (en orden de plantilla) para volver a entrar — `keepId`
    nunca se destilda, es el que se acaba de pedir mostrar. */
export function makeRoomFor(teamFilters: FiltersOption[], keepId: string, capacity: number): FiltersOption[] {
  const selectedCount = teamFilters.filter((f) => f.checked).length;
  let overflow = selectedCount - capacity;
  if (overflow <= 0) return teamFilters;

  return teamFilters.map((filter) => {
    if (overflow <= 0 || !filter.checked || filter.id === keepId) return filter;
    overflow -= 1;
    return { ...filter, checked: false };
  });
}

export function useTeamFilters(initialFilters: () => FiltersOption[]) {
  const [teamFilters, setTeamFilters] = useState(initialFilters);
  // null = todavía no se midió el ancho real del Schedule — no recortar nada.
  const [columnCapacity, setColumnCapacity] = useState<number | null>(null);

  const toggleTeamFilter = (id: string, checked: boolean) => {
    setTeamFilters((currentFilters) => {
      const next = toggleTeamFilterChecked(currentFilters, id, checked);
      if (!checked || columnCapacity === null) return next;
      return makeRoomFor(next, id, columnCapacity);
    });
  };

  const removeTeamFilter = (label: string) => {
    setTeamFilters((currentFilters) => removeTeamFilterChecked(currentFilters, label));
  };

  /* Memoizado: si esta referencia cambiara en cada render, el Schedule
     re-ejecutaría su efecto de centrado (depende de members vía
     availablePreviewRegions) en cada render del Dashboard, saltando el scroll
     a la mitad del tramo libre más largo justo al hacer click en una celda. */
  const selectedMembers = useMemo(() => getSelectedMembers(teamFilters), [teamFilters]);
  const visibleTeamFilters = useMemo(() => {
    if (columnCapacity === null) return teamFilters;

    let visibleCheckedCount = 0;

    return teamFilters.map((filter) => {
      if (!filter.checked) return filter;

      visibleCheckedCount += 1;
      return visibleCheckedCount <= columnCapacity
        ? filter
        : { ...filter, checked: false };
    });
  }, [teamFilters, columnCapacity]);

  return {
    teamFilters: visibleTeamFilters,
    selectedMembers,
    toggleTeamFilter,
    removeTeamFilter,
    setColumnCapacity,
  };
}
