/*
  src/components/widgets/DetailsPanel.tsx
  Panel colapsable reutilizable con details/summary.
*/

import { useRef, type DetailsHTMLAttributes, type MouseEvent as ReactMouseEvent, type ReactNode } from 'react';
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

const FILTER_PANEL_CLASS = 'group w-full cursor-pointer overflow-hidden shrink-0 rounded-4xl text-foreground p-2 bg-card border border-border';

const FILTER_PANEL_BODY_CLASS = 'flex flex-col flex-1 min-h-0 overflow-y-auto pt-1 ';

const DETAILS_PANEL_CONTENT_CLASS = 'flex items-center align-center gap-3 h-12 w-full text-left';

const DETAILS_PANEL_AVATAR_CLASS = 'h-8 w-8 shrink-0';
const DETAILS_PANEL_IMAGE_CLASS = 'h-full w-full';

const DETAILS_PANEL_LABEL_CLASS = '';

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
      <summary hidden={hideHeader} onClick={onSummaryClick}>
        <ContentHeader title={title} action={hideChevron ? undefined : <SummaryButton />} />
      </summary>

      <div data-filter-panel-body className={FILTER_PANEL_BODY_CLASS}>
        {children ?? (
          <>
            {options.map((option) => {
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
                </div>
              );

              /* Sin ítems de dropdown, la fila es un botón simple (selección):
                 el mismo Button ghost que usa el Dropdown para idéntico estilo. */
              return renderDropdownItems ? (
                <Dropdown
                  key={option.id}
                  items={renderDropdownItems(option)}
                  onClick={() => onOptionClick?.(option)}
                  content={content}
                  className={DETAILS_PANEL_TRIGGER_CLASS}
                  openClassName={DETAILS_PANEL_TRIGGER_OPEN_CLASS}
                />
              ) : (
                <Button
                  key={option.id}
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
            })}

            {action ?? (actionLabel ? <AddButton text={actionLabel} onClick={onActionClick} /> : null)}
          </>
        )}
      </div>
    </details>
  );
}