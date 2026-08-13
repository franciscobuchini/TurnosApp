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

  disabled?: boolean;

};



const WRAPPER_CLASS = 'flex flex-wrap justify-start gap-3';

const SWATCH_CLASS = 'h-8 w-8 rounded-full border border-border';

const SWATCH_ACTIVE_CLASS = 'scale-110 ring-2 ring-foreground/80 ring-offset-2 ring-offset-card transition-all';

const SWATCH_INACTIVE_CLASS = 'border-transparent hover:border-border hover:scale-105 transition-all';



export default function ColorPicker({

  colors,

  value,

  onChange,

  disabled = false,

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

            disabled={disabled}

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