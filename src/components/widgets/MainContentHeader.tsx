/*
  src/components/layout/MainContentHeader.tsx
  Titulo principal de cada pagina admin.
*/

import Box from '../interface/Box';

interface MainContentHeaderProps {
  title: string;
}

export default function MainContentHeader({ title }: MainContentHeaderProps) {
  return (
    <Box className="p-(--size-m)">
      <h1>{title}</h1>
    </Box>
  );
}