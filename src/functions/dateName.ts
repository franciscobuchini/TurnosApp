/*
  src/functions/dateName.ts
  Nombres de días y meses en español, y helpers de fecha compartidos
  por los componentes de calendario/agenda.
*/

/* DAY_NAMES: indexado por date.getDay() (0 = Domingo ... 6 = Sábado) */
export const DAY_NAMES = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

/* MONTH_NAMES: indexado por date.getMonth() (0 = Enero ... 11 = Diciembre) */
export const MONTH_NAMES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
];

/* getDayName: nombre de día para una fecha dada, opcionalmente recortado */
export const getDayName = (date: Date, length?: number): string => {
  const name = DAY_NAMES[date.getDay()];
  return length ? name.slice(0, length) : name;
};

/* getMonthName: nombre de mes para una fecha dada, opcionalmente recortado */
export const getMonthName = (date: Date, length?: number): string => {
  const name = MONTH_NAMES[date.getMonth()];
  return length ? name.slice(0, length) : name;
};

/* isSameDay: compara dos fechas ignorando la hora */
export const isSameDay = (date1: Date, date2: Date): boolean => {
  return (
    date1.getDate() === date2.getDate() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getFullYear() === date2.getFullYear()
  );
};