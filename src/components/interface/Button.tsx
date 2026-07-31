/* 
  src/components/interface/Button.tsx
  Este es el componente que se va a utilizar para botones en toda la aplicación.
*/

import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { twMerge } from 'tailwind-merge';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children?: ReactNode;
  to?: string;
  styleClassName?: string;
  height?: string;
  icon?: ReactNode;
  iconPosition?: 'left' | 'right';
  text?: ReactNode;
  textAlign?: 'left' | 'center' | 'right';
  textClassName?: string;
  contentClassName?: string;
}

/* ButtonClasses: el botón/link en sí*/
const ButtonClasses = {
  required: 'flex items-center justify-center min-w-(--size-2xl) p-(--size-s) ',
  height: 'h-(--size-2xl)',
  style: 'bg-red-500 rounded-xl',
  iconOnly: 'aspect-square min-w-0 p-0',
};

/* ButtonContentClasses: el span que envuelve ícono + texto + children. */
const ButtonContentClasses = {
  required: 'flex items-center justify-center whitespace-nowrap',
  style: '',
  withIconGap: 'gap-(--size-s)',
  iconOnlyFill: 'h-full w-full',
};

/* ButtonAlignmentClasses: se elige una de las tres según textAlign. Ninguna tiene color. */
const ButtonAlignmentClasses = {
  left: 'justify-start text-left',
  center: 'justify-center text-center',
  right: 'justify-end text-right',
};

/* ButtonIconWrapperClasses: el span que envuelve el ícono, izquierda o derecha. */
const ButtonIconWrapperClasses = {
  required: 'flex items-center justify-center',
  style: '',
};

export default function Button({
  children,
  to,
  className,
  styleClassName,
  height = ButtonClasses.height,
  icon,
  iconPosition = 'left',
  text,
  textAlign = 'center',
  textClassName,
  contentClassName,
  ...props
}: ButtonProps) {
  const hasTextContent = Boolean(text || children);
  const isOnlyIcon = !hasTextContent && Boolean(icon);

  const buttonClassName = twMerge(
    ButtonClasses.required,
    height,
    styleClassName || ButtonClasses.style,
    isOnlyIcon && ButtonClasses.iconOnly,
    className,
  );

  const content = (
    <span
      className={twMerge(
        ButtonContentClasses.required,
        ButtonContentClasses.style,
        ButtonAlignmentClasses[textAlign],
        hasTextContent && icon ? ButtonContentClasses.withIconGap : '',
        isOnlyIcon ? ButtonContentClasses.iconOnlyFill : '',
        contentClassName,
      )}
    >
      {icon && iconPosition === 'left' ? (
        <span className={twMerge(ButtonIconWrapperClasses.required, ButtonIconWrapperClasses.style)}>{icon}</span>
      ) : null}
      {text !== undefined ? <span className={textClassName}>{text}</span> : null}
      {children}
      {icon && iconPosition === 'right' ? (
        <span className={twMerge(ButtonIconWrapperClasses.required, ButtonIconWrapperClasses.style)}>{icon}</span>
      ) : null}
    </span>
  );

  if (to) {
    return (
      <Link to={to} className={buttonClassName}>
        {content}
      </Link>
    );
  }

  return (
    <button {...props} className={buttonClassName}>
      {content}
    </button>
  );
}