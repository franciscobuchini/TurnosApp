/*
  src/site/booking/steps/SuccessStep.tsx
  Paso final: confirma la reserva y ofrece volver a empezar (para quien
  quiera reservar un segundo turno en la misma visita).
*/

import { CircleCheck } from 'lucide-react';
import SiteButton from '../../components/SiteButton';

interface SuccessStepProps {
  onReset: () => void;
}

export default function SuccessStep({ onReset }: SuccessStepProps) {
  return (
    <div className="flex flex-col items-center gap-3 py-4 text-center">
      <CircleCheck className="size-10 text-(--site-primary)" />
      <p className="font-medium">Tu turno ha sido solicitado</p>
      <p className="text-sm text-(--site-text-muted)">La confirmación va a llegar muy pronto!</p>
      <SiteButton variant="outline" onClick={onReset} className="mt-2">
        Reservar otro turno
      </SiteButton>
    </div>
  );
}
