/* 
  src/pages/admin/Productos.tsx
  Lista de productos/servicios que ofrece el negocio.
*/

import { PackagePlus } from 'lucide-react';
import Layout from '../../components/layout/Layout';
import Sidebar from '../../components/layout/Sidebar';
import SidebarHeader from '../../components/widgets/SidebarHeader';
import MainContent from '../../components/layout/MainContent';
import ProductsTable from '../../components/widgets/ProductsTable';
import Button from '../../components/interface/Button';

function Productos() {
  return (
    <Layout>
      <Sidebar>
        <SidebarHeader
          title="Productos/Servicios"
          action={<Button textAlign="center" icon={<PackagePlus size={20} />} />}
        />
      </Sidebar>
      <MainContent>
        <ProductsTable />
      </MainContent>
    </Layout>
  );
}
export default Productos;