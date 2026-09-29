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

## Junta asesora (mesas de trabajo y tablero de acciones)

La junta vive **aparte de la ideación**: es otra sesión, con `config.tipo = 'junta'`
(para Impercap, `?s=impercap-junta-1`). Así las acciones de las mesas no se mezclan con las ideas
del foro. Si alguien abre `admin.html`, `index.html` o `muro.html` con una sesión de junta, la app lo
lleva a `junta.html`, `mesa.html` o `tablero.html`.

**Puesta en marcha (una vez):** correr `supabase/junta_2026-09-29.sql` en el SQL Editor, después de
`acciones_2026-09-23.sql`, **cambiando antes las dos claves** del `insert`. El script agrega la
columna `acciones.extra`, actualiza el RPC `acciones_op` y crea la sesión `impercap-junta-1`.

| Vista | Quién | Para qué |
| --- | --- | --- |
| `junta.html?s=…` | Administrador (clave admin) | **Mesas**: nombre, pregunta u objetivo, quién modera, quién relata, miembros, color, ícono y orden. **Campos**: qué se diligencia en cada acción y qué es obligatorio. **QR y pantallas**: QR de cada mesa, enlaces y hoja imprimible con un QR por mesa. **Acciones**: conteos por mesa, CSV y vaciar el tablero. |
| `mesa.html?s=…&m=mesa` | Miembros de la mesa (sin clave; es el destino del QR) | Ven en vivo las acciones de su mesa y las descargan en CSV o PDF. Sin `m=`, eligen su mesa. |
| `acciones.html?s=…&m=mesa` | Relator (clave de líder) | Escribe, edita, marca como lista y borra las acciones de su mesa. Con la clave de admin puede trabajar cualquier mesa y mover acciones entre mesas. |
| `tablero.html?s=…&m=mesa` | Pantalla de una mesa | Tablero proyectado de esa mesa, en grande. |
| `tablero.html?s=…` | Pantalla del cierre | Visualizador general: todas las acciones de todas las mesas, con CSV para el acta. |

**Campos.** Acción es fijo; responsable, acompaña, fecha y señal de avance son columnas propias;
prioridad, qué se necesita y notas van en `acciones.extra`. *Obligatorio* no impide guardar a
medias: exige que la acción esté completa para marcarla como **lista**, y en los tableros la
incompleta queda en ámbar con lo que le falta.

La configuración se guarda en `sesiones.config.junta` y todas las pantallas la toman en el siguiente
refresco. Con `?s=junta-demo&demo=1` todo funciona en el navegador, sin base de datos (clave
`admin`): es para practicar y es el plan B si falla la red.
