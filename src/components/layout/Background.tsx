/*
  src/components/layout/Background.tsx

  Fondo global de la aplicación.

  - Glows ambientales estáticos.
  - Grid radial sutil.
  - Órbitas asimétricas.
  - Intensidad diferenciada para light/dark.
  - Sin animaciones.
*/

const BACKGROUND_CLASS =
  'fixed inset-0 -z-10 overflow-hidden bg-(--color-bg)';

const GRID_CLASS =
  'absolute inset-0 opacity-[0.075] dark:opacity-[0.085] [background-image:linear-gradient(to_right,var(--palette-03)_1px,transparent_1px),linear-gradient(to_bottom,var(--palette-03)_1px,transparent_1px)] [background-size:72px_72px] [mask-image:radial-gradient(ellipse_at_center,black_0%,transparent_72%)]';

/* Los mismos colores pastel se ven bastante más apagados sobre el fondo
   claro (#f8f8f8) que sobre el oscuro (#0a0a0a) a igual opacidad —el
   contraste contra blanco es mucho menor—, así que el valor base (claro)
   de cada glow queda más alto que el de dark:, al revés de lo que se
   podría esperar. */
const GLOW_CYAN_CLASS =
  'absolute -left-[18%] -top-[25%] h-[55vw] w-[55vw] max-h-[750px] max-w-[750px] rounded-full bg-(--palette-03) opacity-[0.55] dark:opacity-[0.28] blur-[145px]';

const GLOW_PURPLE_CLASS =
  'absolute -bottom-[35%] left-[15%] h-[50vw] w-[50vw] max-h-[700px] max-w-[700px] rounded-full bg-(--palette-02) opacity-[0.45] dark:opacity-[0.20] blur-[155px]';

const GLOW_LIME_CLASS =
  'absolute -right-[22%] top-[20%] h-[50vw] w-[50vw] max-h-[700px] max-w-[700px] rounded-full bg-(--palette-01) opacity-[0.36] dark:opacity-[0.15] blur-[155px]';

const AMBIENT_CLASS =
  'absolute inset-[-20%] opacity-[0.16] dark:opacity-[0.07] [background-image:radial-gradient(circle_at_20%_20%,var(--palette-03)_0,transparent_25%),radial-gradient(circle_at_80%_70%,var(--palette-02)_0,transparent_25%),radial-gradient(circle_at_70%_30%,var(--palette-01)_0,transparent_20%)]';

const LIGHT_AMBIENT_CLASS =
  'absolute -left-[8%] -top-[8%] h-[420px] w-[420px] rounded-full bg-(--palette-03) opacity-[0.26] dark:opacity-0 blur-[80px]';

const LIGHT_SECONDARY_CLASS =
  'absolute -right-[10%] top-[35%] h-[380px] w-[380px] rounded-full bg-(--palette-01) opacity-[0.20] dark:opacity-0 blur-[90px]';


export default function Background() {
  return (
    <div className={BACKGROUND_CLASS}>
      <div className={GRID_CLASS} />

      <div className={AMBIENT_CLASS} />

      <div className={LIGHT_AMBIENT_CLASS} />
      <div className={LIGHT_SECONDARY_CLASS} />

      <div className={GLOW_CYAN_CLASS} />
      <div className={GLOW_PURPLE_CLASS} />
      <div className={GLOW_LIME_CLASS} />
    </div>
  );
}