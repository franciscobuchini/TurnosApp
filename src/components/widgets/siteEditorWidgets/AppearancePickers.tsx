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

import OptionSwatchPicker from './OptionSwatchPicker';
import { SITE_RADII } from '@/site/design/radii';
import { SITE_FONTS } from '@/site/design/fonts';
import { SITE_HEADING_FONTS } from '@/site/design/headingFonts';
import type { SiteConfig } from '@/database/types';

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
