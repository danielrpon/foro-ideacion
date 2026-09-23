-- ============================================================
-- Tablero de acciones (wrap up) — submódulo de la herramienta
-- Correr una vez en el SQL Editor de Supabase. Es idempotente.
-- ============================================================
-- Los líderes de mesa escriben desde acciones.html con la clave de líder
-- (o la de admin); el tablero proyectado (tablero.html) solo lee.

create table if not exists acciones (
  id          bigserial primary key,
  sesion_id   text not null references sesiones(id) on delete cascade,
  mesa        text not null,                       -- slug de la mesa: mercadeo | innovacion | general
  titulo      text not null,                       -- la acción
  responsable text not null default '',            -- quién la ejecuta (Impercap)
  acompana    text not null default '',            -- miembro de la junta que acompaña
  fecha       text not null default '',            -- texto corto: 10/10, semana del 6…
  senal       text not null default '',            -- cómo sabemos que avanzó
  estado      text not null default 'borrador',    -- borrador | confirmada
  autor       text not null default '',            -- quién la escribió (líder de mesa)
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
create index if not exists acciones_sesion_idx on acciones (sesion_id, mesa, id);

alter table acciones enable row level security;

-- Lectura abierta (el tablero se proyecta sin clave). La escritura pasa SIEMPRE por acciones_op.
drop policy if exists p_acc_sel on acciones; create policy p_acc_sel on acciones for select using (true);
drop policy if exists p_acc_ins on acciones;
drop policy if exists p_acc_upd on acciones;
drop policy if exists p_acc_del on acciones;

-- ------------------------------------------------------------
-- acciones_op: única puerta de escritura, protegida por clave
--   ops: validar | crear | editar | borrar | confirmar | reabrir | limpiar
-- ------------------------------------------------------------
create or replace function acciones_op(p_sesion text, p_clave text, p_op text, p_payload jsonb default '{}'::jsonb)
returns jsonb language plpgsql security definer set search_path = public as $$
declare v_ses sesiones%rowtype; v_id bigint; v_row acciones%rowtype; v_admin boolean;
begin
  select * into v_ses from sesiones where id = p_sesion;
  if not found then raise exception 'SESION_NO_EXISTE'; end if;

  v_admin := (p_clave = v_ses.clave_admin);
  if not v_admin and p_clave is distinct from v_ses.clave_lider then raise exception 'CLAVE_INVALIDA'; end if;

  if p_op = 'validar' then                       -- solo comprueba la clave (lo usa la pantalla de entrada)
    return jsonb_build_object('ok', true, 'admin', v_admin);

  elsif p_op = 'crear' then
    insert into acciones (sesion_id, mesa, titulo, responsable, acompana, fecha, senal, autor)
    values (p_sesion,
            coalesce(nullif(p_payload->>'mesa',''), 'general'),
            coalesce(nullif(p_payload->>'titulo',''), '(sin título)'),
            coalesce(p_payload->>'responsable',''), coalesce(p_payload->>'acompana',''),
            coalesce(p_payload->>'fecha',''), coalesce(p_payload->>'senal',''),
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

  elsif p_op = 'limpiar' then                     -- solo admin: vacía el tablero antes de un ensayo
    if not v_admin then raise exception 'SOLO_ADMIN'; end if;
    delete from acciones where sesion_id = p_sesion;
    return '{"ok":true}'::jsonb;
  end if;

  raise exception 'OP_DESCONOCIDA: %', p_op;
end $$;

revoke all on function acciones_op(text, text, text, jsonb) from public;
grant execute on function acciones_op(text, text, text, jsonb) to anon, authenticated;
