import type { ReactNode } from 'react';
import { twMerge } from 'tailwind-merge';
import Box from '../interface/Box';

interface ContentHeaderProps {
  title: string;
  subtitle?: string;
  action?: ReactNode;
  className?: string;
  sizeClassName?: string;
  colorClassName?: string;
  shapeClassName?: string;
  animationClassName?: string;
}

const ContentHeaderStyle = {
  base: 'min-h-(--size-4xl) flex items-center justify-between px-(--size-m) py-(--size-s)',
  size: '',
  color: '',
  shape: '',
  animation: '',
};

export default function ContentHeader({
  title,
  subtitle,
  action,
  className,
  sizeClassName,
  colorClassName,
  shapeClassName,
  animationClassName,
}: ContentHeaderProps) {
  return (
    <Box
      className={twMerge(
        ContentHeaderStyle.base,
        sizeClassName || ContentHeaderStyle.size,
        colorClassName || ContentHeaderStyle.color,
        shapeClassName || ContentHeaderStyle.shape,
        animationClassName || ContentHeaderStyle.animation,
        className,
      )}
    >
      <div className="flex flex-col gap-(--size-3xs)">
        <h1 className="text-xl font-bold">{title}</h1>
        {subtitle && <span className="text-sm text-neutral-500">{subtitle}</span>}
      </div>
      {action}
    </Box>
  );
}