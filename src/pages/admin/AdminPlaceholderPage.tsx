/*
  src/pages/admin/AdminPlaceholderPage.tsx
  Placeholder para secciones del admin que todavía no están implementadas
  (Métricas, Tema, Marketing): el mismo "Próximamente" que ya usan las
  vistas, dentro de un MainContent.
*/

import MainContent from '@/components/layout/MainContent';
import ComingSoonPanel from '@/components/layout/ComingSoonPanel';

interface AdminPlaceholderPageProps {
  subtitle: string;
}

export default function AdminPlaceholderPage({ subtitle }: AdminPlaceholderPageProps) {
  return (
    <MainContent>
      <ComingSoonPanel subtitle={subtitle} />
    </MainContent>
  );
}
