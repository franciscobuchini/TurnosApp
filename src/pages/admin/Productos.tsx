/* 
  src/pages/admin/Productos.tsx
  Lista de productos/servicios que ofrece el negocio.
*/

import { PackagePlus } from 'lucide-react';
import Layout from '../../components/layout/Layout';
import MainContent from '../../components/layout/MainContent';
import ProductsTable from '../../components/widgets/ProductsTable';
import Button from '../../components/interface/Button';

function Productos() {
  return (
    <Layout
      withSidebar
      withSidebar2
      sidebar2Title="Productos/Servicios"
      sidebar2Action={<Button textAlign="center" icon={<PackagePlus size={20} />} />}
      sidebar2Content={<></>}
    >
      <MainContent>
        <ProductsTable />
      </MainContent>
    </Layout>
  );
}
export default Productos;
