/* 
  src/pages/admin/Personalizacion.tsx
  Esta es la pagina mas compleja, desde acá se edita el sitio web que ven los clientes.
*/

import Layout from '../../components/layout/Layout';
import Sidebar from '../../components/layout/Sidebar';
import SidebarHeader from '../../components/widgets/SidebarHeader';
import MainContent from '../../components/layout/MainContent';
import Button from '../../components/interface/Button';
import { Eye } from 'lucide-react';

function Personalizacion() {
  return (
    <Layout>
      <Sidebar>
        <SidebarHeader
          title="Personalizacion"
          action={<Button textAlign="center" icon={<Eye size={20} />} />}
        />
      </Sidebar>
      <MainContent />
    </Layout>
  );
}
export default Personalizacion;