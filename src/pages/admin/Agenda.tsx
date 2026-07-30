/* 
  src/pages/admin/Agenda.tsx
  Calendario de turnos para el usuario admin.
*/

import { CalendarPlus } from 'lucide-react';
import Layout from '../../components/layout/Layout';
import MainContent from '../../components/layout/MainContent';
import Button from '../../components/interface/Button';
import Calendar from '../../components/widgets/Calendar';
import DailyView from '../../components/widgets/DailyView';

function Agenda() {

  return (
    <Layout
      withSidebar
      withSidebar2
      sidebar2Title="Agenda"
      sidebar2Action={<Button textAlign="center" icon={<CalendarPlus size={20} />} />}
      sidebar2Content={
          <Calendar />
      }
    >
      <MainContent>
        <DailyView />
      </MainContent>
    </Layout>
  );
}
export default Agenda;