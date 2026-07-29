/* 
  src/components/widgets/DailyView.tsx
  Vista diaria de la agenda, organizada por bloques horarios representados con bordes.
  Permite navegar por días de la semana y desplazarse por fechas.
*/

import { useState } from 'react';

const WEEK_DAYS = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
const MONTH_NAMES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

const getWeekDays = (date: Date): Date[] => {
  const current = new Date(date);
  const day = current.getDay();
  // Ajustar para que Lunes sea el primer día de la semana (0 = Domingo, 1 = Lunes, etc.)
  const diff = current.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(current.setDate(diff));
  
  const week: Date[] = [];
  for (let i = 0; i < 7; i++) {
    const next = new Date(monday);
    next.setDate(monday.getDate() + i);
    week.push(next);
  }
  return week;
};

const formatDate = (date: Date): string => {
  const dayName = WEEK_DAYS[date.getDay()];
  const dayNum = date.getDate();
  const monthName = MONTH_NAMES[date.getMonth()];
  const year = date.getFullYear();
  return `${dayName}, ${dayNum} de ${monthName} de ${year}`;
};

export default function DailyView() {
  const [selectedDate, setSelectedDate] = useState(new Date());

  const hours = [
    '08:00', '09:00', '10:00', '11:00', '12:00', '13:00',
    '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00'
  ];

  const weekDays = getWeekDays(selectedDate);

  // Navegación diaria
  const prevDay = () => {
    const next = new Date(selectedDate);
    next.setDate(selectedDate.getDate() - 1);
    setSelectedDate(next);
  };

  const nextDay = () => {
    const next = new Date(selectedDate);
    next.setDate(selectedDate.getDate() + 1);
    setSelectedDate(next);
  };

  // Navegación semanal
  const prevWeek = () => {
    const next = new Date(selectedDate);
    next.setDate(selectedDate.getDate() - 7);
    setSelectedDate(next);
  };

  const nextWeek = () => {
    const next = new Date(selectedDate);
    next.setDate(selectedDate.getDate() + 7);
    setSelectedDate(next);
  };

  const goToToday = () => {
    setSelectedDate(new Date());
  };

  const isSameDay = (date1: Date, date2: Date) => {
    return (
      date1.getDate() === date2.getDate() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getFullYear() === date2.getFullYear()
    );
  };

  return (
    <div className="flex flex-col w-full border border-black p-4 gap-4">
      {/* Controles superiores */}
      <div className="flex flex-col tablet:flex-row justify-between items-center border-b border-black pb-4 gap-4">
        <div className="flex flex-col items-center tablet:items-start">
          <h2 className="text-lg font-bold">{formatDate(selectedDate)}</h2>
          <span className="text-xs text-neutral-500">Horario de turnos de hoy</span>
        </div>
        <div className="flex gap-2">
          <button
            onClick={prevDay}
            className="border border-black px-4 py-2 text-sm font-semibold hover:bg-black/5"
          >
            Día Ant.
          </button>
          <button
            onClick={goToToday}
            className="border border-black px-4 py-2 text-sm font-semibold hover:bg-black/5"
          >
            Hoy
          </button>
          <button
            onClick={nextDay}
            className="border border-black px-4 py-2 text-sm font-semibold hover:bg-black/5"
          >
            Día Sig.
          </button>
        </div>
      </div>

      {/* Selector de días de la semana */}
      <div className="flex items-center justify-between border border-black p-2">
        <button
          onClick={prevWeek}
          className="border border-black px-3 py-1 text-xs font-bold hover:bg-black/5"
        >
          Semana Ant.
        </button>

        <div className="flex flex-1 justify-around mx-4 gap-1">
          {weekDays.map((date, idx) => {
            const active = isSameDay(date, selectedDate);
            return (
              <button
                key={idx}
                onClick={() => setSelectedDate(date)}
                className={`flex-1 flex flex-col items-center justify-center p-2 border ${
                  active ? 'border-2 border-black font-bold' : 'border-black/20 hover:border-black/50'
                }`}
              >
                <span className="text-xs">{WEEK_DAYS[idx]}</span>
                <span className="text-sm">{date.getDate()}</span>
              </button>
            );
          })}
        </div>

        <button
          onClick={nextWeek}
          className="border border-black px-3 py-1 text-xs font-bold hover:bg-black/5"
        >
          Semana Sig.
        </button>
      </div>

      {/* Agenda diaria (Bloques horarios) */}
      <div className="flex flex-col border border-black">
        {hours.map((hour, index) => {
          // Mostrar un turno de ejemplo diferente según el día seleccionado para simular datos reales
          const hasEvent = (selectedDate.getDate() + index) % 4 === 0;

          return (
            <div key={hour} className="flex border-b border-black last:border-b-0 py-2 items-center">
              <div className="w-20 border-r border-black pr-4 text-right font-semibold">
                {hour}
              </div>
              <div className="flex-1 pl-4 flex gap-2">
                {hasEvent ? (
                  <div className="flex-1 border border-dashed border-black h-8 flex items-center justify-center text-sm">
                    Turno Reservado ({hour})
                  </div>
                ) : (
                  <div className="flex-1 h-8" />
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
