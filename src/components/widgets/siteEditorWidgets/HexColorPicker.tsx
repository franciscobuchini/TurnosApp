/*
  src/components/widgets/siteEditorWidgets/HexColorPicker.tsx
  Selector de color hexadecimal construido con la UI de la app (nada de
  <input type="color"> ni presets): un cuadrado de saturación/brillo + una
  tira de tono, arrastrables, más un campo de texto para el hex a mano.

  h/s/v vive en estado propio (no se deriva del hex en cada render): en
  negro puro (v=0) o blanco puro (s=0) el hex no alcanza para reconstruir
  el tono — rgbToHsv devuelve h=0 siempre que r=g=b (delta=0), porque esa
  información ya no existe en el RGB resultante. Derivarlo del hex en cada
  render hacía que, apenas el usuario tocaba negro o blanco, el tono
  quedara forzado a 0 (rojo) sin forma de recuperarlo: mover el slider de
  tono no cambiaba nada visible (v=0 sigue dando negro sin importar el
  tono) y volver a subir el brillo sólo revelaba rojo, nunca el color que
  tenía antes. Con h/s en estado propio, esa elección se conserva mientras
  se arrastra, aunque de pasada por brillo/saturación 0.

  Sólo se resincroniza desde `value` cuando ese hex no coincide con lo que
  el estado interno ya representa (cambio externo: tipeado a mano, reset,
  otro preset) — así sigue siendo imposible que el thumb se desincronice
  del valor real. Un solo componente reutilizado para los 3 colores del
  sitio (fondo, botones, títulos) — ver SitePersonalizationSidebar.
*/

import { useEffect, useRef, useState } from 'react';
import { Input } from '@/components/ui/input';
import { hexToRgb, hsvToRgb, isHexColor, rgbToHex, rgbToHsv } from '@/site/design/colorUtils';

interface HexColorPickerProps {
  value: string;
  onChange: (hex: string) => void;
}

type DragTarget = 'sv' | 'hue' | null;
type Hsv = [number, number, number];

export default function HexColorPicker({ value, onChange }: HexColorPickerProps) {
  const safeHex = isHexColor(value) ? value : '#000000';

  const [hsv, setHsv] = useState<Hsv>(() => rgbToHsv(...hexToRgb(safeHex)));
  const [hue, saturation, brightness] = hsv;

  // Resincroniza sólo si `value` cambió por afuera de este componente (no
  // es el eco de un onChange propio) — evita el loop y preserva h/s en los
  // puntos degenerados mientras el cambio viene de acá mismo.
  useEffect(() => {
    const echo = rgbToHex(hsvToRgb(...hsv));
    if (echo.toLowerCase() !== safeHex.toLowerCase()) {
      setHsv(rgbToHsv(...hexToRgb(safeHex)));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [safeHex]);

  const svRef = useRef<HTMLDivElement>(null);
  const hueRef = useRef<HTMLDivElement>(null);
  const [dragging, setDragging] = useState<DragTarget>(null);

  const updateFromSV = (clientX: number, clientY: number) => {
    const rect = svRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = Math.min(Math.max(clientX - rect.left, 0), rect.width);
    const y = Math.min(Math.max(clientY - rect.top, 0), rect.height);
    const nextSaturation = x / rect.width;
    const nextBrightness = 1 - y / rect.height;
    setHsv([hue, nextSaturation, nextBrightness]);
    onChange(rgbToHex(hsvToRgb(hue, nextSaturation, nextBrightness)));
  };

  const updateFromHue = (clientX: number) => {
    const rect = hueRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = Math.min(Math.max(clientX - rect.left, 0), rect.width);
    const nextHue = (x / rect.width) * 360;
    setHsv([nextHue, saturation, brightness]);
    onChange(rgbToHex(hsvToRgb(nextHue, saturation, brightness)));
  };

  useEffect(() => {
    if (!dragging) return;

    const handleMove = (event: PointerEvent) => {
      if (dragging === 'sv') updateFromSV(event.clientX, event.clientY);
      else updateFromHue(event.clientX);
    };
    const handleUp = () => setDragging(null);

    window.addEventListener('pointermove', handleMove);
    window.addEventListener('pointerup', handleUp);
    return () => {
      window.removeEventListener('pointermove', handleMove);
      window.removeEventListener('pointerup', handleUp);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dragging, hue, saturation, brightness]);

  return (
    <div className="flex flex-col gap-3">
      <div
        ref={svRef}
        onPointerDown={(event) => {
          setDragging('sv');
          updateFromSV(event.clientX, event.clientY);
        }}
        className="relative h-36 w-full touch-none cursor-crosshair rounded-md select-none"
        style={{
          background: `linear-gradient(to top, #000, transparent), linear-gradient(to right, #fff, transparent), hsl(${hue}, 100%, 50%)`,
        }}
      >
        <span
          className="absolute size-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white shadow-[0_0_0_1px_rgba(0,0,0,0.4)]"
          style={{ left: `${saturation * 100}%`, top: `${(1 - brightness) * 100}%`, background: safeHex }}
        />
      </div>

      <div
        ref={hueRef}
        onPointerDown={(event) => {
          setDragging('hue');
          updateFromHue(event.clientX);
        }}
        className="relative h-3.5 w-full touch-none cursor-pointer rounded-full select-none"
        style={{ background: 'linear-gradient(to right, #f00, #ff0, #0f0, #0ff, #00f, #f0f, #f00)' }}
      >
        <span
          className="absolute top-1/2 size-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white shadow-[0_0_0_1px_rgba(0,0,0,0.4)]"
          style={{ left: `${(hue / 360) * 100}%`, background: `hsl(${hue}, 100%, 50%)` }}
        />
      </div>

      <div className="flex items-center gap-2">
        <span
          aria-hidden
          className="size-9 shrink-0 rounded-md border border-border"
          style={{ background: safeHex }}
        />

        <Input
          value={value.replace(/^#/, '')}
          onChange={(event) => {
            const digits = event.target.value.replace(/[^0-9a-fA-F]/g, '').slice(0, 6);
            onChange(`#${digits}`);
          }}
          prefix="#"
          inputClassName="font-mono uppercase"
          className="flex-1"
        />
      </div>
    </div>
  );
}
