/*
  src/hooks/useUnsavedChanges.tsx
  Guarda global de "cambios sin guardar": cualquier vista con un borrador
  (SettingsBusinessView, EntityView, ServiceView, ClientView) registra acá
  su propio isDirty (ver el efecto en cada una). Cualquier navegación que
  pueda perder ese borrador —el botón "Cancelar"/"Volver" de ViewLayout,
  pero también los accesos del AppMenubar (Inicio, Editar web, etc.)— pasa
  primero por `confirmNavigation`, que sólo interrumpe con un ConfirmDialog
  si la vista actual está sucia; si no, navega directo.

  Antes esto sólo vivía adentro de ViewLayout (isDirty por prop): funcionaba
  para "Cancelar" pero no para salir por otro lado (menubar, sidebar, etc.),
  que navegaba sin pasar por ahí. Centralizarlo acá cubre cualquier
  navegación que se anime a llamar a confirmNavigation, no sólo un botón.

  No cubre back/forward del navegador ni cerrar la pestaña (beforeunload) —
  ver comentario en el provider.
*/

import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from 'react';
import ConfirmDialog from '@/components/ui/confirm-dialog';

interface UnsavedChangesContextValue {
  /** Cada vista con borrador llama a esto (típicamente en un useEffect) con
      su isDirty actual, y con `false` al desmontarse. */
  setDirty: (dirty: boolean) => void;
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
  const [confirmOpen, setConfirmOpen] = useState(false);
  const pendingActionRef = useRef<(() => void) | null>(null);

  const setDirty = useCallback((dirty: boolean) => {
    dirtyRef.current = dirty;
  }, []);

  const confirmNavigation = useCallback((proceed: () => void) => {
    if (!dirtyRef.current) {
      proceed();
      return;
    }
    pendingActionRef.current = proceed;
    setConfirmOpen(true);
  }, []);

  const handleConfirm = () => {
    // Se limpia antes de navegar: la vista que se está por desmontar ya no
    // va a llegar a correr su propio cleanup (setDirty(false)) a tiempo
    // para la próxima navegación.
    dirtyRef.current = false;
    const proceed = pendingActionRef.current;
    pendingActionRef.current = null;
    proceed?.();
  };

  return (
    <UnsavedChangesContext.Provider value={{ setDirty, confirmNavigation }}>
      {children}
      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="¿Salir sin guardar?"
        description="Hay cambios sin guardar que se van a perder."
        confirmText="Salir"
        onConfirm={handleConfirm}
      />
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
