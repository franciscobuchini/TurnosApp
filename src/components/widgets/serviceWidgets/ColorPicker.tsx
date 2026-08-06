import { twMerge } from 'tailwind-merge';

export type ServiceColor = {
  id: string;
  label: string;
  className: string;
};

type Props = {
  colors: ServiceColor[];
  value: string;
  onChange: (id: string) => void;
};

const WRAPPER_CLASS = 'flex flex-wrap justify-center gap-(--size-s)';
const SWATCH_CLASS = 'h-(--size-xl) w-(--size-xl) rounded-full border-1 transition';
const SWATCH_ACTIVE_CLASS = 'border-neutral-500';
const SWATCH_INACTIVE_CLASS = 'border-transparent hover:border-neutral-300';

export default function ColorPicker({
  colors,
  value,
  onChange,
}: Props) {
  return (
    <div className={WRAPPER_CLASS}>
      {colors.map((color) => {
        const isActive = value === color.id;

        return (
          <button
            key={color.id}
            type="button"
            aria-label={color.label}
            aria-pressed={isActive}
            title={color.label}
            onClick={() => onChange(color.id)}
            className={twMerge(
              SWATCH_CLASS,
              color.className,
              isActive ? SWATCH_ACTIVE_CLASS : SWATCH_INACTIVE_CLASS
            )}
          />
        );
      })}
    </div>
  );
}