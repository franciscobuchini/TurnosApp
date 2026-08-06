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

const InputClasses = {
  wrapper: 'flex flex-col gap-2',
  label: 'text-sm font-medium text-neutral-700 px-(--size-m)',
  fieldRow: 'flex items-center gap-3',
  field: 'flex-1 min-w-0',
  addon: 'shrink-0',
  approx: 'flex items-center gap-2 whitespace-nowrap text-sm text-neutral-700',
  input: 'w-full rounded-2xl border border-neutral-200 bg-white px-(--size-m) py-(--size-s) text-neutral-900 outline-none transition focus:border-neutral-900',
  textarea: 'min-h-28 resize-none',
};

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
      className={twMerge(InputClasses.input, InputClasses.textarea, inputClassName)}
      {...(props as TextareaHTMLAttributes<HTMLTextAreaElement>)}
    />
  ) : (
    <input
      id={inputId}
      className={twMerge(InputClasses.input, inputClassName)}
      {...(props as InputHTMLAttributes<HTMLInputElement>)}
    />
  );

  const approxAddon =
    approx !== undefined ? (
      <label htmlFor={`${inputId}-approx`} className={InputClasses.approx}>
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
    <div className={twMerge(InputClasses.wrapper, className)}>
      {label ? (
        <label htmlFor={inputId} className={twMerge(InputClasses.label, labelClassName)}>
          {label}
          {optional ? ' (opcional)' : null}
        </label>
      ) : null}
      {resolvedAddon ? (
        <div className={InputClasses.fieldRow}>
          <div className={InputClasses.field}>{field}</div>
          <div className={twMerge(InputClasses.addon, addonClassName)}>{resolvedAddon}</div>
        </div>
      ) : (
        field
      )}
    </div>
  );
}