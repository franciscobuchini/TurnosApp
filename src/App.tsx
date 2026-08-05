import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/landing/Home';
import Dashboard from './pages/admin/Dashboard';
import Personalizacion from './pages/admin/Personalizacion';
import Site from './pages/clients/Site';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/personalizacion" element={<Personalizacion />} />
        <Route path="/site" element={<Site />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
