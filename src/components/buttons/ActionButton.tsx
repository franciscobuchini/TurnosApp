import type { ReactNode } from 'react';
import { twMerge } from 'tailwind-merge';
import { Button } from '@/components/ui/button';

/*
  src/components/buttons/ActionButton.tsx
  Implementación compartida de CancelButton/ConfirmButton/DeleteButton: los
  3 son el mismo wrapper fino sobre Button (mismo tamaño/forma, mismo
  twMerge(base, className)), variando solo el variant de Button y un
  className extra puntual (CancelButton fuerza text-foreground porque el
  variant "ghost" no define color de texto propio). Cada uno sigue siendo
  su propio componente exportado — este archivo no cambia esa API pública,
  solo evita repetir el wrapper 3 veces.
*/

export type ActionButtonVariant = 'cancel' | 'confirm' | 'delete';

interface ActionButtonProps extends Omit<React.HTMLAttributes<HTMLElement>, 'children'> {
  variant: ActionButtonVariant;
  text?: ReactNode;
  disabled?: boolean;
  onClick?: (event: React.MouseEvent<HTMLElement>) => void;
}

const ACTION_BUTTON_CLASS = 'h-12 rounded-2xl px-8 text-base';

const ACTION_BUTTON_VARIANT: Record<ActionButtonVariant, { buttonVariant: 'ghost' | 'default' | 'destructive'; className?: string }> = {
  cancel: { buttonVariant: 'ghost', className: 'text-foreground' },
  confirm: { buttonVariant: 'default' },
  delete: { buttonVariant: 'destructive' },
};

export default function ActionButton({ variant, text, disabled, className, onClick, ...props }: ActionButtonProps) {
  const { buttonVariant, className: variantClassName } = ACTION_BUTTON_VARIANT[variant];

  return (
    <Button
      {...props}
      variant={buttonVariant}
      onClick={onClick}
      text={text}
      disabled={disabled}
      className={twMerge(ACTION_BUTTON_CLASS, variantClassName, className)}
    />
  );
}
