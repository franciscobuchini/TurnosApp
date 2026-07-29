/* 
  src/pages/admin/Agenda.tsx
  Calendario de turnos para el usuario admin.
*/

import { useState } from 'react';
import Layout from '../../components/layout/Layout';
import MainContent from '../../components/layout/MainContent';
import MainContentHeader from '../../components/widgets/MainContentHeader';
import Button from '../../components/interface/Button';
import Select from '../../components/interface/Select';

import MonthlyView from '../../components/widgets/MonthlyView';
import DailyView from '../../components/widgets/DailyView';

function Agenda() {
  const [selectedTeamMember, setSelectedTeamMember] = useState('todos');
  const [selectedTimeRange, setSelectedTimeRange] = useState('mes');
  const [selectedProduct, setSelectedProduct] = useState('todos-productos');

  const teamMemberOptions = [
    { label: 'Todo el equipo', value: 'todos' },
    { label: 'Carlos Rodriguez', value: 'carlos' },
    { label: 'Mariana Lopez', value: 'mariana' },
    { label: 'Diego Fernandez', value: 'diego' },
    { label: 'Sin asignar', value: 'sin-asignar' },
  ];

  const timeRangeOptions = [
    { label: 'Mensual', value: 'mes' },
    { label: 'Diario', value: 'dia' },
  ];

    const productOptions = [
    { label: 'Todos los productos', value: 'todos-productos' },
    { label: 'Corte de Pelo Masculino', value: 'corte-pelo-masculino' },
    { label: 'Recorte de Barba + Spa', value: 'recorte-barba-spa' },
    { label: 'Coloración y Reflejos', value: 'coloracion-reflejos' },
  ];

  return (
    <Layout withSidebar>
      <MainContent>
        <MainContentHeader
          title="Agenda"
          subtitle="Organizá el día, confirmá reservas y gestioná la disponibilidad."
          action={
            <div className="flex items-center gap-4">
              <Select
                options={timeRangeOptions}
                value={selectedTimeRange}
                onChange={setSelectedTimeRange}
              />
              <Select
                options={teamMemberOptions}
                value={selectedTeamMember}
                onChange={setSelectedTeamMember}
              />
              <Select
                options={productOptions}
                value={selectedProduct}
                onChange={setSelectedProduct}
              />
              <Button>Agregar turno</Button>
            </div>
          }
        />
        {selectedTimeRange === 'mes' ? <MonthlyView /> : <DailyView />}
      </MainContent>
    </Layout>
  );
}
export default Agenda;