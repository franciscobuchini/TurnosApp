/*
  src/pages/admin/Personalizacion.tsx
  Esta es la pagina mas compleja, desde acá se edita el sitio web que ven los clientes.
*/

import Layout from '../../components/layout/Layout';
import Sidebar from '../../components/layout/Sidebar';
import AppMenubar from '../../components/layout/AppMenubar';
import MainContent from '../../components/layout/MainContent';

function Personalizacion() {
  return (
    <Layout menubar={<AppMenubar />} sidebar={<Sidebar />}>
      <MainContent />
    </Layout>
  );
}
export default Personalizacion;
