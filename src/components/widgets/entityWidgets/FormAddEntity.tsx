import { type ChangeEvent, useEffect, useState } from 'react';
import Form from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import PhotoUrlPicker from '@/components/ui/photo-url-picker';
import formatCapitalizedWords from '@/utils/formatCapitalizedWords';
import WhatsAppInput, { WHATSAPP_PREFIX } from '../WhatsAppInput';
import ServiceSelector from './ServiceSelector';

interface FormAddEntityProps {
  mode?: 'create' | 'view' | 'edit';
  initialValues?: {
    name?: string;
    role?: string;
    phone?: string;
    email?: string;
    photo?: string;
    services?: string[];
  };
  onValuesChange?: (values: {
    name: string;
    role: string;
    phone: string;
    email: string;
    photo: string;
    services: string[];
  }) => void;
  onValidityChange?: (isValid: boolean) => void;
}

const FORM_CLASS = 'flex flex-col gap-6';
const TWO_COLUMN_GRID_CLASS = 'grid grid-cols-1 gap-4 sm:grid-cols-2';
const FIELD_GROUP_CLASS = 'flex flex-col gap-4';

export default function FormAddEntity({ mode = 'create', initialValues, onValuesChange, onValidityChange }: FormAddEntityProps) {
  const [memberName, setMemberName] = useState(initialValues?.name ?? '');
  const [role, setRole] = useState(initialValues?.role ?? '');
  const [phone, setPhone] = useState(initialValues?.phone ?? '');
  const [email, setEmail] = useState(initialValues?.email ?? '');
  const [photo, setPhoto] = useState(initialValues?.photo ?? '');
  const [selectedServices, setSelectedServices] = useState<string[]>(initialValues?.services ?? []);
  const readOnly = mode === 'view';

  useEffect(() => {
    onValuesChange?.({
      name: memberName,
      role,
      phone,
      email,
      photo,
      services: selectedServices,
    });
  }, [memberName, role, phone, email, photo, selectedServices, onValuesChange]);

  const isFormValid = Boolean(memberName.trim() && role.trim() && phone.replace(WHATSAPP_PREFIX, '').trim());

  useEffect(() => {
    onValidityChange?.(isFormValid);
  }, [isFormValid, onValidityChange]);

  const handleNameChange = (event: ChangeEvent<HTMLInputElement>) => {
    setMemberName(formatCapitalizedWords(event.target.value));
  };

  const handleRoleChange = (event: ChangeEvent<HTMLInputElement>) => {
    setRole(formatCapitalizedWords(event.target.value));
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
        <WhatsAppInput name="phone" value={phone} onChange={setPhone} readOnly={readOnly} />

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

      <div className={FIELD_GROUP_CLASS}>
        <Label>Foto de perfil</Label>

        <PhotoUrlPicker value={photo} onChange={setPhoto} name={memberName} disabled={readOnly} />
      </div>

      <ServiceSelector value={selectedServices} onChange={setSelectedServices} disabled={readOnly} showOnlySelected={readOnly} />
    </Form>
  );
}