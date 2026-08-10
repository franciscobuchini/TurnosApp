/*
  src/components/views/SettingsScheduleView.tsx
  Vista de Ajustes > Horarios (/admin/ajustes/horarios). Define el horario del
  local (reutiliza EntityWeekSchedule, que también se usa por trabajador).
*/

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { twMerge } from 'tailwind-merge';
import ViewLayout from '../layout/ViewLayout';
import Form from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import EntityWeekSchedule from '../widgets/entityWidgets/EntityWeekSchedule';
import { getBusiness, getOpeningHours, saveBusiness, saveOpeningHours } from '../../database/data';
import type { OpeningHoursEntry } from '../../database/types';
import CancelButton from '../buttons/CancelButton';
import ConfirmButton from '../buttons/ConfirmButton';

type AdvanceUnit = 'minutos' | 'horas';

const UNIT_OPTIONS: AdvanceUnit[] = ['minutos', 'horas'];

const UNIT_SELECTOR_CLASS = 'flex shrink-0 items-center gap-1 rounded-2xl border border-neutral-700 bg-neutral-800 p-1';

const UNIT_OPTION_CLASS = 'cursor-pointer rounded-xl px-3 py-1 text-md text-neutral-400 hover:text-neutral-100';

const UNIT_OPTION_ACTIVE_CLASS = 'bg-neutral-950 text-neutral-50';

export default function SettingsScheduleView() {
  const navigate = useNavigate();
  const goBack = () => navigate('/admin');

  const business = getBusiness();

  const [businessHours, setBusinessHours] = useState<OpeningHoursEntry[]>(() =>
    getOpeningHours(),
  );
  const [advanceValue, setAdvanceValue] = useState(() => {
    const advanceMinutes = business.advanceMinutes ?? 0;
    const hours = advanceMinutes >= 60 && advanceMinutes % 60 === 0;
    return hours ? String(advanceMinutes / 60) : String(advanceMinutes);
  });
  const [advanceUnit, setAdvanceUnit] = useState<AdvanceUnit>(() =>
    Number(advanceValue) >= 60 && Number(advanceValue) % 60 === 0 ? 'horas' : 'minutos',
  );

  const handleSave = () => {
    saveOpeningHours(businessHours);
    const value = Number(advanceValue) || 0;
    const advanceMinutes = advanceUnit === 'horas' ? value * 60 : value;
    saveBusiness({ ...getBusiness(), advanceMinutes });
    goBack();
  };

  return (
    <ViewLayout
      title="Horarios"
      onBack={goBack}
        left={
          <Form className="flex flex-col gap-4">
            <EntityWeekSchedule title="Horario del local" value={businessHours} onChange={setBusinessHours} />
          </Form>
        }
        right={
          <Form className="flex flex-col gap-4">
            <div className="flex items-end gap-3">
              <Input
                className="flex-1"
                label="Anticipación para reservar"
                type="number"
                min={0}
                placeholder="0"
                value={advanceValue}
                onChange={(e) => setAdvanceValue(e.target.value)}
              />
              <div className={UNIT_SELECTOR_CLASS}>
                {UNIT_OPTIONS.map((unit) => (
                  <button
                    key={unit}
                    type="button"
                    className={twMerge(UNIT_OPTION_CLASS, advanceUnit === unit && UNIT_OPTION_ACTIVE_CLASS)}
                    onClick={() => setAdvanceUnit(unit)}
                  >
                    {unit}
                  </button>
                ))}
              </div>
            </div>
          </Form>
        }
        footer={
          <>
            <CancelButton onClick={goBack} text="Cancelar" />
            <ConfirmButton onClick={handleSave} text="Guardar" />
          </>
        }
      />
  );
}