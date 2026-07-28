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
    <Box className="h-(--size-4xl) flex items-center px-(--size-m)">
      <h1>{title}</h1>
    </Box>
  );
}