/*
  src/site/components/SiteMap.tsx
  Mapa de sólo lectura (Leaflet + tiles CARTO) para mostrar el pin del
  negocio en el sitio público. El set de tiles (claro/oscuro) se elige según
  la luminancia del color de fondo del sitio (config.backgroundColor) — el
  sitio público tiene su propia paleta, elegida en Personalización, sin
  relación con el tema del panel admin.
*/

import { MapContainer, TileLayer, Marker } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { twMerge } from 'tailwind-merge';
import { CARTO_ATTRIBUTION, CARTO_TILE_URL_BY_THEME, MAP_MARKER_ICON } from '@/lib/mapTiles';
import { getRelativeLuminance } from '../design/colorUtils';

interface SiteMapProps {
  latitude: number;
  longitude: number;
  backgroundColor: string;
  className?: string;
}

export default function SiteMap({ latitude, longitude, backgroundColor, className }: SiteMapProps) {
  const isDark = getRelativeLuminance(backgroundColor) < 0.5;
  const position: [number, number] = [latitude, longitude];

  return (
    <MapContainer
      center={position}
      zoom={16}
      scrollWheelZoom={false}
      // isolate: los panes/controles internos de Leaflet usan z-index hasta
      // 1000 — sin esto, quedan por encima del header sticky del sitio
      // (z-20) al hacer scroll. Aísla esos z-index en su propio stacking
      // context en vez de competir con el resto de la página.
      className={twMerge('isolate', className)}
    >
      <TileLayer attribution={CARTO_ATTRIBUTION} url={CARTO_TILE_URL_BY_THEME[isDark ? 'dark' : 'light']} />
      <Marker position={position} icon={MAP_MARKER_ICON} />
    </MapContainer>
  );
}
