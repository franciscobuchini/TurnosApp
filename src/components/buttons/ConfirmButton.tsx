import type { ReactNode } from 'react';
import ActionButton from './ActionButton';

interface ConfirmButtonProps extends Omit<React.HTMLAttributes<HTMLElement>, 'children'> {
  text?: ReactNode;
  disabled?: boolean;
  onClick?: (event: React.MouseEvent<HTMLElement>) => void;
}

export default function ConfirmButton(props: ConfirmButtonProps) {
  return <ActionButton variant="confirm" {...props} />;
}
