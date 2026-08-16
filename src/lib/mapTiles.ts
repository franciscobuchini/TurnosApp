/*
  src/lib/mapTiles.ts
  Constantes de Leaflet/CARTO compartidas entre el selector de ubicación del
  admin (LocationPickerDialog) y el mapa de sólo lectura del sitio público
  (SiteMap) — mismos tiles, mismo ícono de pin, un solo lugar si cambian.
*/

import L from 'leaflet';

export const CARTO_ATTRIBUTION =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>';

export const CARTO_TILE_URL_BY_THEME = {
  light: 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
  dark: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
} as const;

// Iconos default de Leaflet servidos desde CDN: el bundler no resuelve los
// paths relativos que trae el paquete, así que se apunta directo a unpkg.
export const MAP_MARKER_ICON = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});
