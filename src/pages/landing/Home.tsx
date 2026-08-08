/*
  src/pages/landing/Home.tsx
  Pantalla de bienvenida del sitio web.
*/

import Logo from '../../components/interface/Logo';

const HOME_CLASS = 'flex h-dvh w-dvw items-center justify-center bg-neutral-950';

const HOME_CONTENT_CLASS = 'flex flex-col items-center gap-(--size-xl)';

const HOME_LOGO_CLASS = 'h-(--size-7xl) w-auto';

export default function Home() {
  return (
    <div className={HOME_CLASS}>
      <div className={HOME_CONTENT_CLASS}>
        <Logo className={HOME_LOGO_CLASS} />
        <p className="text-2xl font-semibold tracking-tight text-neutral-50">
          minube.site próximamente
        </p>
      </div>
    </div>
  );
}