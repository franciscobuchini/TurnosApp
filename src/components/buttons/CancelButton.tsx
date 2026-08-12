import type { ReactNode } from 'react';
import ActionButton from './ActionButton';

interface CancelButtonProps extends Omit<React.HTMLAttributes<HTMLElement>, 'children'> {
  text?: ReactNode;
  onClick?: (event: React.MouseEvent<HTMLElement>) => void;
}

export default function CancelButton(props: CancelButtonProps) {
  return <ActionButton variant="cancel" {...props} />;
}
