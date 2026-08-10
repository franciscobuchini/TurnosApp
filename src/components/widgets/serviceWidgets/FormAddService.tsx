import { type ChangeEvent, useEffect, useState } from 'react';

import Form from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

import ColorPicker from './ColorPicker';
import PhotoPicker from './PhotoPicker';

import { SERVICE_COLORS } from './serviceColors';

const FORM_CLASS = 'flex flex-1 flex-col gap-8';
const FIELD_GROUP_CLASS = 'flex flex-col gap-4';
const TWO_COLUMN_GRID_CLASS = 'grid grid-cols-1 gap-4 sm:grid-cols-2';

function formatCapitalizedWords(value: string) {
  const trimmed = value.trim();

  if (!trimmed) return '';

  const hasTrailingSpace = /\s$/.test(value);

  const formatted = trimmed
    .split(/\s+/)
    .map(
      (word) =>
        word.charAt(0).toUpperCase() + word.slice(1).toLowerCase(),
    )
    .join(' ');

  return hasTrailingSpace ? `${formatted} ` : formatted;
}

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
    photoIndex: number | null;
  }) => void;
}

function toFormDuration(value?: string) {
  return value?.replace(/\s*min$/i, '') ?? '';
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

  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState<
    number | null
  >(null);

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
    setSelectedPhotoIndex(null);
    setDuration(toFormDuration(initialValues?.duration));
    setPrice(initialValues?.price ?? '');
    setDescription(initialValues?.description ?? '');
  }, [
    mode,
    initialValues?.name,
    initialValues?.colorId,
    initialValues?.duration,
    initialValues?.price,
    initialValues?.description,
  ]);

  const readOnly = mode === 'view';

  const handleServiceNameChange = (
    event: ChangeEvent<HTMLInputElement>,
  ) => {
    setServiceName(formatCapitalizedWords(event.target.value));
  };

  const isFormValid =
    Boolean(serviceName.trim()) &&
    Boolean(duration.trim()) &&
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
      photoIndex: selectedPhotoIndex,
    });
  }, [
    serviceName,
    selectedColorId,
    duration,
    price,
    description,
    selectedPhotoIndex,
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
          <Input
            label="Duración (min)"
            name="duration"
            type="number"
            placeholder="60"
            value={duration}
            onChange={(event) => setDuration(event.target.value)}
            readOnly={readOnly}
          />

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

          <PhotoPicker
            value={selectedPhotoIndex}
            onChange={setSelectedPhotoIndex}
            disabled={readOnly}
          />
        </div>
      </Form>
  );
}