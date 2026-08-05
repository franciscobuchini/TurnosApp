import { type FocusEvent, type MouseEvent } from 'react';
import { twMerge } from 'tailwind-merge';
import Form from '../../interface/Form';
import Input from '../../interface/Input';

/* AddClientContentClasses: esto es el lienzo en blanco de la vista. */
const AddClientContainerClasses = {
  required: 'relative flex flex-col flex-1 p-(--size-m) h-full w-full',
  style: 'rounded-4xl bg-white',
};

const AddClientLayoutClasses = {
  required: 'flex flex-1 flex-col gap-(--size-m) md:flex-row',
  style: '',
};

const AddClientLeftPanelClasses = {
  required: 'flex-1',
  style: '',
};

const AddClientRightPanelClasses = {
  required: 'flex-1 flex flex-col justify-center items-center',
  style: ' rounded-4xl border-dashed border-gray-400 border-1 text-gray-400',
};

const AddClientForm = {
  required: 'flex flex-col gap-(--size-xl) max-w-2xl p-(--size-m)',
  style: '',
};

const whatsappPrefix = '+54 9 ';

function setCursorAfterPrefix(input: HTMLInputElement) {
  const position = whatsappPrefix.length;
  if (input.selectionStart != null && input.selectionStart < position) {
    input.setSelectionRange(position, position);
  }
}

export default function FormAddClient() {

  const handleWhatsAppFocus = (event: FocusEvent<HTMLInputElement>) => {
    const input = event.currentTarget;
    if (!input.value) {
      input.value = whatsappPrefix;
    }

    window.requestAnimationFrame(() => setCursorAfterPrefix(input));
  };

  const handleWhatsAppMouseUp = (event: MouseEvent<HTMLInputElement>) => {
    const input = event.currentTarget;
    window.requestAnimationFrame(() => setCursorAfterPrefix(input));
  };

  return (
    <div className={twMerge(AddClientContainerClasses.required, AddClientContainerClasses.style)}>
      <div className={twMerge(AddClientLayoutClasses.required, AddClientLayoutClasses.style)}>
        <div className={twMerge(AddClientLeftPanelClasses.required, AddClientLeftPanelClasses.style)}>
          <Form className={twMerge(AddClientForm.required, AddClientForm.style)}>
            <div className="flex flex-col gap-3 md:flex-row md:items-end">
              <div className="flex-1">
                <Input
                  label="Nombre y apellido"
                  name="fullName"
                  placeholder="Juan Pérez"
                />
              </div>
            </div>
            <Input
              label="WhatsApp"
              name="whatsapp"
              type="tel"
              defaultValue={whatsappPrefix}
              onFocus={handleWhatsAppFocus}
              onMouseUp={handleWhatsAppMouseUp}
            />
            <Input
              label="Email"
              name="email"
              type="email"
              optional
              placeholder="cliente@ejemplo.com"
            />
            <Input
              label="Notas"
              name="notes"
              textarea
              rows={5}
              optional
              placeholder="Agrega observaciones si lo deseas"
            />
          </Form>
        </div>
        <div className={twMerge(AddClientRightPanelClasses.required, AddClientRightPanelClasses.style)}>
          <p>Proximamente...</p>
          <p>Sistema de fidelización de clientes</p>
        </div>
      </div>
    </div>
  );
}
