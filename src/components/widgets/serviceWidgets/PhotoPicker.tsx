import { twMerge } from 'tailwind-merge';
import servicePhotos from '../../../database/servicePhotos.json';

type Props = {
  value: number | null;
  onChange: (index: number | null) => void;
  disabled?: boolean;
};

const GRID_CLASS = 'grid grid-cols-[repeat(auto-fill,80px)] justify-center gap-2';
const PHOTO_CLASS = 'h-20 w-20 overflow-hidden rounded-2xl border border-border bg-input';
const PHOTO_ACTIVE_CLASS = 'border-2 border-foreground';
const PHOTO_INACTIVE_CLASS = '';
const NO_PHOTO_LABEL_CLASS = 'flex h-full w-full items-center justify-center text-muted-foreground';
const PHOTO_IMAGE_CLASS = 'h-full w-full object-cover';

export default function PhotoPicker({
  value,
  onChange,
  disabled = false,
}: Props) {
  return (
    <div className={GRID_CLASS}>
      <button
        type="button"
        onClick={() => onChange(null)}
        disabled={disabled}
        aria-pressed={value === null}
        className={twMerge(
          PHOTO_CLASS,
          value === null ? PHOTO_ACTIVE_CLASS : PHOTO_INACTIVE_CLASS,
        )}
      >
        <span className={NO_PHOTO_LABEL_CLASS}>X</span>
      </button>

      {servicePhotos.map((url, index) => {
        const isActive = value === index;

        return (
          <button
            key={url}
            type="button"
            onClick={() => onChange(index)}
            disabled={disabled}
            aria-pressed={isActive}
            className={twMerge(
              PHOTO_CLASS,
              isActive ? PHOTO_ACTIVE_CLASS : PHOTO_INACTIVE_CLASS,
            )}
          >
            <img
              src={url}
              alt={`Foto ${index + 1}`}
              loading="lazy"
              className={PHOTO_IMAGE_CLASS}
            />
          </button>
        );
      })}
    </div>
  );
}