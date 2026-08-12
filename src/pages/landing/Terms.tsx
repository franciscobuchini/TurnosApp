/*
  src/pages/landing/Terms.tsx
  Página pública de Términos y Condiciones.
*/

import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const TERMS_CLASS = 'flex min-h-dvh w-full justify-center p-6';

const TERMS_CONTENT_CLASS = 'flex w-full max-w-2xl flex-col gap-6 py-10';

const TERMS_TITLE_CLASS = 'text-3xl font-semibold tracking-tight text-foreground';

const TERMS_SECTION_CLASS = 'flex flex-col gap-2';

const TERMS_SECTION_TITLE_CLASS = 'text-lg font-medium text-foreground';

const TERMS_SECTION_TEXT_CLASS = 'text-sm leading-relaxed text-muted-foreground';

const TERMS_SECTIONS: { title: string; text: string }[] = [
  {
    title: '1. Aceptación de los términos',
    text: 'Al acceder y utilizar este sitio confirmás que leíste, entendiste y aceptás estos Términos y Condiciones. Si no estás de acuerdo con ellos, por favor no utilices el servicio.',
  },
  {
    title: '2. Servicio de reservas',
    text: 'La plataforma permite reservar turnos con los profesionales y servicios publicados por el establecimiento. Las reservas están sujetas a disponibilidad y al horario del local.',
  },
  {
    title: '3. Cancelaciones y demoras',
    text: 'Las cancelaciones deben realizarse con suficiente antelación. El establecimiento puede aplicar políticas de cancelación, reprogramación o tolerancia de demoras, las cuales se informarán al momento de reservar.',
  },
  {
    title: '4. Responsabilidad del servicio',
    text: 'El establecimiento es el responsable final de la prestación de los servicios ofrecidos. La plataforma actúa únicamente como medio de gestión y comunicación de reservas.',
  },
  {
    title: '5. Datos personales',
    text: 'Los datos personales se utilizan exclusivamente para gestionar las reservas y comunicarte novedades del servicio, conforme a la legislación vigente sobre protección de datos personales.',
  },
  {
    title: '6. Modificaciones',
    text: 'El establecimiento se reserva el derecho de modificar el servicio, los horarios, los precios y estos Términos y Condiciones en cualquier momento, notificando los cambios a través del sitio.',
  },
  {
    title: '7. Contacto',
    text: 'Para consultas sobre estos términos, podés comunicarte con el establecimiento a través de los canales de contacto publicados en el sitio.',
  },
];

export default function Terms() {
  const navigate = useNavigate();

  return (
    <main className={TERMS_CLASS}>
      <div className={TERMS_CONTENT_CLASS}>
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="flex w-fit items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground cursor-pointer"
        >
          <ArrowLeft size={16} />
          Volver
        </button>
        <h1 className={TERMS_TITLE_CLASS}>Términos y Condiciones</h1>
        {TERMS_SECTIONS.map((section) => (
          <section key={section.title} className={TERMS_SECTION_CLASS}>
            <h2 className={TERMS_SECTION_TITLE_CLASS}>{section.title}</h2>
            <p className={TERMS_SECTION_TEXT_CLASS}>{section.text}</p>
          </section>
        ))}
      </div>
    </main>
  );
}