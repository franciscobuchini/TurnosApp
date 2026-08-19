/*
  src/components/widgets/onboarding/OnboardingWizard.tsx
  Wizard de bienvenida (3 pasos + cierre) que se muestra una sola vez, al
  entrar por primera vez con el formulario de "Crear cuenta" de Home.tsx (no
  con "Iniciar sesión" — ver el submit de Home.tsx) — guía una
  personalización básica del negocio: nombre + URL, PIN de administrador y
  un diseño predeterminado para el sitio público, y cierra con el link ya
  listo para compartir. La imagen del negocio no se pide acá — queda para
  Ajustes/Editar web, no es indispensable para arrancar.

  El PIN de administrador se pide acá (no se puede saltear, a diferencia del
  diseño) porque es el mismo PIN que ConfirmDialog (requirePin) exige
  después para acciones sensibles del panel (desactivar un servicio, entrar
  a Editar web) — sin este paso, una cuenta nueva quedaría con adminPin
  vacío y esas confirmaciones se aprobarían solas con cualquier valor.

  Todo se persiste recién al confirmar el diseño (paso 3 → 4): hasta ahí
  sólo vive en el estado local de este componente, así que cerrar el wizard
  antes de tiempo no deja nada a medio guardar — el negocio simplemente
  sigue como estaba, configurable después a mano desde Ajustes/Editar web.
*/

import { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import CancelButton from '@/components/buttons/CancelButton';
import OptionSwatchPicker from '@/components/widgets/siteEditorWidgets/OptionSwatchPicker';
import { getBusiness, saveBusiness } from '@/database/data';
import { getClientId, saveSiteConfig } from '@/database/siteConfig';
import { SITE_HEADING_FONT_BY_ID } from '@/site/design/headingFonts';
import { SITE_FONT_BY_ID } from '@/site/design/fonts';
import { SITE_RADIUS_BY_ID } from '@/site/design/radii';
import { getContrastForeground } from '@/site/design/colorUtils';
import { slugify } from '@/utils/slugify';
import type { SiteConfig, SiteFontId, SiteHeadingFontId, SiteRadiusId, SiteServiceCardStyleId } from '@/database/types';

interface OnboardingWizardProps {
  open: boolean;
  onClose: () => void;
}

interface OnboardingDesignPreset {
  id: string;
  label: string;
  backgroundColor: string;
  primaryColor: string;
  borderRadius: SiteRadiusId;
  headingFont: SiteHeadingFontId;
  bodyFont: SiteFontId;
  serviceCardStyle: SiteServiceCardStyleId;
}

/* 6 combinaciones curadas de las mismas variantes que ya ofrece el editor
   web (site/design/*.ts) — no son opciones nuevas, sólo paquetes prearmados
   para no obligar a elegir 5 controles por separado en el primer ingreso. */
const DESIGN_PRESETS: OnboardingDesignPreset[] = [
  {
    id: 'noche',
    label: 'Noche',
    backgroundColor: '#0a0a0a',
    primaryColor: '#84cc16',
    borderRadius: 'medium',
    headingFont: 'heading-1',
    bodyFont: 'font-2',
    serviceCardStyle: 'photo-top',
  },
  {
    id: 'elegante',
    label: 'Elegante',
    backgroundColor: '#f5f0e8',
    primaryColor: '#7c3aed',
    borderRadius: 'rounded',
    headingFont: 'heading-5',
    bodyFont: 'font-3',
    serviceCardStyle: 'minimal-list',
  },
  {
    id: 'minimal',
    label: 'Minimal',
    backgroundColor: '#ffffff',
    primaryColor: '#171717',
    borderRadius: 'sharp',
    headingFont: 'heading-15',
    bodyFont: 'font-4',
    serviceCardStyle: 'compact-row',
  },
  {
    id: 'vibrante',
    label: 'Vibrante',
    backgroundColor: '#1e1b4b',
    primaryColor: '#f97316',
    borderRadius: 'rounded',
    headingFont: 'heading-8',
    bodyFont: 'font-2',
    serviceCardStyle: 'photo-overlay',
  },
  {
    id: 'retro',
    label: 'Retro',
    backgroundColor: '#fdf3e3',
    primaryColor: '#b45309',
    borderRadius: 'sharp',
    headingFont: 'heading-7',
    bodyFont: 'font-8',
    serviceCardStyle: 'photo-top',
  },
  {
    id: 'futurista',
    label: 'Futurista',
    backgroundColor: '#0f172a',
    primaryColor: '#22d3ee',
    borderRadius: 'sharp',
    headingFont: 'heading-11',
    bodyFont: 'font-4',
    serviceCardStyle: 'compact-row',
  },
];

const PRESET_PREVIEW_CLASS = 'flex h-20 w-full flex-col items-center justify-center gap-1.5 overflow-hidden rounded-md px-2';

function DesignPresetPreview({ preset }: { preset: OnboardingDesignPreset }) {
  const heading = SITE_HEADING_FONT_BY_ID[preset.headingFont];
  const body = SITE_FONT_BY_ID[preset.bodyFont];
  const radius = SITE_RADIUS_BY_ID[preset.borderRadius];

  return (
    <div className={PRESET_PREVIEW_CLASS} style={{ backgroundColor: preset.backgroundColor }}>
      <span className="text-lg leading-none" style={{ fontFamily: heading.stack, color: preset.primaryColor }}>
        {preset.label}
      </span>
      <span
        className="px-2 py-0.5 text-[10px] leading-none"
        style={{
          fontFamily: body.stack,
          backgroundColor: preset.primaryColor,
          color: getContrastForeground(preset.primaryColor),
          borderRadius: radius.value,
        }}
      >
        Reservar turno
      </span>
    </div>
  );
}

const STEP_LABEL_CLASS = 'text-xs font-medium uppercase tracking-wide text-muted-foreground';

export default function OnboardingWizard({ open, onClose }: OnboardingWizardProps) {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [name, setName] = useState('');
  const [url, setUrl] = useState('');
  // Deja de auto-completarse desde el nombre en cuanto la persona toca el
  // input de URL a mano — mismo criterio que un slug de repo.
  const [urlEditedByHand, setUrlEditedByHand] = useState(false);
  const [adminPin, setAdminPin] = useState('');
  const [presetId, setPresetId] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setStep(1);
    setName('');
    setUrl('');
    setUrlEditedByHand(false);
    setAdminPin('');
    setPresetId(null);
  }, [open]);

  const handleNameChange = (value: string) => {
    setName(value);
    if (!urlEditedByHand) setUrl(slugify(value));
  };

  const handleUrlChange = (value: string) => {
    setUrlEditedByHand(true);
    setUrl(slugify(value));
  };

  // Mismo criterio que ConfirmDialog/SettingsBusinessView: sólo dígitos, 4 como máximo.
  const handleAdminPinChange = (value: string) => {
    setAdminPin(value.replace(/\D/g, '').slice(0, 4));
  };

  const trimmedName = name.trim();
  const trimmedUrl = url.trim();

  const handleConfirmDesign = () => {
    const preset = DESIGN_PRESETS.find((p) => p.id === presetId);
    if (!preset) return;

    const business = getBusiness();
    saveBusiness({
      ...business,
      name: trimmedName,
      url: trimmedUrl,
      adminPin,
    });

    const siteConfig: SiteConfig = {
      clientId: getClientId(),
      backgroundColor: preset.backgroundColor,
      primaryColor: preset.primaryColor,
      borderRadius: preset.borderRadius,
      headingFont: preset.headingFont,
      bodyFont: preset.bodyFont,
      serviceCardStyle: preset.serviceCardStyle,
    };
    saveSiteConfig(siteConfig);

    setStep(4);
  };

  return (
    <Dialog open={open} onOpenChange={(next) => !next && onClose()}>
      <DialogContent className="max-w-lg">
        {step === 1 && (
          <>
            <DialogHeader>
              <span className={STEP_LABEL_CLASS}>Paso 1 de 3</span>
              <DialogTitle>¿Cómo se llama tu negocio?</DialogTitle>
              <DialogDescription>Con esto armamos el link de tu sitio público.</DialogDescription>
            </DialogHeader>

            <div className="flex flex-col gap-4 py-1">
              <Input
                label="Nombre del negocio"
                placeholder="Ej: Barbería Studio"
                value={name}
                onChange={(e) => handleNameChange(e.target.value)}
                autoFocus
              />
              {trimmedName !== '' && (
                <Input
                  label="URL del negocio"
                  prefix="minube.site/"
                  placeholder="tu-negocio"
                  value={url}
                  onChange={(e) => handleUrlChange(e.target.value)}
                />
              )}
            </div>

            <DialogFooter>
              <Button type="button" text="Continuar" disabled={trimmedName === '' || trimmedUrl === ''} onClick={() => setStep(2)} />
            </DialogFooter>
          </>
        )}

        {step === 2 && (
          <>
            <DialogHeader>
              <span className={STEP_LABEL_CLASS}>Paso 2 de 3</span>
              <DialogTitle>Elegí un PIN de administrador</DialogTitle>
              <DialogDescription>
                Te lo vamos a pedir para confirmar acciones sensibles del panel (desactivar un servicio, entrar a
                Editar web, etc.).
              </DialogDescription>
            </DialogHeader>

            <div className="py-1">
              <Input
                label="PIN de administrador"
                type="password"
                inputMode="numeric"
                placeholder="0000"
                maxLength={4}
                value={adminPin}
                onChange={(e) => handleAdminPinChange(e.target.value)}
                autoFocus
              />
            </div>

            <DialogFooter>
              <CancelButton text="Atrás" onClick={() => setStep(1)} />
              <Button type="button" text="Continuar" disabled={adminPin.length < 4} onClick={() => setStep(3)} />
            </DialogFooter>
          </>
        )}

        {step === 3 && (
          <>
            <DialogHeader>
              <span className={STEP_LABEL_CLASS}>Paso 3 de 3</span>
              <DialogTitle>Elegí un diseño para tu web</DialogTitle>
              <DialogDescription>Después podés seguir ajustándolo en Editar web.</DialogDescription>
            </DialogHeader>

            <div className="py-1">
              <OptionSwatchPicker
                cols={3}
                value={presetId ?? ''}
                onChange={setPresetId}
                options={DESIGN_PRESETS.map((preset) => ({
                  id: preset.id,
                  label: preset.label,
                  render: <DesignPresetPreview preset={preset} />,
                }))}
              />
            </div>

            <DialogFooter>
              <CancelButton text="Atrás" onClick={() => setStep(2)} />
              <Button type="button" text="Continuar" disabled={!presetId} onClick={handleConfirmDesign} />
            </DialogFooter>
          </>
        )}

        {step === 4 && (
          <>
            <DialogHeader>
              <DialogTitle>¡Tu web ya está activa!</DialogTitle>
              <DialogDescription>Compartila con tus clientes y empezá a recibir turnos ahora mismo.</DialogDescription>
            </DialogHeader>

            <Button
              type="button"
              variant="link"
              text={`minube.site/${trimmedUrl}`}
              onClick={() => window.open('/site', '_blank', 'noopener,noreferrer')}
              className="w-fit px-0 text-foreground"
            />

            <DialogFooter>
              <Button type="button" text="Ir al panel" onClick={onClose} />
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
