/*
  src/components/views/sidebarViews/AddShiftSidebar.tsx
  Estado "agregar turno" de la sidebar: header "Seleccionar servicio" y solo el
  panel de Servicios abierto (sin acción de agregar servicio nuevo). Al
  cerrarse el panel, vuelve al estado anterior (onClose).
*/

import { useNavigate } from 'react-router-dom';
import Sidebar from '../../layout/Sidebar';
import DetailsPanel, {
  type DetailsPanelOption,
} from '../../widgets/sidebarWidgets/DetailsPanel';
import CancelButton from '../../buttons/CancelButton';
import { ServiceFilterButton } from '../../widgets/sidebarWidgets/DropdownRowActions';

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
    <Sidebar footer={<CancelButton text="Cancelar" onClick={onClose} className="w-full" />}>
      <DetailsPanel
        title="Seleccionar servicio"
        options={serviceFilters}
        renderDropdownItems={(option) => [
          <ServiceFilterButton
            key={`${option.id}-toggle`}
            option={option}
            onToggle={toggleServiceFilter}
            onOpenDetails={() => navigate(`/admin/servicio/${encodeURIComponent(option.label)}`)}
          />,
        ]}
        open
        onToggle={(e) => {
          if (!e.currentTarget.open) {
            onClose();
          }
        }}
      />
    </Sidebar>
  );
}
