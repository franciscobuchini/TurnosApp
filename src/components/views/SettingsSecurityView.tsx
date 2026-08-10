/*
  src/components/views/SettingsSecurityView.tsx
  Vista de Ajustes > Seguridad: nombre del encargado, mail y contraseña.
*/

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ViewLayout from '../layout/ViewLayout';
import Form from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import CancelButton from '../buttons/CancelButton';
import ConfirmButton from '../buttons/ConfirmButton';
import { getBusiness, saveBusiness } from '../../database/data';

interface SecurityDraft {
  name: string;
  email: string;
  password: string;
  adminPin: string;
}

export default function SettingsSecurityView() {
  const navigate = useNavigate();
  const goBack = () => navigate('/admin');

  const business = getBusiness();

  const [draft, setDraft] = useState<SecurityDraft>({
    name: business.managerName ?? '',
    email: business.email ?? '',
    password: business.password ?? '',
    adminPin: business.adminPin ?? '',
  });

  const setValue = (key: keyof SecurityDraft) => (value: string) =>
    setDraft((prev) => ({ ...prev, [key]: value }));

  const handleAdminPinChange = (value: string) => {
    const digits = value.replace(/\D/g, '').slice(0, 4);
    setDraft((prev) => ({ ...prev, adminPin: digits }));
  };

  const handleSave = () => {
    saveBusiness({
      ...getBusiness(),
      managerName: draft.name.trim(),
      email: draft.email.trim(),
      password: draft.password,
      adminPin: draft.adminPin,
    });
    goBack();
  };

  return (
    <ViewLayout
      title="Seguridad"
      onBack={goBack}
        left={
          <Form className="flex flex-col gap-4">
            <Input
              label="Nombre del encargado"
              placeholder="Ej: Juan Pérez"
              value={draft.name}
              onChange={(e) => setValue('name')(e.target.value)}
            />
            <Input
              label="Mail"
              type="email"
              placeholder="encargado@mail.com"
              value={draft.email}
              onChange={(e) => setValue('email')(e.target.value)}
            />
            <Input
              label="Contraseña"
              type="password"
              placeholder="••••••••"
              value={draft.password}
              onChange={(e) => setValue('password')(e.target.value)}
            />
            <Input
              label="Pin de administrador"
              type="password"
              inputMode="numeric"
              placeholder="0000"
              maxLength={4}
              value={draft.adminPin}
              onChange={(e) => handleAdminPinChange(e.target.value)}
            />
          </Form>
        }
        right={
          <div className="flex flex-1 flex-col items-center justify-center gap-2 rounded-4xl border-1 border-dashed border-neutral-500 text-neutral-400">
            <p>Próximamente...</p>
            <p>Funciones de seguridad avanzada</p>
          </div>
        }
        footer={
          <>
            <CancelButton onClick={goBack} text="Cancelar" />
            <ConfirmButton onClick={handleSave} text="Guardar" />
          </>
        }
      />
  );
}