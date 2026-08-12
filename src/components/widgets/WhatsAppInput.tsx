import type { FocusEvent, MouseEvent } from 'react';
import { Input } from '@/components/ui/input';

/*
  src/components/widgets/WhatsAppInput.tsx
  Campo de WhatsApp compartido por FormAddEntity (miembro) y FormAddClient
  (cliente): prefijo fijo "+54 9 " que se precarga al enfocar un campo vacío,
  cursor que no puede entrar al prefijo, y saneo del valor (solo dígitos +
  un "+" inicial) en cada cambio.
*/

export const WHATSAPP_PREFIX = '+54 9 ';

// Solo números y un "+" al inicio: descarta cualquier otro carácter.
function sanitizeWhatsApp(value: string): string {
  const digits = value.replace(/\D/g, '');
  const hasLeadingPlus = value.startsWith('+');
  return hasLeadingPlus ? `+${digits}` : digits;
}

function setCursorAfterPrefix(input: HTMLInputElement) {
  const position = WHATSAPP_PREFIX.length;
  if (input.selectionStart != null && input.selectionStart < position) {
    input.setSelectionRange(position, position);
  }
}

interface WhatsAppInputProps {
  value: string;
  onChange: (value: string) => void;
  readOnly?: boolean;
  name?: string;
  label?: string;
}

export default function WhatsAppInput({ value, onChange, readOnly, name = 'whatsapp', label = 'WhatsApp' }: WhatsAppInputProps) {
  const handleFocus = (event: FocusEvent<HTMLInputElement>) => {
    const input = event.currentTarget;
    if (!input.value) {
      input.value = WHATSAPP_PREFIX;
      onChange(WHATSAPP_PREFIX);
    }

    window.requestAnimationFrame(() => setCursorAfterPrefix(input));
  };

  const handleMouseUp = (event: MouseEvent<HTMLInputElement>) => {
    window.requestAnimationFrame(() => setCursorAfterPrefix(event.currentTarget));
  };

  return (
    <Input
      label={label}
      name={name}
      type="tel"
      value={value || WHATSAPP_PREFIX}
      onChange={(event) => onChange(sanitizeWhatsApp(event.target.value))}
      onFocus={handleFocus}
      onMouseUp={handleMouseUp}
      readOnly={readOnly}
    />
  );
}
