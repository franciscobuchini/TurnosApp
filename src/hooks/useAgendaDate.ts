/*
  src/hooks/useAgendaDate.ts
  Estado y acciones compartidas para la fecha visible/seleccionada de la agenda.
*/

import { useState } from 'react';

export function useAgendaDate() {
  const [viewDate, setViewDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());

  const selectDate = (date: Date) => {
    setViewDate(date);
    setSelectedDate(date);
  };

  return {
    viewDate,
    selectedDate,
    setViewDate,
    setSelectedDate,
    selectDate,
  };
}
