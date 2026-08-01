/* 
  src/variables/types.ts
  Tipos compartidos para las entidades de datos de la aplicación.
  Todos los componentes importan sus tipos desde acá.
*/

export type DaySchedule = {
  day: string;
  hours: string[];
};

export type TeamMember = {
  name: string;
  role: string;
  email: string;
  phone: string;
  services: string[];
  schedule: DaySchedule[] | string;
};

export type Product = {
  name: string;
  description: string;
  price: number;
  duration: string;
};

export type Client = {
  name: string;
  phone: string;
  appointmentsCount: number;
  totalSpent: number;
};

export type FiltersOption = {
  id: string;
  label: string;
  checked?: boolean;
};
