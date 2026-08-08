import { type ChangeEvent, type FocusEvent, type MouseEvent, useEffect, useState } from 'react';
import Form from '../../interface/Form';
import Input from '../../interface/Input';

interface FormAddClientProps {
  mode?: 'create' | 'view' | 'edit';
  initialValues?: {
    fullName?: string;
    whatsapp?: string;
    email?: string;
    notes?: string;
  };
  onValidityChange?: (isValid: boolean) => void;
  onValuesChange?: (values: {
    fullName: string;
    whatsapp: string;
    email: string;
    notes: string;
  }) => void;
}

const FORM_CLASS = 'flex flex-1 flex-col gap-(--size-xl)';

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

export default function FormAddClient({ mode = 'create', initialValues, onValidityChange, onValuesChange }: FormAddClientProps) {
  const [fullName, setFullName] = useState(initialValues?.fullName ?? '');
  const [whatsapp, setWhatsapp] = useState(initialValues?.whatsapp ?? '');
  const [email, setEmail] = useState(initialValues?.email ?? '');
  const [notes, setNotes] = useState(initialValues?.notes ?? '');

  useEffect(() => {
    setFullName(initialValues?.fullName ?? '');
    setWhatsapp(initialValues?.whatsapp ?? '');
    setEmail(initialValues?.email ?? '');
    setNotes(initialValues?.notes ?? '');
  }, [mode, initialValues?.fullName, initialValues?.whatsapp, initialValues?.email, initialValues?.notes]);

  const isFormValid = Boolean(fullName.trim()) && Boolean(whatsapp.replace(whatsappPrefix, '').trim());

  useEffect(() => {
    onValidityChange?.(isFormValid);
  }, [isFormValid, onValidityChange]);

  useEffect(() => {
    onValuesChange?.({
      fullName,
      whatsapp,
      email,
      notes,
    });
  }, [fullName, whatsapp, email, notes, onValuesChange]);

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
      <Form className={FORM_CLASS}>
        <Input
          label="Nombre y Apellido"
          name="fullName"
          placeholder="Juan Pérez"
          value={fullName}
          onChange={handleNameChange}
          readOnly={mode === 'view'}
        />
        <Input
          label="WhatsApp"
          name="whatsapp"
          type="tel"
          value={whatsapp || whatsappPrefix}
          onChange={(event) => setWhatsapp(event.target.value)}
          onFocus={handleWhatsAppFocus}
          onMouseUp={handleWhatsAppMouseUp}
          readOnly={mode === 'view'}
        />
        <Input
          label="Email"
          name="email"
          type="email"
          optional
          placeholder="cliente@ejemplo.com"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          readOnly={mode === 'view'}
        />
        <Input
          label="Notas"
          name="notes"
          textarea
          rows={5}
          optional
          placeholder="Agrega observaciones si lo deseas"
          value={notes}
          onChange={(event) => setNotes(event.target.value)}
          readOnly={mode === 'view'}
        />
      </Form>
  );
}