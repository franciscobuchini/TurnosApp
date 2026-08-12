/*
  src/components/buttons/weekSelectorButtonState.ts
  Estado visual (default / hoy / seleccionado) compartido entre los botones
  de navegación de semana (WeekNavigationButtons) y los botones de día
  (DaySelectorButtons). Sin colores de paleta acá: chocaban visualmente con
  los colores de servicio de las tarjetas de turnos. Los 3 estados se
  distinguen solo con grises/bordes del theme (--muted, --border,
  --foreground), que ya son claros/oscuros automáticamente según el tema
  activo.
*/

const WEEK_SELECTOR_DEFAULT_CLASS = 'bg-transparent text-muted-foreground hover:bg-muted/60 hover:text-foreground';

const WEEK_SELECTOR_TODAY_CLASS = 'bg-transparent border border-border text-foreground hover:bg-muted/60';

const WEEK_SELECTOR_SELECTED_CLASS = 'bg-muted border border-foreground/15 text-foreground hover:bg-muted';

export function weekSelectorStateClass(isSelected: boolean, isToday: boolean): string {
  if (isSelected) return WEEK_SELECTOR_SELECTED_CLASS;
  if (isToday) return WEEK_SELECTOR_TODAY_CLASS;
  return WEEK_SELECTOR_DEFAULT_CLASS;
}
