import { type ChangeEvent, useEffect, useState } from 'react';

import Form from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import DurationSelector from '@/components/ui/duration-selector';
import PhotoUrlPicker from '@/components/ui/photo-url-picker';
import { minutesToTime } from '@/hooks/useWeekSchedule';
import formatCapitalizedWords from '@/utils/formatCapitalizedWords';

import ColorPicker from './ColorPicker';

import { SERVICE_COLORS } from './serviceColors';

const FORM_CLASS = 'flex flex-1 flex-col gap-8';
const FIELD_GROUP_CLASS = 'flex flex-col gap-4';
const TWO_COLUMN_GRID_CLASS = 'grid grid-cols-1 gap-4 sm:grid-cols-2';

interface FormAddServiceProps {
  mode?: 'create' | 'view' | 'edit';
  initialValues?: {
    name?: string;
    description?: string;
    duration?: string;
    price?: string;
    colorId?: string;
    photo?: string;
  };
  onValidityChange?: (isValid: boolean) => void;
  onValuesChange?: (values: {
    name: string;
    colorId: string;
    duration: string;
    price: string;
    description: string;
    photo: string;
  }) => void;
}

function toFormDuration(value?: string) {
  return value?.replace(/\s*min$/i, '') ?? '';
}

/* "HH:mm" -> minutos como string (el form trabaja en minutos). */
function durationMinutesFromSelector(value: string): string {
  const [hours, minutes] = value.split(':').map(Number);
  return String(hours * 60 + minutes);
}

export default function FormAddService({
  mode = 'create',
  initialValues,
  onValidityChange,
  onValuesChange,
}: FormAddServiceProps) {
  const [serviceName, setServiceName] = useState(
    initialValues?.name ?? '',
  );

  const [selectedColorId, setSelectedColorId] = useState(
    initialValues?.colorId ?? SERVICE_COLORS[0].id,
  );

  const [photo, setPhoto] = useState(initialValues?.photo ?? '');

  const [duration, setDuration] = useState(
    toFormDuration(initialValues?.duration),
  );

  const [price, setPrice] = useState(initialValues?.price ?? '');

  const [description, setDescription] = useState(
    initialValues?.description ?? '',
  );

  useEffect(() => {
    setServiceName(initialValues?.name ?? '');
    setSelectedColorId(
      initialValues?.colorId ?? SERVICE_COLORS[0].id,
    );
    setPhoto(initialValues?.photo ?? '');
    setDuration(toFormDuration(initialValues?.duration));
    setPrice(initialValues?.price ?? '');
    setDescription(initialValues?.description ?? '');
  }, [
    mode,
    initialValues?.name,
    initialValues?.colorId,
    initialValues?.photo,
    initialValues?.duration,
    initialValues?.price,
    initialValues?.description,
  ]);

  const readOnly = mode === 'view';

  /* El selector trabaja con "HH:mm"; el form guarda minutos sueltos ("60").
     Una duración en minutos no válida se muestra como 00:00 (sin valor). */
  const durationMinutes = (() => {
    const parsed = parseInt(duration, 10);
    return Number.isNaN(parsed) ? 0 : parsed;
  })();

  const selectorDuration = /^\d+$/.test(duration) ? minutesToTime(durationMinutes) : undefined;

  const handleServiceNameChange = (
    event: ChangeEvent<HTMLInputElement>,
  ) => {
    setServiceName(formatCapitalizedWords(event.target.value));
  };

  const isFormValid =
    Boolean(serviceName.trim()) &&
    durationMinutes > 0 &&
    Boolean(price.trim());

  useEffect(() => {
    onValidityChange?.(isFormValid);
  }, [isFormValid, onValidityChange]);

  useEffect(() => {
    onValuesChange?.({
      name: serviceName,
      colorId: selectedColorId,
      duration: `${duration.trim()} min`,
      price,
      description,
      photo,
    });
  }, [
    serviceName,
    selectedColorId,
    duration,
    price,
    description,
    photo,
    onValuesChange,
  ]);

  return (
      <Form className={FORM_CLASS}>
        <Input
          label="Nombre del servicio"
          name="serviceName"
          placeholder="Corte de cabello"
          value={serviceName}
          onChange={handleServiceNameChange}
          readOnly={readOnly}
        />

        <div className={TWO_COLUMN_GRID_CLASS}>
          <div className="flex flex-col gap-4">
            <Label>Duración</Label>
            <DurationSelector
              value={selectorDuration}
              onChange={(value) => setDuration(durationMinutesFromSelector(value))}
              readOnly={readOnly}
            />
          </div>

          <Input
            label="Precio"
            name="price"
            type="number"
            placeholder="15000"
            value={price}
            onChange={(event) => setPrice(event.target.value)}
            readOnly={readOnly}
          />
        </div>

        <Input
          label="Descripción"
          name="description"
          optional
          placeholder="Describe el servicio"
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          readOnly={readOnly}
        />

        <div className={FIELD_GROUP_CLASS}>
          <Label>Color del servicio</Label>

          <ColorPicker
            colors={SERVICE_COLORS}
            value={selectedColorId}
            onChange={setSelectedColorId}
            disabled={readOnly}
          />
        </div>

        <div className={FIELD_GROUP_CLASS}>
          <Label>Foto del servicio</Label>

          <PhotoUrlPicker
            value={photo}
            onChange={setPhoto}
            name={serviceName}
            disabled={readOnly}
          />
        </div>
      </Form>
  );
}