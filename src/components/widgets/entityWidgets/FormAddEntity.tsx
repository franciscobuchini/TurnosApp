import { type ChangeEvent, type FocusEvent, type MouseEvent, useState } from 'react';
import Form from '../../interface/Form';
import Input from '../../interface/Input';
import getInitials from '../../../functions/getInitials';
import ServiceSelector from './ServiceSelector';

const CONTAINER_CLASS = 'flex h-full w-full flex-1 flex-col rounded-4xl';
const LAYOUT_CLASS = 'flex flex-1 flex-col gap-(--size-m) md:flex-row';
const LEFT_PANEL_CLASS = 'flex flex-1 flex-col justify-center';
const RIGHT_PANEL_CLASS = 'flex flex-1 flex-col items-center justify-center';
const FORM_CLASS = 'flex flex-col gap-(--size-xl) p-(--size-m)';
const TWO_COLUMN_GRID_CLASS = 'grid grid-cols-1 gap-(--size-m) sm:grid-cols-2';

const PREVIEW_CARD_CLASS = 'flex w-full max-w-sm flex-col items-center rounded-3xl border border-neutral-200 bg-white p-(--size-l) shadow-sm';
const INITIALS_BADGE_CLASS = 'flex h-16 w-16 items-center justify-center rounded-full bg-(--primary-01) text-xl font-semibold text-neutral-900';
const PREVIEW_CONTENT_CLASS = 'mt-4 text-center';
const PREVIEW_NAME_CLASS = 'text-base font-semibold text-neutral-900';
const PREVIEW_ROLE_CLASS = 'mt-1 text-sm text-neutral-600';

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

export default function FormAddEntity() {
  const [memberName, setMemberName] = useState('');
  const [role, setRole] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const initials = getInitials(memberName);

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
    <div className={CONTAINER_CLASS}>
      <div className={LAYOUT_CLASS}>
        <div className={LEFT_PANEL_CLASS}>
          <Form className={FORM_CLASS}>
            <Input
              label="Nombre y Apellido"
              name="memberName"
              placeholder="Juan Pérez"
              value={memberName}
              onChange={handleNameChange}
            />

            <Input
              label="Rol"
              name="role"
              placeholder="Peluquero"
              value={role}
              onChange={handleRoleChange}
            />

            <div className={TWO_COLUMN_GRID_CLASS}>
              <Input
                label="WhatsApp"
                name="phone"
                type="tel"
                value={phone}
                defaultValue={whatsappPrefix}
                onChange={(event) => setPhone(event.target.value)}
                onFocus={handleWhatsAppFocus}
                onMouseUp={handleWhatsAppMouseUp}
              />

              <Input
                label="Email"
                name="email"
                type="email"
                optional
                placeholder="miembro@ejemplo.com"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
              />
            </div>

            <ServiceSelector value={selectedServices} onChange={setSelectedServices} />
          </Form>
        </div>

        <div className={RIGHT_PANEL_CLASS}>
          <div className={PREVIEW_CARD_CLASS}>
            <div className={INITIALS_BADGE_CLASS}>{initials || 'EM'}</div>
            <div className={PREVIEW_CONTENT_CLASS}>
              <p className={PREVIEW_NAME_CLASS}>{memberName || 'Nombre del miembro'}</p>
              <p className={PREVIEW_ROLE_CLASS}>{role || 'Rol del miembro'}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
