/* Identidad Freaknerd v1 (manual de marca, §3 y §12) aplicada a la paleta de Tailwind.
   Se carga justo después de vendor/tailwind.js: así todas las clases existentes (bg-gray-100, text-blue-700,
   border-emerald-500…) caen en la paleta de marca sin tocar cada plantilla.
   - gris → escala de azul (texto 2, nota, tinte); verde/azul/morado/índigo/teal/rosa → azul de marca
   - rojo/ámbar/naranja → naranja texto #C23A00 (única señal de atención)
   - sin radio de borde y sin sombras (esquinas rectas, filetes tinte) */
(function () {
  var AZ = '#09318D', BL = '#FCFFFF', T2 = '#4B5C8C', NOTA = '#5A6B94', MED = '#6F87BD', TINTE = '#D8E0EE', SOFT = '#EEF2F9', NT = '#C23A00';
  var azul = { 50: SOFT, 100: TINTE, 200: TINTE, 300: MED, 400: MED, 500: AZ, 600: AZ, 700: AZ, 800: AZ, 900: AZ, 950: AZ };
  var atencion = { 50: BL, 100: BL, 200: NT, 300: NT, 400: NT, 500: NT, 600: NT, 700: NT, 800: NT, 900: NT, 950: NT };
  var gris = { 50: SOFT, 100: SOFT, 200: TINTE, 300: TINTE, 400: NOTA, 500: T2, 600: T2, 700: AZ, 800: AZ, 900: AZ, 950: AZ };
  var verde = Object.assign({}, azul, { 300: TINTE, 400: BL });   /* emerald-400 se usaba como texto sobre fondo oscuro: ahora es blanco */
  tailwind.config = {
    theme: {
      extend: {
        colors: { white: BL, black: AZ, gray: gris, slate: gris, zinc: gris, neutral: gris, stone: gris, emerald: verde, green: azul, lime: azul, teal: azul, cyan: azul, sky: azul, blue: azul, indigo: azul, violet: azul, purple: azul, fuchsia: azul, pink: azul, rose: azul, red: atencion, orange: atencion, amber: atencion, yellow: atencion,
          fn: { soft: SOFT, blanco: BL, azul: AZ, texto2: T2, nota: NOTA, medio: MED, tinte: TINTE, rosa: '#EED2E2', naranja: '#FF4200', 'naranja-texto': NT } },
        fontFamily: { sans: ['Montserrat', '-apple-system', 'Segoe UI', 'sans-serif'], mono: ['"JetBrains Mono"', 'ui-monospace', 'Menlo', 'monospace'] },
        borderRadius: { none: '0', sm: '0', DEFAULT: '0', md: '0', lg: '0', xl: '0', '2xl': '0', '3xl': '0', full: '0' },
        boxShadow: { sm: 'none', DEFAULT: 'none', md: 'none', lg: 'none', xl: 'none', '2xl': 'none' }
      }
    }
  };
})();
