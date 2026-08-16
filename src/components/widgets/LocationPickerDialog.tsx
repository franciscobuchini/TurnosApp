/*
  src/components/widgets/LocationPickerDialog.tsx
  Modal con mapa (Leaflet + tiles de CARTO, sin API key) para que el dueño
  del negocio ubique el pin exacto de su local. Se abre desde
  SettingsBusinessView. Al confirmar, devuelve lat/lng y —si el reverse
  geocoding de Nominatim responde— una dirección legible para precargar el
  campo "Ubicación".

  Los tiles de CARTO son imágenes de mosaico ya renderizadas (no vectoriales):
  no se puede elegir el color de cada elemento (calles, agua, etc.) por
  separado, pero sí alternar entre su set claro y oscuro según el tema de
  la app — mismo criterio que useTheme (data-theme en <html>).
*/

import { useEffect, useRef, useState } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L, { type LatLng } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapPin } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import AddButton from '@/components/buttons/AddButton';
import CancelButton from '@/components/buttons/CancelButton';
import ConfirmButton from '@/components/buttons/ConfirmButton';
import type { Theme } from '@/hooks/useTheme';
import { CARTO_ATTRIBUTION, CARTO_TILE_URL_BY_THEME, MAP_MARKER_ICON } from '@/lib/mapTiles';

// useTheme guarda su estado en un useState local a cada componente (no hay
// contexto global) — como este diálogo queda montado todo el tiempo (Radix
// sólo oculta el contenido), leer el tema una sola vez lo dejaría "pegado"
// al valor del primer render. Se observa el atributo data-theme directo.
function useDocumentTheme(): Theme {
  const [theme, setTheme] = useState<Theme>(
    () => (document.documentElement.getAttribute('data-theme') === 'light' ? 'light' : 'dark'),
  );

  useEffect(() => {
    const target = document.documentElement;
    const sync = () => setTheme(target.getAttribute('data-theme') === 'light' ? 'light' : 'dark');
    // Re-lee al montar: el useState de arriba puede haber corrido antes de
    // que useTheme (en el header) aplicara el atributo en su propio efecto.
    sync();
    const observer = new MutationObserver(sync);
    observer.observe(target, { attributes: true, attributeFilter: ['data-theme'] });
    return () => observer.disconnect();
  }, []);

  return theme;
}

const DEFAULT_CENTER: [number, number] = [-34.6037, -58.3816]; // Buenos Aires

export interface PickedLocation {
  latitude: number;
  longitude: number;
  address?: string;
}

interface LocationPickerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialPosition?: { latitude: number; longitude: number } | null;
  onConfirm: (location: PickedLocation) => void;
}

function ClickToPlacePin({ onPick }: { onPick: (latlng: LatLng) => void }) {
  useMapEvents({
    click(event) {
      onPick(event.latlng);
    },
  });
  return null;
}

// Nominatim devuelve display_name con toda la jerarquía administrativa
// (barrio, distrito, partido, provincia, código postal, país...) — de ahí
// se arma sólo "calle y altura, ciudad", que es lo que un dueño de negocio
// necesita mostrar.
function buildShortAddress(address: Record<string, string> | undefined): string | undefined {
  if (!address) return undefined;

  const street = [address.road, address.house_number].filter(Boolean).join(' ');
  const city = address.city || address.town || address.village || address.municipality || address.county;
  const parts = [street, city].filter(Boolean);

  return parts.length > 0 ? parts.join(', ') : undefined;
}

async function reverseGeocode(lat: number, lng: number): Promise<string | undefined> {
  try {
    const url = `https://nominatim.openstreetmap.org/reverse?format=json&addressdetails=1&lat=${lat}&lon=${lng}`;
    const response = await fetch(url, { headers: { Accept: 'application/json' } });
    if (!response.ok) return undefined;
    const data = await response.json();
    return buildShortAddress(data?.address) ?? (typeof data?.display_name === 'string' ? data.display_name : undefined);
  } catch {
    return undefined;
  }
}

export default function LocationPickerDialog({
  open,
  onOpenChange,
  initialPosition,
  onConfirm,
}: LocationPickerDialogProps) {
  const theme = useDocumentTheme();
  const mapRef = useRef<L.Map | null>(null);
  const [position, setPosition] = useState<{ lat: number; lng: number } | null>(
    initialPosition ? { lat: initialPosition.latitude, lng: initialPosition.longitude } : null,
  );
  const [locating, setLocating] = useState(false);
  const [confirming, setConfirming] = useState(false);

  const handleUseMyLocation = () => {
    if (!navigator.geolocation) return;
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const found = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setPosition(found);
        setLocating(false);
        mapRef.current?.flyTo(found, 16);
      },
      () => setLocating(false),
      { enableHighAccuracy: true, timeout: 10000 },
    );
  };

  const handleConfirm = async () => {
    if (!position) return;
    setConfirming(true);
    const address = await reverseGeocode(position.lat, position.lng);
    setConfirming(false);
    onConfirm({ latitude: position.lat, longitude: position.lng, address });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Ubicación de tu negocio</DialogTitle>
          <DialogDescription>Tocá el mapa para ubicar el pin en la dirección exacta.</DialogDescription>
        </DialogHeader>

        <div className="h-80 w-full overflow-hidden rounded-2xl border border-border">
          <MapContainer
            ref={mapRef}
            center={position ?? DEFAULT_CENTER}
            zoom={position ? 16 : 12}
            className="h-full w-full"
          >
            <TileLayer attribution={CARTO_ATTRIBUTION} url={CARTO_TILE_URL_BY_THEME[theme]} />
            <ClickToPlacePin onPick={(latlng) => setPosition({ lat: latlng.lat, lng: latlng.lng })} />
            {position ? <Marker position={position} icon={MAP_MARKER_ICON} /> : null}
          </MapContainer>
        </div>

        <DialogFooter className="flex-col items-stretch gap-3">
          <AddButton
            text={locating ? 'Buscando...' : 'Usar mi ubicación actual'}
            icon={<MapPin size={16} />}
            onClick={handleUseMyLocation}
            disabled={locating}
            className="w-fit"
          />
          <div className="flex justify-end gap-2">
            <CancelButton text="Cancelar" onClick={() => onOpenChange(false)} />
            <ConfirmButton
              text={confirming ? 'Confirmando...' : 'Confirmar ubicación'}
              onClick={handleConfirm}
              disabled={!position || confirming}
            />
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
