/* 
  src/pages/admin/Productos.tsx
  Lista de productos/servicios que ofrece el negocio.
*/

import { PackagePlus } from 'lucide-react';
import Layout from '../../components/layout/Layout';
import Sidebar from '../../components/layout/Sidebar';
import MainHeader from '../../components/widgets/MainHeader';
import MainContent from '../../components/layout/MainContent';
import ProductsTable from '../../components/widgets/ProductsTable';
import Button from '../../components/interface/Button';

function Productos() {
  return (
    <Layout>
      <Sidebar>
        <MainHeader
          title="Productos/Servicios"
          action={<Button iconOnly="bottom" text="Agregar producto"  icon={<PackagePlus size={20} />} />}
        />
      </Sidebar>
      <MainContent>
        <ProductsTable />
      </MainContent>
    </Layout>
  );
}
export default Productos;
