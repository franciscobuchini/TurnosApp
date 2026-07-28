/* 
  src/pages/admin/Clientes.tsx
  Lista de clientes.
*/

import Layout from '../../components/layout/Layout';
import MainContent from '../../components/layout/MainContent';
import MainContentHeader from '../../components/widgets/MainContentHeader';
import ClientsTable from '../../components/widgets/ClientsTable';

function Clientes() {
  return (
    <Layout withSidebar>
      <MainContent>
        <MainContentHeader title="Clientes" />
        <ClientsTable />
      </MainContent>
    </Layout>
  );
}
export default Clientes;
