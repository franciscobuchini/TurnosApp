/*
  src/components/layout/ComingSoonPanel.tsx
  Panel placeholder "Próximamente..." usado en el slot `right` de las vistas
  que todavía no tienen esa función implementada (antes copiado en cada vista).
*/

const COMING_SOON_CLASS = 'flex flex-1 flex-col items-center justify-center gap-2 rounded-4xl text-muted-foreground';

interface ComingSoonPanelProps {
  title?: string;
  subtitle: string;
}

export default function ComingSoonPanel({ title = 'Próximamente...', subtitle }: ComingSoonPanelProps) {
  return (
    <div className={COMING_SOON_CLASS}>
      <p>{title}</p>
      <p>{subtitle}</p>
    </div>
  );
}
