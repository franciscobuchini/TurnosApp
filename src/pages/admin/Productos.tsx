/* 
  src/pages/admin/Productos.tsx
  Lista de productos/servicios que ofrece el negocio.
*/

import Layout from '../../components/layout/Layout';
import MainContent from '../../components/layout/MainContent';
import MainContentHeader from '../../components/widgets/MainContentHeader';
import ProductsTable from '../../components/widgets/ProductsTable';
import Button from '../../components/interface/Button';

function Productos() {
  return (
    <Layout withSidebar>
      <MainContent>
        <MainContentHeader
          title="Productos/Servicios"
          subtitle="Definí los servicios y opciones que tus clientes pueden agendar online."
          action={<Button>Agregar servicio</Button>}
        />
        <ProductsTable />
      </MainContent>
    </Layout>
  );
}
export default Productos;
