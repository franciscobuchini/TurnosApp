/*
  src/components/views/SettingsBusinessView.tsx
  Vista de Ajustes (/admin/ajustes): Negocio, Seguridad y Horario del local,
  las 3 secciones que antes vivían en pantallas separadas, en una sola
  pantalla. ViewLayout apila left/right en una sola columna (ver
  ViewLayout.tsx), así que acá se sigue el mismo patrón que
  FormAddEntity/FormAddService: un único Form con los campos uno debajo del
  otro (de a pares cortos en grid de 2 columnas) y el horario aparte, como
  `right`, igual que WeekSchedule en EntityView.
*/

import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, Copy, MapPin } from 'lucide-react';
import ViewLayout from '../layout/ViewLayout';
import Form from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import PhotoUrlPicker from '@/components/ui/photo-url-picker';
import AddButton from '../buttons/AddButton';
import WeekSchedule from '../widgets/entityWidgets/WeekSchedule';
import LocationPickerDialog from '../widgets/LocationPickerDialog';
import { getBusiness, getOpeningHours, saveBusiness, saveOpeningHours } from '../../database/data';
import type { OpeningHoursEntry } from '../../database/types';
import { useUnsavedChanges } from '@/hooks/useUnsavedChanges';

interface BusinessDraft {
  name: string;
  imageUrl: string;
  url: string;
  location: string;
  latitude: number | null;
  longitude: number | null;
  whatsapp: string;
  instagram: string;
}

interface SecurityDraft {
  name: string;
  email: string;
  password: string;
  adminPin: string;
}

const TWO_COLUMN_GRID_CLASS = 'grid grid-cols-1 gap-4 sm:grid-cols-2';

const COLUMN_FORM_CLASS = 'flex w-full flex-col gap-6';

export default function SettingsBusinessView() {
  const navigate = useNavigate();
  const goBack = () => navigate('/admin');

  const business = getBusiness();

  const [copied, setCopied] = useState(false);

  const [draft, setDraft] = useState<BusinessDraft>({
    name: business.name ?? '',
    imageUrl: business.image ?? '',
    url: business.url ?? '',
    location: business.location ?? '',
    latitude: business.latitude ?? null,
    longitude: business.longitude ?? null,
    whatsapp: business.whatsapp ?? '',
    instagram: business.instagram ?? '',
  });

  const [locationPickerOpen, setLocationPickerOpen] = useState(false);

  const [securityDraft, setSecurityDraft] = useState<SecurityDraft>({
    name: business.managerName ?? '',
    email: business.email ?? '',
    password: business.password ?? '',
    adminPin: business.adminPin ?? '',
  });

  const [businessHours, setBusinessHours] = useState<OpeningHoursEntry[]>(() =>
    getOpeningHours(),
  );

  // Snapshot del estado tal como llegó, para saber si hay cambios sin
  // guardar (ver isDirty) — useRef con valor inicial sólo lo captura una
  // vez, en el primer render.
  const initialStateRef = useRef({ draft, securityDraft, businessHours });
  const isDirty =
    JSON.stringify({ draft, securityDraft, businessHours }) !== JSON.stringify(initialStateRef.current);

  const { setDirty } = useUnsavedChanges();
  useEffect(() => {
    setDirty(isDirty);
    return () => setDirty(false);
  }, [isDirty, setDirty]);

  const setValue = (key: keyof BusinessDraft) => (value: string) =>
    setDraft((prev) => ({ ...prev, [key]: value }));

  const setSecurityValue = (key: keyof SecurityDraft) => (value: string) =>
    setSecurityDraft((prev) => ({ ...prev, [key]: value }));

  const handleAdminPinChange = (value: string) => {
    const digits = value.replace(/\D/g, '').slice(0, 4);
    setSecurityDraft((prev) => ({ ...prev, adminPin: digits }));
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(`https://minube.site/${draft.url}`);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1500);
  };

  const handleLocationPicked = ({ latitude, longitude, address }: { latitude: number; longitude: number; address?: string }) => {
    setDraft((prev) => ({
      ...prev,
      latitude,
      longitude,
      location: address || prev.location,
    }));
  };

  const handleSave = () => {
    saveOpeningHours(businessHours);
    saveBusiness({
      ...getBusiness(),
      name: draft.name.trim(),
      image: draft.imageUrl,
      url: draft.url.trim(),
      location: draft.location.trim(),
      latitude: draft.latitude ?? undefined,
      longitude: draft.longitude ?? undefined,
      whatsapp: draft.whatsapp.trim(),
      instagram: draft.instagram.trim(),
      managerName: securityDraft.name.trim(),
      email: securityDraft.email.trim(),
      password: securityDraft.password,
      adminPin: securityDraft.adminPin,
    });
    goBack();
  };

  return (
    <>
    <ViewLayout
      title="Tu neogocio"
      left={
        <Form className={COLUMN_FORM_CLASS}>
          <Input
            label="Nombre del negocio"
            placeholder="Ej: Barbería Studio"
            value={draft.name}
            onChange={(e) => setValue('name')(e.target.value)}
          />

          <div className="flex items-end gap-2">
            <Input
              label="URL del negocio"
              prefix="minube.site/"
              placeholder="tu-negocio"
              value={draft.url}
              onChange={(e) => setValue('url')(e.target.value)}
              className="flex-1"
            />
            <Button
              type="button"
              variant="outline"
              onClick={handleCopyLink}
              aria-label="Copiar link"
              title="Copiar link"
              className="h-11 w-11 shrink-0 rounded-md p-0"
              icon={copied ? <Check size={16} /> : <Copy size={16} />}
            />
          </div>

          <div className="flex flex-col gap-4">
            <AddButton
              text="Seleccionar ubicación de tu negocio"
              icon={<MapPin size={16} />}
              onClick={() => setLocationPickerOpen(true)}
              className="w-full bg-primary text-black hover:bg-primary/70 hover:text-black"
            />
            <Input
              placeholder="Ciudad, dirección"
              value={draft.location}
              onChange={(e) => setValue('location')(e.target.value)}
            />
          </div>

          <div className={TWO_COLUMN_GRID_CLASS}>
            <Input
              label="WhatsApp del negocio"
              placeholder="+54 9 11 2345-6789"
              value={draft.whatsapp}
              onChange={(e) => setValue('whatsapp')(e.target.value)}
            />
            <Input
              label="Instagram del negocio"
              prefix="@"
              placeholder="barberiastudio"
              value={draft.instagram}
              onChange={(e) => setValue('instagram')(e.target.value)}
            />
          </div>

          <div className="flex flex-col gap-4">
            <Label>Imagen del negocio</Label>
            <PhotoUrlPicker
              value={draft.imageUrl}
              onChange={(url) => setValue('imageUrl')(url)}
              name={draft.name}
            />
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
        </Form>
      }
      right={<WeekSchedule title="Horario del local" value={businessHours} onChange={setBusinessHours} />}
      confirmText="Guardar"
      onCancel={goBack}
      onConfirm={handleSave}
    >
      <Button variant="link" to="/terminos" className="w-fit px-0 text-foreground">
        Términos y condiciones
      </Button>
    </ViewLayout>
    <LocationPickerDialog
      open={locationPickerOpen}
      onOpenChange={setLocationPickerOpen}
      initialPosition={draft.latitude != null && draft.longitude != null ? { latitude: draft.latitude, longitude: draft.longitude } : null}
      onConfirm={handleLocationPicked}
    />
    </>
  );
}
