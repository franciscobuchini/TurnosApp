/*
  src/components/views/SettingsBusinessView.tsx
  Vista de Ajustes > Negocio (/admin/ajustes): nombre del negocio, imagen
  (cargable desde el dispositivo), url y ubicación.
*/

import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, X } from 'lucide-react';
import ViewLayout from '../layout/ViewLayout';
import ComingSoonPanel from '../layout/ComingSoonPanel';
import Form from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    setDraft((prev) => ({ ...prev, imageUrl: '' }));
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
        left={
          <Form className="grid grid-cols-1 gap-6 md:grid-cols-2 w-full">
            {/* Columna 1 */}
            <div className="flex flex-col gap-4">
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
            <div className="flex flex-col gap-3 h-full">
              <Label>Imagen del negocio</Label>
              <div
                onClick={() => {
                  if (!draft.imageUrl) {
                    fileInputRef.current?.click();
                  }
                }}
                className="group relative flex aspect-square w-full items-center justify-center rounded-4xl border-2 border-dashed border-neutral-700 bg-neutral-900/30 overflow-hidden cursor-pointer hover:border-neutral-500 transition-colors"
              >
                {draft.imageUrl ? (
                  <>
                    <img
                      src={draft.imageUrl}
                      alt="Imagen del negocio"
                      className="h-full w-full object-cover rounded-4xl"
                    />
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveImage();
                        }}
                        className="flex h-12 w-12 items-center justify-center rounded-full bg-neutral-800 text-white hover:bg-neutral-700 transition-colors cursor-pointer"
                        aria-label="Quitar imagen"
                      >
                        <X size={24} />
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center text-neutral-400">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-neutral-800 text-neutral-400 group-hover:bg-neutral-700 group-hover:text-white transition-all">
                      <Plus size={24} />
                    </div>
                    <span className="mt-2 text-sm text-neutral-500 group-hover:text-neutral-400 transition-colors">
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
          </Form>
        }
        right={<ComingSoonPanel subtitle="Ajustes avanzados" />}
        confirmText="Guardar"
        onCancel={goBack}
        onConfirm={handleSave}
      />
  );
}