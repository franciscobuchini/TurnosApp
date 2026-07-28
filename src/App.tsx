import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/landing/Home';
import Agenda from './pages/admin/Agenda';
import Horarios from './pages/admin/Horarios';
import Productos from './pages/admin/Productos';
import Equipo from './pages/admin/Equipo';
import Clientes from './pages/admin/Clientes';
import Personalizacion from './pages/admin/Personalizacion';
import Site from './pages/clients/Site';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/admin/agenda" element={<Agenda />} />
        <Route path="/admin/horarios" element={<Horarios />} />
        <Route path="/admin/productos" element={<Productos />} />
        <Route path="/admin/equipo" element={<Equipo />} />
        <Route path="/admin/clientes" element={<Clientes />} />
        <Route path="/admin/personalizacion" element={<Personalizacion />} />
        <Route path="/site" element={<Site />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
