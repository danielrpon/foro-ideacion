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
