import { twMerge } from 'tailwind-merge';
import Button from '../interface/Button';

/* SidebarStyle: clases de estilo, estas si se pueden variar */
const SidebarStyle = {
  sidebar: 'bg-black',
  nav: 'gap-(--size-s) mx-(--size-s) my-(--size-xl)',
};

export default function Sidebar() {
  return (
    <aside
      className={twMerge(
        'hidden h-full flex-col tablet:flex tablet:w-(--size-3xl) desktop:w-(--size-6xl)',
        SidebarStyle.sidebar,
      )}
    >
      <nav className={twMerge('flex flex-col', SidebarStyle.nav)}>
        <Button to="/admin/agenda">Agenda/Turnos</Button>
        <Button to="/admin/equipo">Equipo/Ambientes</Button>
        <Button to="/admin/productos">Productos/Servicios</Button>
        <Button to="/admin/clientes">Clientes</Button>
        <Button to="/admin/personalizacion">Personalización</Button>
      </nav>
    </aside>
  );
}