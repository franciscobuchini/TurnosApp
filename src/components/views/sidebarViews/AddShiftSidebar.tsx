/*
  src/components/views/sidebarViews/AddShiftSidebar.tsx
  Estado "agregar turno" de la sidebar, en dos pasos:
  1. "Seleccionar servicio" — hasta que se elige un horario en el Schedule.
  2. "Seleccionar cliente" — una vez que se hizo click en una celda disponible
     (shiftSlot ya tiene el horario elegido), para terminar de confirmar el turno.
  El botón de abajo cierra todo el flujo en el paso 1, y en el paso 2 vuelve
  al paso 1 (sin perder el servicio elegido) para poder elegir otro horario.
*/

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { FiltersOption } from '../../../database/types';
import type { ShiftSlot } from '../../../pages/admin/Dashboard';
import Sidebar from '../../layout/Sidebar';
import DetailsPanel, {
  type DetailsPanelOption,
} from '../../widgets/sidebarWidgets/DetailsPanel';
import CancelButton from '../../buttons/CancelButton';
import ConfirmButton from '../../buttons/ConfirmButton';
import AddEntityLauncherButton from '../../buttons/AddEntityLauncherButton';
import AddClientView, { ADD_CLIENT_VIEW_TITLE } from '../ClientView';

interface AddShiftSidebarProps {
  serviceFilters: DetailsPanelOption[];
  clientFilters: FiltersOption[];
  onClose: () => void;
  selectedService?: string | null;
  onSelectService: (serviceName: string) => void;
  shiftSlot: ShiftSlot | null;
  onBack: () => void;
  /** Confirma el turno con el cliente elegido. */
  onConfirmClient: (clientName: string) => void;
}

export default function AddShiftSidebar({
  serviceFilters,
  clientFilters,
  onClose,
  selectedService,
  onSelectService,
  shiftSlot,
  onBack,
  onConfirmClient,
}: AddShiftSidebarProps) {
  const navigate = useNavigate();
  const selectedOptionId = serviceFilters.find((filter) => filter.label === selectedService)?.id;
  const [selectedClient, setSelectedClient] = useState<string | null>(null);

  /* Al volver a la selección de horario (o cerrar el flujo), se deselecciona
     el cliente para no confirmar un turno viejo con un cliente elegido antes. */
  useEffect(() => {
    if (!shiftSlot) {
      setSelectedClient(null);
    }
  }, [shiftSlot]);

  if (shiftSlot) {
    const selectedClientId = clientFilters.find((filter) => filter.label === selectedClient)?.id;

    return (
      <Sidebar
        footer={
          <div className="flex flex-col gap-2">
            {selectedClient && (
              <ConfirmButton
                text="Confirmar turno"
                onClick={() => onConfirmClient(selectedClient)}
                className="w-full"
              />
            )}
            <CancelButton text="Volver" onClick={onBack} className="w-full" />
          </div>
        }
      >
        <DetailsPanel
          title="Seleccionar cliente"
          options={clientFilters}
          selectedId={selectedClientId}
          onOptionClick={(option) => setSelectedClient(option.label)}
          open
          onToggle={(e) => {
            if (!e.currentTarget.open) {
              onBack();
            }
          }}
          action={
            <AddEntityLauncherButton
              title={ADD_CLIENT_VIEW_TITLE}
              onOpen={() => navigate('/admin/cliente')}
              renderView={({ open, onClose }) => (
                <AddClientView open={open} onClose={onClose} title={ADD_CLIENT_VIEW_TITLE} />
              )}
            />
          }
        />
      </Sidebar>
    );
  }

  return (
    <Sidebar footer={<CancelButton text="Cancelar" onClick={onClose} className="w-full" />}>
      <DetailsPanel
        title="Seleccionar servicio"
        options={serviceFilters}
        selectedId={selectedOptionId}
        onOptionClick={(option) => onSelectService(option.label)}
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
