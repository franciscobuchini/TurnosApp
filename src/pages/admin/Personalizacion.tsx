/* 
  src/pages/admin/Personalizacion.tsx
  Esta es la pagina mas compleja, desde acá se edita el sitio web que ven los clientes.
*/

import Layout from '../../components/layout/Layout';
import MainContent from '../../components/layout/MainContent';
import Button from '../../components/interface/Button';
import { Eye } from 'lucide-react';

function Personalizacion() {
  return (
    <Layout
      withSidebar
      withSidebar2
      sidebar2Title="Personalizacion"
      sidebar2Action={<Button textAlign="center" icon={<Eye size={20} />} />}
      sidebar2Content={<></>}
    >
      <MainContent />
    </Layout>
  );
}
export default Personalizacion;
