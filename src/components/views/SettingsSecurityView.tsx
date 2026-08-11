/*
  src/components/views/SettingsSecurityView.tsx
  Vista de Ajustes > Seguridad: nombre del encargado, mail y contraseña.
*/

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ViewLayout from '../layout/ViewLayout';
import ComingSoonPanel from '../layout/ComingSoonPanel';
import Form from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { getBusiness, saveBusiness } from '../../database/data';

const TWO_COLUMN_GRID_CLASS = 'grid grid-cols-1 gap-4 sm:grid-cols-2';

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
        left={
          <Form className="flex flex-col gap-4">
            <div className={TWO_COLUMN_GRID_CLASS}>
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
            </div>
            <div className={TWO_COLUMN_GRID_CLASS}>
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
            </div>
          </Form>
        }
        right={<ComingSoonPanel subtitle="Funciones de seguridad avanzada" />}
        confirmText="Guardar"
        onCancel={goBack}
        onConfirm={handleSave}
      />
  );
}