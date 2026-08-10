export interface ServiceColor {
  id: string;
  label: string;
  className: string;
}

export const SERVICE_COLORS: ServiceColor[] = [
  { id: 'lima', label: 'Lima', className: 'bg-(--palette-01)' },
  { id: 'lavanda', label: 'Lavanda', className: 'bg-(--palette-02)' },
  { id: 'celeste', label: 'Celeste', className: 'bg-(--palette-03)' },
  { id: 'rosa', label: 'Rosa', className: 'bg-(--palette-04)' },
  { id: 'durazno', label: 'Durazno', className: 'bg-(--palette-05)' },
  { id: 'menta', label: 'Menta', className: 'bg-(--palette-06)' },
  { id: 'coral', label: 'Coral', className: 'bg-(--palette-07)' },
  { id: 'violeta', label: 'Violeta', className: 'bg-(--palette-08)' },
  { id: 'manteca', label: 'Manteca', className: 'bg-(--palette-09)' },
  { id: 'azul-pastel', label: 'Azul pastel', className: 'bg-(--palette-10)' },
  { id: 'salmon', label: 'Salmón', className: 'bg-(--palette-11)' },
  { id: 'verde-lima', label: 'Verde lima', className: 'bg-(--palette-12)' },
];

export const SERVICE_COLOR_BY_ID = Object.fromEntries(
  SERVICE_COLORS.map((color) => [color.id, color]),
) as Record<string, ServiceColor>;