import { twMerge } from 'tailwind-merge';

type Props = {
  count: number;
  value: number | null;
  onChange: (index: number | null) => void;
};

const GRID_CLASSES = 'grid grid-cols-[repeat(auto-fill,80px)] justify-center gap-(--size-s)';
const PHOTO_CLASSES = 'h-(--size-5xl) w-(--size-5xl) overflow-hidden rounded-lg border-1 bg-white';
const PHOTO_ACTIVE_CLASSES = 'border-neutral-500';
const PHOTO_INACTIVE_CLASSES = 'border-transparent border-neutral-200';
const NO_PHOTO_LABEL_CLASSES = 'flex h-full w-full items-center justify-center text-neutral-500';

export default function PhotoPicker({
  count,
  value,
  onChange,
}: Props) {
  return (
    <div className={GRID_CLASSES}>
      <button
        type="button"
        onClick={() => onChange(null)}
        aria-pressed={value === null}
        className={twMerge(
          PHOTO_CLASSES,
          value === null ? PHOTO_ACTIVE_CLASSES : PHOTO_INACTIVE_CLASSES
        )}
      >
        <span className={NO_PHOTO_LABEL_CLASSES}>X</span>
      </button>

      {Array.from({ length: count }, (_, index) => {
        const isActive = value === index;

        return (
          <button
            key={index}
            type="button"
            onClick={() => onChange(index)}
            aria-pressed={isActive}
            className={twMerge(
              PHOTO_CLASSES,
              isActive ? PHOTO_ACTIVE_CLASSES : PHOTO_INACTIVE_CLASSES
            )}
          >
            {/* Reemplazar por la imagen real */}
            <span className={NO_PHOTO_LABEL_CLASSES}>
              {index + 1}
            </span>
          </button>
        );
      })}
    </div>
  );
}