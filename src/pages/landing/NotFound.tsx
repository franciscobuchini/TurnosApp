/*
  src/pages/landing/NotFound.tsx
  Página 404: cualquier ruta que no matchee ningún <Route> de App.tsx cae
  acá (ver el path="*" al final de <Routes>) — mismo layout centrado que
  Home.tsx (logo + tarjeta), para que se sienta parte del mismo sitio en vez
  de una pantalla de error genérica del navegador.
*/

import Logo from '@/components/ui/logo';
import { Button } from '@/components/ui/button';

const NOT_FOUND_CLASS = 'flex min-h-dvh w-dvw items-center justify-center p-6';

const NOT_FOUND_CONTENT_CLASS = 'flex w-full max-w-sm flex-col items-center gap-8';

const NOT_FOUND_LOGO_CLASS = 'h-32 w-auto';

const NOT_FOUND_CARD_CLASS = 'flex w-full flex-col items-center gap-4 rounded-4xl border border-border bg-card p-8 text-center';

const NOT_FOUND_CODE_CLASS = 'text-5xl font-bold tracking-tight text-foreground';

const NOT_FOUND_TITLE_CLASS = 'text-lg font-semibold text-foreground';

const NOT_FOUND_TEXT_CLASS = 'text-sm text-muted-foreground';

export default function NotFound() {
  return (
    <div className={NOT_FOUND_CLASS}>
      <div className={NOT_FOUND_CONTENT_CLASS}>
        <Logo className={NOT_FOUND_LOGO_CLASS} />

        <div className={NOT_FOUND_CARD_CLASS}>
          <span className={NOT_FOUND_CODE_CLASS}>404</span>
          <h1 className={NOT_FOUND_TITLE_CLASS}>Esta página no existe</h1>
          <p className={NOT_FOUND_TEXT_CLASS}>El link que seguiste puede estar roto o la página ya no está disponible.</p>

          <Button to="/" text="Volver al inicio" className="mt-2 w-full h-11" />
        </div>
      </div>
    </div>
  );
}
