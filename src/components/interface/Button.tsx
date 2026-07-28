/* 
  src/components/interface/Button.tsx
  Este es el componente que se va a utilizar para botones en toda la aplicación.
*/


import { Link } from 'react-router-dom';
import { twMerge } from 'tailwind-merge';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  to?: string;
}

/* ButtonStyle: clases de estilo, estas si se pueden variar */
const ButtonStyle = {
  button: 'h-(--size-2xl) p-(--size-m) bg-red-500',
};

export default function Button({
  children,
  to,
  className,
  ...props
}: ButtonProps) {
  const buttonClassName = twMerge('flex items-center', ButtonStyle.button, className);

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