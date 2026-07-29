/* 
  src/pages/admin/Equipo.tsx
  Página de administración del equipo de trabajo.
  Esta pagina tengo que ver que nombre darle a todo porque:
  si tenes un par de canchas de f5, cada cancha le correspondería una agenda,
  y si sos una peluqueria a cada trabajador le corresponde una agenda.
  Entonces de acá salen las agendas, pero el usuario no va a entender que esto le corresponde a un trabajador o a una cancha de f5, tengo que darle a entender eso.
*/

import Layout from '../../components/layout/Layout';
import MainContent from '../../components/layout/MainContent';
import ContentHeader from '../../components/widgets/ContentHeader';
import TeamTable from '../../components/widgets/TeamTable';
import Button from '../../components/interface/Button';

function Equipo() {
  return (
    <Layout withSidebar>
      <MainContent>
        <ContentHeader
          title="Equipo/Ambientes"
          subtitle="Coordiná los miembros de tu equipo, asigná sus roles y configurá sus horarios de trabajo."
          action={<Button>Agregar miembro</Button>}
        />
        <TeamTable />
      </MainContent>
    </Layout>
  );
}
export default Equipo;
