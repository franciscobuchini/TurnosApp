/* 
  src/pages/admin/Personalizacion.tsx
  Esta es la pagina mas compleja, desde acá se edita el sitio web que ven los clientes.
*/

import Layout from '../../components/layout/Layout';
import MainContent from '../../components/layout/MainContent';
import MainContentHeader from '../../components/widgets/MainContentHeader';

function Personalizacion() {
  return (
    <Layout withSidebar>
      <MainContent>
        <MainContentHeader
          title="Personalizacion"
          subtitle="Personalizá el diseño, colores y la información pública de tu negocio."
        />
      </MainContent>
    </Layout>
  );
}
export default Personalizacion;
