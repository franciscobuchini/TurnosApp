import { type ChangeEvent, type FocusEvent, type MouseEvent, useEffect, useState } from 'react';
import Form from '../../interface/Form';
import Input from '../../interface/Input';
import ServiceSelector from './ServiceSelector';

interface FormAddEntityProps {
  mode?: 'create' | 'view' | 'edit';
  initialValues?: {
    name?: string;
    role?: string;
    phone?: string;
    email?: string;
    services?: string[];
  };
  onValuesChange?: (values: {
    name: string;
    role: string;
    phone: string;
    email: string;
    services: string[];
  }) => void;
  onValidityChange?: (isValid: boolean) => void;
}

const FORM_CLASS = 'flex flex-col gap-(--size-4xl)';
const TWO_COLUMN_GRID_CLASS = 'grid grid-cols-1 gap-(--size-m) sm:grid-cols-2';

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

// Solo números y un "+" al inicio: descarta cualquier otro carácter.
function sanitizeWhatsApp(value: string): string {
  const digits = value.replace(/\D/g, '');
  const hasLeadingPlus = value.startsWith('+');
  return hasLeadingPlus ? `+${digits}` : digits;
}

export default function FormAddEntity({ mode = 'create', initialValues, onValuesChange, onValidityChange }: FormAddEntityProps) {
  const [memberName, setMemberName] = useState(initialValues?.name ?? '');
  const [role, setRole] = useState(initialValues?.role ?? '');
  const [phone, setPhone] = useState(initialValues?.phone ?? '');
  const [email, setEmail] = useState(initialValues?.email ?? '');
  const [selectedServices, setSelectedServices] = useState<string[]>(initialValues?.services ?? []);
  const readOnly = mode === 'view';

  useEffect(() => {
    onValuesChange?.({
      name: memberName,
      role,
      phone,
      email,
      services: selectedServices,
    });
  }, [memberName, role, phone, email, selectedServices, onValuesChange]);

  const isFormValid = Boolean(memberName.trim() && role.trim() && phone.replace(whatsappPrefix, '').trim());

  useEffect(() => {
    onValidityChange?.(isFormValid);
  }, [isFormValid, onValidityChange]);

  const handleNameChange = (event: ChangeEvent<HTMLInputElement>) => {
    setMemberName(formatCapitalizedWords(event.target.value));
  };

  const handleRoleChange = (event: ChangeEvent<HTMLInputElement>) => {
    setRole(formatCapitalizedWords(event.target.value));
  };

  const handleWhatsAppFocus = (event: FocusEvent<HTMLInputElement>) => {
    const input = event.currentTarget;
    if (!input.value) {
      input.value = whatsappPrefix;
      setPhone(input.value);
    }

    window.requestAnimationFrame(() => setCursorAfterPrefix(input));
  };

  const handleWhatsAppMouseUp = (event: MouseEvent<HTMLInputElement>) => {
    const input = event.currentTarget;
    window.requestAnimationFrame(() => setCursorAfterPrefix(input));
  };

  return (
    <Form className={FORM_CLASS}>
      <div className={TWO_COLUMN_GRID_CLASS}>
        <Input
          label="Nombre y Apellido"
          name="memberName"
          placeholder="Juan Perez"
          value={memberName}
          onChange={handleNameChange}
          readOnly={readOnly}
        />

        <Input
          label="Rol"
          name="role"
          placeholder="Peluquero"
          value={role}
          onChange={handleRoleChange}
          readOnly={readOnly}
        />
      </div>

      <div className={TWO_COLUMN_GRID_CLASS}>
        <Input
          label="WhatsApp"
          name="phone"
          type="tel"
          value={phone || whatsappPrefix}
          onChange={(event) => setPhone(sanitizeWhatsApp(event.target.value))}
          onFocus={handleWhatsAppFocus}
          onMouseUp={handleWhatsAppMouseUp}
          readOnly={readOnly}
        />

        <Input
          label="Email"
          name="email"
          type="email"
          optional
          placeholder="miembro@ejemplo.com"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          readOnly={readOnly}
        />
      </div>

      <ServiceSelector value={selectedServices} onChange={setSelectedServices} disabled={readOnly} showOnlySelected={readOnly} />
    </Form>
  );
}