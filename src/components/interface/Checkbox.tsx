/*
  src/components/interface/Checkbox.tsx
  Checkbox reutilizable con label.
*/

import type { ChangeEvent } from 'react';
import { Check } from 'lucide-react';
import { twMerge } from 'tailwind-merge';

interface CheckboxProps {
  id: string;
  label: string;
  checked?: boolean;
  disabled?: boolean;
  onChange?: (id: string, checked: boolean) => void;
  className?: string;
}

/* CheckboxClasses: contenedor del input + texto */
const CheckboxClasses = {
  required: 'flex cursor-pointer items-center pl-(--size-s) gap-(--size-xs) h-(--size-xl)',
  style: '',
  disabled: 'cursor-not-allowed opacity-50',
};

/* CheckboxInputClasses: input real, oculto visualmente pero accesible */
const CheckboxInputClasses = {
  required: 'peer sr-only',
  style: '',
};

/* CheckboxSquareClasses: cuadrado visible y personalizable */
const CheckboxSquareClasses = {
  required: 'flex h-(--size-l) w-(--size-l) shrink-0 items-center justify-center rounded-xl',
  style: 'bg-stone-950 text-white',
};

/* CheckboxIconClasses: tilde visible cuando el checkbox esta activo */
const CheckboxIconClasses = {
  required: 'h-3 w-3 opacity-0 transition-opacity duration-150 peer-checked:opacity-100',
  style: '',
};

/* CheckboxLabelClasses: texto del checkbox */
const CheckboxLabelClasses = {
  required: '',
  style: '',
};

export default function Checkbox({
  id,
  label,
  checked = true,
  disabled,
  onChange,
  className,
}: CheckboxProps) {
  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    onChange?.(id, event.target.checked);
  };

  return (
    <label className={twMerge(CheckboxClasses.required, CheckboxClasses.style, disabled && CheckboxClasses.disabled, className)}>
      <span className={twMerge(CheckboxSquareClasses.required, CheckboxSquareClasses.style)}>
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
      </span>
      <span className={twMerge(CheckboxLabelClasses.required, CheckboxLabelClasses.style)}>
        {label}
      </span>
    </label>
  );
}