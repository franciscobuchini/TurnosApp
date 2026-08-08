import type { InputHTMLAttributes, TextareaHTMLAttributes } from 'react';
import { twMerge } from 'tailwind-merge';

type BaseProps = {
  label?: string;
  className?: string;
  labelClassName?: string;
  inputClassName?: string;
  rows?: number;
  optional?: boolean;
  id?: string;
};

type InputVariant = BaseProps & Omit<InputHTMLAttributes<HTMLInputElement>, 'className' | 'id'> & { textarea?: false | undefined };
type TextareaVariant = BaseProps & Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'className' | 'id'> & { textarea: true };

type InputProps = InputVariant | TextareaVariant;

const INPUT_WRAPPER_CLASS = 'flex flex-col gap-(--size-s)';
const INPUT_LABEL_CLASS = 'text-md text-neutral-300 px-(--size-s)';
const INPUT_INPUT_CLASS = 'w-full rounded-2xl border border-neutral-700 bg-neutral-800 px-(--size-m) py-(--size-s) text-neutral-100 outline-none transition focus:border-neutral-400';
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

  return (
    <div className={twMerge(INPUT_WRAPPER_CLASS, className)}>
      {label ? (
        <label htmlFor={inputId} className={twMerge(INPUT_LABEL_CLASS, labelClassName)}>
          {label}
          {optional ? ' (opcional)' : null}
        </label>
      ) : null}
      {field}
    </div>
  );
}