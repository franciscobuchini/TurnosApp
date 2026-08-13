/*
  src/components/views/sidebarViews/AddShiftSidebar.tsx
  Estado "agregar turno" de la sidebar, en dos pasos:
  1. "Seleccionar servicio" — hasta que se elige un horario en el Schedule.
  2. "Seleccionar cliente" — una vez que se hizo click en una celda disponible
     (shiftSlot ya tiene el horario elegido), para terminar de confirmar el
     turno. El campo de cliente es buscador y alta en uno: se tipea el
     nombre, la lista de abajo filtra en vivo (con margen de error, ver
     fuzzyMatch) y, si el cliente no existe, ese mismo texto queda precargado
     como nombre del cliente nuevo — completando WhatsApp (y notas,
     opcional) se lo agrega y confirma el turno en un solo paso.
  El botón de abajo cierra todo el flujo en el paso 1, y en el paso 2 vuelve
  al paso 1 (sin perder el servicio elegido) para poder elegir otro horario.
*/

import { useEffect, useState } from 'react';
import { twMerge } from 'tailwind-merge';
import type { FiltersOption } from '../../../database/types';
import type { ShiftSlot } from '../../../pages/admin/Dashboard';
import { fuzzyMatch } from '../../../utils/fuzzyMatch';
import Sidebar from '../../layout/Sidebar';
import DetailsPanel, {
  type DetailsPanelOption,
} from '../../widgets/sidebarWidgets/DetailsPanel';
import ContentHeader from '../../ui/content-header';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import Image from '../../ui/image';
import WhatsAppInput, { WHATSAPP_PREFIX } from '../../widgets/WhatsAppInput';
import CancelButton from '../../buttons/CancelButton';
import ConfirmButton from '../../buttons/ConfirmButton';

interface AddShiftSidebarProps {
  serviceFilters: DetailsPanelOption[];
  clientFilters: FiltersOption[];
  onClose: () => void;
  selectedService?: string | null;
  onSelectService: (serviceName: string) => void;
  shiftSlot: ShiftSlot | null;
  onBack: () => void;
  /** Confirma el turno con un cliente ya existente. */
  onConfirmClient: (clientName: string) => void;
  /** Da de alta un cliente nuevo y confirma el turno con él, en un solo paso. */
  onAddClientAndConfirm: (client: { name: string; phone: string; notes?: string }) => void;
}

const CLIENT_CARD_CLASS = 'flex w-full flex-col gap-1 rounded-4xl border border-border bg-card p-4';

const CLIENT_HEADER_CLASS = 'px-0 pb-1';

const CLIENT_LIST_CLASS = 'flex flex-col gap-0.5 py-1';

const CLIENT_ROW_CLASS =
  'h-12 w-full shrink-0 justify-start gap-4 rounded-3xl text-left text-muted-foreground hover:text-foreground';

const CLIENT_ROW_SELECTED_CLASS = 'bg-background text-foreground';

const CLIENT_ROW_AVATAR_CLASS = 'h-8 w-8 shrink-0';

const NEW_CLIENT_SECTION_CLASS = 'flex flex-col gap-4';

const NEW_CLIENT_SECTION_SEPARATOR_CLASS = 'border-t border-border/60 pt-3';

const NEW_CLIENT_HINT_CLASS = 'px-1 text-xs text-muted-foreground';

export default function AddShiftSidebar({
  serviceFilters,
  clientFilters,
  onClose,
  selectedService,
  onSelectService,
  shiftSlot,
  onBack,
  onConfirmClient,
  onAddClientAndConfirm,
}: AddShiftSidebarProps) {
  const selectedOptionId = serviceFilters.find((filter) => filter.label === selectedService)?.id;
  const [clientQuery, setClientQuery] = useState('');
  const [selectedClient, setSelectedClient] = useState<string | null>(null);
  const [newClientWhatsapp, setNewClientWhatsapp] = useState('');
  const [newClientNotes, setNewClientNotes] = useState('');

  /* Al volver a la selección de horario (o cerrar el flujo), limpia todo lo
     tipeado para no confirmar (ni sugerir) datos de un turno viejo. */
  useEffect(() => {
    if (!shiftSlot) {
      setClientQuery('');
      setSelectedClient(null);
      setNewClientWhatsapp('');
      setNewClientNotes('');
    }
  }, [shiftSlot]);

  if (shiftSlot) {
    const filteredClients = clientQuery.trim()
      ? clientFilters.filter((client) => fuzzyMatch(clientQuery, client.label))
      : clientFilters;

    const isNewClientValid =
      !selectedClient &&
      Boolean(clientQuery.trim()) &&
      Boolean(newClientWhatsapp.replace(WHATSAPP_PREFIX, '').trim());

    const handleQueryChange = (value: string) => {
      setClientQuery(value);
      setSelectedClient(null);
    };

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
        <div className={CLIENT_CARD_CLASS}>
          <ContentHeader title="Seleccionar cliente" className={CLIENT_HEADER_CLASS} />

          <Input
            name="client-search"
            placeholder="Escribí el nombre..."
            value={clientQuery}
            onChange={(event) => handleQueryChange(event.target.value)}
            autoFocus
          />

          {filteredClients.length > 0 && (
            <div className={CLIENT_LIST_CLASS}>
              {filteredClients.map((option) => (
                <Button
                  key={option.id}
                  type="button"
                  variant="ghost"
                  className={twMerge(
                    CLIENT_ROW_CLASS,
                    option.label === selectedClient && CLIENT_ROW_SELECTED_CLASS,
                  )}
                  onClick={() => {
                    setClientQuery(option.label);
                    setSelectedClient(option.label);
                  }}
                >
                  <Image name={option.label} className={CLIENT_ROW_AVATAR_CLASS} />
                  {option.label}
                </Button>
              ))}
            </div>
          )}

          {!selectedClient && clientQuery.trim() && (
            <div
              className={twMerge(
                NEW_CLIENT_SECTION_CLASS,
                filteredClients.length > 0 && NEW_CLIENT_SECTION_SEPARATOR_CLASS,
              )}
            >
              <span className={NEW_CLIENT_HINT_CLASS}>
                ¿No está en la lista? Completá estos datos para agregarlo como cliente nuevo.
              </span>
              <WhatsAppInput value={newClientWhatsapp} onChange={setNewClientWhatsapp} />
              <Input
                name="new-client-notes"
                textarea
                rows={2}
                optional
                label="Notas"
                placeholder="Agregar notas..."
                value={newClientNotes}
                onChange={(event) => setNewClientNotes(event.target.value)}
              />
              <ConfirmButton
                text="Agregar cliente y confirmar"
                disabled={!isNewClientValid}
                onClick={() =>
                  onAddClientAndConfirm({
                    name: clientQuery.trim(),
                    phone: newClientWhatsapp,
                    notes: newClientNotes.trim() || undefined,
                  })
                }
                className="w-full"
              />
            </div>
          )}
        </div>
      </Sidebar>
    );
  }

  return (
    <Sidebar>
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
