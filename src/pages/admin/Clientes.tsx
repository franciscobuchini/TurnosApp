/* 
  src/pages/admin/Clientes.tsx
  Lista de clientes.
*/

import Layout from '../../components/layout/Layout';
import MainContent from '../../components/layout/MainContent';
import ContentHeader from '../../components/widgets/ContentHeader';
import ClientsTable from '../../components/widgets/ClientsTable';
import Button from '../../components/interface/Button';

function Clientes() {
  return (
    <Layout withSidebar>
      <MainContent>
        <ContentHeader
          title="Clientes"
          subtitle="Administrá la información de tus clientes, datos de contacto y sus historiales."
          action={<Button>Agregar cliente</Button>}
        />
        <ClientsTable />
      </MainContent>
    </Layout>
  );
}
export default Clientes;
