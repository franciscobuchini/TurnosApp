/*
  src/components/views/SettingsScheduleView.tsx
  Vista de Ajustes > Horarios (/SettingsView/horarios). Define el horario del
  local (reutiliza EntityWeekSchedule, que también se usa por trabajador).
*/

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../layout/Layout';
import SettingsSidebar from './sidebarViews/SettingsSidebar';
import ViewLayout from '../layout/ViewLayout';
import Form from '../interface/Form';
import Input from '../interface/Input';
import EntityWeekSchedule from '../widgets/entityWidgets/EntityWeekSchedule';
import { getBusiness, getOpeningHours, saveBusiness, saveOpeningHours } from '../../database/data';
import type { OpeningHoursEntry } from '../../database/types';
import CancelButton from '../buttons/CancelButton';
import ConfirmButton from '../buttons/ConfirmButton';

export default function SettingsScheduleView() {
  const navigate = useNavigate();
  const goBack = () => navigate('/admin');

  const [businessHours, setBusinessHours] = useState<OpeningHoursEntry[]>(() =>
    getOpeningHours(),
  );
  const [advanceHours, setAdvanceHours] = useState(() =>
    String(getBusiness().advanceHours ?? 0),
  );

  const handleSave = () => {
    saveOpeningHours(businessHours);
    saveBusiness({ ...getBusiness(), advanceHours: Number(advanceHours) || 0 });
    goBack();
  };

  return (
    <Layout sidebar={<SettingsSidebar activeId="horarios" />}>
      <ViewLayout
        title="Horarios"
        onBack={goBack}
        left={
          <Form className="flex flex-col gap-(--size-m)">
            <EntityWeekSchedule title="Horario del local" value={businessHours} onChange={setBusinessHours} />
          </Form>
        }
        right={
          <Form className="flex flex-col gap-(--size-m)">
            <Input
              label="Anticipación para reservar (horas)"
              type="number"
              min={0}
              placeholder="0"
              value={advanceHours}
              onChange={(e) => setAdvanceHours(e.target.value)}
            />
          </Form>
        }
        footer={
          <>
            <CancelButton onClick={goBack} text="Cancelar" />
            <ConfirmButton onClick={handleSave} text="Guardar" />
          </>
        }
      />
    </Layout>
  );
}