# Foro de Ideación (Freaknerd)

Plataforma web para foros de ideación con expertos: captura de ideas en paralelo desde el celular, consolidación MECE con IA (Claude), votación opcional, matriz esfuerzo‑impacto y reporte final. Réplica de la "Plataforma de Ideación" (PHP) sobre **GitHub Pages + Supabase**.

## Vistas
| Vista | Archivo | Quién |
|---|---|---|
| Participante (móvil) | `index.html` | asistentes |
| Muro (proyector) | `muro.html` | pantalla |
| Gestión de pilar | `area.html` | líderes (clave líder) |
| Administrador | `admin.html` | facilitador (clave admin) |
| Reporte final | `reporte.html` | todos (edición con clave) |
| Manual | `manual.html` | todos |

Todas aceptan `?s=slug` para otra sesión/cliente.

## Puesta en marcha (una vez)
1. **Supabase**: crear proyecto → SQL Editor → correr `supabase/schema.sql` y luego `supabase/seed_impercap.sql` (cambiar las claves `clave_admin` / `clave_lider` antes).
2. Copiar `Project URL` y `anon public key` (Settings → API) en `js/config.js` (`MODE: 'supabase'`).
3. Publicar en GitHub Pages (rama `main`, raíz). Listo.

Sin credenciales, la app arranca en **modo demo local** (datos en el navegador, claves `admin` / `lider`) para practicar.

## IA (consolidación MECE)
Desde Admin › *IA · MECE* o desde Gestión (por pilar): pegar la API key de Anthropic (queda solo en ese navegador), *Generar*, revisar la previsualización y *Aplicar*. Ruta manual: *Copiar prompt* → claude.ai → pegar JSON. Modelo: `claude-opus-5`.

## Seguridad (suficiente para un taller)
- Anon solo lee y **inserta** (participantes, ideas en etapa `ideacion`, votos en `votacion`, evaluaciones en `matriz`). Las claves nunca se exponen (columna revocada).
- Toda edición/borrado pasa por la RPC `admin_op(sesion, clave, op, payload)` que valida la clave en el servidor.
- Límite de votos por pilar y por etapa: trigger en la base.

## Estructura
```
index.html muro.html area.html admin.html reporte.html manual.html
js/config.js  js/db.js (supabase | local)  js/common.js (etapas, MECE)  js/mece-ui.js
supabase/schema.sql  supabase/seed_impercap.sql
```

## Tablero de acciones (wrap up)

Submódulo para el cierre de una junta: cada líder de mesa escribe las acciones que salieron y la
sala las ve en una sola pantalla.

- `acciones.html` — vista del líder de mesa. Entra con su mesa, su nombre y la **clave de líder**
  (también sirve la de admin). Crea, edita, marca como lista y borra acciones. El formulario no se
  redibuja solo: se puede escribir mientras la mesa conversa.
- `tablero.html` — vista que se proyecta. Solo lee, se refresca cada 4 s, muestra cuántas acciones
  tienen dueño y fecha, exporta **CSV para el acta**, imprime y muestra un **QR** con el enlace de
  los líderes.
- `js/acciones.js` — capa de datos (Supabase o localStorage), lista de mesas y CSV.
- `supabase/acciones_2026-09-23.sql` — tabla `acciones` + RPC `acciones_op`. **Correr una vez** en el
  SQL Editor antes de usarlo en producción. La escritura pasa siempre por el RPC con clave; la
  lectura es abierta (el tablero se proyecta sin clave).

Las mesas se cambian en `MESAS`, en `js/acciones.js`. Con `?demo=1` todo funciona en el navegador
sin base de datos: es el plan B si falla la red (los líderes escriben en el portátil del moderador).
