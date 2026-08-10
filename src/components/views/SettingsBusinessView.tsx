/*
  src/components/views/SettingsBusinessView.tsx
  Vista de Ajustes > Negocio (/admin/ajustes): nombre del negocio, imagen
  (cargable desde el dispositivo), url y ubicación.
*/

import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ViewLayout from '../layout/ViewLayout';
import Form from '../interface/Form';
import Input from '../interface/Input';
import Box from '../interface/Box';
import Image from '../interface/Image';
import Button from '../interface/Button';
import CancelButton from '../buttons/CancelButton';
import ConfirmButton from '../buttons/ConfirmButton';
import { getBusiness, saveBusiness } from '../../database/data';

interface BusinessDraft {
  name: string;
  imageUrl: string;
  url: string;
  location: string;
}

export default function SettingsBusinessView() {
  const navigate = useNavigate();
  const goBack = () => navigate('/admin');

  const business = getBusiness();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [imageName, setImageName] = useState('');

  const [draft, setDraft] = useState<BusinessDraft>({
    name: business.name ?? '',
    imageUrl: business.image ?? '',
    url: business.url ?? '',
    location: business.location ?? '',
  });

  const setValue = (key: keyof BusinessDraft) => (value: string) =>
    setDraft((prev) => ({ ...prev, [key]: value }));

  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setDraft((prev) => ({ ...prev, imageUrl: String(reader.result ?? '') }));
      setImageName(file.name);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    setDraft((prev) => ({ ...prev, imageUrl: '' }));
    setImageName('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSave = () => {
    saveBusiness({
      ...getBusiness(),
      name: draft.name.trim(),
      image: draft.imageUrl,
      url: draft.url.trim(),
      location: draft.location.trim(),
    });
    goBack();
  };

  return (
    <ViewLayout
        title="Negocio"
        onBack={goBack}
        left={
          <Form className="flex flex-col gap-(--size-m)">
            <Input
              label="Nombre del negocio"
              placeholder="Ej: Barbería Studio"
              value={draft.name}
              onChange={(e) => setValue('name')(e.target.value)}
            />
            <div className="flex flex-col gap-(--size-s)">
              <span className="px-(--size-s) text-md text-neutral-300">
                Imagen del negocio
              </span>
              {draft.imageUrl ? (
                <div className="flex items-center gap-(--size-m)">
                  <Image
                    src={draft.imageUrl}
                    name={draft.name}
                    alt="Imagen del negocio"
                    className="h-(--size-4xl) w-(--size-4xl) shrink-0"
                  />
                  <span className="min-w-0 flex-1 truncate text-sm text-neutral-500">
                    {imageName}
                  </span>
                  <Button text="Quitar" onClick={handleRemoveImage} className="h-(--size-3xl) px-(--size-m)" />
                </div>
              ) : (
                <Button
                  text="Cargar imagen"
                  onClick={() => fileInputRef.current?.click()}
                  className="h-(--size-3xl) w-full rounded-2xl bg-neutral-600 text-neutral-50"
                />
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageSelect}
              />
            </div>
            <Input
              label="URL del negocio"
              placeholder="https://mituweb.com"
              value={draft.url}
              onChange={(e) => setValue('url')(e.target.value)}
            />
            <Input
              label="Ubicación"
              placeholder="Ciudad, dirección"
              value={draft.location}
              onChange={(e) => setValue('location')(e.target.value)}
            />
            <Box className="flex shrink-0 flex-row items-center gap-(--size-m) p-(--size-l)">
              <Image
                src={draft.imageUrl || undefined}
                name={draft.name}
                className="h-(--size-4xl) w-(--size-4xl) shrink-0 text-lg"
              />
              <div className="flex min-w-0 flex-col gap-(--size-2xs)">
                <h2 className="truncate text-lg text-white">{draft.name || 'Nombre del negocio'}</h2>
                <span className="truncate text-sm text-neutral-500">
                  {draft.url || 'https://tuweb.com'}
                </span>
                <span className="truncate text-sm text-neutral-500">
                  {draft.location || 'Ubicación'}
                </span>
              </div>
            </Box>
          </Form>
        }
        right={
          <div className="flex flex-1 flex-col items-center justify-center gap-2 rounded-4xl border-1 border-dashed border-neutral-500 text-neutral-400">
            <p>Próximamente...</p>
            <p>Ajustes avanzados</p>
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