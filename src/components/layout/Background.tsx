/*
  src/components/layout/Background.tsx
  Fondo de toda la app: negro con un resplandor celeste tenue en la esquina
  superior izquierda, desplazado ~10% de la pantalla hacia abajo desde la
  esquina. El blur es lo que lo hace leer como una luz suave y difusa en vez
  de un foco marcado.

  Se monta una sola vez en App.tsx, fixed y detrás de todo el contenido
  (-z-10). El wrapper de App.tsx tiene `relative isolate` para que este
  z-index negativo quede acotado a esa capa (si no, un elemento fixed pinta
  por encima del contenido estático sin importar el orden del DOM, y el
  glow terminaba tapando el sidebar). Layout.tsx sí necesita su propio
  fondo opaco (bg-background) porque cubre toda la pantalla y, si no,
  tapa el glow igual — el glow solo se ve en Home, que no tiene ese fondo.
*/

const BACKGROUND_CLASS = 'fixed inset-0 -z-10 overflow-hidden bg-black';

const GLOW_CLASS =
  'absolute -left-[20%] top-[10%] h-[55vw] w-[55vw] max-h-[640px] max-w-[640px] rounded-full bg-cyan-500 opacity-40 blur-[210px]';

export default function Background() {
  return (
    <div className={BACKGROUND_CLASS}>
      <div className={GLOW_CLASS} />
    </div>
  );
}
