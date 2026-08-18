/*
  src/components/views/sidebarViews/AddShiftSidebar.tsx
  Estado "agregar turno" de la sidebar, en dos pasos:
  1. "Crear un nuevo turno" — hasta que se elige un horario en el Schedule.
  2. "Seleccionar cliente" — una vez que se hizo click en una celda disponible
     (shiftSlot ya tiene el horario elegido), para terminar de confirmar el
     turno. El campo de cliente es buscador y alta en uno: se tipea el
     nombre, la lista de abajo filtra en vivo (con margen de error, ver
     fuzzyMatch) y, si el cliente no existe, ese mismo texto queda precargado
     como nombre del cliente nuevo — completando WhatsApp (y notas,
     opcional) se lo agrega y confirma el turno en un solo paso.
  El botón de abajo cierra todo el flujo en el paso 1, y en el paso 2 vuelve
  al paso 1 (sin perder el servicio elegido) para poder elegir otro horario.

  Debajo de "Crear un nuevo turno" (mismo paso 1) va "Crear un nuevo
  bloqueo", con las 4 formas de bloquear el Schedule: hora/día del negocio
  (toda la fila / todo el día, para todos los miembros) y hora/día de un
  miembro puntual (una celda / una columna entera). Los 4 ya tienen
  lógica real:
  - "Bloquear horario del negocio" activa el modo de click-en-fila del
    Schedule (blockMode='business-hour'), sumando/sacando filas sueltas de
    pendingBlockRows.
  - "Bloquear horario de un miembro" activa el modo de click-en-celda
    (blockMode='member-hour') — mismo mecanismo que el anterior, pero
    acotado a una sola celda de un miembro en vez de toda la fila,
    sumando/sacando celdas sueltas de pendingMemberHourCells.
  - "Bloquear día de un miembro" activa el modo de click-en-header
    (blockMode='member-day'), sumando/sacando miembro+día de
    pendingMemberDays.
  - "Bloquear día del negocio" no toca el Schedule — no hay fila ni
    columna que resaltar, es el negocio entero para todos los miembros —
    en vez de eso REEMPLAZA toda la lista de opciones acá mismo por un
    Calendar (selección múltiple, círculos en destructive) para elegir
    uno o más días sueltos (pendingBlockDays). Al no necesitar el
    Schedule como superficie de selección, no tiene blockMode ni pasa por
    Schedule.tsx. Como la lista de opciones queda oculta mientras tanto,
    "Volver" desde ahí no alcanza con limpiar la selección (no habría
    forma de ver la lista de nuevo): pasa por onExitBlockDayMode, que
    además resetea blockType.
  En los primeros tres, con algo elegido se pasa a un 3er paso acá mismo
  ("Confirmar bloqueo", mismo lugar donde "Agregar turno" muestra
  "Seleccionar cliente") que lista lo elegido (rangos ya fundidos para
  filas, ver pendingBlockRanges en Dashboard.tsx; miembro + día para
  columnas; miembro + rango fundido para celdas, ver
  pendingMemberHourRanges) antes de persistirlo. "Bloquear día del
  negocio" no pasa por ese 3er paso: el Calendar ya muestra qué días
  quedaron elegidos, así que confirma directo desde ahí (botón "Confirmar
  bloqueo" debajo del Calendar).
  `name="add-block"` explícito para que este panel no comparta grupo de
  exclusividad con "Crear un nuevo turno" (que fuerza `open` siempre y
  cierra todo el flujo si se lo toggle-ea) — si compartieran nombre, abrir
  este cerraría aquél y dispararía onClose por error. */

import { useEffect, useState } from 'react';
import { twMerge } from 'tailwind-merge';
import type { FiltersOption } from '../../../database/types';
import type { BlockRow, MemberDayBlock, MemberHourBlock, ShiftSlot } from '../../../pages/admin/Dashboard';
import { fuzzyMatch } from '../../../utils/fuzzyMatch';
import { getDayName, getMonthName, toDateKey } from '../../../utils/dateName';
import Sidebar from '../../layout/Sidebar';
import DetailsPanel, {
  type DetailsPanelOption,
} from '../../widgets/sidebarWidgets/DetailsPanel';
import Calendar from '../../widgets/sidebarWidgets/Calendar';
import ContentHeader from '../../ui/content-header';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import Image from '../../ui/image';
import WhatsAppInput, { WHATSAPP_PREFIX } from '../../widgets/WhatsAppInput';
import CancelButton from '../../buttons/CancelButton';
import ConfirmButton from '../../buttons/ConfirmButton';

/* Cada opción mapea a una forma de recorrer el Schedule (ver grilla en
   Schedule.tsx): "fila" = misma hora, todos los miembros; "día entero" =
   toda la columna de horas de ese día, todos los miembros; "celda" = un
   solo horario de un solo miembro; "columna" = todo el día de un miembro. */
const BLOCK_OPTIONS: DetailsPanelOption[] = [
  { id: 'business-hour', label: 'Bloquear horario del negocio' },
  { id: 'business-day', label: 'Bloquear día del negocio' },
  { id: 'member-hour', label: 'Bloquear horario de un miembro' },
  { id: 'member-day', label: 'Bloquear día de un miembro' },
];

const UNBLOCK_OPTIONS: DetailsPanelOption[] = [
  { id: 'unblock-business-hour', label: 'Desbloquear horario del negocio' },
  { id: 'unblock-business-day', label: 'Desbloquear día del negocio' },
  { id: 'unblock-member-hour', label: 'Desbloquear horario de un miembro' },
  { id: 'unblock-member-day', label: 'Desbloquear día de un miembro' },
];

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
  /** Tipo de bloqueo/desbloqueo elegido (id de BLOCK_OPTIONS o UNBLOCK_OPTIONS). */
  blockType: string | null;
  onSelectBlockType: (id: string) => void;
  /** Filas elegidas en el Schedule (modo 'business-hour' o 'unblock-business-hour', sueltas), a la espera de confirmarse. */
  pendingBlockRows: BlockRow[];
  /** pendingBlockRows agrupadas por día y fundidas en rangos contiguos — lo que se muestra acá. */
  pendingBlockRanges: BlockRow[];
  /** Miembros+día elegidos en el Schedule (modo 'member-day' o 'unblock-member-day', sueltos), a la espera de confirmarse. */
  pendingMemberDays: MemberDayBlock[];
  /** Fechas ("YYYY-MM-DD") elegidas en el Calendar de acá abajo (modo 'business-day' o 'unblock-business-day', sueltas), a la espera de confirmarse. */
  pendingBlockDays: string[];
  onToggleBlockDay: (date: string) => void;
  /** Sale de 'business-day'/'unblock-business-day' (vuelve a mostrar la lista de opciones), descartando los días elegidos sin persistirlos. */
  onExitBlockDayMode: () => void;
  /** Celdas elegidas en el Schedule (modo 'member-hour' o 'unblock-member-hour', sueltas) agrupadas por miembro+día y fundidas en rangos contiguos — lo que se muestra acá. */
  pendingMemberHourRanges: MemberHourBlock[];
  /** Texto libre opcional del input "Motivo del bloqueo/desbloqueo" — uno solo para toda la tanda que se confirma junta. */
  blockReason: string;
  onBlockReasonChange: (reason: string) => void;
  onConfirmBlock: () => void;
  /** Vacía toda la selección pendiente (de cualquiera de los modos) sin
      cerrar el flujo (mantiene el tipo elegido). */
  onClearPendingBlocks: () => void;
}

const CLIENT_CARD_CLASS = 'flex w-full flex-col gap-1 rounded-4xl border border-border bg-card p-4';

/* Mismo card que CLIENT_CARD_CLASS (más aire entre título/explicación,
   lista, e input — ver CONFIRM_BLOCK_SECTION_CLASS), pero con los mismos
   colores que los horarios no hábiles del Schedule (bg-background/50, ver
   SCHEDULE_OFF_HOURS_OVERLAY_CLASS/BlockedSlotCard) en vez de bg-card: es
   la sidebar de "bloquear", tiene sentido que se sienta del mismo color
   que lo que va a quedar bloqueado, en los dos temas por igual (son
   tokens, no un hex fijo) — translúcido (/50), no sólido, para que
   coincida de verdad con esa niebla y no sólo con su tono. */
const CONFIRM_BLOCK_CARD_CLASS = 'flex w-full flex-col gap-7 rounded-4xl border border-border bg-background/50 p-4';

const CONFIRM_BLOCK_HEADER_CLASS = 'flex flex-col gap-3';

/* Separador entre grupos (lista, input): línea + aire debajo antes de su
   contenido — el aire de arriba (entre el grupo anterior y la línea) ya lo
   da el gap-7 del card. */
const CONFIRM_BLOCK_SECTION_CLASS = 'border-t border-border/60 pt-7';

const CONFIRM_BLOCK_LIST_CLASS = 'flex flex-col gap-4 px-1';

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
  blockType,
  onSelectBlockType,
  pendingBlockRows,
  pendingBlockRanges,
  pendingMemberDays,
  pendingBlockDays,
  onToggleBlockDay,
  onExitBlockDayMode,
  pendingMemberHourRanges,
  blockReason,
  onBlockReasonChange,
  onConfirmBlock,
  onClearPendingBlocks,
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

  const isUnblockMode = Boolean(blockType && blockType.startsWith('unblock-'));
  const isBusinessDayMode = blockType === 'business-day' || blockType === 'unblock-business-day';

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

  if (pendingBlockRows.length > 0 || pendingMemberDays.length > 0 || pendingMemberHourRanges.length > 0) {
    const confirmTitle = isUnblockMode ? 'Confirmar desbloqueo' : 'Confirmar bloqueo';
    const confirmDescription = isUnblockMode
      ? 'Estos horarios van a quedar habilitados para solicitar turnos esos días.'
      : 'Para todo el negocio. Nadie va a poder solicitar turnos en estos horarios esos días.';
    const reasonLabel = isUnblockMode ? 'Motivo del desbloqueo' : 'Motivo del bloqueo';
    const reasonPlaceholder = isUnblockMode ? 'Ej: horario especial, guardia, evento...' : 'Ej: mantenimiento, feriado...';
    const confirmBtnText = isUnblockMode ? 'Confirmar desbloqueo' : 'Confirmar bloqueo';

    return (
      <Sidebar
        footer={
          <div className="flex flex-col gap-2">
            <CancelButton text="Volver" onClick={onClearPendingBlocks} className="w-full" />
          </div>
        }
      >
        <div className={CONFIRM_BLOCK_CARD_CLASS}>
          <div className={CONFIRM_BLOCK_HEADER_CLASS}>
            <ContentHeader title={confirmTitle} className={CLIENT_HEADER_CLASS} />
            <p className="px-1 text-sm text-muted-foreground">
              {confirmDescription}
            </p>
          </div>
          <div className={twMerge(CONFIRM_BLOCK_SECTION_CLASS, CONFIRM_BLOCK_LIST_CLASS)}>
            {pendingBlockRanges.map((range) => {
              const rangeDate = new Date(`${range.date}T00:00:00`);
              const formattedDate = `${getDayName(rangeDate)} ${rangeDate.getDate()} de ${getMonthName(rangeDate)}`;

              return (
                <div key={`${range.date}-${range.startTime}`} className="flex items-center justify-between gap-4 text-sm">
                  <span className="text-muted-foreground">{formattedDate}</span>
                  <span className="font-medium text-foreground">
                    {range.startTime} a {range.endTime}
                  </span>
                </div>
              );
            })}
            {pendingMemberDays.map((entry) => {
              const entryDate = new Date(`${entry.date}T00:00:00`);
              const formattedDate = `${getDayName(entryDate)} ${entryDate.getDate()} de ${getMonthName(entryDate)}`;

              return (
                <div key={`${entry.date}-${entry.member}`} className="flex flex-col gap-0.5 text-sm">
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-muted-foreground">{formattedDate}</span>
                    <span className="font-medium text-foreground">{entry.member}</span>
                  </div>
                  <div className="text-right text-xs font-medium text-muted-foreground">
                    Día completo
                  </div>
                </div>
              );
            })}
            {pendingMemberHourRanges.map((range) => {
              const rangeDate = new Date(`${range.date}T00:00:00`);
              const formattedDate = `${getDayName(rangeDate)} ${rangeDate.getDate()} de ${getMonthName(rangeDate)}`;

              return (
                <div key={`${range.date}-${range.member}-${range.startTime}`} className="flex flex-col gap-0.5 text-sm">
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-muted-foreground">{formattedDate}</span>
                    <span className="font-medium text-foreground">{range.member}</span>
                  </div>
                  <div className="text-right text-xs font-medium text-muted-foreground">
                    {range.startTime} a {range.endTime}
                  </div>
                </div>
              );
            })}
          </div>
          <div className={CONFIRM_BLOCK_SECTION_CLASS}>
            <Input
              name="block-reason"
              optional
              label={reasonLabel}
              placeholder={reasonPlaceholder}
              value={blockReason}
              onChange={(event) => onBlockReasonChange(event.target.value)}
            />
          </div>
          <div className="pt-2 border-t border-border">
            <ConfirmButton text={confirmBtnText} onClick={onConfirmBlock} className="w-full" />
          </div>
        </div>
      </Sidebar>
    );
  }

  return (
    <Sidebar
      footer={
        isBusinessDayMode ? (
          <div className="flex flex-col gap-2">
            <CancelButton text="Volver" onClick={onExitBlockDayMode} className="w-full" />
          </div>
        ) : undefined
      }
    >
      {isBusinessDayMode ? (
        <>
          <Calendar
            selectedDates={pendingBlockDays.map((date) => new Date(`${date}T00:00:00`))}
            selectedDatesVariant={isUnblockMode ? 'unblock' : 'destructive'}
            onSelectDate={(date) => onToggleBlockDay(toDateKey(date))}
          />
          {pendingBlockDays.length > 0 && (
            <div className={CONFIRM_BLOCK_CARD_CLASS}>
              <div className={CONFIRM_BLOCK_HEADER_CLASS}>
                <ContentHeader
                  title={isUnblockMode ? 'Confirmar desbloqueo' : 'Confirmar bloqueo'}
                  className={CLIENT_HEADER_CLASS}
                />
                <p className="px-1 text-sm text-muted-foreground">
                  {isUnblockMode
                    ? 'Para todo el negocio. Se van a poder solicitar turnos esos días.'
                    : 'Para todo el negocio. Nadie va a poder solicitar turnos esos días.'}
                </p>
              </div>
              <div className={twMerge(CONFIRM_BLOCK_SECTION_CLASS, CONFIRM_BLOCK_LIST_CLASS)}>
                {[...pendingBlockDays].sort().map((date) => {
                  const dayDate = new Date(`${date}T00:00:00`);
                  const formattedDate = `${getDayName(dayDate)} ${dayDate.getDate()} de ${getMonthName(dayDate)}`;

                  return (
                    <div key={date} className="flex items-center justify-between gap-4 text-sm">
                      <span className="text-muted-foreground">{formattedDate}</span>
                      <span className="font-medium text-foreground">Día completo</span>
                    </div>
                  );
                })}
              </div>
              <div className={CONFIRM_BLOCK_SECTION_CLASS}>
                <Input
                  name="block-reason-day"
                  optional
                  label={isUnblockMode ? 'Motivo del desbloqueo' : 'Motivo del bloqueo'}
                  placeholder={isUnblockMode ? 'Ej: apertura extraordinaria, feriado abierto...' : 'Ej: mantenimiento, feriado...'}
                  value={blockReason}
                  onChange={(event) => onBlockReasonChange(event.target.value)}
                />
              </div>
              <div className="flex flex-col gap-2 pt-2 border-t border-border">
                <ConfirmButton
                  text={isUnblockMode ? 'Confirmar desbloqueo' : 'Confirmar bloqueo'}
                  onClick={onConfirmBlock}
                  disabled={pendingBlockDays.length === 0}
                  className="w-full"
                />
              </div>
            </div>
          )}
        </>
      ) : (
        <>
          <DetailsPanel
            title="Crear un nuevo turno"
            hideChevron
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

          <DetailsPanel
            title="Crear o editar un bloqueo"
            name="add-block"
            options={BLOCK_OPTIONS}
            selectedId={blockType ?? undefined}
            onOptionClick={(option) => {
              if (blockType === option.id) {
                onSelectBlockType('');
              } else {
                onSelectBlockType(option.id);
              }
            }}
          />

          <DetailsPanel
            title="Crear o editar un desbloqueo"
            name="add-unblock"
            options={UNBLOCK_OPTIONS}
            selectedId={blockType ?? undefined}
            onOptionClick={(option) => {
              if (blockType === option.id) {
                onSelectBlockType('');
              } else {
                onSelectBlockType(option.id);
              }
            }}
          />
        </>
      )}
    </Sidebar>
  );
}
