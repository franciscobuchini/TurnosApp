/*
  src/site/booking/BookingWidget.tsx
  Orquesta el wizard de reserva: arma el marco (volver + título de paso) y
  delega el contenido de cada paso a steps/*. La lógica de "qué paso sigue"
  vive en useBookingFlow — este componente sólo decide qué step renderizar.

  Si el servicio elegido estaba más abajo en una lista larga, cambiar de
  paso puede dejar el nuevo contenido (más corto) por encima del scroll
  actual. Por eso cada cambio de paso hace scrollIntoView del widget, salvo
  el primer render (no hay por qué saltar apenas se monta la página).

  El "salvo el primer render" se resuelve comparando contra el step
  anterior, no con un booleano "¿ya pasó el primer render?": ese booleano
  se rompe bajo StrictMode (dev), que invoca el efecto de montaje dos veces
  seguidas — la primera invocación lo marca en false y la segunda ya no
  entra al "return" temprano, disparando un scroll no pedido apenas se
  entra a la página. Comparando el valor real del step anterior, las dos
  invocaciones ven "no cambió" las dos veces.
*/

import { useEffect, useRef } from 'react';
import { ArrowLeft } from 'lucide-react';
import { useBookingFlow, type BookingStep } from './useBookingFlow';
import BookingSummary from './BookingSummary';
import ServiceStep from './steps/ServiceStep';
import ScheduleStep from './steps/ScheduleStep';
import ProfessionalStep from './steps/ProfessionalStep';
import ClientDetailsStep from './steps/ClientDetailsStep';
import SuccessStep from './steps/SuccessStep';
import SiteSection from '../components/SiteSection';
import SiteButton from '../components/SiteButton';
import Toast from '@/components/ui/toast';
import type { service, SiteServiceCardStyleId } from '@/database/types';
import type { SiteBusinessData, SitePublicTeamMember } from '@/database/siteData';

interface BookingWidgetProps {
  services: service[];
  team: SitePublicTeamMember[];
  business: SiteBusinessData;
  serviceCardStyle?: SiteServiceCardStyleId;
}

const STEP_TITLES: Record<BookingStep, string> = {
  service: 'Elegí un servicio',
  schedule: 'Elegí fecha y horario',
  professional: 'Elegí con quién',
  details: 'Tus datos',
  success: '¡Listo!',
};

// Mismo ancho para los 5 pasos, sin excepciones — el resto de las secciones
// del sitio (Hero, Servicios, Horarios, Ubicación) ya comparten este ancho
// vía SiteSection, y este widget no debería ser el único que salta de
// tamaño según qué paso muestra.
const WIDGET_WIDTH_CLASS = 'max-w-5xl';

export default function BookingWidget({ services, team, business, serviceCardStyle }: BookingWidgetProps) {
  const flow = useBookingFlow({ services });
  const widgetRef = useRef<HTMLDivElement>(null);
  const previousStepRef = useRef(flow.step);

  useEffect(() => {
    if (previousStepRef.current !== flow.step) {
      widgetRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    previousStepRef.current = flow.step;
  }, [flow.step]);

  if (services.length === 0) {
    return null;
  }

  return (
    <>
    <SiteSection className="items-center">
      <div
        ref={widgetRef}
        className={`w-full rounded-(--site-radius) border border-(--site-border) bg-(--site-surface) backdrop-blur-xl p-6 ${WIDGET_WIDTH_CLASS}`}
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

        {flow.step === 'service' && (
          <ServiceStep services={services} onSelect={flow.selectService} cardStyle={serviceCardStyle} />
        )}

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
          <ProfessionalStep
            memberNames={flow.slot.memberNames}
            team={team}
            onSelect={flow.selectMember}
            onSelectAny={flow.selectAnyMember}
          />
        )}

        {flow.step === 'details' && <ClientDetailsStep client={flow.client} onChange={flow.updateClient} />}

        {flow.step === 'success' && <SuccessStep onReset={flow.reset} />}

        {flow.step !== 'service' && flow.step !== 'success' && (
          <BookingSummary
            service={flow.selectedService}
            date={flow.date}
            slot={flow.slot}
            member={flow.member}
            client={flow.client}
          />
        )}

        {flow.step === 'details' && (
          <SiteButton
            onClick={flow.confirmBooking}
            disabled={!flow.isClientValid || flow.submitting}
            className="mt-6 w-full"
          >
            {flow.submitting ? 'Confirmando…' : 'Confirmar mi turno'}
          </SiteButton>
        )}
      </div>
    </SiteSection>
    <Toast message={flow.noAvailabilityMessage} onDismiss={flow.dismissNoAvailabilityMessage} />
    </>
  );
}
