import { twMerge } from 'tailwind-merge';
import servicePhotos from '../../../database/servicePhotos.json';

type Props = {
  name: string;
  description: string;
  duration: string;
  price: string;
  colorClassName: string;
  selectedPhotoIndex: number | null;
};

const PREVIEW_CARD_CLASS =
  'flex h-(--size-5xl) w-full max-w-sm overflow-hidden rounded-2xl border border-neutral-700 bg-neutral-900';

const PREVIEW_IMAGE_CLASS =
  'flex h-full w-(--size-5xl) shrink-0 items-center justify-center text-neutral-500';

const PREVIEW_IMAGE_IMG_CLASS = 'h-full w-full object-cover';

const PREVIEW_IMAGE_WITH_COLOR_CLASS =
  'flex h-full w-(--size-m) shrink-0 text-neutral-100';

const PREVIEW_DETAILS_CLASS =
  'flex min-w-0 flex-1 flex-col justify-center gap-(--size-2xs) px-(--size-s)';

const PREVIEW_TITLE_ROW_CLASS =
  'flex min-w-0 items-center gap-2';

const PREVIEW_COLOR_DOT_CLASS =
  'h-2.5 w-2.5 shrink-0 rounded-full';

const PREVIEW_TITLE_CLASS =
  'truncate text-sm font-semibold text-neutral-100';

const PREVIEW_DESCRIPTION_CLASS =
  'truncate text-xs text-neutral-400';

const PREVIEW_FOOTER_CLASS =
  'flex items-center gap-2 text-sm text-neutral-300';

const PREVIEW_DIVIDER_DOT_CLASS =
  'h-1 w-1 rounded-full bg-neutral-600';

export default function ServicePreviewCard({
  name,
  description,
  duration,
  price,
  colorClassName,
  selectedPhotoIndex,
}: Props) {
const hasPhoto =
    selectedPhotoIndex !== null && selectedPhotoIndex < servicePhotos.length;

  return (
      <div className={PREVIEW_CARD_CLASS}>
        <div
          className={twMerge(
            hasPhoto
              ? PREVIEW_IMAGE_CLASS
              : PREVIEW_IMAGE_WITH_COLOR_CLASS,
            hasPhoto ? 'bg-neutral-800' : colorClassName
          )}
        >
          {hasPhoto ? (
            <img
              src={servicePhotos[selectedPhotoIndex as number]}
              alt={`Foto #${selectedPhotoIndex as number + 1}`}
              loading="lazy"
              className={PREVIEW_IMAGE_IMG_CLASS}
            />
          ) : ''}
        </div>

        <div className={PREVIEW_DETAILS_CLASS}>
          <div className={PREVIEW_TITLE_ROW_CLASS}>
            <span
              className={twMerge(
                PREVIEW_COLOR_DOT_CLASS,
                colorClassName
              )}
            />

            <p className={PREVIEW_TITLE_CLASS}>
              {name || 'Nombre del servicio'}
            </p>
          </div>

          {description ? (
            <p className={PREVIEW_DESCRIPTION_CLASS}>
              {description}
            </p>
          ) : null}

          <div className={PREVIEW_FOOTER_CLASS}>
            <span>{price ? `$${price}` : '$'}</span>

            <span className={PREVIEW_DIVIDER_DOT_CLASS} />

            <span>{duration ? `${duration} min` : 'min'}</span>
          </div>
        </div>
      </div>
  );
}