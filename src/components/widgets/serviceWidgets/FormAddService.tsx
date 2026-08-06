import { type ChangeEvent, useState } from 'react';
import Form from '../../interface/Form';
import Input from '../../interface/Input';
import getInitials from '../../../functions/getInitials';
import ServicePreviewCard from './ServicePreviewCard';
import ColorPicker from './ColorPicker';
import PhotoPicker from './PhotoPicker';

const ADD_SERVICE_CONTAINER_CLASS ='flex h-full w-full flex-1 flex-col rounded-4xl bg-neutral-50 p-(--size-m)';
const ADD_SERVICE_LAYOUT_CLASS = 'flex flex-1 flex-col gap-(--size-m) md:flex-row';
const ADD_SERVICE_LEFT_PANEL_CLASS = 'flex flex-1 flex-col justify-center';
const ADD_SERVICE_RIGHT_PANEL_CLASS = 'flex flex-1 flex-col items-center justify-center gap-3 rounded-4xl bg-neutral-50 p-(--size-m)';
const ADD_SERVICE_FORM_CLASS = 'flex flex-col gap-(--size-xl) p-(--size-m)';
const FIELD_GROUP_CLASS = 'flex flex-col gap-2';
const FIELD_LABEL_CLASS = 'px-(--size-m) text-sm font-medium text-neutral-700';
const TWO_COLUMN_GRID_CLASS = 'grid grid-cols-1 gap-(--size-m) sm:grid-cols-2';

const SERVICE_COLORS: { id: string; label: string; className: string }[] = [
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

const SERVICE_COLOR_BY_ID = Object.fromEntries(SERVICE_COLORS.map((color) => [color.id, color]));


function formatCapitalizedWords(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return '';

  const hasTrailingSpace = /\s$/.test(value);
  const formatted = trimmed
    .split(/\s+/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');

  return hasTrailingSpace ? `${formatted} ` : formatted;
}

export default function FormAddService() {
  const [serviceName, setServiceName] = useState('');
  const [selectedColorId, setSelectedColorId] = useState(SERVICE_COLORS[0].id);
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState<number | null>(null);
  const [duration, setDuration] = useState('');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const selectedColor = SERVICE_COLOR_BY_ID[selectedColorId] ?? SERVICE_COLORS[0];
  const selectedColorClassName = selectedColor.className;
  const initials = getInitials(serviceName);
  const handleServiceNameChange = (event: ChangeEvent<HTMLInputElement>) => {
    setServiceName(formatCapitalizedWords(event.target.value));
  };

  return (
    <div className={ADD_SERVICE_CONTAINER_CLASS}>
      <div className={ADD_SERVICE_LAYOUT_CLASS}>
        <div className={ADD_SERVICE_LEFT_PANEL_CLASS}>
          <Form className={ADD_SERVICE_FORM_CLASS}>
            <Input
              label="Nombre del servicio"
              name="serviceName"
              placeholder="Corte de cabello"
              value={serviceName}
              onChange={handleServiceNameChange}
            />

            <div className={FIELD_GROUP_CLASS}>
              <p className={FIELD_LABEL_CLASS}>Color del servicio</p>

              <ColorPicker
                colors={SERVICE_COLORS}
                value={selectedColorId}
                onChange={setSelectedColorId}
              />
            </div>

            <div className={FIELD_GROUP_CLASS}>
              <p className={FIELD_LABEL_CLASS}>Foto del servicio</p>

              <PhotoPicker
                count={17}
                value={selectedPhotoIndex}
                onChange={setSelectedPhotoIndex}
              />
            </div>

            <div className={TWO_COLUMN_GRID_CLASS}>
              <Input
                label="Duración (min)"
                name="duration"
                type="number"
                placeholder="60"
                value={duration}
                onChange={(event) => setDuration(event.target.value)}
              />

              <Input
                label="Precio"
                name="price"
                type="number"
                placeholder="15000"
                value={price}
                onChange={(event) => setPrice(event.target.value)}
              />
            </div>

            <Input
              label="Descripción"
              name="description"
              optional
              placeholder="Describe el servicio"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
            />
          </Form>
        </div>

        <div className={ADD_SERVICE_RIGHT_PANEL_CLASS}>
          <ServicePreviewCard
            name={serviceName}
            description={description}
            duration={duration}
            price={price}
            initials={initials}
            colorClassName={selectedColorClassName}
            selectedPhotoIndex={selectedPhotoIndex}
          />
        </div>
      </div>
    </div>
  );
}