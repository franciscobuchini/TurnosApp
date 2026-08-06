import { type ChangeEvent, type FocusEvent, type MouseEvent, useState } from 'react';
import Form from '../../interface/Form';
import Input from '../../interface/Input';

const CONTAINER_CLASS = 'relative flex p-(--size-m) h-full w-full rounded-4xl bg-neutral-50';
const FORM_CLASS = 'flex flex-1 flex-col justify-center gap-(--size-xl) max-w-2xl p-(--size-m)';
const RIGHT_PANEL_CLASS = 'flex-1 flex flex-col justify-center items-center rounded-4xl border-dashed border-neutral-400 border-1 text-neutral-400';

const whatsappPrefix = '+54 9 ';

function formatCapitalizedWords(value: string) {
  const hasTrailingSpace = /\s$/.test(value);
  const words = value.trim().split(/\s+/).filter(Boolean);

  if (!words.length) {
    return '';
  }

  const formattedWords = words.map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase());

  return hasTrailingSpace ? `${formattedWords.join(' ')} ` : formattedWords.join(' ');
}

function setCursorAfterPrefix(input: HTMLInputElement) {
  const position = whatsappPrefix.length;
  if (input.selectionStart != null && input.selectionStart < position) {
    input.setSelectionRange(position, position);
  }
}

export default function FormAddClient() {
  const [fullName, setFullName] = useState('');

  const handleNameChange = (event: ChangeEvent<HTMLInputElement>) => {
    setFullName(formatCapitalizedWords(event.target.value));
  };

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
    <div className={CONTAINER_CLASS}>
      <Form className={FORM_CLASS}>
        <Input
          label="Nombre y Apellido"
          name="fullName"
          placeholder="Juan Pérez"
          value={fullName}
          onChange={handleNameChange}
        />
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
      <div className={RIGHT_PANEL_CLASS}>
        <p>Proximamente...</p>
        <p>Sistema de fidelización de clientes</p>
      </div>
    </div>
  );
}