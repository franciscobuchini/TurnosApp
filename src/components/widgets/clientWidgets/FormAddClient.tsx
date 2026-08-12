import { type ChangeEvent, useEffect, useState } from 'react';
import Form from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import formatCapitalizedWords from '@/utils/formatCapitalizedWords';
import WhatsAppInput, { WHATSAPP_PREFIX } from '../WhatsAppInput';

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

const FORM_CLASS = 'flex flex-1 flex-col gap-8';

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

  const isFormValid = Boolean(fullName.trim()) && Boolean(whatsapp.replace(WHATSAPP_PREFIX, '').trim());

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
        <WhatsAppInput name="whatsapp" value={whatsapp} onChange={setWhatsapp} readOnly={mode === 'view'} />
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