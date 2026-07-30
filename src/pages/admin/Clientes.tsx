/* 
  src/pages/admin/Clientes.tsx
  Lista de clientes.
*/

import { SmilePlus } from 'lucide-react';
import Layout from '../../components/layout/Layout';
import MainContent from '../../components/layout/MainContent';
import ClientsTable from '../../components/widgets/ClientsTable';
import Button from '../../components/interface/Button';

function Clientes() {
  return (
    <Layout
      withSidebar
      withSidebar2
      sidebar2Title="Clientes"
      sidebar2Action={<Button textAlign="center" icon={<SmilePlus size={20} />} />}
      sidebar2Content={<>Contenido del sidebar</>}
    >
      <MainContent>
        <ClientsTable />
      </MainContent>
    </Layout>
  );
}
export default Clientes;
