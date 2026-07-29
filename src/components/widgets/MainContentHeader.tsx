import type { ReactNode } from 'react';
import Box from '../interface/Box';

interface MainContentHeaderProps {
  title: string;
  subtitle?: string;
  action?: ReactNode;
}

export default function MainContentHeader({ title, subtitle, action }: MainContentHeaderProps) {
  return (
    <Box className="min-h-(--size-4xl) flex items-center justify-between px-(--size-m) py-(--size-s)">
      <div className="flex flex-col gap-(--size-3xs)">
        <h1 className="text-xl font-bold">{title}</h1>
        {subtitle && <span className="text-sm text-neutral-500">{subtitle}</span>}
      </div>
      {action}
    </Box>
  );
}