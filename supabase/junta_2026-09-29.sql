-- ============================================================
-- Junta asesora — sesión aparte de la ideación + campos configurables
-- Correr una vez en el SQL Editor de Supabase. Es idempotente.
-- Requiere haber corrido antes acciones_2026-09-23.sql.
-- ============================================================

-- 1) Campos adicionales de una acción (prioridad, recursos, notas…): van en extra
alter table acciones add column if not exists extra jsonb not null default '{}'::jsonb;

-- 2) acciones_op: igual que antes, ahora guarda y combina extra
create or replace function acciones_op(p_sesion text, p_clave text, p_op text, p_payload jsonb default '{}'::jsonb)
returns jsonb language plpgsql security definer set search_path = public as $$
declare v_ses sesiones%rowtype; v_id bigint; v_row acciones%rowtype; v_admin boolean;
begin
  select * into v_ses from sesiones where id = p_sesion;
  if not found then raise exception 'SESION_NO_EXISTE'; end if;

  v_admin := (p_clave = v_ses.clave_admin);
  if not v_admin and p_clave is distinct from v_ses.clave_lider then raise exception 'CLAVE_INVALIDA'; end if;

  if p_op = 'validar' then
    return jsonb_build_object('ok', true, 'admin', v_admin);

  elsif p_op = 'crear' then
    insert into acciones (sesion_id, mesa, titulo, responsable, acompana, fecha, senal, extra, autor)
    values (p_sesion,
            coalesce(nullif(p_payload->>'mesa',''), 'general'),
            coalesce(nullif(p_payload->>'titulo',''), '(sin título)'),
            coalesce(p_payload->>'responsable',''), coalesce(p_payload->>'acompana',''),
            coalesce(p_payload->>'fecha',''), coalesce(p_payload->>'senal',''),
            case when jsonb_typeof(p_payload->'extra') = 'object' then p_payload->'extra' else '{}'::jsonb end,
            coalesce(p_payload->>'autor',''))
    returning * into v_row;
    return to_jsonb(v_row);

  elsif p_op = 'editar' then
    v_id := (p_payload->>'id')::bigint;
    update acciones set
      titulo      = coalesce(nullif(p_payload->>'titulo',''), titulo),
      responsable = coalesce(p_payload->>'responsable', responsable),
      acompana    = coalesce(p_payload->>'acompana', acompana),
      fecha       = coalesce(p_payload->>'fecha', fecha),
      senal       = coalesce(p_payload->>'senal', senal),
      mesa        = coalesce(nullif(p_payload->>'mesa',''), mesa),
      extra       = extra || case when jsonb_typeof(p_payload->'extra') = 'object' then p_payload->'extra' else '{}'::jsonb end,
      updated_at  = now()
    where id = v_id and sesion_id = p_sesion returning * into v_row;
    if not found then raise exception 'NO_EXISTE'; end if;
    return to_jsonb(v_row);

  elsif p_op in ('confirmar','reabrir') then
    v_id := (p_payload->>'id')::bigint;
    update acciones set estado = case when p_op = 'confirmar' then 'confirmada' else 'borrador' end, updated_at = now()
    where id = v_id and sesion_id = p_sesion returning * into v_row;
    if not found then raise exception 'NO_EXISTE'; end if;
    return to_jsonb(v_row);

  elsif p_op = 'borrar' then
    delete from acciones where id = (p_payload->>'id')::bigint and sesion_id = p_sesion;
    return '{"ok":true}'::jsonb;

  elsif p_op = 'limpiar' then
    if not v_admin then raise exception 'SOLO_ADMIN'; end if;
    delete from acciones where sesion_id = p_sesion;
    return '{"ok":true}'::jsonb;
  end if;

  raise exception 'OP_DESCONOCIDA: %', p_op;
end $$;

revoke all on function acciones_op(text, text, text, jsonb) from public;
grant execute on function acciones_op(text, text, text, jsonb) to anon, authenticated;

-- 3) Sesión de la junta del 2-oct, aparte del foro de ideación ('impercap' queda intacta).
--    Se abre con ?s=impercap-junta-1 (junta.html, mesa.html, acciones.html, tablero.html).
--    CAMBIA LAS DOS CLAVES antes de correr: la de líder la reciben los relatores el mismo día;
--    la de admin no se comparte. Tienen que ser distintas.
insert into sesiones (id, nombre, empresa, facilitador, etapa, config, clave_admin, clave_lider)
values (
  'impercap-junta-1', 'Junta asesora · Impercap · Sesión 1', 'Impercap', 'Daniel Restrepo', 'bienvenida',
  jsonb_build_object('tipo', 'junta', 'junta', jsonb_build_object(
    'mesas', jsonb_build_array(
      jsonb_build_object('slug','mercadeo','nombre','Mercadeo y ventas','color','blue','icono','fa-bullhorn',
        'pregunta','','modera','Julián Vélez','relata','Carolina Ardila','miembros', '[]'::jsonb),
      jsonb_build_object('slug','innovacion','nombre','Innovación de producto','color','teal','icono','fa-lightbulb',
        'pregunta','','modera','Daniel Restrepo','relata','Daniel Restrepo','miembros', '[]'::jsonb)),
    'campos', jsonb_build_object(
      'responsable', jsonb_build_object('activo', true,  'obligatorio', true,  'etiqueta', 'Responsable'),
      'acompana',    jsonb_build_object('activo', true,  'obligatorio', false, 'etiqueta', 'Acompaña'),
      'fecha',       jsonb_build_object('activo', true,  'obligatorio', true,  'etiqueta', 'Fecha'),
      'senal',       jsonb_build_object('activo', true,  'obligatorio', false, 'etiqueta', 'Señal de avance'),
      'prioridad',   jsonb_build_object('activo', false, 'obligatorio', false, 'etiqueta', 'Prioridad'),
      'recursos',    jsonb_build_object('activo', false, 'obligatorio', false, 'etiqueta', 'Qué se necesita'),
      'notas',       jsonb_build_object('activo', false, 'obligatorio', false, 'etiqueta', 'Notas')))),
  'CAMBIAR-clave-admin', 'CAMBIAR-clave-lider'
)
on conflict (id) do nothing;

-- Si ya la habías creado y solo quieres cambiar las claves:
-- update sesiones set clave_admin = '…', clave_lider = '…' where id = 'impercap-junta-1';
