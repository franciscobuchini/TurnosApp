export interface ServiceColor {
  id: string;
  label: string;
  className: string;
}

export const SERVICE_COLORS: ServiceColor[] = [
  { id: 'lima', label: 'Lima', className: 'bg-(--primary-01)' },
  { id: 'lavanda', label: 'Lavanda', className: 'bg-(--primary-02)' },
  { id: 'celeste', label: 'Celeste', className: 'bg-(--primary-03)' },
  { id: 'rosa', label: 'Rosa', className: 'bg-(--primary-04)' },
  { id: 'durazno', label: 'Durazno', className: 'bg-(--primary-05)' },
  { id: 'menta', label: 'Menta', className: 'bg-(--primary-06)' },
  { id: 'coral', label: 'Coral', className: 'bg-(--primary-07)' },
  { id: 'violeta', label: 'Violeta', className: 'bg-(--primary-08)' },
  { id: 'manteca', label: 'Manteca', className: 'bg-(--primary-09)' },
  { id: 'azul-pastel', label: 'Azul pastel', className: 'bg-(--primary-10)' },
  { id: 'salmon', label: 'Salmón', className: 'bg-(--primary-11)' },
  { id: 'verde-lima', label: 'Verde lima', className: 'bg-(--primary-12)' },
  { id: 'arena', label: 'Arena', className: 'bg-(--primary-13)' },
];

export const SERVICE_COLOR_BY_ID = Object.fromEntries(
  SERVICE_COLORS.map((color) => [color.id, color]),
) as Record<string, ServiceColor>;