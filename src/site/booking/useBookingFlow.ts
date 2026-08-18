/*
  src/site/booking/useBookingFlow.ts
  Estado del wizard de reserva pública, sin UI: qué paso se muestra, qué se
  eligió en cada uno, y la acción final que persiste el turno. Los steps
  sólo leen este estado y llaman a sus acciones — la lógica de "qué paso
  sigue" (incluido saltear "Profesional" cuando hay un solo calificado
  disponible) vive acá, no repartida en cada componente.

  Fecha y horario comparten un único paso ("schedule"): elegir un día no
  navega a otra pantalla, sólo actualiza qué horarios se muestran, así el
  selector de fecha queda siempre visible mientras se compara disponibilidad
  entre días. Por eso, al elegir el servicio, ya se preselecciona el primer
  día con disponibilidad real para ESE servicio (getFirstAvailableDate) —
  si hoy no queda ningún hueco (profesionales sin horario libre, todo ya
  reservado, etc.) salta directo al próximo día que sí tenga, en vez de
  dejar al cliente parado en un día sin turnos.

  Al confirmar reutiliza addClient + addAppointment de database/data.ts —
  el mismo camino que ya usa el flujo interno "Agregar turno" del admin
  (ver confirmShiftWithNewClient en pages/admin/Dashboard.tsx) — así un
  turno reservado acá aparece de inmediato en la agenda del admin.
*/

import { useEffect, useMemo, useState } from 'react';
import { addBookingRequest, DATA_CHANGE_EVENT } from '@/database/data';

import {
  DATE_RANGE_DAYS,
  getAvailableSlots,
  getFirstAvailableDate,
  parseServiceDurationMinutes,
  pickAnyAvailableMember,
  type AvailableSlot,
} from '@/functions/bookingAvailability';
import type { service } from '@/database/types';
import { toDateKey } from '@/utils/dateName';

export type BookingStep = 'service' | 'schedule' | 'professional' | 'details' | 'success';

/** Cuántos días adelante se busca disponibilidad al elegir servicio, antes
    de avisar que no hay turnos (ver selectService). */
const SERVICE_AVAILABILITY_SEARCH_DAYS = DATE_RANGE_DAYS;

export interface ClientDetails {
  name: string;
  phone: string;
  email: string;
  notes: string;
}

interface UseBookingFlowOptions {
  services: service[];
}

export function useBookingFlow({ services }: UseBookingFlowOptions) {
  const [stepStack, setStepStack] = useState<BookingStep[]>(['service']);
  const [serviceName, setServiceName] = useState<string | null>(null);
  const [date, setDate] = useState<Date | null>(null);
  const [slot, setSlot] = useState<AvailableSlot | null>(null);
  const [member, setMember] = useState<string | null>(null);
  const [client, setClient] = useState<ClientDetails>({ name: '', phone: '', email: '', notes: '' });
  const [submitting, setSubmitting] = useState(false);
  const [noAvailabilityMessage, setNoAvailabilityMessage] = useState<string | null>(null);
  const [dataVersion, setDataVersion] = useState(0);

  useEffect(() => {
    const handleDataChange = () => {
      setDataVersion((v) => v + 1);
    };

    window.addEventListener(DATA_CHANGE_EVENT, handleDataChange);
    window.addEventListener('storage', handleDataChange);

    return () => {
      window.removeEventListener(DATA_CHANGE_EVENT, handleDataChange);
      window.removeEventListener('storage', handleDataChange);
    };
  }, []);

  const step = stepStack[stepStack.length - 1];

  const goTo = (next: BookingStep) => setStepStack((stack) => [...stack, next]);
  const goBack = () => setStepStack((stack) => (stack.length > 1 ? stack.slice(0, -1) : stack));

  const selectedService = useMemo(
    () => services.find((item) => item.name === serviceName) ?? null,
    [services, serviceName],
  );
  const durationMinutes = selectedService ? parseServiceDurationMinutes(selectedService.duration) : 0;

  const availableSlots = useMemo(() => {
    void dataVersion;
    if (!date || !serviceName || durationMinutes <= 0) {
      return [];
    }
    return getAvailableSlots(date, serviceName, durationMinutes);
  }, [date, serviceName, durationMinutes, dataVersion]);

  // Si en los próximos SERVICE_AVAILABILITY_SEARCH_DAYS días no hay ni un
  // hueco para el servicio elegido, no tiene sentido avanzar al paso
  // "schedule" (quedaría mostrando fecha de hoy con la grilla vacía, sin
  // explicación): se avisa con un toast y se queda en "service" para que
  // pruebe con otro.
  const selectService = (name: string) => {
    setServiceName(name);

    // No se puede usar el `durationMinutes` de más abajo acá: está
    // memoizado sobre el `serviceName` del render anterior, todavía no el
    // que se acaba de elegir. Se recalcula fresco a partir de `name`.
    const service = services.find((item) => item.name === name);
    const duration = service ? parseServiceDurationMinutes(service.duration) : 0;
    const nextAvailable = getFirstAvailableDate(name, duration, new Date(), SERVICE_AVAILABILITY_SEARCH_DAYS);

    if (!nextAvailable) {
      setNoAvailabilityMessage(
        `No hay turnos disponibles para "${name}" en los próximos ${SERVICE_AVAILABILITY_SEARCH_DAYS} días.`,
      );
      return;
    }

    setDate(nextAvailable);
    setSlot(null);
    setMember(null);
    setStepStack(['service', 'schedule']);
  };

  // Cambiar de día no navega: sólo actualiza qué horarios se muestran,
  // sigue en el mismo paso "schedule".
  const selectDate = (nextDate: Date) => {
    setDate(nextDate);
    setSlot(null);
    setMember(null);
  };

  // Paso "Profesional" inteligente: si sólo hay un calificado libre en ese
  // horario se auto-asigna y se salta directo a los datos del cliente; si
  // hay más de uno, se muestra el paso para elegir (o "Cualquiera disponible").
  const selectSlot = (nextSlot: AvailableSlot) => {
    setSlot(nextSlot);
    if (nextSlot.memberNames.length <= 1) {
      setMember(nextSlot.memberNames[0] ?? null);
      goTo('details');
    } else {
      setMember(null);
      goTo('professional');
    }
  };

  const selectMember = (name: string) => {
    setMember(name);
    goTo('details');
  };

  // "Cualquiera disponible" (ProfessionalStep): no es sólo el primero de la
  // lista, reparte la carga entre los calificados libres — ver
  // pickAnyAvailableMember.
  const selectAnyMember = () => {
    if (!slot || !date) return;
    selectMember(pickAnyAvailableMember(slot.memberNames, date));
  };

  const updateClient = (patch: Partial<ClientDetails>) => setClient((current) => ({ ...current, ...patch }));

  const isClientValid = client.name.trim().length > 0 && client.phone.trim().length > 0;

  const confirmBooking = () => {
    if (!selectedService || !date || !slot || !member || !isClientValid) {
      return;
    }

    setSubmitting(true);

    addBookingRequest({
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      date: toDateKey(date),
      startTime: slot.startTime,
      endTime: slot.endTime,
      member,
      service: selectedService.name,
      price: selectedService.price ?? 0,
      client: {
        name: client.name.trim(),
        phone: client.phone.trim(),
        email: client.email.trim() || undefined,
        notes: client.notes.trim() || undefined,
      },
      status: 'pending',
    });

    setSubmitting(false);
    goTo('success');
  };

  const reset = () => {
    setStepStack(['service']);
    setServiceName(null);
    setDate(null);
    setSlot(null);
    setMember(null);
    setClient({ name: '', phone: '', email: '', notes: '' });
    setNoAvailabilityMessage(null);
  };

  return {
    step,
    goBack,
    canGoBack: stepStack.length > 1 && step !== 'success',
    selectedService,
    durationMinutes,
    selectService,
    date,
    selectDate,
    availableSlots,
    slot,
    selectSlot,
    member,
    selectMember,
    selectAnyMember,
    client,
    updateClient,
    isClientValid,
    confirmBooking,
    submitting,
    reset,
    noAvailabilityMessage,
    dismissNoAvailabilityMessage: () => setNoAvailabilityMessage(null),
  };
}
