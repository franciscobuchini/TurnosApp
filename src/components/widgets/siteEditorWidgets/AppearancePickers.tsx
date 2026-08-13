/*
  src/components/widgets/siteEditorWidgets/AppearancePickers.tsx
  Los controles de apariencia del sitio (theme, color principal, bordes,
  fuente de título, fuente de texto), cada uno un OptionSwatchPicker armado
  a partir de las definiciones de site/design/. Theme y color principal son
  independientes: el theme define fondo/superficie/texto, el color
  principal define el acento — se combinan libre. Fuente de título y fuente
  de texto también son independientes: la de título admite opciones
  "exóticas" (display) porque sólo se aplica a h1/h2, nunca al cuerpo. Cada
  picker vive en su propio DetailsPanel (ver SitePersonalizationSidebar),
  por eso no llevan Label propio — el título del panel ya cumple ese rol.
  Agregar una opción nueva a futuro es sumarla en site/design/ — estos
  componentes no cambian.
*/

import OptionSwatchPicker from './OptionSwatchPicker';
import { SITE_THEMES } from '@/site/design/themes';
import { SITE_PRIMARY_COLORS } from '@/site/design/colors';
import { SITE_RADII } from '@/site/design/radii';
import { SITE_FONTS } from '@/site/design/fonts';
import { SITE_HEADING_FONTS } from '@/site/design/headingFonts';
import type { SiteConfig } from '@/database/types';

interface ThemePickerProps {
  value: SiteConfig['theme'];
  onChange: (theme: SiteConfig['theme']) => void;
}

export function ThemePicker({ value, onChange }: ThemePickerProps) {
  return (
    <OptionSwatchPicker
      value={value}
      onChange={onChange}
      options={SITE_THEMES.map((theme) => ({
        id: theme.id,
        label: theme.label,
        render: (
          <span
            className="size-8 rounded-full border-2"
            style={{ background: theme.colors.background, borderColor: theme.colors.text }}
          />
        ),
      }))}
    />
  );
}

interface PrimaryColorPickerProps {
  value: SiteConfig['primaryColor'];
  onChange: (primaryColor: SiteConfig['primaryColor']) => void;
}

export function PrimaryColorPicker({ value, onChange }: PrimaryColorPickerProps) {
  return (
    <OptionSwatchPicker
      value={value}
      onChange={onChange}
      showLabels={false}
      cols={6}
      options={SITE_PRIMARY_COLORS.map((color) => ({
        id: color.id,
        label: color.label,
        fill: true,
        render: <span className="block h-full w-full" style={{ background: color.value }} />,
      }))}
    />
  );
}

interface HeadingColorPickerProps {
  value: SiteConfig['headingColor'];
  onChange: (headingColor: SiteConfig['headingColor']) => void;
}

/* El color de los títulos usa exactamente la misma paleta que el color
   principal — mismo picker, otro campo del SiteConfig. */
export function HeadingColorPicker({ value, onChange }: HeadingColorPickerProps) {
  return <PrimaryColorPicker value={value} onChange={onChange} />;
}

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
