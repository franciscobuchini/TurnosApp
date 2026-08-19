import type { ReactNode } from 'react';
import ActionButton from './ActionButton';

interface DeleteButtonProps extends Omit<React.HTMLAttributes<HTMLElement>, 'children'> {
  text?: ReactNode;
  disabled?: boolean;
  onClick?: (event: React.MouseEvent<HTMLElement>) => void;
}

export default function DeleteButton(props: DeleteButtonProps) {
  return <ActionButton variant="delete" {...props} />;
}
