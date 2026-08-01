/* 
  src/pages/admin/Clientes.tsx
  Lista de clientes.
*/

import { SmilePlus } from 'lucide-react';
import Layout from '../../components/layout/Layout';
import Sidebar from '../../components/layout/Sidebar';
import MainHeader from '../../components/widgets/MainHeader';
import MainContent from '../../components/layout/MainContent';
import ClientsTable from '../../components/widgets/ClientsTable';
import Button from '../../components/interface/Button';

function Clientes() {
  return (
    <Layout>
      <Sidebar>
        <MainHeader
          title="Clientes"
          action={<Button iconOnly="bottom" text="Agregar cliente" icon={<SmilePlus size={20} />} />}
        />
        Contenido del sidebar
      </Sidebar>
      <MainContent>
        <ClientsTable />
      </MainContent>
    </Layout>
  );
}
export default Clientes;
