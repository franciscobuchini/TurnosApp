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
import AddServiceButton from '../../buttons/AddServiceButton';
import ServiceFilterButton from '../../buttons/ServiceFilterButton';

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
        action={<AddServiceButton onOpen={() => navigate('/admin/servicio')} />}
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