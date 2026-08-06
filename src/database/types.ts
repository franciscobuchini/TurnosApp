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
