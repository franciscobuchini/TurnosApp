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
  // Pin del mapa (Ajustes > seleccionar ubicación) — independiente del
  // texto libre de `location`, que el dueño puede escribir a mano.
  latitude?: number;
  longitude?: number;
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
  // undefined/true = activo (default, así los servicios del seed no
  // necesitan este campo). Sólo false lo saca del turnero público — ver
  // getSiteServices en siteData.ts. No afecta al admin: sigue pudiendo
  // agregarle turnos a mano a un servicio desactivado.
  active?: boolean;
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

// Bloqueo puntual del Schedule (panel "Crear un nuevo bloqueo" en
// AddShiftSidebar): una franja horaria de un día puntual que queda como si
// fuera fuera de horario — no se pueden solicitar turnos ahí, ni desde el
// admin ni desde el sitio público, mientras el resto del horario del día
// sigue intacto. `member` ausente = bloqueo de todo el negocio (todos los
// miembros); con `member` = bloqueo puntual de ese miembro nada más — ese
// segundo caso todavía no se genera desde ningún lado (sólo "Bloquear hora
// del negocio" está implementado por ahora, ver AddShiftSidebar.tsx), pero
// el tipo ya lo contempla para no tener que migrarlo después.
export type ScheduleBlock = {
  id: string;
  date: string;       // "YYYY-MM-DD"
  startTime: string;  // "HH:mm"
  endTime: string;    // "HH:mm"
  member?: string;
  // 'block' (default) para bloquear horarios/días; 'unblock' para desbloquear/habilitar
  // horarios fuera de horario laboral o días cerrados.
  type?: 'block' | 'unblock';
  // Texto libre, opcional ("mantenimiento", "feriado", "horario especial", etc.) — se carga en
  // el paso "Confirmar bloqueo/desbloqueo" de AddShiftSidebar.tsx.
  reason?: string;
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
// Estilo visual de las cards de servicio del turnero (paso "Elegí un
// servicio") — ver site/design/serviceCardStyles.ts para el detalle de
// cada uno y ServiceStep.tsx para el layout que le corresponde a cada id.
export type SiteServiceCardStyleId = 'photo-top' | 'compact-row' | 'minimal-list' | 'photo-overlay';

// Personalización del sitio público de un cliente. No duplica datos del
// negocio (servicios, horarios, ubicación, etc. siguen viniendo de Business/
// service/TeamMember) — sólo apariencia. El título del sitio y la bajada
// bajo el nombre del negocio ya no son editables acá: el título usa
// siempre Business.name y la bajada es fija ("Reservá tu turno online en
// simples pasos"), ver SiteHero.tsx.
export type SiteConfig = {
  clientId: string;
  // Color de fondo del sitio: superficie/texto/texto-muted/borde se derivan
  // de éste automáticamente (contraste), ver deriveSiteSurfaceColors.
  backgroundColor: SiteHexColor;
  // Color primario: botones/CTAs y títulos (h1/h2, nombre del negocio)
  // comparten este mismo color — independiente del fondo.
  primaryColor: SiteHexColor;
  borderRadius: SiteRadiusId;
  headingFont: SiteHeadingFontId;
  bodyFont: SiteFontId;
  serviceCardStyle: SiteServiceCardStyleId;
};
