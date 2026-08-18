/*
  scratch/test-block-system.ts
  Test suite for verifying the 6-in-1 unified block/unblock system.
*/

const store = new Map<string, string>();
(globalThis as any).localStorage = {
  getItem: (key: string) => store.get(key) ?? null,
  setItem: (key: string, val: string) => store.set(key, String(val)),
  removeItem: (key: string) => store.delete(key),
  clear: () => store.clear(),
};

import {
  toggleCellBlockState,
  toggleRowBlockState,
  toggleMemberDayBlockState,
  toggleBusinessDayBlockState,
} from '../src/functions/blockToggleOperations';
import {
  getScheduleBlocks,
  saveScheduleBlocks,
  getAppointments,
  saveAppointments,
} from '../src/database/data';

function runTests() {
  console.log('--- Starting Unified Block/Unblock Tests ---');

  // Setup initial clean state
  const originalBlocks = getScheduleBlocks();
  const originalAppointments = getAppointments();

  saveScheduleBlocks([]);
  saveAppointments([
    {
      id: 'apt-test-1',
      date: '2026-08-20',
      startTime: '10:00',
      endTime: '11:00',
      member: 'Francisco',
      client: 'Juan Perez',
      service: 'Corte',
    },
  ]);

  // Test 1: Block available cell without appointments
  const res1 = toggleCellBlockState({
    dateStr: '2026-08-20',
    member: 'Francisco',
    startTime: '14:00',
    endTime: '14:15',
    isAvailable: true,
  });
  console.assert(res1.success === true, 'Test 1 Failed: Should successfully block available slot');
  console.log('✓ Test 1 Passed: Blocked available cell 14:00-14:15');

  // Test 2: Unblock the cell we just blocked
  const res2 = toggleCellBlockState({
    dateStr: '2026-08-20',
    member: 'Francisco',
    startTime: '14:00',
    endTime: '14:15',
    isAvailable: false,
  });
  console.assert(res2.success === true, 'Test 2 Failed: Should successfully unblock blocked slot');
  console.log('✓ Test 2 Passed: Unblocked cell 14:00-14:15');

  // Test 3: Attempt to block cell that overlaps appointment (10:00 - 11:00)
  const res3 = toggleCellBlockState({
    dateStr: '2026-08-20',
    member: 'Francisco',
    startTime: '10:15',
    endTime: '10:30',
    isAvailable: true,
  });
  console.assert(res3.success === false, 'Test 3 Failed: Should reject block overlapping appointment');
  console.assert(
    res3.message === 'El bloqueo seleccionado tiene turnos dentro y no se puede realizar la acción.',
    'Test 3 Failed: Wrong alert message',
  );
  console.log('✓ Test 3 Passed: Conflict alert triggered when cell overlaps appointment');

  // Test 4: Attempt to block business row overlapping appointment
  const res4 = toggleRowBlockState({
    dateStr: '2026-08-20',
    startTime: '10:00',
    endTime: '10:15',
    isRowOpen: true,
  });
  console.assert(res4.success === false, 'Test 4 Failed: Should reject business row block overlapping appointment');
  console.log('✓ Test 4 Passed: Conflict alert triggered on business row block');

  // Test 5: Successfully block business row on free time
  const res5 = toggleRowBlockState({
    dateStr: '2026-08-20',
    startTime: '16:00',
    endTime: '16:15',
    isRowOpen: true,
  });
  console.assert(res5.success === true, 'Test 5 Failed: Should block free business row');
  console.log('✓ Test 5 Passed: Business row blocked on free time');

  // Test 6: Attempt to block member day with appointment
  const res6 = toggleMemberDayBlockState({
    dateStr: '2026-08-20',
    member: 'Francisco',
    isMemberDayOpen: true,
  });
  console.assert(res6.success === false, 'Test 6 Failed: Should reject member day block with appointment');
  console.log('✓ Test 6 Passed: Member day block prevented when appointments exist');

  // Test 7: Successfully block member day with NO appointment
  const res7 = toggleMemberDayBlockState({
    dateStr: '2026-08-20',
    member: 'Mariano',
    isMemberDayOpen: true,
  });
  console.assert(res7.success === true, 'Test 7 Failed: Should block free member day');
  console.log('✓ Test 7 Passed: Free member day blocked');

  // Test 8: Attempt to block business day with appointment
  const res8 = toggleBusinessDayBlockState({
    dateStr: '2026-08-20',
    isBusinessDayOpen: true,
  });
  console.assert(res8.success === false, 'Test 8 Failed: Should reject business day block with appointment');
  console.log('✓ Test 8 Passed: Business day block prevented when appointments exist');

  // Restore
  saveScheduleBlocks(originalBlocks);
  saveAppointments(originalAppointments);

  console.log('--- ALL TESTS PASSED SUCCESSFULLY! ---');
}

runTests();
