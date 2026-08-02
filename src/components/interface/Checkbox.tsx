/*
  src/components/interface/Checkbox.tsx
  Checkbox reutilizable - solo el cuadro con tilde.
*/

import type { ChangeEvent } from 'react';
import { Check } from 'lucide-react';
import { twMerge } from 'tailwind-merge';

interface CheckboxProps {
  id: string;
  checked?: boolean;
  disabled?: boolean;
  onChange?: (id: string, checked: boolean) => void;
  className?: string;
}

/* CheckboxSquareClasses: contenedor visible y personalizable */
const CheckboxSquareClasses = {
  required: 'relative flex h-(--size-l) w-(--size-l) shrink-0 items-center justify-center rounded-xl cursor-pointer',
  style: 'bg-stone-950 text-white',
  disabled: 'cursor-not-allowed opacity-50',
};

/* CheckboxInputClasses: input real oculto */
const CheckboxInputClasses = {
  required: 'peer sr-only',
  style: '',
};

/* CheckboxIconClasses: tilde visible cuando está activo */
const CheckboxIconClasses = {
  required: 'h-3 w-3 opacity-0 transition-opacity duration-150 peer-checked:opacity-100',
  style: '',
};

export default function Checkbox({
  id,
  checked = true,
  disabled,
  onChange,
  className,
}: CheckboxProps) {
  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    onChange?.(id, event.target.checked);
  };

  return (
    <label
      className={twMerge(
        CheckboxSquareClasses.required,
        CheckboxSquareClasses.style,
        disabled && CheckboxSquareClasses.disabled,
        className,
      )}
    >
      <input
        type="checkbox"
        checked={Boolean(checked)}
        disabled={disabled}
        onChange={handleChange}
        className={twMerge(CheckboxInputClasses.required, CheckboxInputClasses.style)}
      />
      <Check
        strokeWidth={3}
        className={twMerge(CheckboxIconClasses.required, CheckboxIconClasses.style)}
      />
    </label>
  );
}