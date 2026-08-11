/*
  src/components/views/sidebarViews/AddShiftSidebar.tsx
  Estado "agregar turno" de la sidebar: header "Seleccionar servicio" y solo el
  panel de Servicios abierto. Al cerrarse el panel, vuelve al estado anterior
  (onClose).
*/

import { useNavigate } from 'react-router-dom';
import Sidebar from '../../layout/Sidebar';
import DetailsPanel, {
  type DetailsPanelOption,
} from '../../widgets/sidebarWidgets/DetailsPanel';
import AddEntityLauncherButton from '../../buttons/AddEntityLauncherButton';
import { ServiceFilterButton } from '../../widgets/sidebarWidgets/DropdownRowActions';
import AddServiceView, { ADD_SERVICE_VIEW_TITLE } from '../ServiceView';

interface AddShiftSidebarProps {
  serviceFilters: DetailsPanelOption[];
  toggleServiceFilter: (id: string, checked: boolean) => void;
  onClose: () => void;
}

export default function AddShiftSidebar({
  serviceFilters,
  toggleServiceFilter,
  onClose,
}: AddShiftSidebarProps) {
  const navigate = useNavigate();

  return (
    <Sidebar title="seleccionar servicio">
      <DetailsPanel
        title="Servicios"
        options={serviceFilters}
        renderDropdownItems={(option) => [
          <ServiceFilterButton
            key={`${option.id}-toggle`}
            option={option}
            onToggle={toggleServiceFilter}
            onOpenDetails={() => navigate(`/admin/servicio/${encodeURIComponent(option.label)}`)}
          />,
        ]}
        action={
          <AddEntityLauncherButton
            title={ADD_SERVICE_VIEW_TITLE}
            onOpen={() => navigate('/admin/servicio')}
            renderView={({ open, onClose }) => (
              <AddServiceView open={open} onClose={onClose} title={ADD_SERVICE_VIEW_TITLE} />
            )}
          />
        }
        open
        hideHeader
        onToggle={(e) => {
          if (!e.currentTarget.open) {
            onClose();
          }
        }}
      />
    </Sidebar>
  );
}