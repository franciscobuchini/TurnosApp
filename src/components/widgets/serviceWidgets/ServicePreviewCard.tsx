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

const PREVIEW_CARD_CLASS =
  'flex h-20 w-full max-w-sm overflow-hidden rounded-2xl border border-neutral-200 bg-white';

const PREVIEW_IMAGE_CLASS =
  'flex h-full w-20 shrink-0 items-center justify-center text-[10px] text-neutral-400';

const PREVIEW_IMAGE_WITH_COLOR_CLASS =
  'flex h-full w-20 shrink-0 items-center justify-center text-xs font-semibold text-neutral-900';

const PREVIEW_DETAILS_CLASS =
  'flex min-w-0 flex-1 flex-col justify-center gap-1 p-2.5';

const PREVIEW_TITLE_ROW_CLASS =
  'flex min-w-0 items-center gap-2';

const PREVIEW_COLOR_DOT_CLASS =
  'h-2.5 w-2.5 shrink-0 rounded-full';

const PREVIEW_TITLE_CLASS =
  'truncate text-sm font-semibold text-neutral-900';

const PREVIEW_DESCRIPTION_CLASS =
  'truncate text-xs text-neutral-500';

const PREVIEW_FOOTER_CLASS =
  'flex items-center gap-2 text-xs text-neutral-700';

const PREVIEW_DIVIDER_DOT_CLASS =
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
      <div className={PREVIEW_CARD_CLASS}>
        <div
          className={twMerge(
            hasPhoto
              ? PREVIEW_IMAGE_CLASS
              : PREVIEW_IMAGE_WITH_COLOR_CLASS,
            hasPhoto ? 'bg-neutral-100' : colorClassName
          )}
        >
          {hasPhoto ? `Foto #${selectedPhotoIndex + 1}` : initials}
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

          <p className={PREVIEW_DESCRIPTION_CLASS}>
            {description || 'Sin descripción'}
          </p>

          <div className={PREVIEW_FOOTER_CLASS}>
            <span>{price ? `$${price}` : '$'}</span>

            <span className={PREVIEW_DIVIDER_DOT_CLASS} />

            <span>{duration ? `${duration} min` : 'min'}</span>
          </div>
        </div>
      </div>
  );
}