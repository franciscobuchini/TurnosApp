import type { ReactNode } from 'react';
import { twMerge } from 'tailwind-merge';

interface FormProps {
  children: ReactNode;
  className?: string;
  title?: string;
}

const FormClasses = {
  wrapper: 'flex flex-col w-full gap-4',
  title: 'text-lg font-semibold text-gray-900',
};

export default function Form({ children, className, title }: FormProps) {
  return (
    <form className={twMerge(FormClasses.wrapper, className)}>
      {title ? <h2 className={FormClasses.title}>{title}</h2> : null}
      {children}
    </form>
  );
}
