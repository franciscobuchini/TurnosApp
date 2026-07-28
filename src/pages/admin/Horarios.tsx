/* 
  src/pages/admin/Horarios.tsx
  Horarios de atención.
  Cada trabajador puede tener su propio horario. Pero hay que ver como coordinarlo con el horario del local.
*/

import Layout from '../../components/layout/Layout';
import MainContent from '../../components/layout/MainContent';
import MainContentHeader from '../../components/widgets/MainContentHeader';

function Horarios() {
  return (
    <Layout withSidebar>
      <MainContent>
        <MainContentHeader title="Horarios" />
      </MainContent>
    </Layout>
  );
}
export default Horarios;
