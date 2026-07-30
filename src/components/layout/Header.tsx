import { twMerge } from 'tailwind-merge';

/* HeaderClasses:
   - required: tamaño y stacking. No varía.
   - style: color de fondo. Esto sí se puede modificar (editando el valor de acá abajo). */
const HeaderClasses = {
  required: 'h-(--size-3xl) z-100',
  style: 'bg-stone-950',
};

export default function Header() {
  return <header className={twMerge(HeaderClasses.required, HeaderClasses.style)} />;
}