/* 
  src/pages/admin/Productos.tsx
  Lista de productos/servicios que ofrece el negocio.
*/

import Layout from '../../components/layout/Layout';
import MainContent from '../../components/layout/MainContent';
import MainContentHeader from '../../components/widgets/MainContentHeader';

function Productos() {
  return (
    <Layout withSidebar>
      <MainContent>
        <MainContentHeader title="Productos/Servicios" />
      </MainContent>
    </Layout>
  );
}
export default Productos;
