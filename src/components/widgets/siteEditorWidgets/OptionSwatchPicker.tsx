/*
  src/components/widgets/siteEditorWidgets/OptionSwatchPicker.tsx
  Grilla de opciones seleccionables con preview propio — generalización de
  ColorPicker.tsx (servicios) para elegir entre definiciones más ricas que
  un color plano (un theme completo, un radio, una tipografía). Un mismo
  componente sirve para los tres controles de Apariencia: agregar una
  opción nueva es un elemento más en el array que arma `options`, no un
  componente nuevo.
*/

import type { ReactNode } from 'react';
import { twMerge } from 'tailwind-merge';

export interface OptionSwatchPickerOption<T extends string> {
  id: T;
  label: string;
  render: ReactNode;
  /** La opción pinta todo el recuadro (sin padding): el render debe llenar
      con h-full w-full. */
  fill?: boolean;
}

interface OptionSwatchPickerProps<T extends string> {
  options: OptionSwatchPickerOption<T>[];
  value: T;
  onChange: (id: T) => void;
  /** Columnas de la grilla (default 3). */
  cols?: number;
  /** Oculta la etiqueta bajo cada opción (p.ej. solo el color en el
      picker de temas). */
  showLabels?: boolean;
}

const WRAPPER_CLASS = 'grid grid-cols-3 gap-2';

const OPTION_CLASS =
  'flex cursor-pointer flex-col items-center gap-2 rounded-2xl border p-3 text-center transition-all';

const OPTION_ACTIVE_CLASS = 'border-foreground/70 bg-muted';

const OPTION_INACTIVE_CLASS = 'border-border hover:border-muted-foreground';

export default function OptionSwatchPicker<T extends string>({
  options,
  value,
  onChange,
  cols = 3,
  showLabels = true,
}: OptionSwatchPickerProps<T>) {
  return (
    <div className={WRAPPER_CLASS} style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}>
      {options.map((option) => {
        const isActive = value === option.id;

        return (
          <button
            key={option.id}
            type="button"
            aria-pressed={isActive}
            title={option.label}
            onClick={() => onChange(option.id)}
            className={twMerge(
              OPTION_CLASS,
              option.fill && 'aspect-square overflow-hidden rounded-none p-0',
              isActive ? OPTION_ACTIVE_CLASS : OPTION_INACTIVE_CLASS,
            )}
          >
            {option.render}
            {showLabels && <span className="text-xs text-muted-foreground">{option.label}</span>}
          </button>
        );
      })}
    </div>
  );
}
