/* 
  src/pages/admin/Agenda.tsx
  Calendario de turnos para el usuario admin.
*/

import Layout from '../../components/layout/Layout';
import MainContent from '../../components/layout/MainContent';
import MainContentHeader from '../../components/widgets/MainContentHeader';

function Agenda() {
  return (
    <Layout withSidebar>
      <MainContent>
        <MainContentHeader title="Agenda" />
      </MainContent>
    </Layout>
  );
}
export default Agenda;
