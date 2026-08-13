/* 
  src/database/types.ts
  Tipos compartidos para las entidades de datos de la aplicación.
  Todos los componentes importan sus tipos desde acá.
*/

export type OpeningHoursEntry = {
  dayOfWeek: number;
  startTime: string | null;
  endTime: string | null;
};

export type Business = {
  name: string;
  image: string;
  url: string;
  location: string;
  whatsapp: string;
  instagram: string;
  // Horario del local.
  schedule: OpeningHoursEntry[] | string;
  managerName: string;
  email: string;
  password: string;
  // PIN de 4 dígitos para acceder al panel del administrador.
  adminPin: string;
};

export type TeamMember = {
  name: string;
  photo?: string;
  role: string;
  email: string;
  phone: string;
  services: string[];
  schedule: OpeningHoursEntry[] | string;
};

export type service = {
  name: string;
  photo?: string;
  colorId?: string;
  description: string;
  price: number;
  duration: string;
};

export type Client = {
  name: string;
  photo?: string;
  phone: string;
  email?: string;
  notes?: string;
  appointmentsCount: number;
  totalSpent: number;
};

export type FiltersOption = {
  id: string;
  label: string;
  checked?: boolean;
};

export type Appointment = {
  id: string;
  date: string;       // "YYYY-MM-DD"
  startTime: string;  // "HH:mm"
  endTime: string;    // "HH:mm"
  member: string;
  client: string;
  service: string;
  notes?: string;
};

// Identificadores de opciones de apariencia del sitio público. Las
// definiciones (valores, labels) viven en src/site/design/ — acá sólo el ID
// persistido, igual que colorId en `service`.
// Color libre en formato hex ("#3b82f6"), elegido con HexColorPicker — ver
// site/design/colorUtils.ts para cómo se derivan superficie/texto/foreground
// a partir de estos.
export type SiteHexColor = string;
export type SiteRadiusId = 'sharp' | 'medium' | 'rounded';
// Fuente de texto (cuerpo, botones, labels): legible a tamaños chicos.
export type SiteFontId = 'font-1' | 'font-2' | 'font-3' | 'font-4' | 'font-5' | 'font-6' | 'font-7' | 'font-8' | 'font-9';
// Fuente de título: sólo para h1/h2 y el nombre del negocio — "exóticas" a
// propósito (display), no pensadas para leerse en párrafos ni botones.
export type SiteHeadingFontId = 'heading-1' | 'heading-3' | 'heading-5' | 'heading-6' | 'heading-7' | 'heading-8' | 'heading-9' | 'heading-10' | 'heading-11' | 'heading-12' | 'heading-13' | 'heading-15';

// Personalización del sitio público de un cliente. No duplica datos del
// negocio (servicios, horarios, ubicación, etc. siguen viniendo de Business/
// service/TeamMember) — sólo contenido editable y apariencia.
export type SiteConfig = {
  clientId: string;
  title: string;
  description: string;
  // Color de fondo del sitio: superficie/texto/texto-muted/borde se derivan
  // de éste automáticamente (contraste), ver deriveSiteSurfaceColors.
  backgroundColor: SiteHexColor;
  // Color de los botones/CTAs — independiente del fondo, se combina libre.
  primaryColor: SiteHexColor;
  // Color de los títulos (h1/h2, nombre del negocio) — independiente del
  // fondo y del color de botones.
  headingColor: SiteHexColor;
  borderRadius: SiteRadiusId;
  headingFont: SiteHeadingFontId;
  bodyFont: SiteFontId;
};
