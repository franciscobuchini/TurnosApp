/*
  src/functions/scheduleZoom.ts
  Niveles de zoom del Schedule: un único valor (rowHeightPx, alto en píxeles
  de un slot de 15 min) del que dependen a la vez el alto de fila de la
  tabla (Schedule.tsx), el alto de las tarjetas de turno (AppointmentCard.tsx)
  y el reposicionamiento de la línea de hora actual (current-time-line.tsx).
  Cambiar solo ese número reacomoda los tres a la par.
*/

/** Niveles disponibles, de más chico a más grande. */
export const ROW_HEIGHT_LEVELS_PX: number[] = [28, 36, 48, 64, 80];

/** Alto de fila con el que arranca el Schedule (equivale al h-12 anterior). */
export const DEFAULT_ROW_HEIGHT_PX = 48;

function currentLevelIndex(rowHeightPx: number): number {
  const index = ROW_HEIGHT_LEVELS_PX.indexOf(rowHeightPx);
  return index === -1 ? ROW_HEIGHT_LEVELS_PX.indexOf(DEFAULT_ROW_HEIGHT_PX) : index;
}

/** Siguiente nivel más grande, o el mismo si ya está en el máximo. */
export function zoomIn(rowHeightPx: number): number {
  const nextIndex = Math.min(currentLevelIndex(rowHeightPx) + 1, ROW_HEIGHT_LEVELS_PX.length - 1);
  return ROW_HEIGHT_LEVELS_PX[nextIndex];
}

/** Siguiente nivel más chico, o el mismo si ya está en el mínimo. */
export function zoomOut(rowHeightPx: number): number {
  const nextIndex = Math.max(currentLevelIndex(rowHeightPx) - 1, 0);
  return ROW_HEIGHT_LEVELS_PX[nextIndex];
}

export function canZoomIn(rowHeightPx: number): boolean {
  return currentLevelIndex(rowHeightPx) < ROW_HEIGHT_LEVELS_PX.length - 1;
}

export function canZoomOut(rowHeightPx: number): boolean {
  return currentLevelIndex(rowHeightPx) > 0;
}
