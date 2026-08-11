import { useMemo } from 'react';
import { Plus, X } from 'lucide-react';
import { twMerge } from 'tailwind-merge';
import type { OpeningHoursEntry } from '../../../database/types';
import HourSelector from '@/components/ui/hour-selector';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import {
  DAYS,
  getDayError,
  getBusinessHoursByDay,
  getBusinessDayLimits,
  isRangeOrderValid,
  rangesOverlap,
  useWeekSchedule,
} from '@/hooks/useWeekSchedule';

export interface WeekScheduleProps {
  value?: OpeningHoursEntry[];
  onChange?: (schedule: OpeningHoursEntry[]) => void;
  readOnly?: boolean;
  title?: string;
  businessHours?: OpeningHoursEntry[];
}

export default function WeekSchedule({
  value,
  onChange,
  readOnly = false,
  title = 'Días y horarios de trabajo',
  businessHours,
}: WeekScheduleProps) {
  const businessHoursByDay = useMemo(
    () => getBusinessHoursByDay(businessHours),
    [businessHours],
  );
  const businessLimits = useMemo(
    () => getBusinessDayLimits(businessHours),
    [businessHours],
  );
  const { days, toggleWorks, addRange, removeRange, updateRange } = useWeekSchedule({
    value,
    onChange,
    limits: businessLimits,
  });

  return (
    <div className="flex flex-col gap-2 w-full min-h-0">
      <Label>{title}</Label>
      <div className="flex flex-col gap-2 w-full py-2 px-4 border border-border rounded-3xl">
        {DAYS.map((dayRow) => {
          const day = days[dayRow.dayOfWeek];
          const hasError = getDayError(day.ranges);

          return (
            <div
              key={dayRow.dayOfWeek}
              className={twMerge(
                "flex items-center gap-4 w-full px-4 py-3 h-20 transition-colors"
              )}
            >
              {/* Checkbox + Day Name */}
              <div className="flex items-center gap-4 min-w-[100px] shrink-0">
                <Checkbox
                  id={`week-day-${dayRow.dayOfWeek}`}
                  checked={day.works}
                  disabled={readOnly}
                  onCheckedChange={(checked) => toggleWorks(dayRow.dayOfWeek, checked === true)}
                />
                <span className="text-sm text-foreground min-w-16">{dayRow.label}</span>
              </div>

              {/* Separator */}
              <div className="h-5 w-px bg-border shrink-0" />

              {/* Body: Ranges or No Trabaja */}
              <div className="flex items-center gap-3 flex-1 min-w-0">
                {!day.works ? (
                  <span className="text-sm text-muted-foreground">No trabaja</span>
                ) : (
                  <div className="flex items-center gap-3 w-full">
                    {day.ranges.map((range, index) => {
                      const prevRange = index > 0 ? day.ranges[index - 1] : undefined;
                      const nextRange = index < day.ranges.length - 1 ? day.ranges[index + 1] : undefined;
                      const invalid = !isRangeOrderValid(range) || day.ranges.some(
                        (other, otherIndex) => otherIndex !== index && rangesOverlap(range, other),
                      );

                      return (
                        <div key={index} className="flex items-center gap-2 ">
                          <HourSelector
                            value={range.startTime}
                            min={prevRange?.endTime || undefined}
                            max={range.endTime || undefined}
                            businessHours={businessHoursByDay[dayRow.dayOfWeek]}
                            onChange={(time) => updateRange(dayRow.dayOfWeek, index, { startTime: time })}
                            readOnly={readOnly}
                            className={twMerge("w-20", invalid && "border-red-400 focus:border-red-400")}
                          />
                          <span className="text-muted-foreground shrink-0 text-xs">—</span>
                          <HourSelector
                            value={range.endTime}
                            min={range.startTime || undefined}
                            max={nextRange?.startTime || undefined}
                            businessHours={businessHoursByDay[dayRow.dayOfWeek]}
                            onChange={(time) => updateRange(dayRow.dayOfWeek, index, { endTime: time })}
                            readOnly={readOnly}
                            className={twMerge("w-20", invalid && "border-red-400 focus:border-red-400")}
                          />
                          {!readOnly && day.ranges.length > 1 && (
                            <button
                              type="button"
                              className="text-muted-foreground hover:text-destructive transition-colors p-1 rounded-md hover:bg-destructive/10 shrink-0 cursor-pointer"
                              onClick={() => removeRange(dayRow.dayOfWeek, index)}
                              aria-label="Quitar turno"
                            >
                              <X size={14} />
                            </button>
                          )}
                        </div>
                      );
                    })}

                    {/* Add Button if works and ranges < 2 */}
                    {!readOnly && day.ranges.length < 2 && (
                      <button
                        type="button"
                        className="h-8 px-3 rounded-2xl text-muted-foreground text-sm flex items-center gap-1 transition-all cursor-pointer"
                        onClick={() => addRange(dayRow.dayOfWeek)}
                      >
                        <Plus size={14} />
                        <span>Agregar</span>
                      </button>
                    )}

                    {hasError && (
                      <span className="text-[10px] text-red-400 leading-none">{hasError}</span>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}