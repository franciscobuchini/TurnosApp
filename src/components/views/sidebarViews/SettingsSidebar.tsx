/*
  src/components/views/sidebarViews/SettingsSidebar.tsx
  Sidebar de Ajustes: título "Ajustes" + opciones de sección (Negocio, Horarios,
  Seguridad) que navegan a la vista correspondiente.
*/

import type { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { Settings, Clock, Lock } from 'lucide-react';
import Sidebar from '../../layout/Sidebar';
import SidebarOption from '../../widgets/sidebarWidgets/SidebarOption';

interface SettingsSection {
  id: string;
  label: string;
  icon: ReactNode;
  path: string;
}

const SETTINGS_SECTIONS: SettingsSection[] = [
  { id: 'negocio', label: 'Negocio', icon: <Settings size={20} />, path: '/admin/ajustes' },
  { id: 'horarios', label: 'Horarios', icon: <Clock size={20} />, path: '/admin/ajustes/horarios' },
  { id: 'seguridad', label: 'Seguridad', icon: <Lock size={20} />, path: '/admin/ajustes/seguridad' },
];

interface SettingsSidebarProps {
  activeId: string;
}

export default function SettingsSidebar({ activeId }: SettingsSidebarProps) {
  const navigate = useNavigate();

  return (
    <Sidebar title="Ajustes">
      {SETTINGS_SECTIONS.map((section) => (
        <SidebarOption
          key={section.id}
          id={section.id}
          title={section.label}
          icon={section.icon}
          selectedId={activeId}
          onSelect={() => navigate(section.path)}
        />
      ))}
    </Sidebar>
  );
}