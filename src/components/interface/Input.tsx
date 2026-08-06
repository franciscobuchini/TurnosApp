import type { InputHTMLAttributes, ReactNode, TextareaHTMLAttributes } from 'react';
import { twMerge } from 'tailwind-merge';
import Checkbox from './Checkbox';

type BaseProps = {
  label?: string;
  className?: string;
  labelClassName?: string;
  inputClassName?: string;
  rows?: number;
  optional?: boolean;
  id?: string;
  /** Contenido que se acopla a la derecha del campo, alineado en la misma fila. */
  addon?: ReactNode;
  addonClassName?: string;
  /**
   * Muestra un checkbox "Aprox." acoplado a la derecha del campo, alineado
   * al input (no al label). Pasar `approx` + `onApproxChange` alcanza,
   * no hace falta armar el layout a mano desde afuera.
   */
  approx?: boolean;
  onApproxChange?: (value: boolean) => void;
  approxLabel?: string;
};

type InputVariant = BaseProps & Omit<InputHTMLAttributes<HTMLInputElement>, 'className' | 'id'> & { textarea?: false | undefined };
type TextareaVariant = BaseProps & Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'className' | 'id'> & { textarea: true };

type InputProps = InputVariant | TextareaVariant;

const INPUT_WRAPPER_CLASS = 'flex flex-col gap-2';
const INPUT_LABEL_CLASS = 'text-sm font-medium text-neutral-700 px-(--size-m)';
const INPUT_FIELD_ROW_CLASS = 'flex items-center gap-3';
const INPUT_FIELD_CLASS = 'flex-1 min-w-0';
const INPUT_ADDON_CLASS = 'shrink-0';
const INPUT_APPROX_CLASS = 'flex items-center gap-2 whitespace-nowrap text-sm text-neutral-700';
const INPUT_INPUT_CLASS = 'w-full rounded-2xl border border-neutral-200 bg-white px-(--size-m) py-(--size-s) text-neutral-900 outline-none transition focus:border-neutral-900';
const INPUT_TEXTAREA_CLASS = 'min-h-28 resize-none';

export default function Input({
  label,
  className,
  labelClassName,
  inputClassName,
  textarea = false,
  rows = 4,
  optional = false,
  id,
  addon,
  addonClassName,
  approx,
  onApproxChange,
  approxLabel = 'Aprox.',
  ...props
}: InputProps) {
  const inputId = id ?? props.name;

  const field = textarea ? (
    <textarea
      id={inputId}
      rows={rows}
      className={twMerge(INPUT_INPUT_CLASS, INPUT_TEXTAREA_CLASS, inputClassName)}
      {...(props as TextareaHTMLAttributes<HTMLTextAreaElement>)}
    />
  ) : (
    <input
      id={inputId}
      className={twMerge(INPUT_INPUT_CLASS, inputClassName)}
      {...(props as InputHTMLAttributes<HTMLInputElement>)}
    />
  );

  const approxAddon =
    approx !== undefined ? (
      <label htmlFor={`${inputId}-approx`} className={INPUT_APPROX_CLASS}>
        {approxLabel}
        <Checkbox
          id={`${inputId}-approx`}
          checked={approx}
          onChange={() => onApproxChange?.(!approx)}
        />
      </label>
    ) : null;

  const resolvedAddon = addon ?? approxAddon;

  return (
    <div className={twMerge(INPUT_WRAPPER_CLASS, className)}>
      {label ? (
        <label htmlFor={inputId} className={twMerge(INPUT_LABEL_CLASS, labelClassName)}>
          {label}
          {optional ? ' (opcional)' : null}
        </label>
      ) : null}
      {resolvedAddon ? (
        <div className={INPUT_FIELD_ROW_CLASS}>
          <div className={INPUT_FIELD_CLASS}>{field}</div>
          <div className={twMerge(INPUT_ADDON_CLASS, addonClassName)}>{resolvedAddon}</div>
        </div>
      ) : (
        field
      )}
    </div>
  );
}
