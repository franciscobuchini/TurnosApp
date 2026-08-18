/*
  src/functions/blockToggleOperations.ts
  Lógica unificada y bidireccional para alternar bloqueos y desbloqueos:
  - Celda individual (miembro + hora)
  - Fila entera del negocio (hora del negocio)
  - Columna entera de miembro (día del miembro)
  - Día completo del negocio
  Valida siempre que no existan turnos agendados antes de aplicar un bloqueo.
*/

import {
  getScheduleBlocks,
  saveScheduleBlocks,
  getAppointments,
} from '@/database/data';

export interface BlockOperationResult {
  success: boolean;
  message?: string;
}

/** 1. Alterna el estado de una celda individual (miembro + horario de 15 min). */
export function toggleCellBlockState(params: {
  dateStr: string;
  member: string;
  startTime: string;
  endTime: string;
  isAvailable: boolean;
}): BlockOperationResult {
  const { dateStr, member, startTime, endTime, isAvailable } = params;
  const currentBlocks = getScheduleBlocks();

  if (isAvailable) {
    // Bloquear celda
    const apts = getAppointments().filter((a) => a.date === dateStr);
    const hasConflict = apts.some(
      (apt) => apt.member === member && apt.startTime < endTime && apt.endTime > startTime,
    );
    if (hasConflict) {
      return {
        success: false,
        message: 'El bloqueo seleccionado tiene turnos dentro y no se puede realizar la acción.',
      };
    }

    const nextBlocks = currentBlocks.filter(
      (b) =>
        !(
          b.date === dateStr &&
          b.member === member &&
          b.type === 'unblock' &&
          b.startTime <= startTime &&
          b.endTime >= endTime
        ),
    );

    nextBlocks.push({
      id: crypto.randomUUID(),
      date: dateStr,
      startTime,
      endTime,
      member,
      type: 'block',
    });

    saveScheduleBlocks(nextBlocks);
    return { success: true };
  } else {
    // Desbloquear celda
    let removedExplicit = false;
    const nextBlocks = currentBlocks.filter((b) => {
      if (
        b.date === dateStr &&
        b.member === member &&
        b.type !== 'unblock' &&
        b.startTime === startTime &&
        b.endTime === endTime
      ) {
        removedExplicit = true;
        return false;
      }
      return true;
    });

    if (!removedExplicit) {
      nextBlocks.push({
        id: crypto.randomUUID(),
        date: dateStr,
        startTime,
        endTime,
        member,
        type: 'unblock',
      });
    }

    saveScheduleBlocks(nextBlocks);
    return { success: true };
  }
}

/** 2. Alterna el estado de una fila entera del negocio (horario de 15 min para todos). */
export function toggleRowBlockState(params: {
  dateStr: string;
  startTime: string;
  endTime: string;
  isRowOpen: boolean;
}): BlockOperationResult {
  const { dateStr, startTime, endTime, isRowOpen } = params;
  const currentBlocks = getScheduleBlocks();

  if (isRowOpen) {
    // Bloquear fila de negocio
    const apts = getAppointments().filter((a) => a.date === dateStr);
    const hasConflict = apts.some((apt) => apt.startTime < endTime && apt.endTime > startTime);
    if (hasConflict) {
      return {
        success: false,
        message: 'El bloqueo seleccionado tiene turnos dentro y no se puede realizar la acción.',
      };
    }

    const nextBlocks = currentBlocks.filter(
      (b) =>
        !(
          !b.member &&
          b.date === dateStr &&
          b.type === 'unblock' &&
          b.startTime <= startTime &&
          b.endTime >= endTime
        ),
    );

    nextBlocks.push({
      id: crypto.randomUUID(),
      date: dateStr,
      startTime,
      endTime,
      type: 'block',
    });

    saveScheduleBlocks(nextBlocks);
    return { success: true };
  } else {
    // Desbloquear fila de negocio
    let removedExplicit = false;
    const nextBlocks = currentBlocks.filter((b) => {
      if (
        !b.member &&
        b.date === dateStr &&
        b.type !== 'unblock' &&
        b.startTime === startTime &&
        b.endTime === endTime
      ) {
        removedExplicit = true;
        return false;
      }
      return true;
    });

    if (!removedExplicit) {
      nextBlocks.push({
        id: crypto.randomUUID(),
        date: dateStr,
        startTime,
        endTime,
        type: 'unblock',
      });
    }

    saveScheduleBlocks(nextBlocks);
    return { success: true };
  }
}

/** 3. Alterna el estado del día completo de un miembro. */
export function toggleMemberDayBlockState(params: {
  dateStr: string;
  member: string;
  isMemberDayOpen: boolean;
}): BlockOperationResult {
  const { dateStr, member, isMemberDayOpen } = params;
  const currentBlocks = getScheduleBlocks();

  if (isMemberDayOpen) {
    // Bloquear día del miembro
    const apts = getAppointments().filter((a) => a.date === dateStr);
    const hasConflict = apts.some((apt) => apt.member === member);
    if (hasConflict) {
      return {
        success: false,
        message: 'El bloqueo seleccionado tiene turnos dentro y no se puede realizar la acción.',
      };
    }

    const nextBlocks = currentBlocks.filter(
      (b) => !(b.date === dateStr && b.member === member && b.type === 'unblock'),
    );

    nextBlocks.push({
      id: crypto.randomUUID(),
      date: dateStr,
      startTime: '00:00',
      endTime: '24:00',
      member,
      type: 'block',
    });

    saveScheduleBlocks(nextBlocks);
    return { success: true };
  } else {
    // Desbloquear día del miembro
    let hadBlocks = false;
    const nextBlocks = currentBlocks.filter((b) => {
      if (b.date === dateStr && b.member === member && b.type !== 'unblock') {
        hadBlocks = true;
        return false;
      }
      return true;
    });

    if (!hadBlocks) {
      nextBlocks.push({
        id: crypto.randomUUID(),
        date: dateStr,
        startTime: '00:00',
        endTime: '24:00',
        member,
        type: 'unblock',
      });
    }

    saveScheduleBlocks(nextBlocks);
    return { success: true };
  }
}

/** 4. Alterna el estado del día completo del negocio. */
export function toggleBusinessDayBlockState(params: {
  dateStr: string;
  isBusinessDayOpen: boolean;
}): BlockOperationResult {
  const { dateStr, isBusinessDayOpen } = params;
  const currentBlocks = getScheduleBlocks();

  if (isBusinessDayOpen) {
    // Bloquear día del negocio
    const apts = getAppointments().filter((a) => a.date === dateStr);
    if (apts.length > 0) {
      return {
        success: false,
        message: 'El bloqueo seleccionado tiene turnos dentro y no se puede realizar la acción.',
      };
    }

    const nextBlocks = currentBlocks.filter(
      (b) => !(!b.member && b.date === dateStr && b.type === 'unblock'),
    );

    nextBlocks.push({
      id: crypto.randomUUID(),
      date: dateStr,
      startTime: '00:00',
      endTime: '24:00',
      type: 'block',
    });

    saveScheduleBlocks(nextBlocks);
    return { success: true };
  } else {
    // Desbloquear día del negocio
    let hadBlocks = false;
    const nextBlocks = currentBlocks.filter((b) => {
      if (!b.member && b.date === dateStr && b.type !== 'unblock') {
        hadBlocks = true;
        return false;
      }
      return true;
    });

    if (!hadBlocks) {
      nextBlocks.push({
        id: crypto.randomUUID(),
        date: dateStr,
        startTime: '00:00',
        endTime: '24:00',
        type: 'unblock',
      });
    }

    saveScheduleBlocks(nextBlocks);
    return { success: true };
  }
}
