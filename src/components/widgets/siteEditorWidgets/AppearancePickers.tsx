/*
  src/components/widgets/siteEditorWidgets/AppearancePickers.tsx
  Los controles de apariencia restantes que no son un color directo: bordes,
  fuente de título y fuente de texto — cada uno un OptionSwatchPicker armado
  a partir de las definiciones de site/design/. Fondo, botones y títulos
  usan directamente HexColorPicker (ver SitePersonalizationSidebar), no
  necesitan un wrapper acá porque no tienen variación entre sí más que el
  campo del SiteConfig que actualizan.

  Fuente de título y fuente de texto son independientes: la de título admite
  opciones "exóticas" (display) porque sólo se aplica a h1/h2, nunca al
  cuerpo. Cada picker vive en su propio DetailsPanel (ver
  SitePersonalizationSidebar), por eso no llevan Label propio — el título
  del panel ya cumple ese rol. Agregar una opción nueva a futuro es sumarla
  en site/design/ — estos componentes no cambian.
*/

import { twMerge } from 'tailwind-merge';
import OptionSwatchPicker from './OptionSwatchPicker';
import { SITE_RADII } from '@/site/design/radii';
import { SITE_FONTS } from '@/site/design/fonts';
import { SITE_HEADING_FONTS } from '@/site/design/headingFonts';
import { SITE_SERVICE_CARD_STYLES } from '@/site/design/serviceCardStyles';
import type { SiteConfig, SiteServiceCardStyleId } from '@/database/types';

interface BorderRadiusPickerProps {
  value: SiteConfig['borderRadius'];
  onChange: (borderRadius: SiteConfig['borderRadius']) => void;
}

export function BorderRadiusPicker({ value, onChange }: BorderRadiusPickerProps) {
  return (
    <OptionSwatchPicker
      value={value}
      onChange={onChange}
      options={SITE_RADII.map((radius) => ({
        id: radius.id,
        label: radius.label,
        render: <span className="size-8 border-2 border-foreground/60" style={{ borderRadius: radius.value }} />,
      }))}
    />
  );
}

interface BodyFontPickerProps {
  value: SiteConfig['bodyFont'];
  onChange: (bodyFont: SiteConfig['bodyFont']) => void;
}

export function BodyFontPicker({ value, onChange }: BodyFontPickerProps) {
  return (
    <OptionSwatchPicker
      value={value}
      onChange={onChange}
      options={SITE_FONTS.map((font) => ({
        id: font.id,
        label: font.label,
        render: (
          <span className="text-2xl leading-none" style={{ fontFamily: font.stack }}>
            Aa
          </span>
        ),
      }))}
    />
  );
}

interface HeadingFontPickerProps {
  value: SiteConfig['headingFont'];
  onChange: (headingFont: SiteConfig['headingFont']) => void;
}

export function HeadingFontPicker({ value, onChange }: HeadingFontPickerProps) {
  return (
    <OptionSwatchPicker
      value={value}
      onChange={onChange}
      options={SITE_HEADING_FONTS.map((font) => ({
        id: font.id,
        label: font.label,
        render: (
          <span className="text-2xl leading-none" style={{ fontFamily: font.stack }}>
            Aa
          </span>
        ),
      }))}
    />
  );
}

/* Mini-mockup de cada estilo de card de servicio (ver ServiceStep.tsx para
   el layout real) — a diferencia de radio/fuente, no hay un único valor
   visual que mostrar, así que cada preview redibuja en miniatura la forma
   del layout (foto/franja de color + líneas simulando texto). */
const CARD_STYLE_PREVIEW_CLASS = 'flex h-14 w-20 flex-col overflow-hidden rounded-md border border-foreground/20 bg-background';

function ServiceCardStylePreview({ id }: { id: SiteServiceCardStyleId }) {
  if (id === 'photo-top') {
    return (
      <div className={CARD_STYLE_PREVIEW_CLASS}>
        <div className="h-7 w-full bg-foreground/25" />
        <div className="flex flex-1 flex-col justify-center gap-1 p-1.5">
          <div className="h-1.5 w-3/4 rounded-full bg-foreground/60" />
          <div className="h-1.5 w-1/2 rounded-full bg-foreground/30" />
        </div>
      </div>
    );
  }

  if (id === 'compact-row') {
    return (
      <div className={twMerge(CARD_STYLE_PREVIEW_CLASS, 'flex-row items-center gap-1.5 p-1.5')}>
        <div className="size-8 shrink-0 rounded bg-foreground/25" />
        <div className="flex flex-1 flex-col gap-1">
          <div className="h-1.5 w-full rounded-full bg-foreground/60" />
          <div className="h-1.5 w-2/3 rounded-full bg-foreground/30" />
        </div>
      </div>
    );
  }

  if (id === 'minimal-list') {
    return (
      <div className={twMerge(CARD_STYLE_PREVIEW_CLASS, 'flex-row items-center gap-1.5 p-1.5')}>
        <div className="h-8 w-1 shrink-0 rounded-full bg-foreground/50" />
        <div className="flex flex-1 flex-col gap-1">
          <div className="h-1.5 w-full rounded-full bg-foreground/60" />
          <div className="h-1.5 w-2/3 rounded-full bg-foreground/30" />
        </div>
      </div>
    );
  }

  return (
    <div className={twMerge(CARD_STYLE_PREVIEW_CLASS, 'relative justify-end bg-foreground/30 p-1.5')}>
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
      <div className="relative h-1.5 w-3/4 rounded-full bg-white/90" />
    </div>
  );
}

interface ServiceCardStylePickerProps {
  value: SiteConfig['serviceCardStyle'];
  onChange: (style: SiteConfig['serviceCardStyle']) => void;
}

export function ServiceCardStylePicker({ value, onChange }: ServiceCardStylePickerProps) {
  return (
    <OptionSwatchPicker
      value={value}
      onChange={onChange}
      cols={2}
      options={SITE_SERVICE_CARD_STYLES.map((style) => ({
        id: style.id,
        label: style.label,
        render: <ServiceCardStylePreview id={style.id} />,
      }))}
    />
  );
}
