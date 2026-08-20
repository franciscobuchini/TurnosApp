/*
  src/components/ui/photo-url-picker.tsx
  Selector de foto por URL: un input para pegar el link + un botón que
  alterna entre "Cargar" (lo tipeado todavía no se aplicó) y "Quitar" (ya
  hay una foto cargada) — sin backend de archivos en esta app, la URL es
  la única forma real de tener una foto propia sin guardar binarios en
  localStorage.

  La preview sólo se actualiza al tocar "Cargar", no en cada tecla — así no
  parpadea con cada letra tipeada mientras se termina de pegar el link. Si
  se edita el link después de haber cargado una foto, el botón vuelve solo
  a "Cargar" (lo tipeado ya no coincide con `value`, lo efectivamente
  cargado) en vez de quedarse en "Quitar" mostrando una foto vieja.
*/

import { useEffect, useState } from 'react';
import { Upload, X } from 'lucide-react';
import { Input } from './input';
import { Button } from './button';
import Image from './image';

interface PhotoUrlPickerProps {
  value: string;
  onChange: (url: string) => void;
  /** Nombre para las iniciales del preview si la URL no carga ninguna
      imagen (mismo fallback que Image en el resto de la app). */
  name?: string;
  disabled?: boolean;
}

export default function PhotoUrlPicker({ value, onChange, name, disabled = false }: PhotoUrlPickerProps) {
  const [draftUrl, setDraftUrl] = useState(value);

  // Si `value` cambia desde afuera (ej. se pasa a editar otra entidad), el
  // input tiene que reflejar ese valor nuevo, no seguir mostrando lo que
  // había tipeado para la entidad anterior.
  useEffect(() => {
    setDraftUrl(value);
  }, [value]);

  const isLoaded = value.trim() !== '' && draftUrl.trim() === value.trim();

  const handleAction = () => {
    if (isLoaded) {
      setDraftUrl('');
      onChange('');
      return;
    }
    onChange(draftUrl.trim());
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <Input
          placeholder="Link de la imagen"
          value={draftUrl}
          onChange={(event) => setDraftUrl(event.target.value)}
          disabled={disabled}
          className="flex-1"
        />
        <Button
          type="button"
          variant={isLoaded ? 'outline' : 'default'}
          size="icon-lg"
          icon={isLoaded ? <X size={18} /> : <Upload size={18} />}
          aria-label={isLoaded ? 'Quitar' : 'Cargar'}
          title={isLoaded ? 'Quitar' : 'Cargar'}
          onClick={handleAction}
          disabled={disabled || (!isLoaded && !draftUrl.trim())}
          className="h-11 w-11 shrink-0"
        />
      </div>

      {value.trim() && (
        <Image src={value} name={name} className="h-20 w-20 shrink-0 rounded-2xl" />
      )}
    </div>
  );
}
