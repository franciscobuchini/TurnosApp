/*
  src/hooks/useUnsavedChanges.tsx
  Guarda global de "cambios sin guardar": cualquier vista con un borrador
  (SettingsBusinessView, EntityView, ServiceView, ClientView, y el modo
  Bloqueos/Desbloqueos de Dashboard) registra acá su propio isDirty (ver el
  efecto en cada una). Cualquier navegación que pueda perder ese borrador
  —el botón "Cancelar"/"Volver" de ViewLayout, pero también los accesos del
  AppMenubar (Inicio, Editar web, etc.)— pasa primero por `confirmNavigation`,
  que sólo interrumpe con un dialog si la vista actual está sucia; si no,
  navega directo.

  Antes esto sólo vivía adentro de ViewLayout (isDirty por prop): funcionaba
  para "Cancelar" pero no para salir por otro lado (menubar, sidebar, etc.),
  que navegaba sin pasar por ahí. Centralizarlo acá cubre cualquier
  navegación que se anime a llamar a confirmNavigation, no sólo un botón.

  setDirty acepta dos argumentos opcionales, `onSave` y `onDiscard`: si quien
  registra el borrador puede guardarlo sin pasar por su propia UI (ej. el
  modo Bloqueos/Desbloqueos, que ya persiste cada click y sólo necesita
  "cerrar" para confirmar), el dialog de salida ofrece un tercer botón
  "Guardar y salir" además de "Salir sin guardar". Los borradores de
  formulario (EntityView, etc.) no pasan ninguno de los dos: para guardar
  ahí hace falta validar el form primero (sólo tiene sentido "Cancelar"/
  "Salir sin guardar"), y descartarlos es tan simple como dejar que el
  componente se desmonte con su estado local.

  `onDiscard` existe porque el modo Bloqueos/Desbloqueos SÍ necesita revertir
  algo al salir sin guardar (los toggles ya se persistieron en la BBDD; hay
  que devolverlos a como estaban) y no alcanza con confiar en que el efecto
  de limpieza de Dashboard se dispare solo: ese efecto está atado a que
  Dashboard siga montado, y no lo sigue si la navegación va a una ruta
  top-level como "/personalizacion" (fuera del árbol de <Dashboard>) — ahí
  Dashboard se desmonta entero y ese efecto nunca llega a correr con el
  pathname nuevo. Pasar el revert como onDiscard lo hace explícito acá, sin
  depender de qué tan anidada esté la ruta de destino.

  No cubre back/forward del navegador ni cerrar la pestaña (beforeunload) —
  eso queda fuera de alcance por ahora.
*/

import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import CancelButton from '@/components/buttons/CancelButton';
import DeleteButton from '@/components/buttons/DeleteButton';
import ConfirmButton from '@/components/buttons/ConfirmButton';

interface UnsavedChangesContextValue {
  /** Cada vista con borrador llama a esto (típicamente en un useEffect) con
      su isDirty actual, y con `false` al desmontarse. Si se pasa `onSave`,
      el dialog de salida ofrece "Guardar y salir" además de "Salir sin
      guardar". Si se pasa `onDiscard`, se ejecuta al confirmar "Salir sin
      guardar" (antes de navegar) — para borradores que necesitan revertir
      algo ya persistido, no sólo abandonar estado local. */
  setDirty: (dirty: boolean, onSave?: () => void, onDiscard?: () => void) => void;
  /** Punto único por el que debe pasar cualquier navegación que pueda
      perder cambios: ejecuta `proceed` directo si no hay nada sucio, o
      pide confirmación primero si lo hay. */
  confirmNavigation: (proceed: () => void) => void;
}

const UnsavedChangesContext = createContext<UnsavedChangesContextValue | null>(null);

export function UnsavedChangesProvider({ children }: { children: ReactNode }) {
  // Ref, no state: setDirty se llama en efectos de render de otros
  // componentes, no hace falta (ni conviene) re-renderizar el árbol entero
  // cada vez que una vista tipea en un input.
  const dirtyRef = useRef(false);
  const onSaveRef = useRef<(() => void) | null>(null);
  const onDiscardRef = useRef<(() => void) | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [canSaveOnExit, setCanSaveOnExit] = useState(false);
  const pendingActionRef = useRef<(() => void) | null>(null);

  const setDirty = useCallback((dirty: boolean, onSave?: () => void, onDiscard?: () => void) => {
    dirtyRef.current = dirty;
    onSaveRef.current = dirty ? (onSave ?? null) : null;
    onDiscardRef.current = dirty ? (onDiscard ?? null) : null;
  }, []);

  const confirmNavigation = useCallback((proceed: () => void) => {
    if (!dirtyRef.current) {
      proceed();
      return;
    }
    pendingActionRef.current = proceed;
    setCanSaveOnExit(onSaveRef.current !== null);
    setConfirmOpen(true);
  }, []);

  const runPending = () => {
    dirtyRef.current = false;
    onSaveRef.current = null;
    onDiscardRef.current = null;
    const proceed = pendingActionRef.current;
    pendingActionRef.current = null;
    proceed?.();
  };

  const handleDiscard = () => {
    setConfirmOpen(false);
    onDiscardRef.current?.();
    runPending();
  };

  const handleSaveAndExit = () => {
    setConfirmOpen(false);
    onSaveRef.current?.();
    runPending();
  };

  return (
    <UnsavedChangesContext.Provider value={{ setDirty, confirmNavigation }}>
      {children}
      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>¿Salir sin guardar?</DialogTitle>
            <DialogDescription>Hay cambios sin guardar que se van a perder.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <CancelButton text="Volver" onClick={() => setConfirmOpen(false)} />
            <DeleteButton text="Salir sin guardar" onClick={handleDiscard} />
            {canSaveOnExit && <ConfirmButton text="Guardar y salir" onClick={handleSaveAndExit} />}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </UnsavedChangesContext.Provider>
  );
}

export function useUnsavedChanges(): UnsavedChangesContextValue {
  const ctx = useContext(UnsavedChangesContext);
  if (!ctx) {
    throw new Error('useUnsavedChanges se tiene que usar dentro de <UnsavedChangesProvider>');
  }
  return ctx;
}
