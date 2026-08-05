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

const InputClasses = {
  wrapper: 'flex flex-col gap-2',
  label: 'text-sm font-medium text-gray-700 px-(--size-m)',
  input: 'w-full rounded-2xl border border-gray-200 bg-white px-(--size-m) py-(--size-s) text-gray-900 outline-none transition focus:border-gray-900',
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
  ...props
}: InputProps) {
  const inputId = id ?? props.name;

  return (
    <div className={twMerge(InputClasses.wrapper, className)}>
      {label ? (
        <label htmlFor={inputId} className={twMerge(InputClasses.label, labelClassName)}>
          {label}
          {optional ? ' (opcional)' : null}
        </label>
      ) : null}
      {textarea ? (
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
      )}
    </div>
  );
}
