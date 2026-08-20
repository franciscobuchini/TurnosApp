/*
  src/pages/landing/Home.tsx
  Pantalla de bienvenida del sitio web: acceso al panel de administración
  vía un form de inicio de sesión/registro. Todavía no hay backend de auth
  — completar los campos (la validación HTML5 de los inputs required) y
  enviar el form alcanza para entrar a /admin, sea login o registro.

  Sólo "Crear cuenta" pasa `state: { onboarding: true }` al navegar: es la
  señal que Dashboard.tsx lee para abrir el wizard de bienvenida
  (OnboardingWizard) al llegar — "Iniciar sesión" entra directo, sin wizard,
  como corresponde a una cuenta que ya existe.
*/

import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import Logo from '@/components/ui/logo';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

type AuthMode = 'login' | 'signup';

const HOME_CLASS = 'flex h-dvh w-dvw items-center justify-center overflow-y-auto overflow-x-hidden p-4 sm:p-6';

const HOME_CONTENT_CLASS = 'flex w-full max-w-sm flex-col items-center gap-6 sm:gap-8';

const HOME_LOGO_CLASS = 'h-20 w-auto sm:h-32';

const HOME_CARD_CLASS = 'flex w-full flex-col gap-5 rounded-4xl border border-border bg-card p-6 sm:gap-6 sm:p-8';

const HOME_TITLE_CLASS = 'text-center text-xl font-semibold tracking-tight text-foreground';

const HOME_FORM_CLASS = 'flex flex-col gap-4';

const HOME_TOGGLE_CLASS = 'text-center text-sm text-muted-foreground';

const HOME_TOGGLE_LINK_CLASS = 'font-medium text-foreground underline-offset-4 hover:underline cursor-pointer';

export default function Home() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<AuthMode>('login');

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (mode === 'signup') {
      navigate('/admin', { state: { onboarding: true } });
    } else {
      navigate('/admin');
    }
  };

  return (
    <div className={HOME_CLASS}>
      <div className={HOME_CONTENT_CLASS}>
        <Logo className={HOME_LOGO_CLASS} />

        <div className={HOME_CARD_CLASS}>
          <h1 className={HOME_TITLE_CLASS}>{mode === 'login' ? 'Iniciar sesión' : 'Crear cuenta'}</h1>

          <form className={HOME_FORM_CLASS} onSubmit={handleSubmit}>
            {mode === 'signup' && <Input label="Nombre" name="name" autoComplete="name" required />}
            <Input label="Email" name="email" type="email" autoComplete="email" required />
            <Input
              label="Contraseña"
              name="password"
              type="password"
              autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
              required
            />

            <Button type="submit" text={mode === 'login' ? 'Ingresar' : 'Crear cuenta'} className="mt-2 w-full h-11" />
          </form>

          <p className={HOME_TOGGLE_CLASS}>
            {mode === 'login' ? (
              <>
                ¿No tenés cuenta?{' '}
                <button type="button" className={HOME_TOGGLE_LINK_CLASS} onClick={() => setMode('signup')}>
                  Registrate
                </button>
              </>
            ) : (
              <>
                ¿Ya tenés cuenta?{' '}
                <button type="button" className={HOME_TOGGLE_LINK_CLASS} onClick={() => setMode('login')}>
                  Iniciar sesión
                </button>
              </>
            )}
          </p>
        </div>
      </div>
    </div>
  );
}
