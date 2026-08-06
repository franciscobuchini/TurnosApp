import { twMerge } from 'tailwind-merge';

type Props = {
  name: string;
  description: string;
  duration: string;
  price: string;
  initials: string;
  colorClassName: string;
  selectedPhotoIndex: number | null;
};

const PREVIEW_CARD_CLASSES =
  'flex h-20 w-full max-w-sm overflow-hidden rounded-2xl border border-neutral-200 bg-white';

const PREVIEW_IMAGE_CLASSES =
  'flex h-full w-20 shrink-0 items-center justify-center text-[10px] text-neutral-400';

const PREVIEW_IMAGE_WITH_COLOR_CLASSES =
  'flex h-full w-20 shrink-0 items-center justify-center text-xs font-semibold text-neutral-900';

const PREVIEW_DETAILS_CLASSES =
  'flex min-w-0 flex-1 flex-col justify-center gap-1 p-2.5';

const PREVIEW_TITLE_ROW_CLASSES =
  'flex min-w-0 items-center gap-2';

const PREVIEW_COLOR_DOT_CLASSES =
  'h-2.5 w-2.5 shrink-0 rounded-full';

const PREVIEW_TITLE_CLASSES =
  'truncate text-sm font-semibold text-neutral-900';

const PREVIEW_DESCRIPTION_CLASSES =
  'truncate text-xs text-neutral-500';

const PREVIEW_FOOTER_CLASSES =
  'flex items-center gap-2 text-xs text-neutral-700';

const PREVIEW_DIVIDER_DOT_CLASSES =
  'h-1 w-1 rounded-full bg-neutral-300';

export default function ServicePreviewCard({
  name,
  description,
  duration,
  price,
  initials,
  colorClassName,
  selectedPhotoIndex,
}: Props) {
  const hasPhoto = selectedPhotoIndex !== null;

  return (
      <div className={PREVIEW_CARD_CLASSES}>
        <div
          className={twMerge(
            hasPhoto
              ? PREVIEW_IMAGE_CLASSES
              : PREVIEW_IMAGE_WITH_COLOR_CLASSES,
            hasPhoto ? 'bg-neutral-100' : colorClassName
          )}
        >
          {hasPhoto ? `Foto #${selectedPhotoIndex + 1}` : initials}
        </div>

        <div className={PREVIEW_DETAILS_CLASSES}>
          <div className={PREVIEW_TITLE_ROW_CLASSES}>
            <span
              className={twMerge(
                PREVIEW_COLOR_DOT_CLASSES,
                colorClassName
              )}
            />

            <p className={PREVIEW_TITLE_CLASSES}>
              {name || 'Nombre del servicio'}
            </p>
          </div>

          <p className={PREVIEW_DESCRIPTION_CLASSES}>
            {description || 'Sin descripción'}
          </p>

          <div className={PREVIEW_FOOTER_CLASSES}>
            <span>{price ? `$${price}` : '$'}</span>

            <span className={PREVIEW_DIVIDER_DOT_CLASSES} />

            <span>{duration ? `${duration} min` : 'min'}</span>
          </div>
        </div>
      </div>
  );
}