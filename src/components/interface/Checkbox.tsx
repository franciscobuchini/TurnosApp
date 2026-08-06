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

const CHECKBOX_SQUARE_CLASS = 'relative flex h-(--size-l) w-(--size-l) shrink-0 items-center justify-center rounded-xl cursor-pointer bg-neutral-950 text-white';
const CHECKBOX_SQUARE_DISABLED_CLASS = 'cursor-not-allowed opacity-50';

const CHECKBOX_INPUT_CLASS = 'peer sr-only';

const CHECKBOX_ICON_CLASS = 'h-3 w-3 opacity-0 transition-opacity duration-150 peer-checked:opacity-100';

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
      className={twMerge(CHECKBOX_SQUARE_CLASS,
        disabled && CHECKBOX_SQUARE_DISABLED_CLASS,
        className,
      )}
    >
      <input
        type="checkbox"
        checked={Boolean(checked)}
        disabled={disabled}
        onChange={handleChange}
        className={CHECKBOX_INPUT_CLASS}
      />
      <Check
        strokeWidth={3}
        className={CHECKBOX_ICON_CLASS}
      />
    </label>
  );
}
