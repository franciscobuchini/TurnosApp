import type { ReactNode } from 'react';
import { twMerge } from 'tailwind-merge';

interface FormProps {
  children: ReactNode;
  className?: string;
  title?: string;
}

const FORM_WRAPPER_CLASS = 'flex flex-col w-full';
const FORM_TITLE_CLASS = 'text-lg text-foreground';

export default function Form({ children, className, title }: FormProps) {
  return (
    <form className={twMerge(FORM_WRAPPER_CLASS, className)}>
      {title ? <h2 className={FORM_TITLE_CLASS}>{title}</h2> : null}
      {children}
    </form>
  );
}
