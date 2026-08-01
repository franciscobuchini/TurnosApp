/*
  src/components/interface/FiltersGroupContext.tsx
  Contexto que agrupa los Filters de un mismo contenedor (sidebar, maincontent, etc.)
  para que abrir uno cierre los demás del mismo grupo. Usa el atributo nativo `name`
  de <details>, que hace que el navegador se encargue de la exclusividad — no hace
  falta manejar estado a mano.
*/

import { createContext, useContext } from 'react';

const FiltersGroupContext = createContext<string | undefined>(undefined);

export const FiltersGroupProvider = FiltersGroupContext.Provider;

export function useFiltersGroup(): string | undefined {
  return useContext(FiltersGroupContext);
}