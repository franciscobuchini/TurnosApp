/*
  src/components/views/sidebarViews/EditAppointmentSidebar.tsx
  Sidebar de "ver/editar turno": se abre al clickear la tarjeta de un turno
  confirmado en el Schedule (Dashboard.tsx controla editingAppointment).
  Modo vista (solo lectura) por default; "Editar" habilita
  servicio/miembro/cliente/horario/notas, con "Cancelar turno" (elimina)
  junto a Guardar/Cancelar — mismo criterio que "Eliminar" en
  Cliente/Servicio/Miembro. Sigue el mismo patrón de sidebar-por-estado que
  AddShiftSidebar (no una ruta), para mantener el Schedule visible detrás.

  UI deliberadamente chata: todo el contenido (header + filas + acciones)
  vive en un único contenedor (mismo estilo que los paneles de AdminSidebar),
  sin acordeones ni tarjetas anidadas — las filas usan popovers livianos para
  elegir servicio/miembro/cliente en vez de paneles expandibles.
*/

import { useEffect, useMemo, useState } from 'react';
import { CalendarIcon, ChevronDown } from 'lucide-react';
import { twMerge } from 'tailwind-merge';
import Sidebar from '@/components/layout/Sidebar';
import ContentHeader from '@/components/ui/content-header';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import Calendar from '@/components/widgets/sidebarWidgets/Calendar';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import HourSelector from '@/components/ui/hour-selector';
import { Input } from '@/components/ui/input';
import Image from '@/components/ui/image';
import CancelButton from '@/components/buttons/CancelButton';
import ConfirmButton from '@/components/buttons/ConfirmButton';
import DeleteButton from '@/components/buttons/DeleteButton';
import type { DetailsPanelOption } from '@/components/widgets/sidebarWidgets/DetailsPanel';
import { getservices, getTeamMembers, getClients, getAppointments } from '@/database/data';
import type { Appointment } from '@/database/types';
import { SERVICE_COLOR_BY_ID } from '@/components/widgets/serviceWidgets/serviceColors';
import { minutesToTime, rangesOverlap } from '@/hooks/useWeekSchedule';
import { getDayName, getMonthName } from '@/utils/dateName';

interface EditAppointmentSidebarProps {
  appointment: Appointment;
  onClose: () => void;
  onSave: (id: string, updated: Appointment) => void;
  onCancelAppointment: (id: string) => void;
}

/* Padding horizontal centralizado acá (px-4): todo lo demás (filas, header,
   notas, acciones) es px-0 y solo declara su propio espaciado vertical, para
   que el inset izquierdo/derecho sea uno solo en vez de ir sumando px por
   cada fila. Vertical: py-3 arriba y abajo del contenedor, simétrico con el
   pt-3 que ya trae el separador de acciones al final. */
const CARD_CLASS = 'flex w-full flex-col rounded-4xl border border-border bg-card px-4 py-3';

const HEADER_CLASS = 'px-0 pt-0 pb-2';

const ROW_CLASS = 'flex items-center justify-between gap-3 py-2.5';

const ROW_LABEL_CLASS = 'text-sm text-muted-foreground';

const ROW_VALUE_CLASS = 'flex items-center gap-2 text-sm font-medium text-foreground';

const ROW_AVATAR_CLASS = 'h-6 w-6 shrink-0 text-[10px]';

const TRIGGER_CLASS = 'h-9 gap-2 rounded-full pr-3 pl-1.5 text-sm font-medium';

const OPTION_CLASS = 'w-full justify-start gap-2 px-2';

const HOUR_SELECTOR_CLASS = 'h-9 w-auto min-w-0 flex-none border-transparent bg-accent/60 px-3';

const ERROR_CLASS = 'pb-1 text-xs text-destructive';

const NOTES_ROW_CLASS = 'py-2.5';

const ACTIONS_CLASS = 'mt-1 flex items-center gap-2 border-t border-border/60 pt-3';

const ACTION_BUTTON_CLASS = 'h-10 min-w-0 flex-1 px-3 text-sm';

function slugify(value: string): string {
  return value.toLowerCase().replace(/\s+/g, '-');
}

function toMinutes(time: string): number {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
}

function parseDurationMinutes(duration: string): number {
  const minutes = parseInt(duration, 10);
  return Number.isFinite(minutes) && minutes > 0 ? minutes : 30;
}

function pad(n: number): string {
  return n.toString().padStart(2, '0');
}

function todayDateStr(): string {
  return toDateStr(new Date());
}

/** "YYYY-MM-DD" de una fecha local (mismo formato que appointment.date). */
function toDateStr(date: Date): string {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

/** Verdadero si el turno ya terminó (fecha anterior a hoy, o de hoy con
    horario de fin ya pasado): un turno pasado se puede ver pero no editar. */
function isPastAppointment(appt: Appointment, now: Date): boolean {
  const today = todayDateStr();
  if (appt.date < today) return true;
  if (appt.date === today) {
    return toMinutes(appt.endTime) <= now.getHours() * 60 + now.getMinutes();
  }
  return false;
}

interface SelectRowProps {
  label: string;
  value: string;
  options: DetailsPanelOption[];
  onSelect: (option: DetailsPanelOption) => void;
}

/* Fila "Label ... Valor ⌄": el valor actual abre un popover liviano con la
   lista de opciones, en vez del acordeón con borde que usa DetailsPanel. */
function SelectRow({ label, value, options, onSelect }: SelectRowProps) {
  const [open, setOpen] = useState(false);
  const selected = options.find((option) => option.label === value);

  return (
    <div className={ROW_CLASS}>
      <span className={ROW_LABEL_CLASS}>{label}</span>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button variant="ghost" className={TRIGGER_CLASS}>
            <Image name={value} className={twMerge(ROW_AVATAR_CLASS, selected?.colorClassName)} />
            {value}
            <ChevronDown className="size-3.5 text-muted-foreground" />
          </Button>
        </PopoverTrigger>
        <PopoverContent
          align="end"
          onClick={() => setOpen(false)}
          className="max-h-64 w-56 overflow-y-auto rounded-2xl p-1.5"
        >
          {options.map((option) => (
            <Button
              key={option.id}
              variant="ghost"
              className={OPTION_CLASS}
              onClick={() => onSelect(option)}
            >
              <Image name={option.label} className={twMerge(ROW_AVATAR_CLASS, option.colorClassName)} />
              {option.label}
            </Button>
          ))}
        </PopoverContent>
      </Popover>
    </div>
  );
}

interface DateRowProps {
  label: string;
  value: string;
  onSelect: (dateStr: string) => void;
}

/* Misma fila "Label ... Valor ⌄" que SelectRow, pero el popover muestra el
   Calendar (mismo componente que usa AdminSidebar para navegar la agenda)
   en vez de una lista de opciones — así se puede relocalizar el turno a
   cualquier día, no solo cambiar la hora dentro del mismo día. */
function DateRow({ label, value, onSelect }: DateRowProps) {
  const [open, setOpen] = useState(false);
  const dateObj = new Date(`${value}T00:00:00`);
  const displayValue = `${getDayName(dateObj, 3)} ${dateObj.getDate()} de ${getMonthName(dateObj, 3)}`;

  return (
    <div className={ROW_CLASS}>
      <span className={ROW_LABEL_CLASS}>{label}</span>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button variant="ghost" className={TRIGGER_CLASS}>
            <CalendarIcon className="size-4 text-muted-foreground" />
            {displayValue}
            <ChevronDown className="size-3.5 text-muted-foreground" />
          </Button>
        </PopoverTrigger>
        <PopoverContent align="end" className="w-80 border-none bg-transparent p-0 shadow-none">
          <Calendar
            selectedDate={dateObj}
            onSelectDate={(date) => {
              onSelect(toDateStr(date));
              setOpen(false);
            }}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}

interface InfoRowProps {
  label: string;
  value: string;
  avatarLabel?: string;
}

/* Fila de solo lectura para el modo vista: "Label ... Valor", con avatar si
   corresponde a una entidad (Miembro/Cliente) o texto simple si no
   (Notas). */
function InfoRow({ label, value, avatarLabel }: InfoRowProps) {
  return (
    <div className={ROW_CLASS}>
      <span className={ROW_LABEL_CLASS}>{label}</span>
      <span className={twMerge(ROW_VALUE_CLASS, !avatarLabel && 'text-right font-normal text-muted-foreground')}>
        {avatarLabel && <Image name={avatarLabel} className={ROW_AVATAR_CLASS} />}
        {value}
      </span>
    </div>
  );
}

interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  confirmText: string;
  onConfirm: () => void;
}

/* Diálogo de confirmación para acciones que no se pueden deshacer (cancelar
   un turno) o que pierden trabajo sin guardar (descartar cambios). */
function ConfirmDialog({ open, onOpenChange, title, description, confirmText, onConfirm }: ConfirmDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <CancelButton text="Volver" onClick={() => onOpenChange(false)} />
          <DeleteButton
            text={confirmText}
            onClick={() => {
              onOpenChange(false);
              onConfirm();
            }}
          />
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default function EditAppointmentSidebar({
  appointment,
  onClose,
  onSave,
  onCancelAppointment,
}: EditAppointmentSidebarProps) {
  const [editing, setEditing] = useState(false);
  const [service, setService] = useState(appointment.service);
  const [member, setMember] = useState(appointment.member);
  const [client, setClient] = useState(appointment.client);
  const [date, setDate] = useState(appointment.date);
  const [startTime, setStartTime] = useState(appointment.startTime);
  const [endTime, setEndTime] = useState(appointment.endTime);
  const [notes, setNotes] = useState(appointment.notes ?? '');
  const [error, setError] = useState<string | null>(null);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [confirmDiscardOpen, setConfirmDiscardOpen] = useState(false);

  /* Si se clickea otro turno mientras este sidebar ya está abierto, reinicia
     el draft al nuevo turno y vuelve a modo vista. */
  useEffect(() => {
    setEditing(false);
    setService(appointment.service);
    setMember(appointment.member);
    setClient(appointment.client);
    setDate(appointment.date);
    setStartTime(appointment.startTime);
    setEndTime(appointment.endTime);
    setNotes(appointment.notes ?? '');
    setError(null);
  }, [appointment]);

  const services = useMemo(() => getservices(), []);
  const teamMembers = useMemo(() => getTeamMembers(), []);
  const clients = useMemo(() => getClients(), []);

  const serviceOptions: DetailsPanelOption[] = useMemo(
    () =>
      services.map((s) => ({
        id: slugify(s.name),
        label: s.name,
        colorClassName: s.colorId ? SERVICE_COLOR_BY_ID[s.colorId]?.className : undefined,
      })),
    [services],
  );

  const memberOptions: DetailsPanelOption[] = useMemo(
    () => teamMembers.map((m) => ({ id: slugify(m.name), label: m.name })),
    [teamMembers],
  );

  const clientOptions: DetailsPanelOption[] = useMemo(
    () => clients.map((c) => ({ id: slugify(c.name), label: c.name })),
    [clients],
  );

  const appointmentDate = new Date(`${date}T00:00:00`);
  const formattedDate = `${getDayName(appointmentDate)} ${appointmentDate.getDate()} de ${getMonthName(appointmentDate)}`;
  const isPast = isPastAppointment(appointment, new Date());

  const minStartTime =
    date === todayDateStr()
      ? `${pad(new Date().getHours())}:${pad(new Date().getMinutes())}`
      : undefined;

  const clearError = () => setError(null);

  const isDirty =
    service !== appointment.service ||
    member !== appointment.member ||
    client !== appointment.client ||
    date !== appointment.date ||
    startTime !== appointment.startTime ||
    endTime !== appointment.endTime ||
    notes !== (appointment.notes ?? '');

  const handleCancelEdit = () => {
    setService(appointment.service);
    setMember(appointment.member);
    setClient(appointment.client);
    setDate(appointment.date);
    setStartTime(appointment.startTime);
    setEndTime(appointment.endTime);
    setNotes(appointment.notes ?? '');
    setError(null);
    setEditing(false);
  };

  /* Si hay cambios sin guardar, pide confirmación antes de descartarlos; si
     no se tocó nada, "Cancelar" vuelve directo a modo vista. */
  const requestCancelEdit = () => {
    if (isDirty) {
      setConfirmDiscardOpen(true);
      return;
    }
    handleCancelEdit();
  };

  const handleSave = () => {
    /* Libertad total de servicio/miembro/cliente/duración/fecha: no se
       exige que el miembro elegido realice el servicio elegido, que la
       duración coincida con la del catálogo, ni que el horario caiga
       dentro del horario configurado del local/miembro. El único chequeo
       es no pisar otro turno ya agendado del mismo miembro ese día
       (el turno se puede relocalizar libremente a otra fecha/hora/miembro,
       siempre que no choque con uno ya existente). */
    const conflict = getAppointments().find(
      (a) =>
        a.id !== appointment.id &&
        a.date === date &&
        a.member === member &&
        rangesOverlap(a, { startTime, endTime }),
    );
    if (conflict) {
      setError('Este horario se superpone con otro turno de este miembro.');
      return;
    }

    onSave(appointment.id, {
      ...appointment,
      service,
      member,
      client,
      date,
      startTime,
      endTime,
      notes: notes.trim() || undefined,
    });
  };

  if (!editing) {
    return (
      <Sidebar>
        <div className={CARD_CLASS}>
          <ContentHeader
            title={service}
            subtitle={`${formattedDate} · ${startTime} – ${endTime}`}
            className={HEADER_CLASS}
          />
          <InfoRow label="Miembro" value={member} avatarLabel={member} />
          <InfoRow label="Cliente" value={client} avatarLabel={client} />
          {appointment.notes && <InfoRow label="Notas" value={appointment.notes} />}
          <div className={ACTIONS_CLASS}>
            <CancelButton text="Volver" onClick={onClose} className={ACTION_BUTTON_CLASS} />
            {!isPast && (
              <ConfirmButton text="Editar" onClick={() => setEditing(true)} className={ACTION_BUTTON_CLASS} />
            )}
          </div>
        </div>
      </Sidebar>
    );
  }

  return (
    <Sidebar>
      <div className={CARD_CLASS}>
        <ContentHeader
          title={service}
          subtitle={`${formattedDate} · ${startTime} – ${endTime}`}
          className={HEADER_CLASS}
        />

        <SelectRow
          label="Servicio"
          value={service}
          options={serviceOptions}
          onSelect={(option) => {
            clearError();
            setService(option.label);
            /* Precarga la duración del catálogo como punto de partida, pero
               queda libre para editarse: no vuelve a imponerse en ningún otro
               momento. */
            const newService = services.find((s) => s.name === option.label);
            if (newService) {
              setEndTime(minutesToTime(toMinutes(startTime) + parseDurationMinutes(newService.duration)));
            }
          }}
        />

        <SelectRow
          label="Miembro"
          value={member}
          options={memberOptions}
          onSelect={(option) => {
            clearError();
            setMember(option.label);
          }}
        />

        <SelectRow
          label="Cliente"
          value={client}
          options={clientOptions}
          onSelect={(option) => {
            clearError();
            setClient(option.label);
          }}
        />

        <DateRow
          label="Fecha"
          value={date}
          onSelect={(newDate) => {
            clearError();
            setDate(newDate);
          }}
        />

        <div className={ROW_CLASS}>
          <span className={ROW_LABEL_CLASS}>Horario</span>
          <div className="flex items-center gap-2">
            <HourSelector
              value={startTime}
              min={minStartTime}
              className={HOUR_SELECTOR_CLASS}
              onChange={(time) => {
                clearError();
                /* Mueve el turno entero preservando la duración actual (el
                   fin se desplaza lo mismo que el inicio); el fin se puede
                   volver a ajustar aparte, libremente, con su propio
                   selector. */
                const delta = toMinutes(time) - toMinutes(startTime);
                setStartTime(time);
                setEndTime((current) => minutesToTime(toMinutes(current) + delta));
              }}
            />
            <span className="text-xs text-muted-foreground">–</span>
            <HourSelector
              value={endTime}
              min={minutesToTime(toMinutes(startTime) + 15)}
              className={HOUR_SELECTOR_CLASS}
              onChange={(time) => {
                clearError();
                setEndTime(time);
              }}
            />
          </div>
        </div>

        <div className={NOTES_ROW_CLASS}>
          <Input
            name="notes"
            textarea
            rows={2}
            optional
            placeholder="Agregar notas..."
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            inputClassName="border-transparent bg-accent/40 rounded-2xl"
          />
        </div>

        {error && <span className={ERROR_CLASS}>{error}</span>}

        <div className={ACTIONS_CLASS}>
          <DeleteButton text="Eliminar" onClick={() => setConfirmDeleteOpen(true)} className={ACTION_BUTTON_CLASS} />
          <CancelButton text="Cancelar" onClick={requestCancelEdit} className={ACTION_BUTTON_CLASS} />
          <ConfirmButton text="Guardar" onClick={handleSave} className={ACTION_BUTTON_CLASS} />
        </div>
      </div>

      <ConfirmDialog
        open={confirmDeleteOpen}
        onOpenChange={setConfirmDeleteOpen}
        title="¿Cancelar este turno?"
        description={`Se va a eliminar el turno de ${client} (${service}, ${startTime}–${endTime}). Esta acción no se puede deshacer.`}
        confirmText="Eliminar"
        onConfirm={() => onCancelAppointment(appointment.id)}
      />

      <ConfirmDialog
        open={confirmDiscardOpen}
        onOpenChange={setConfirmDiscardOpen}
        title="¿Descartar los cambios?"
        description="Vas a perder los cambios que hiciste en este turno."
        confirmText="Descartar"
        onConfirm={handleCancelEdit}
      />
    </Sidebar>
  );
}
