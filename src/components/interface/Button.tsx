/* 
  src/components/interface/Button.tsx
  Este es el componente que se va a utilizar para botones en toda la aplicación.
*/

import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { twMerge } from 'tailwind-merge';
import Tooltip, { type TooltipPosition } from './Tooltip';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children?: ReactNode;
  to?: string;
  icon?: ReactNode;
  iconPosition?: 'left' | 'right';
  iconOnly?: TooltipPosition;
  text?: ReactNode;
  textAlign?: 'left' | 'center' | 'right';
}

/* ButtonClasses: el botón/link en sí*/
const ButtonClasses = {
  required: 'relative flex h-(--size-2xl) items-center justify-center min-w-(--size-2xl) p-(--size-s) group',
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
  icon,
  iconPosition = 'left',
  iconOnly,
  text,
  textAlign = 'center',
  ...props
}: ButtonProps) {
  const hasTextContent = Boolean(text || children);
  const isOnlyIcon = Boolean(iconOnly && (icon || children));
  const showTooltip = Boolean(iconOnly && icon && hasTextContent);

  const buttonClassName = twMerge(
    ButtonClasses.required,
    ButtonClasses.style,
    isOnlyIcon && ButtonClasses.iconOnly,
    className,
  );

  const content = (
    <span
      className={twMerge(
        ButtonContentClasses.required,
        ButtonContentClasses.style,
        ButtonAlignmentClasses[textAlign],
        hasTextContent && icon && !isOnlyIcon ? ButtonContentClasses.withIconGap : '',
        isOnlyIcon ? ButtonContentClasses.iconOnlyFill : '',
      )}
    >
      {icon && iconPosition === 'left' ? (
        <span className={twMerge(ButtonIconWrapperClasses.required, ButtonIconWrapperClasses.style)}>{icon}</span>
      ) : null}
      {!isOnlyIcon && text !== undefined ? <span>{text}</span> : null}
      {!isOnlyIcon && children}
      {isOnlyIcon && !icon ? children : null}
      {icon && iconPosition === 'right' ? (
        <span className={twMerge(ButtonIconWrapperClasses.required, ButtonIconWrapperClasses.style)}>{icon}</span>
      ) : null}
    </span>
  );

  const tooltip = showTooltip && iconOnly ? <Tooltip position={iconOnly}>{text ?? children}</Tooltip> : null;

  if (to) {
    return (
      <Link to={to} className={buttonClassName}>
        {content}
        {tooltip}
      </Link>
    );
  }

  return (
    <button {...props} className={buttonClassName}>
      {content}
      {tooltip}
    </button>
  );
}
