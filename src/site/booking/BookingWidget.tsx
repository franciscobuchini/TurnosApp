/*
  src/site/booking/BookingWidget.tsx
  Orquesta el wizard de reserva: arma el marco (volver + título de paso) y
  delega el contenido de cada paso a steps/*. La lógica de "qué paso sigue"
  vive en useBookingFlow — este componente sólo decide qué step renderizar.

  Si el servicio elegido estaba más abajo en una lista larga, cambiar de
  paso puede dejar el nuevo contenido (más corto) por encima del scroll
  actual. Por eso cada cambio de paso hace scrollIntoView del widget, salvo
  el primer render (no hay por qué saltar apenas se monta la página).
*/

import { useEffect, useRef } from 'react';
import { ArrowLeft } from 'lucide-react';
import { twMerge } from 'tailwind-merge';
import { useBookingFlow, type BookingStep } from './useBookingFlow';
import ServiceStep from './steps/ServiceStep';
import ScheduleStep from './steps/ScheduleStep';
import ProfessionalStep from './steps/ProfessionalStep';
import ClientDetailsStep from './steps/ClientDetailsStep';
import ConfirmStep from './steps/ConfirmStep';
import SuccessStep from './steps/SuccessStep';
import SiteSection from '../components/SiteSection';
import type { service } from '@/database/types';
import type { SiteBusinessData, SitePublicTeamMember } from '@/database/siteData';

interface BookingWidgetProps {
  services: service[];
  team: SitePublicTeamMember[];
  business: SiteBusinessData;
}

const STEP_TITLES: Record<BookingStep, string> = {
  service: 'Elegí un servicio',
  schedule: 'Elegí fecha y horario',
  professional: 'Elegí con quién',
  details: 'Tus datos',
  confirm: 'Confirmá tu turno',
  success: '¡Listo!',
};

// Servicios (fotos en 2 columnas) y fecha+horario (tira de días + slots)
// necesitan más ancho que el resto de los pasos, más chicos y tipo formulario.
const WIDE_STEPS: BookingStep[] = ['service', 'schedule'];

export default function BookingWidget({ services, team, business }: BookingWidgetProps) {
  const flow = useBookingFlow({ services });
  const widgetRef = useRef<HTMLDivElement>(null);
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    widgetRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, [flow.step]);

  if (services.length === 0) {
    return null;
  }

  return (
    <SiteSection className="items-center">
      <div
        ref={widgetRef}
        className={twMerge(
          'w-full rounded-(--site-radius) border border-(--site-border) bg-(--site-surface) p-6 transition-[max-width]',
          WIDE_STEPS.includes(flow.step) ? 'max-w-2xl' : 'max-w-md',
        )}
      >
        <div className="mb-5 flex items-center gap-3">
          {flow.canGoBack && (
            <button
              type="button"
              onClick={flow.goBack}
              aria-label="Volver"
              className="cursor-pointer text-(--site-text-muted) hover:text-(--site-text)"
            >
              <ArrowLeft className="size-4" />
            </button>
          )}
          <h2 className="text-lg font-semibold">{STEP_TITLES[flow.step]}</h2>
        </div>

        {flow.step === 'service' && <ServiceStep services={services} onSelect={flow.selectService} />}

        {flow.step === 'schedule' && flow.date && (
          <ScheduleStep
            schedule={business.schedule}
            selectedDate={flow.date}
            onSelectDate={flow.selectDate}
            slots={flow.availableSlots}
            onSelectSlot={flow.selectSlot}
          />
        )}

        {flow.step === 'professional' && flow.slot && (
          <ProfessionalStep memberNames={flow.slot.memberNames} team={team} onSelect={flow.selectMember} />
        )}

        {flow.step === 'details' && (
          <ClientDetailsStep
            client={flow.client}
            onChange={flow.updateClient}
            isValid={flow.isClientValid}
            onContinue={flow.goToConfirm}
          />
        )}

        {flow.step === 'confirm' && flow.selectedService && flow.date && flow.slot && flow.member && (
          <ConfirmStep
            service={flow.selectedService}
            date={flow.date}
            slot={flow.slot}
            member={flow.member}
            client={flow.client}
            submitting={flow.submitting}
            onConfirm={flow.confirmBooking}
          />
        )}

        {flow.step === 'success' && <SuccessStep onReset={flow.reset} />}
      </div>
    </SiteSection>
  );
}
