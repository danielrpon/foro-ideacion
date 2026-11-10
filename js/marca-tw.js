/* Identidad Freaknerd v2 (manual de marca v2.1, §4 y §12) aplicada a la paleta de Tailwind.
   Se carga justo después de vendor/tailwind.js: así todas las clases existentes (bg-gray-100, text-blue-700,
   border-emerald-500…) caen en la paleta de marca sin tocar cada plantilla.
   - gris → pizarra (texto), piedra oscura (texto secundario), piedra y filete (líneas), crema 2 (rellenos)
   - verde/azul/morado/índigo/teal/rosa → pizarra (tinta); el azul de marca queda solo como susurro (fn-azul)
   - rojo/ámbar/naranja → naranja texto #B83A12 (texto) y naranja #FF4A1C (borde): atención, siempre con palabra
   - sin radio de borde y sin sombras (esquinas rectas, filetes) */
(function () {
  var PZ = '#2C312E', CR = '#F4EFE6', CR2 = '#E9E3D7', PO = '#4A504C', PI = '#656A66', RG = '#CCCAC2', RG2 = '#DDD8CC', NA = '#FF4A1C', NT = '#B83A12', NTI = '#FBD9CC';
  var tinta = { 50: CR2, 100: RG2, 200: RG, 300: PI, 400: PI, 500: PZ, 600: PZ, 700: PZ, 800: PZ, 900: PZ, 950: PZ };
  var atencion = { 50: CR, 100: CR, 200: NA, 300: NA, 400: NA, 500: NT, 600: NT, 700: NT, 800: NT, 900: NT, 950: NT };
  var gris = { 50: CR2, 100: CR2, 200: RG2, 300: RG, 400: PO, 500: PO, 600: PO, 700: PZ, 800: PZ, 900: PZ, 950: PZ };
  var verde = Object.assign({}, tinta, { 300: RG, 400: CR });   /* emerald-400 se usaba como texto sobre fondo oscuro: ahora es crema */
  tailwind.config = {
    theme: {
      extend: {
        colors: { white: CR, black: PZ, gray: gris, slate: gris, zinc: gris, neutral: gris, stone: gris, emerald: verde, green: tinta, lime: tinta, teal: tinta, cyan: tinta, sky: tinta, blue: tinta, indigo: tinta, violet: tinta, purple: tinta, fuchsia: tinta, pink: tinta, rose: tinta, red: atencion, orange: atencion, amber: atencion, yellow: atencion,
          fn: { crema: CR, 'crema-2': CR2, pizarra: PZ, piedra: PI, 'piedra-osc': PO, regla: RG, naranja: NA, 'naranja-texto': NT, 'naranja-tinte': NTI, azul: '#2E4FA6', 'azul-claro': '#D3DCF0' } },
        fontFamily: { sans: ['Montserrat', '-apple-system', 'Segoe UI', 'sans-serif'], mono: ['"JetBrains Mono"', 'ui-monospace', 'Menlo', 'monospace'] },
        borderRadius: { none: '0', sm: '0', DEFAULT: '0', md: '0', lg: '0', xl: '0', '2xl': '0', '3xl': '0', full: '0' },
        boxShadow: { sm: 'none', DEFAULT: 'none', md: 'none', lg: 'none', xl: 'none', '2xl': 'none' }
      }
    }
  };
})();
