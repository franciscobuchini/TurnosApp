/*
  src/site/sections/SiteHours.tsx
  Horarios de atención — apartado propio, separado de Ubicación (ver
  SiteLocation.tsx). Agrupa días consecutivos con el mismo horario en una
  sola fila ("Lunes a Viernes · 09:00–18:00") y resalta el día de hoy.
*/

import SiteSection from '../components/SiteSection';
import { SITE_HEADING_CLASS } from '../design/cssVars';
import { DAYS, getBusinessHoursByDay, type TimeRange } from '@/hooks/useWeekSchedule';
import type { OpeningHoursEntry } from '@/database/types';

interface SiteHoursProps {
  schedule: OpeningHoursEntry[];
}

function formatRanges(ranges: TimeRange[]): string {
  return ranges.length === 0 ? 'Cerrado' : ranges.map((range) => `${range.startTime}–${range.endTime}`).join(', ');
}

function groupScheduleRows(hoursByDay: Record<number, TimeRange[]>) {
  const groups: { days: typeof DAYS; hours: string }[] = [];

  for (const day of DAYS) {
    const hours = formatRanges(hoursByDay[day.dayOfWeek] ?? []);
    const current = groups[groups.length - 1];

    if (current && current.hours === hours) {
      current.days.push(day);
    } else {
      groups.push({ days: [day], hours });
    }
  }

  return groups.map((group) => ({
    label:
      group.days.length === 1 ? group.days[0].label : `${group.days[0].label} a ${group.days[group.days.length - 1].label}`,
    hours: group.hours,
    includesToday: group.days.some((day) => day.dayOfWeek === new Date().getDay()),
  }));
}

export default function SiteHours({ schedule }: SiteHoursProps) {
  const hoursByDay = getBusinessHoursByDay(schedule);
  const scheduleRows = groupScheduleRows(hoursByDay);

  return (
    <SiteSection id="horarios">
      <h2 className={`text-2xl font-semibold ${SITE_HEADING_CLASS}`}>Horarios</h2>

      <div className="flex w-full flex-col rounded-(--site-radius) border border-(--site-border) bg-(--site-surface) backdrop-blur-xl divide-y divide-(--site-border)">
        {scheduleRows.map((row) => (
          <div
            key={row.label}
            className="flex items-center justify-between gap-4 px-5 py-3 text-sm first:rounded-t-(--site-radius) last:rounded-b-(--site-radius)"
          >
            <span className={row.includesToday ? 'font-medium' : undefined}>{row.label}</span>
            <span className={row.includesToday ? 'font-medium text-(--site-text)' : 'text-(--site-text-muted)'}>
              {row.hours}
            </span>
          </div>
        ))}
      </div>
    </SiteSection>
  );
}
