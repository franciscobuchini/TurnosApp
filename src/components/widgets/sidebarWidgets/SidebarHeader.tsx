import type { ReactNode } from 'react';
import { twMerge } from 'tailwind-merge';
import MainHeader from '../../interface/MainHeader';
import Logo from '../../interface/Logo';

interface SidebarHeaderProps {
  title?: string;
  className?: string;
  leading?: ReactNode;
  action?: ReactNode;
  onClick?: () => void;
}

const SIDEBAR_HEADER_CLASS = 'flex h-(--size-6xl) w-full shrink-0 bg-transparent';

const SIDEBAR_HEADER_BUTTON_CLASS = 'flex w-full cursor-pointer border-none bg-transparent p-0 text-left';

export default function SidebarHeader({
  title = 'minube.site',
  className,
  leading = <Logo className="h-(--size-4xl) w-auto" />,
  action,
  onClick,
}: SidebarHeaderProps) {
  const header = (
    <MainHeader
      title={title}
      leading={leading}
      actionsRight={action}
      titleClassName="text-neutral-50"
      gradient={false}
      className={twMerge(SIDEBAR_HEADER_CLASS, className)}
    />
  );

  if (!onClick) {
    return header;
  }

  return (
    <button type="button" onClick={onClick} className={SIDEBAR_HEADER_BUTTON_CLASS}>
      {header}
    </button>
  );
}