/* 
  src/pages/admin/Equipo.tsx
  Página de administración del equipo de trabajo.
  Esta pagina tengo que ver que nombre darle a todo porque:
  si tenes un par de canchas de f5, cada cancha le correspondería una agenda,
  y si sos una peluqueria a cada trabajador le corresponde una agenda.
  Entonces de acá salen las agendas, pero el usuario no va a entender que esto le corresponde a un trabajador o a una cancha de f5, tengo que darle a entender eso.
*/

import { BookmarkPlus } from 'lucide-react';
import Layout from '../../components/layout/Layout';
import Sidebar from '../../components/layout/Sidebar';
import SidebarHeader from '../../components/widgets/SidebarHeader';
import MainContent from '../../components/layout/MainContent';
import TeamTable from '../../components/widgets/TeamTable';
import Button from '../../components/interface/Button';

function Equipo() {
  return (
    <Layout>
      <Sidebar>
        <SidebarHeader
          title="Equipo/Ambientes"
          action={<Button textAlign="center" icon={<BookmarkPlus size={20} />} />}
        />
      </Sidebar>
      <MainContent>
        <TeamTable />
      </MainContent>
    </Layout>
  );
}
export default Equipo;