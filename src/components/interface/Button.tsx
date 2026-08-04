/* 
  src/components/interface/Button.tsx
  Este es el componente que se va a utilizar para botones en toda la aplicación.
*/

import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { twMerge } from 'tailwind-merge';

interface ButtonProps extends Omit<React.HTMLAttributes<HTMLElement>, 'onClick'> {
  children?: ReactNode;
  to?: string;
  icon?: ReactNode;
  text?: ReactNode;
  disabled?: boolean;
  onClick?: (event: React.MouseEvent<HTMLElement>) => void;
  type?: 'button' | 'submit' | 'reset';
}

/* ButtonClasses: el botón/link en sí */
const ButtonClasses = {
  required: 'relative flex items-center group cursor-pointer select-none',
  style: 'bg-red-500 rounded-2xl',
  disabled: 'pointer-events-none opacity-50',
};

export default function Button(props: ButtonProps) {
  const {
    children,
    to,
    className,
    icon,
    text,
    disabled,
    onClick,
    type,
    ...rest
  } = props;

  const buttonClassName = twMerge(
    ButtonClasses.required,
    ButtonClasses.style,
    disabled ? ButtonClasses.disabled : '',
    className,
  );

  const content = (
    <>
      {text !== undefined ? <span>{text}</span> : null}
      {children}
      {icon ? <span>{icon}</span> : null}
    </>
  );

  const sharedProps = {
    className: buttonClassName,
    onClick,
    ...rest,
  };

  if (to) {
    return (
      <Link to={to} {...sharedProps}>
        {content}
      </Link>
    );
  }

  return (
    <button
      {...sharedProps}
      type={type ?? 'button'}
      disabled={disabled}
    >
      {content}
    </button>
  );
}
