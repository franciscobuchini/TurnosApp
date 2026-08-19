/*
  src/components/widgets/DetailsPanel.tsx
  Panel colapsable reutilizable con details/summary.
*/

import { useLayoutEffect, useRef, type DetailsHTMLAttributes, type MouseEvent as ReactMouseEvent, type ReactNode } from 'react';
import { twMerge } from 'tailwind-merge';
import { Dropdown } from '@/components/ui/dropdown';
import { Button } from '@/components/ui/button';
import Image from '@/components/ui/image';
import ContentHeader from '@/components/ui/content-header';
import { useFiltersGroup } from '@/hooks/useFiltersGroup';
import AddButton from '../../buttons/AddButton';
import SummaryButton from '../../buttons/SummaryButton';

export interface DetailsPanelOption {
  id: string;
  label: string;
  checked?: boolean;
  disabled?: boolean;
  colorClassName?: string;
  /** Sólo la usa el panel Servicios (ver ServiceFilterButton): independiente
      de `checked`, que es nada más el filtro de "mostrar en mi calendario" —
      `active` es si el servicio se puede reservar desde el sitio público. */
  active?: boolean;
  /** Sólo la usa el panel Clientes (ver clientFilters en Dashboard.tsx):
      se muestran los últimos 2 dígitos en la fila, para diferenciar
      clientes con nombres parecidos sin mostrar el teléfono entero. */
  phone?: string;
}

interface DetailsPanelProps extends DetailsHTMLAttributes<HTMLDetailsElement> {
  title: string;
  options?: DetailsPanelOption[];
  renderDropdownItems?: (option: DetailsPanelOption) => ReactNode[];
  action?: ReactNode;
  actionLabel?: string;
  onActionClick?: () => void;
  hideHeader?: boolean;
  /** Saca la flechita (SummaryButton) del título, sin ocultar el resto del
      summary — para paneles que técnicamente son un <details> pero no se
      quieren mostrar como un acordeón más (ver "Crear un nuevo turno" en
      AddShiftSidebar). */
  hideChevron?: boolean;
  /** Id de la opción seleccionada (se resalta) y callback al hacer click en la fila. */
  selectedId?: string;
  onOptionClick?: (option: DetailsPanelOption) => void;
  /** Contenido libre en vez de la lista de options (ej. un formulario) — si
      se pasa, options/action se ignoran. */
  children?: ReactNode;
}

/* Ojo: <details> con display:flex (o grid) NO reparte el alto a sus hijos
   con flex-grow/1fr — es un bug/particularidad real del elemento (probado
   a mano: un <details> y un <div> con el mismo CSS flex-col + hijo flex:1
   dan resultados distintos, el <div> reparte bien y el <details> no, sin
   importar si el hijo es <summary> real o un div cualquiera). Por eso acá
   NO se usa flex-col en el propio <details> — la altura del body se fija
   a mano en px vía usePanelBodyHeight de más abajo, que sí funciona
   siempre (ver ese hook para el detalle). */
const FILTER_PANEL_CLASS = 'group w-full cursor-pointer overflow-hidden shrink-0 rounded-4xl text-foreground p-2 bg-card border border-border';

const FILTER_PANEL_SUMMARY_CLASS = 'shrink-0';

const FILTER_PANEL_BODY_CLASS = 'flex flex-col min-h-0 pt-1';

/* Sólo la lista de options hace scroll — el botón "Agregar un nuevo..."
   (action/actionLabel) vive afuera de este contenedor, así queda anclado
   abajo como footer del panel en vez de desplazarse con la lista cuando
   hay muchas filas (ver expandOpenPanel en Sidebar.tsx: el panel abierto
   ocupa flex-1 del alto disponible, y ahí es donde esto se nota). */
const FILTER_PANEL_LIST_CLASS = 'flex flex-col flex-1 min-h-0 overflow-y-auto';

const DETAILS_PANEL_CONTENT_CLASS = 'flex items-center align-center gap-3 h-12 w-full text-left';

const DETAILS_PANEL_AVATAR_CLASS = 'h-8 w-8 shrink-0';
const DETAILS_PANEL_IMAGE_CLASS = 'h-full w-full';

const DETAILS_PANEL_LABEL_CLASS = 'flex-1 truncate';

const DETAILS_PANEL_PHONE_CLASS = 'shrink-0 text-xs text-muted-foreground';

interface DetailsPanelOptionRowProps {
  option: DetailsPanelOption;
  renderDropdownItems?: (option: DetailsPanelOption) => ReactNode[];
  onOptionClick?: (option: DetailsPanelOption) => void;
  selectedId?: string;
}

/* Fila de opción (avatar + label, con menú Dropdown o click simple según
   se pase renderDropdownItems) — la usa el listado por defecto de acá
   abajo, y también paneles que arman su propio body (children) pero
   quieren la misma fila, ej. el buscador de Clientes en AdminSidebar. */
export function DetailsPanelOptionRow({ option, renderDropdownItems, onOptionClick, selectedId }: DetailsPanelOptionRowProps) {
  const content = (
    <div
      data-details-panel-content
      className={twMerge(
        DETAILS_PANEL_CONTENT_CLASS,
        (option.checked === false || option.active === false) && 'opacity-40',
      )}
    >
      <span className={DETAILS_PANEL_AVATAR_CLASS}>
        <Image
          name={option.label}
          className={twMerge(
            DETAILS_PANEL_IMAGE_CLASS,
            option.colorClassName && 'text-black',
            option.colorClassName,
          )}
        />
      </span>
      <span className={DETAILS_PANEL_LABEL_CLASS}>{option.label}</span>
      {option.phone?.trim() && (
        <span className={DETAILS_PANEL_PHONE_CLASS}>•• {option.phone.trim().slice(-2)}</span>
      )}
    </div>
  );

  return renderDropdownItems ? (
    <Dropdown
      items={renderDropdownItems(option)}
      onClick={() => onOptionClick?.(option)}
      content={content}
      className={DETAILS_PANEL_TRIGGER_CLASS}
      openClassName={DETAILS_PANEL_TRIGGER_OPEN_CLASS}
    />
  ) : (
    <Button
      type="button"
      variant="ghost"
      className={twMerge(
        DETAILS_PANEL_TRIGGER_CLASS,
        'text-left',
        option.id === selectedId && DETAILS_PANEL_TRIGGER_OPEN_CLASS,
      )}
      onClick={() => onOptionClick?.(option)}
    >
      {content}
    </Button>
  );
}

/* animate-in solo dispara al montarse (no en cada apertura del acordeón,
   ya que las filas existentes no se desmontan al cerrar/abrir un <details>
   nativo) — así una fila recién agregada (ej. un servicio que se acaba de
   crear) entra con una transición sutil sin re-animar el resto de la lista. */
const DETAILS_PANEL_TRIGGER_CLASS =
  'w-full h-12 gap-4 shrink-0 justify-center text-muted-foreground hover:text-foreground rounded-3xl animate-in fade-in-0 slide-in-from-top-1 duration-200';
const DETAILS_PANEL_TRIGGER_OPEN_CLASS = 'bg-background';

/* El <details> nativo no anima: el contenido aparece/desaparece de golpe
   con display:none al tocar `open`. En vez de reimplementar el toggle a
   mano, se deja que siga siendo el <details> nativo el que manda (así
   sigue funcionando gratis la exclusividad por `name` entre paneles del
   mismo grupo, y el onToggle de abajo con su lógica de resize/fallback del
   calendario) — sólo se intercepta el click en <summary> para animar la
   altura con la Web Animations API antes de sincronizar `details.open`, en
   vez de dejar que el toggle nativo la cambie de una. Patrón estándar (ver
   "Building an open/close accordion" de web.dev): al abrir, se fija la
   altura cerrada actual, se pone `open = true` (dispara el toggle nativo
   ya mismo, como siempre) y recién en el frame siguiente se anima hasta la
   altura natural; al cerrar, se anima primero desde la altura abierta
   hasta la cerrada y `open` pasa a false (dispara el toggle nativo) al
   terminar. La altura "cerrada" no sale de sumar summary + padding a mano
   (frágil si cambia el CSS): sale de restarle a la altura total la del
   body — así da lo mismo qué combinación de padding/borde tenga el panel. */
const DETAILS_TOGGLE_ANIMATION_DURATION = 200;
const DETAILS_TOGGLE_ANIMATION_EASING = 'ease-out';

function useDetailsToggleAnimation(detailsRef: React.RefObject<HTMLDetailsElement | null>) {
  const animationRef = useRef<Animation | null>(null);
  const isClosingRef = useRef(false);
  const isExpandingRef = useRef(false);

  const onAnimationFinish = (details: HTMLDetailsElement, open: boolean) => {
    details.open = open;
    details.style.height = '';
    animationRef.current = null;
    isClosingRef.current = false;
    isExpandingRef.current = false;

    // Recién acá el <details> quedó libre para medir su alto real (flex-1
    // desde afuera, si aplica) sin el height animado de por medio — ver
    // syncPanelBodyHeight. Mientras la animación corre, el <details> sigue
    // el height animado (no el flex-grow final), así que sincronizar antes
    // de este punto deja al body con un alto intermedio, congelado.
    window.requestAnimationFrame(() => syncPanelBodyHeight(details));
  };

  const shrink = (details: HTMLDetailsElement) => {
    isClosingRef.current = true;

    const body = details.querySelector<HTMLElement>('[data-filter-panel-body]');
    const openHeight = details.offsetHeight;
    const closedHeight = body ? openHeight - body.offsetHeight : openHeight;

    animationRef.current?.cancel();
    animationRef.current = details.animate(
      { height: [`${openHeight}px`, `${closedHeight}px`] },
      { duration: DETAILS_TOGGLE_ANIMATION_DURATION, easing: DETAILS_TOGGLE_ANIMATION_EASING },
    );
    animationRef.current.onfinish = () => onAnimationFinish(details, false);
    animationRef.current.oncancel = () => {
      isClosingRef.current = false;
    };
  };

  const expand = (details: HTMLDetailsElement, closedHeight: number) => {
    isExpandingRef.current = true;

    // Saca el lock de altura para medir la natural (abierta) ya con el
    // contenido montado, y lo vuelve a poner en el valor cerrado antes de
    // animar — todo en el mismo frame, sin pintar de por medio.
    details.style.height = '';
    const openHeight = details.offsetHeight;
    details.style.height = `${closedHeight}px`;

    animationRef.current?.cancel();
    animationRef.current = details.animate(
      { height: [`${closedHeight}px`, `${openHeight}px`] },
      { duration: DETAILS_TOGGLE_ANIMATION_DURATION, easing: DETAILS_TOGGLE_ANIMATION_EASING },
    );
    animationRef.current.onfinish = () => onAnimationFinish(details, true);
    animationRef.current.oncancel = () => {
      isExpandingRef.current = false;
    };
  };

  return (event: ReactMouseEvent<HTMLElement>) => {
    const details = detailsRef.current;
    if (!details) return;

    // Reduced motion: nada de interceptar, toggle nativo de siempre.
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    event.preventDefault();

    if (isClosingRef.current || !details.open) {
      const closedHeight = details.offsetHeight;
      details.style.height = `${closedHeight}px`;
      details.open = true;
      window.requestAnimationFrame(() => expand(details, closedHeight));
    } else {
      shrink(details);
    }
  };
}

/* <details> no reparte alto a sus hijos con CSS (ver comentario de
   FILTER_PANEL_CLASS), así que cuando el propio <details> recibe más
   altura de la que necesita su contenido natural (acordeón abierto dentro
   de un contexto h-full, ej. el panel expandido de Sidebar.tsx vía
   SIDEBAR_EXPAND_OPEN_PANEL_CLASS), el body se fija a mano al espacio que
   sobra — así el botón "Agregar un nuevo...", al ser el último hijo de un
   body flex-col, queda empujado hasta el fondo real en vez de pegado
   justo debajo de la última fila.

   El recálculo NO puede depender sólo de ResizeObserver: mientras el
   <details> tiene flex-1 (flex-basis:0%) su altura animada a mano por
   useDetailsToggleAnimation queda ignorada por el algoritmo de flexbox
   (gana el flex-grow, no el height inline), así que el tamaño real
   "salta" a su valor final apenas se abre — y en el entorno de test de
   este proyecto ResizeObserver no llegó a reportar ese salto de forma
   confiable. Por eso el toggle de <details> (ver onToggle más abajo)
   llama a syncPanelBodyHeight a mano en el mismo rAF donde ya espera a
   que el layout asiente (el que dispara "resize-filter-panel"). El
   ResizeObserver + el listener de resize de acá quedan como red de
   contención para el resto de los casos (resize de ventana con el panel
   ya abierto, cambios de layout ajenos al propio toggle). */
function syncPanelBodyHeight(details: HTMLDetailsElement) {
  const summary = details.querySelector<HTMLElement>(':scope > summary');
  const body = details.querySelector<HTMLElement>(':scope > [data-filter-panel-body]');
  if (!summary || !body) return;

  // clientHeight incluye el padding vertical del propio <details> (p-2):
  // hay que restarlo antes de restar el summary, si no el body queda con
  // paddingTop + paddingBottom de más (el botón termina desbordando el
  // fondo real del panel en vez de quedar justo a ras).
  const computed = window.getComputedStyle(details);
  const verticalPadding = parseFloat(computed.paddingTop) + parseFloat(computed.paddingBottom);
  const contentHeight = details.clientHeight - verticalPadding;

  body.style.height = `${contentHeight - summary.offsetHeight}px`;
}

function usePanelBodyHeight(detailsRef: React.RefObject<HTMLDetailsElement | null>) {
  useLayoutEffect(() => {
    const details = detailsRef.current;
    if (!details) return;

    const sync = () => syncPanelBodyHeight(details);
    sync();

    const observer = new ResizeObserver(sync);
    observer.observe(details);
    window.addEventListener('resize', sync);
    return () => {
      observer.disconnect();
      window.removeEventListener('resize', sync);
    };
  }, [detailsRef]);
}

export default function DetailsPanel({
  title,
  options = [],
  renderDropdownItems,
  action,
  actionLabel,
  onActionClick,
  className,
  name,
  hideHeader = false,
  hideChevron = false,
  selectedId,
  onOptionClick,
  children,
  ...props
}: DetailsPanelProps) {
  /* Si no se pasa un name explícito, usa el del contenedor (sidebar/maincontent)
     para que abrir este panel cierre a los demás del mismo contenedor. */
  const groupName = useFiltersGroup();
  const detailsRef = useRef<HTMLDetailsElement>(null);
  const onSummaryClick = useDetailsToggleAnimation(detailsRef);
  usePanelBodyHeight(detailsRef);

  return (
    <details
      {...props}
      ref={detailsRef}
      data-filter-panel
      data-panel-title={title}
      name={name ?? groupName}
      onToggle={(e) => {
        props.onToggle?.(e);

        const details = e.currentTarget;

        window.requestAnimationFrame(() => {
          syncPanelBodyHeight(details);
          details.dispatchEvent(new Event('resize-filter-panel'));
        });

        if (details.open || !groupName) return;

        const openedFilters = document.querySelector(
          `details[name="${groupName}"][data-filter-panel][open]`,
        );

        if (!openedFilters) {
          const calendar = document.querySelector<HTMLDetailsElement>(
            `details[name="${groupName}"][data-calendar]`,
          );

          if (calendar) {
            calendar.open = true;
          }
        }
      }}
      className={twMerge(FILTER_PANEL_CLASS, className)}
    >
      <summary hidden={hideHeader} onClick={onSummaryClick} className={FILTER_PANEL_SUMMARY_CLASS}>
        <ContentHeader title={title} action={hideChevron ? undefined : <SummaryButton />} />
      </summary>

      <div data-filter-panel-body className={FILTER_PANEL_BODY_CLASS}>
        {children ?? (
          <>
            <div className={FILTER_PANEL_LIST_CLASS}>
              {options.map((option) => (
                <DetailsPanelOptionRow
                  key={option.id}
                  option={option}
                  renderDropdownItems={renderDropdownItems}
                  onOptionClick={onOptionClick}
                  selectedId={selectedId}
                />
              ))}
            </div>

            {action ?? (actionLabel ? <AddButton text={actionLabel} onClick={onActionClick} /> : null)}
          </>
        )}
      </div>
    </details>
  );
}