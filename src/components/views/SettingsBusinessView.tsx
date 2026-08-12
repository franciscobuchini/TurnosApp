/*
  src/components/views/SettingsBusinessView.tsx
  Vista de Ajustes (/admin/ajustes): Negocio + Seguridad a la izquierda,
  Horario del local a la derecha (columna propia para que la lista de días
  no fuerce scroll junto con el resto). Las 3 secciones que antes vivían en
  pantallas separadas (Negocio, Horarios, Seguridad) están acá, en una sola
  pantalla.
*/

import { useRef, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Plus, X } from 'lucide-react';
import ViewLayout from '../layout/ViewLayout';
import Form from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import WeekSchedule from '../widgets/entityWidgets/WeekSchedule';
import { getBusiness, getOpeningHours, saveBusiness, saveOpeningHours } from '../../database/data';
import type { OpeningHoursEntry } from '../../database/types';

interface BusinessDraft {
  name: string;
  imageUrl: string;
  url: string;
  location: string;
}

interface SecurityDraft {
  name: string;
  email: string;
  password: string;
  adminPin: string;
}

const TWO_COLUMN_GRID_CLASS = 'grid grid-cols-1 gap-4 sm:grid-cols-2';

const COLUMN_FORM_CLASS =
  'flex h-full min-h-0 flex-col gap-6 overflow-y-auto pr-1 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden';

export default function SettingsBusinessView() {
  const navigate = useNavigate();
  const goBack = () => navigate('/admin');

  const business = getBusiness();

  const fileInputRef = useRef<HTMLInputElement>(null);

  const [draft, setDraft] = useState<BusinessDraft>({
    name: business.name ?? '',
    imageUrl: business.image ?? '',
    url: business.url ?? '',
    location: business.location ?? '',
  });

  const [securityDraft, setSecurityDraft] = useState<SecurityDraft>({
    name: business.managerName ?? '',
    email: business.email ?? '',
    password: business.password ?? '',
    adminPin: business.adminPin ?? '',
  });

  const [businessHours, setBusinessHours] = useState<OpeningHoursEntry[]>(() =>
    getOpeningHours(),
  );

  const setValue = (key: keyof BusinessDraft) => (value: string) =>
    setDraft((prev) => ({ ...prev, [key]: value }));

  const setSecurityValue = (key: keyof SecurityDraft) => (value: string) =>
    setSecurityDraft((prev) => ({ ...prev, [key]: value }));

  const handleAdminPinChange = (value: string) => {
    const digits = value.replace(/\D/g, '').slice(0, 4);
    setSecurityDraft((prev) => ({ ...prev, adminPin: digits }));
  };

  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setDraft((prev) => ({ ...prev, imageUrl: String(reader.result ?? '') }));
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    setDraft((prev) => ({ ...prev, imageUrl: '' }));
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSave = () => {
    saveOpeningHours(businessHours);
    saveBusiness({
      ...getBusiness(),
      name: draft.name.trim(),
      image: draft.imageUrl,
      url: draft.url.trim(),
      location: draft.location.trim(),
      managerName: securityDraft.name.trim(),
      email: securityDraft.email.trim(),
      password: securityDraft.password,
      adminPin: securityDraft.adminPin,
    });
    goBack();
  };

  return (
    <ViewLayout
      title="Tu neogocio"
      left={
        <Form className={COLUMN_FORM_CLASS}>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 w-full">
            {/* Columna 1 */}
            <div className="flex flex-1 flex-col gap-4">
              <Input
                label="Nombre del negocio"
                placeholder="Ej: Barbería Studio"
                value={draft.name}
                onChange={(e) => setValue('name')(e.target.value)}
              />
              <Input
                label="URL del negocio"
                prefix="minube.site/"
                placeholder="tu-negocio"
                value={draft.url}
                onChange={(e) => setValue('url')(e.target.value)}
              />
              <Input
                label="Ubicación"
                placeholder="Ciudad, dirección"
                value={draft.location}
                onChange={(e) => setValue('location')(e.target.value)}
              />
            </div>

            {/* Columna 2 */}
            <div className="flex flex-col gap-3">
              <Label>Imagen del negocio</Label>
              <div
                onClick={() => {
                  if (!draft.imageUrl) {
                     fileInputRef.current?.click();
                  }
                }}
                className="group relative flex aspect-square h-55 items-center justify-center rounded-4xl border border-dashed border-border bg-card/30 overflow-hidden cursor-pointer hover:border-muted-foreground transition-colors"
              >
                {draft.imageUrl ? (
                  <>
                    <img
                      src={draft.imageUrl}
                      alt="Imagen del negocio"
                      className="h-full w-full object-cover rounded-4xl"
                    />
                    <div className="absolute inset-0 bg-background/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveImage();
                        }}
                        className="flex h-12 w-12 items-center justify-center rounded-full bg-muted text-foreground hover:bg-muted/80 transition-colors cursor-pointer"
                        aria-label="Quitar imagen"
                      >
                        <X size={24} />
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center text-muted-foreground">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted text-muted-foreground group-hover:bg-muted/80 group-hover:text-foreground transition-all">
                      <Plus size={24} />
                    </div>
                    <span className="mt-2 text-sm text-muted-foreground group-hover:text-foreground transition-colors">
                      Cargar imagen
                    </span>
                  </div>
                )}
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageSelect}
              />
            </div>
          </div>

          <div className={TWO_COLUMN_GRID_CLASS}>
            <Input
              label="Nombre del encargado"
              placeholder="Ej: Juan Pérez"
              value={securityDraft.name}
              onChange={(e) => setSecurityValue('name')(e.target.value)}
            />
            <Input
              label="Mail"
              type="email"
              placeholder="encargado@mail.com"
              value={securityDraft.email}
              onChange={(e) => setSecurityValue('email')(e.target.value)}
            />
          </div>
          <div className={TWO_COLUMN_GRID_CLASS}>
            <Input
              label="Contraseña"
              type="password"
              placeholder="••••••••"
              value={securityDraft.password}
              onChange={(e) => setSecurityValue('password')(e.target.value)}
            />
            <Input
              label="Pin de administrador"
              type="password"
              inputMode="numeric"
              placeholder="0000"
              maxLength={4}
              value={securityDraft.adminPin}
              onChange={(e) => handleAdminPinChange(e.target.value)}
            />
          </div>
          <Link
            to="/terminos"
            className="w-fit text-sm text-primary underline underline-offset-4 transition-colors hover:text-primary/80"
          >
            Términos y condiciones
          </Link>
        </Form>
      }
      right={
        <Form className={COLUMN_FORM_CLASS}>
          <WeekSchedule title="Horario del local" value={businessHours} onChange={setBusinessHours} />
        </Form>
      }
      confirmText="Guardar"
      onCancel={goBack}
      onConfirm={handleSave}
    />
  );
}
