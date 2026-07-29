/* 
  src/components/interface/Button.tsx
  Este es el componente que se va a utilizar para botones en toda la aplicación.
*/

import { Link } from 'react-router-dom';
import { twMerge } from 'tailwind-merge';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  to?: string;
  sizeClassName?: string;
  colorClassName?: string;
  shapeClassName?: string;
  animationClassName?: string;
}

/* ButtonStyle: clases de estilo, estas si se pueden variar */
const ButtonStyle = {
  base: 'flex items-center',
  size: 'h-(--size-2xl) p-(--size-m)',
  color: 'bg-red-500',
  shape: '',
  animation: '',
};

export default function Button({
  children,
  to,
  className,
  sizeClassName,
  colorClassName,
  shapeClassName,
  animationClassName,
  ...props
}: ButtonProps) {
  const buttonClassName = twMerge(
    ButtonStyle.base,
    sizeClassName || ButtonStyle.size,
    colorClassName || ButtonStyle.color,
    shapeClassName || ButtonStyle.shape,
    animationClassName || ButtonStyle.animation,
    className,
  );

  if (to) {
    return (
      <Link to={to} className={buttonClassName}>
        {children}
      </Link>
    );
  }

  return (
    <button {...props} className={buttonClassName}>
      {children}
    </button>
  );
}