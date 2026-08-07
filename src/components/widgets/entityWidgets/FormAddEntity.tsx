import { type ChangeEvent, type FocusEvent, type MouseEvent, useEffect, useRef, useState } from 'react';
import { ImageUp, X } from 'lucide-react';
import Form from '../../interface/Form';
import Image from '../../interface/Image';
import Input from '../../interface/Input';
import getInitials from '../../../functions/getInitials';
import ServiceSelector from './ServiceSelector';
import Button from '../../interface/Button';

interface FormAddEntityProps {
  mode?: 'create' | 'view' | 'edit';
  initialValues?: {
    name?: string;
    role?: string;
    phone?: string;
    email?: string;
    services?: string[];
    photo?: string;
  };
  onValuesChange?: (values: {
    name: string;
    role: string;
    phone: string;
    email: string;
    services: string[];
    photo?: string;
  }) => void;
  onValidityChange?: (isValid: boolean) => void;
}

const FORM_CLASS = 'flex flex-col gap-(--size-xl) p-(--size-m)';
const TWO_COLUMN_GRID_CLASS = 'grid grid-cols-1 gap-(--size-m) sm:grid-cols-2';
const FIELD_GROUP_CLASS = 'flex flex-col gap-2';
const FIELD_LABEL_CLASS = 'px-(--size-m) text-sm font-medium text-neutral-700';
const AVATAR_FIELD_CLASS = 'flex items-center gap-(--size-m) px-(--size-m)';
const AVATAR_IMAGE_CLASS = 'h-(--size-4xl) w-(--size-4xl) text-xl';
const AVATAR_WRAPPER_CLASS = 'group relative inline-block rounded-full';
const AVATAR_REMOVE_BUTTON_CLASS =
  'absolute inset-0 flex items-center justify-center rounded-full bg-black/30 text-white opacity-0 transition-opacity group-hover:opacity-100 focus:opacity-100 focus:outline-none';
const AVATAR_INPUT_CLASS = 'sr-only';
const BUTTON_UPLOAD_CLASS = 'flex items-center gap-(--size-s) px-(--size-xs) bg-transparent text-sm text-neutral-600 focus:outline-none focus:ring-offset-0';

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
  const [photoSrc, setPhotoSrc] = useState<string | undefined>(initialValues?.photo);
  const photoInputRef = useRef<HTMLInputElement>(null);
  const imageName = getInitials(memberName) ? memberName : 'Equipo Miembro';
  const readOnly = mode === 'view';

  useEffect(() => {
    return () => {
      if (photoSrc) {
        URL.revokeObjectURL(photoSrc);
      }
    };
  }, [photoSrc]);

  useEffect(() => {
    onValuesChange?.({
      name: memberName,
      role,
      phone,
      email,
      services: selectedServices,
      photo: photoSrc,
    });
  }, [memberName, role, phone, email, selectedServices, photoSrc, onValuesChange]);

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

  const handlePhotoChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setPhotoSrc((current) => {
      if (current) {
        URL.revokeObjectURL(current);
      }

      return URL.createObjectURL(file);
    });
  };

  const handleRemovePhoto = () => {
    setPhotoSrc((current) => {
      if (current) {
        URL.revokeObjectURL(current);
      }
      return undefined;
    });

    if (photoInputRef.current) {
      photoInputRef.current.value = '';
    }
  };

  return (
    <Form className={FORM_CLASS}>
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

      <div className={FIELD_GROUP_CLASS}>
        <p className={FIELD_LABEL_CLASS}>Imagen de perfil</p>
        <div className={AVATAR_FIELD_CLASS}>
          <div className={AVATAR_WRAPPER_CLASS}>
            <Image
              src={photoSrc}
              name={imageName}
              className={AVATAR_IMAGE_CLASS}
            />
            {photoSrc && !readOnly && (
              <button
                type="button"
                className={AVATAR_REMOVE_BUTTON_CLASS}
                onClick={handleRemovePhoto}
                aria-label="Eliminar foto"
              >
                <X size="var(--size-m)" />
              </button>
            )}
          </div>
          {!readOnly && (
            <>
              <Button type="button" className={BUTTON_UPLOAD_CLASS} onClick={() => photoInputRef.current?.click()}>
                <ImageUp size="var(--size-m)" />
                o cargar una imagen...
              </Button>
              <input
                ref={photoInputRef}
                className={AVATAR_INPUT_CLASS}
                name="photo"
                type="file"
                accept="image/*"
                onChange={handlePhotoChange}
              />
            </>
          )}
        </div>
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

      <ServiceSelector value={selectedServices} onChange={setSelectedServices} disabled={readOnly} />
    </Form>
  );
}