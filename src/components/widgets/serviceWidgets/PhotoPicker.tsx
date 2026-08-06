import { twMerge } from 'tailwind-merge';



type Props = {

  count: number;

  value: number | null;

  onChange: (index: number | null) => void;

  disabled?: boolean;

};



const GRID_CLASS = 'grid grid-cols-[repeat(auto-fill,80px)] justify-center gap-(--size-s)';

const PHOTO_CLASS = 'h-(--size-5xl) w-(--size-5xl) overflow-hidden rounded-lg border-1 bg-white';

const PHOTO_ACTIVE_CLASS = 'border-neutral-500';

const PHOTO_INACTIVE_CLASS = 'border-transparent border-neutral-200';

const NO_PHOTO_LABEL_CLASS = 'flex h-full w-full items-center justify-center text-neutral-500';



export default function PhotoPicker({

  count,

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

          value === null ? PHOTO_ACTIVE_CLASS : PHOTO_INACTIVE_CLASS

        )}

      >

        <span className={NO_PHOTO_LABEL_CLASS}>X</span>

      </button>



      {Array.from({ length: count }, (_, index) => {

        const isActive = value === index;



        return (

          <button

            key={index}

            type="button"

            onClick={() => onChange(index)}

            disabled={disabled}

            aria-pressed={isActive}

            className={twMerge(

              PHOTO_CLASS,

              isActive ? PHOTO_ACTIVE_CLASS : PHOTO_INACTIVE_CLASS

            )}

          >

            {/* Reemplazar por la imagen real */}

            <span className={NO_PHOTO_LABEL_CLASS}>

              {index + 1}

            </span>

          </button>

        );

      })}

    </div>

  );

}