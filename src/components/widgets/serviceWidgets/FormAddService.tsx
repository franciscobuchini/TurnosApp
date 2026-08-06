import { type ChangeEvent, useEffect, useState } from 'react';

import Form from '../../interface/Form';

import Input from '../../interface/Input';

import getInitials from '../../../functions/getInitials';

import ServicePreviewCard from './ServicePreviewCard';

import ColorPicker from './ColorPicker';

import PhotoPicker from './PhotoPicker';

import { SERVICE_COLORS, SERVICE_COLOR_BY_ID } from './serviceColors';



const ADD_SERVICE_CONTAINER_CLASS ='flex h-full w-full flex-1 flex-col rounded-4xl bg-neutral-50 p-(--size-m)';

const ADD_SERVICE_LAYOUT_CLASS = 'flex flex-1 flex-col gap-(--size-m) md:flex-row';

const ADD_SERVICE_LEFT_PANEL_CLASS = 'flex flex-1 flex-col justify-center';

const ADD_SERVICE_RIGHT_PANEL_CLASS = 'flex flex-1 flex-col items-center justify-center gap-3 rounded-4xl bg-neutral-50 p-(--size-m)';

const ADD_SERVICE_FORM_CLASS = 'flex flex-col gap-(--size-xl) p-(--size-m)';

const FIELD_GROUP_CLASS = 'flex flex-col gap-2';

const FIELD_LABEL_CLASS = 'px-(--size-m) text-sm font-medium text-neutral-700';

const TWO_COLUMN_GRID_CLASS = 'grid grid-cols-1 gap-(--size-m) sm:grid-cols-2';



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

export default function FormAddService({ mode = 'create', initialValues, onValidityChange, onValuesChange }: FormAddServiceProps) {

  const [serviceName, setServiceName] = useState(initialValues?.name ?? '');

  const [selectedColorId, setSelectedColorId] = useState(initialValues?.colorId ?? SERVICE_COLORS[0].id);

  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState<number | null>(null);

  const [duration, setDuration] = useState(toFormDuration(initialValues?.duration));

  const [price, setPrice] = useState(initialValues?.price ?? '');

  const [description, setDescription] = useState(initialValues?.description ?? '');

  useEffect(() => {
    setServiceName(initialValues?.name ?? '');
    setSelectedColorId(initialValues?.colorId ?? SERVICE_COLORS[0].id);
    setSelectedPhotoIndex(null);
    setDuration(toFormDuration(initialValues?.duration));
    setPrice(initialValues?.price ?? '');
    setDescription(initialValues?.description ?? '');
  }, [mode, initialValues?.name, initialValues?.colorId, initialValues?.duration, initialValues?.price, initialValues?.description]);

  const selectedColor = SERVICE_COLOR_BY_ID[selectedColorId] ?? SERVICE_COLORS[0];

  const selectedColorClassName = selectedColor.className;

  const initials = getInitials(serviceName);

  const readOnly = mode === 'view';

  const handleServiceNameChange = (event: ChangeEvent<HTMLInputElement>) => {

    setServiceName(formatCapitalizedWords(event.target.value));

  };

  const isFormValid = Boolean(serviceName.trim()) && Boolean(duration.trim()) && Boolean(price.trim());

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
  }, [serviceName, selectedColorId, duration, price, description, selectedPhotoIndex, onValuesChange]);



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

              readOnly={readOnly}

            />



            <div className={FIELD_GROUP_CLASS}>

              <p className={FIELD_LABEL_CLASS}>Color del servicio</p>



              <ColorPicker

                colors={SERVICE_COLORS}

                value={selectedColorId}

                onChange={setSelectedColorId}

                disabled={readOnly}

              />

            </div>



            <div className={FIELD_GROUP_CLASS}>

              <p className={FIELD_LABEL_CLASS}>Foto del servicio</p>



              <PhotoPicker

                count={17}

                value={selectedPhotoIndex}

                onChange={setSelectedPhotoIndex}

                disabled={readOnly}

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