-- ============================================================
-- FORO DE IDEACIÓN · esquema Supabase (Postgres)
-- Correr completo en el SQL Editor de Supabase (una sola vez).
-- Luego correr seed_impercap.sql para crear la sesión del foro.
-- ============================================================
create extension if not exists pgcrypto;

-- ---------- Tablas ----------
create table if not exists sesiones (
  id            text primary key,                 -- slug: 'impercap'
  nombre        text not null,                    -- 'Foro Impercap'
  empresa       text,
  facilitador   text,
  etapa         text not null default 'bienvenida',
  etapa_ts      timestamptz not null default now(),
  fin_etapa     timestamptz,                      -- cuenta regresiva (opcional)
  proyectada_id bigint,                           -- idea proyectada en la matriz
  modo_matriz   text not null default 'todas',    -- 'todas' | 'proyectada'
  config        jsonb not null default '{}'::jsonb,
  clave_admin   text not null,
  clave_lider   text not null,
  created_at    timestamptz not null default now()
);

create table if not exists pilares (
  id          bigserial primary key,
  sesion_id   text not null references sesiones(id) on delete cascade,
  orden       int not null default 0,
  nombre      text not null,
  icono       text default 'fa-lightbulb',
  color       text default 'blue',                -- tailwind: blue|green|amber|purple|rose|teal|gray
  enunciado   text,                               -- problema/guía que ve el participante
  subfrentes  jsonb not null default '[]'::jsonb, -- ["Cobertura","Diversificación",...]
  activo      boolean not null default true
);

create table if not exists participantes (
  id         uuid primary key default gen_random_uuid(),
  sesion_id  text not null references sesiones(id) on delete cascade,
  nombre     text not null,
  perfil     text,
  created_at timestamptz not null default now(),
  last_seen  timestamptz not null default now()
);

create table if not exists ideas (
  id                  bigserial primary key,
  sesion_id           text not null references sesiones(id) on delete cascade,
  pilar_id            bigint references pilares(id) on delete set null,
  subfrente           text,
  participante_id     uuid,
  participante_nombre text,
  tipo                text not null default 'idea',   -- 'idea' (aporte) | 'grupo' (idea consolidada MECE)
  texto               text not null,
  texto_original      text,
  es_editado          boolean not null default false,
  estado              text not null default 'nueva',  -- nueva|validada|repetida|agrupada  (grupo: consolidada)
  padre_id            bigint references ideas(id) on delete set null,  -- idea → grupo
  titulo              text,
  descripcion_corta   text,
  detalle             text,
  origen              text default 'participante',    -- participante|lider|ia|admin
  responsable         text,
  tiempo_ejecucion    text,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);
create index if not exists ideas_sesion_idx on ideas(sesion_id);
create index if not exists ideas_padre_idx  on ideas(padre_id);

create table if not exists votos (
  id              bigserial primary key,
  sesion_id       text not null references sesiones(id) on delete cascade,
  idea_id         bigint not null references ideas(id) on delete cascade,
  participante_id uuid not null,
  created_at      timestamptz not null default now(),
  unique (idea_id, participante_id)
);

create table if not exists evaluaciones (
  id              bigserial primary key,
  sesion_id       text not null references sesiones(id) on delete cascade,
  idea_id         bigint not null references ideas(id) on delete cascade,
  participante_id uuid not null,
  esfuerzo        int not null check (esfuerzo between 1 and 10),
  impacto         int not null check (impacto between 1 and 10),
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  unique (idea_id, participante_id)
);

-- ---------- Vista con agregados ----------
create or replace view v_ideas with (security_invoker = true) as
select i.*,
       p.nombre  as pilar_nombre,
       p.color   as pilar_color,
       p.orden   as pilar_orden,
       coalesce(v.n,0)::int          as votos,
       coalesce(e.n,0)::int          as conteo_eval,
       round(coalesce(e.esf,0)::numeric,1) as esfuerzo_prom,
       round(coalesce(e.imp,0)::numeric,1) as impacto_prom,
       coalesce(h.n,0)::int          as n_hijas
from ideas i
left join pilares p on p.id = i.pilar_id
left join (select idea_id, count(*) n from votos group by idea_id) v on v.idea_id = i.id
left join (select idea_id, count(*) n, avg(esfuerzo) esf, avg(impacto) imp from evaluaciones group by idea_id) e on e.idea_id = i.id
left join (select padre_id, count(*) n from ideas where padre_id is not null group by padre_id) h on h.padre_id = i.id;

-- Sesión sin claves (lo que ve el público)
create or replace view v_sesiones with (security_invoker = true) as
select id, nombre, empresa, facilitador, etapa, etapa_ts, fin_etapa, proyectada_id, modo_matriz, config, created_at
from sesiones;

-- ---------- Triggers ----------
create or replace function touch_updated_at() returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end $$;
drop trigger if exists ideas_touch on ideas;
create trigger ideas_touch before update on ideas for each row execute function touch_updated_at();
drop trigger if exists eval_touch on evaluaciones;
create trigger eval_touch before update on evaluaciones for each row execute function touch_updated_at();

-- Límite de votos por pilar por participante (config.votos_por_pilar, default 3)
create or replace function votos_limite() returns trigger language plpgsql as $$
declare v_pilar bigint; v_max int; v_n int; v_etapa text;
begin
  select pilar_id into v_pilar from ideas where id = new.idea_id;
  select coalesce((config->>'votos_por_pilar')::int,3), etapa into v_max, v_etapa from sesiones where id = new.sesion_id;
  if v_etapa <> 'votacion' then raise exception 'ETAPA_CERRADA'; end if;
  select count(*) into v_n from votos v join ideas i on i.id = v.idea_id
   where v.participante_id = new.participante_id and i.pilar_id = v_pilar and v.sesion_id = new.sesion_id;
  if v_n >= v_max then raise exception 'LIMITE_VOTOS'; end if;
  return new;
end $$;
drop trigger if exists votos_limite_trg on votos;
create trigger votos_limite_trg before insert on votos for each row execute function votos_limite();

-- Tope de calificaciones por participante en la matriz (config.max_calificaciones, por defecto 8).
-- Un upsert sobre una calificación existente no cuenta (es una actualización).
create or replace function evaluaciones_limite() returns trigger language plpgsql as $$
declare v_max int; v_n int; v_etapa text;
begin
  if exists (select 1 from evaluaciones e where e.idea_id = new.idea_id and e.participante_id = new.participante_id) then return new; end if;
  select coalesce((config->>'max_calificaciones')::int,8), etapa into v_max, v_etapa from sesiones where id = new.sesion_id;
  if v_etapa <> 'matriz' then raise exception 'ETAPA_CERRADA'; end if;
  select count(*) into v_n from evaluaciones e where e.participante_id = new.participante_id and e.sesion_id = new.sesion_id;
  if v_n >= v_max then raise exception 'LIMITE_CALIFICACIONES'; end if;
  return new;
end $$;
drop trigger if exists evaluaciones_limite_trg on evaluaciones;
create trigger evaluaciones_limite_trg before insert on evaluaciones for each row execute function evaluaciones_limite();

-- ---------- RLS ----------
alter table sesiones      enable row level security;
alter table pilares       enable row level security;
alter table participantes enable row level security;
alter table ideas         enable row level security;
alter table votos         enable row level security;
alter table evaluaciones  enable row level security;

-- Lectura pública (las claves NO se exponen: se lee por v_sesiones y se revoca la columna)
drop policy if exists p_ses_sel on sesiones;      create policy p_ses_sel on sesiones      for select using (true);
drop policy if exists p_pil_sel on pilares;       create policy p_pil_sel on pilares       for select using (true);
drop policy if exists p_par_sel on participantes; create policy p_par_sel on participantes for select using (true);
drop policy if exists p_ide_sel on ideas;         create policy p_ide_sel on ideas         for select using (true);
drop policy if exists p_vot_sel on votos;         create policy p_vot_sel on votos         for select using (true);
drop policy if exists p_eva_sel on evaluaciones;  create policy p_eva_sel on evaluaciones  for select using (true);

revoke all on sesiones from anon, authenticated;
grant select (id, nombre, empresa, facilitador, etapa, etapa_ts, fin_etapa, proyectada_id, modo_matriz, config, created_at)
  on sesiones to anon, authenticated;

-- Escritura del participante (solo insertar; editar/borrar pasa por admin_op)
drop policy if exists p_par_ins on participantes; create policy p_par_ins on participantes for insert with check (true);
drop policy if exists p_par_upd on participantes; create policy p_par_upd on participantes for update using (true) with check (true);
drop policy if exists p_ide_ins on ideas;
create policy p_ide_ins on ideas for insert
  with check (tipo = 'idea' and estado = 'nueva' and padre_id is null
              and exists (select 1 from sesiones s where s.id = sesion_id and s.etapa = 'ideacion'));
drop policy if exists p_vot_ins on votos;        create policy p_vot_ins on votos for insert with check (true);
drop policy if exists p_vot_del on votos;        create policy p_vot_del on votos for delete using (exists (select 1 from sesiones s where s.id = sesion_id and s.etapa = 'votacion'));
drop policy if exists p_eva_ins on evaluaciones; create policy p_eva_ins on evaluaciones for insert with check (exists (select 1 from sesiones s where s.id = sesion_id and s.etapa = 'matriz'));
drop policy if exists p_eva_upd on evaluaciones; create policy p_eva_upd on evaluaciones for update using (true) with check (exists (select 1 from sesiones s where s.id = sesion_id and s.etapa = 'matriz'));
drop policy if exists p_eva_del on evaluaciones; create policy p_eva_del on evaluaciones for delete using (exists (select 1 from sesiones s where s.id = sesion_id and s.etapa = 'matriz'));

-- ---------- RPC de administración (admin / líder) ----------
create or replace function admin_op(p_sesion text, p_clave text, p_op text, p_payload jsonb default '{}'::jsonb)
returns jsonb language plpgsql security definer set search_path = public as $$
declare s sesiones%rowtype; rol text; r jsonb := '{}'::jsonb; v_id bigint; v_ids jsonb; x jsonb; v_min int;
begin
  select * into s from sesiones where id = p_sesion;
  if s.id is null then raise exception 'SESION_NO_EXISTE'; end if;
  if p_clave = s.clave_admin then rol := 'admin';
  elsif p_clave = s.clave_lider then rol := 'lider';
  else raise exception 'CLAVE_INVALIDA'; end if;

  if p_op = 'login' then return jsonb_build_object('rol', rol);

  -- ===== solo admin =====
  elsif p_op = 'cambiar_etapa' then
    if rol <> 'admin' then raise exception 'SOLO_ADMIN'; end if;
    v_min := (p_payload->>'minutos')::int;
    update sesiones set etapa = p_payload->>'etapa', etapa_ts = now(),
           fin_etapa = case when v_min is not null and v_min > 0 then now() + (v_min || ' minutes')::interval else null end
     where id = p_sesion;
  elsif p_op = 'temporizador' then          -- {minutos: N} (N=0 apaga; 'extender': true suma)
    if rol <> 'admin' then raise exception 'SOLO_ADMIN'; end if;
    v_min := coalesce((p_payload->>'minutos')::int,0);
    if coalesce((p_payload->>'extender')::boolean,false) then
      update sesiones set fin_etapa = coalesce(fin_etapa, now()) + (v_min || ' minutes')::interval where id = p_sesion;
    elsif v_min > 0 then update sesiones set fin_etapa = now() + (v_min || ' minutes')::interval where id = p_sesion;
    else update sesiones set fin_etapa = null where id = p_sesion; end if;
  elsif p_op = 'proyectar' then             -- {idea_id: N|null}
    if rol <> 'admin' then raise exception 'SOLO_ADMIN'; end if;
    update sesiones set proyectada_id = nullif(p_payload->>'idea_id','')::bigint where id = p_sesion;
  elsif p_op = 'modo_matriz' then           -- {modo: 'todas'|'proyectada'}
    if rol <> 'admin' then raise exception 'SOLO_ADMIN'; end if;
    update sesiones set modo_matriz = p_payload->>'modo' where id = p_sesion;
  elsif p_op = 'config' then                -- {config: {...}}  (merge)
    if rol <> 'admin' then raise exception 'SOLO_ADMIN'; end if;
    update sesiones set config = config || (p_payload->'config'), nombre = coalesce(p_payload->>'nombre', nombre),
           empresa = coalesce(p_payload->>'empresa', empresa), facilitador = coalesce(p_payload->>'facilitador', facilitador)
     where id = p_sesion;
  elsif p_op = 'upsert_pilar' then          -- {id?, nombre, icono, color, enunciado, subfrentes, orden, activo}
    if rol <> 'admin' then raise exception 'SOLO_ADMIN'; end if;
    if (p_payload->>'id') is null then
      insert into pilares(sesion_id, nombre, icono, color, enunciado, subfrentes, orden, activo)
      values (p_sesion, p_payload->>'nombre', coalesce(p_payload->>'icono','fa-lightbulb'), coalesce(p_payload->>'color','blue'),
              p_payload->>'enunciado', coalesce(p_payload->'subfrentes','[]'::jsonb), coalesce((p_payload->>'orden')::int,0), true)
      returning id into v_id;
    else
      update pilares set nombre = coalesce(p_payload->>'nombre', nombre), icono = coalesce(p_payload->>'icono', icono),
             color = coalesce(p_payload->>'color', color), enunciado = coalesce(p_payload->>'enunciado', enunciado),
             subfrentes = coalesce(p_payload->'subfrentes', subfrentes), orden = coalesce((p_payload->>'orden')::int, orden),
             activo = coalesce((p_payload->>'activo')::boolean, activo)
       where id = (p_payload->>'id')::bigint and sesion_id = p_sesion returning id into v_id;
    end if;
    r := jsonb_build_object('id', v_id);
  elsif p_op = 'eliminar_pilar' then
    if rol <> 'admin' then raise exception 'SOLO_ADMIN'; end if;
    delete from pilares where id = (p_payload->>'id')::bigint and sesion_id = p_sesion;
  elsif p_op = 'eliminar_idea' then
    if rol <> 'admin' then raise exception 'SOLO_ADMIN'; end if;
    update ideas set padre_id = null, estado = case when estado = 'agrupada' then 'validada' else estado end
     where padre_id = (p_payload->>'id')::bigint and sesion_id = p_sesion;
    delete from ideas where id = (p_payload->>'id')::bigint and sesion_id = p_sesion;
  elsif p_op = 'borrar_votos' then
    if rol <> 'admin' then raise exception 'SOLO_ADMIN'; end if;
    delete from votos where sesion_id = p_sesion;
  elsif p_op = 'borrar_evaluaciones' then
    if rol <> 'admin' then raise exception 'SOLO_ADMIN'; end if;
    delete from evaluaciones where sesion_id = p_sesion;
  elsif p_op = 'borrar_grupos' then         -- deshace la consolidación (deja las ideas)
    if rol <> 'admin' then raise exception 'SOLO_ADMIN'; end if;
    update ideas set padre_id = null, estado = 'validada' where sesion_id = p_sesion and estado = 'agrupada';
    delete from ideas where sesion_id = p_sesion and tipo = 'grupo';
  elsif p_op = 'borrar_todo' then
    if rol <> 'admin' then raise exception 'SOLO_ADMIN'; end if;
    delete from evaluaciones where sesion_id = p_sesion;
    delete from votos where sesion_id = p_sesion;
    delete from ideas where sesion_id = p_sesion;
    delete from participantes where sesion_id = p_sesion;
    update sesiones set etapa = 'bienvenida', etapa_ts = now(), fin_etapa = null, proyectada_id = null where id = p_sesion;
  elsif p_op = 'eliminar_participante' then
    if rol <> 'admin' then raise exception 'SOLO_ADMIN'; end if;
    delete from participantes where id = (p_payload->>'id')::uuid and sesion_id = p_sesion;

  -- ===== admin y líder =====
  elsif p_op = 'crear_idea' then            -- {pilar_id, subfrente, texto, tipo?, titulo?, descripcion_corta?, detalle?}
    insert into ideas(sesion_id, pilar_id, subfrente, participante_nombre, tipo, texto, estado, titulo, descripcion_corta, detalle, origen)
    values (p_sesion, nullif(p_payload->>'pilar_id','')::bigint, p_payload->>'subfrente', coalesce(p_payload->>'participante_nombre', initcap(rol)),
            coalesce(p_payload->>'tipo','idea'), coalesce(p_payload->>'texto', p_payload->>'titulo'),
            case when coalesce(p_payload->>'tipo','idea') = 'grupo' then 'consolidada' else 'validada' end,
            p_payload->>'titulo', p_payload->>'descripcion_corta', p_payload->>'detalle', rol)
    returning id into v_id;
    r := jsonb_build_object('id', v_id);
  elsif p_op = 'editar_idea' then           -- {id, texto?, pilar_id?, subfrente?, estado?, titulo?, descripcion_corta?, detalle?, responsable?, tiempo_ejecucion?}
    update ideas set
      texto_original    = case when p_payload ? 'texto' and texto_original is null and (p_payload->>'texto') <> texto then texto else texto_original end,
      es_editado        = case when p_payload ? 'texto' and (p_payload->>'texto') <> texto then true else es_editado end,
      texto             = coalesce(p_payload->>'texto', texto),
      pilar_id          = case when p_payload ? 'pilar_id' then nullif(p_payload->>'pilar_id','')::bigint else pilar_id end,
      subfrente         = case when p_payload ? 'subfrente' then p_payload->>'subfrente' else subfrente end,
      estado            = coalesce(p_payload->>'estado', estado),
      titulo            = case when p_payload ? 'titulo' then p_payload->>'titulo' else titulo end,
      descripcion_corta = case when p_payload ? 'descripcion_corta' then p_payload->>'descripcion_corta' else descripcion_corta end,
      detalle           = case when p_payload ? 'detalle' then p_payload->>'detalle' else detalle end,
      responsable       = case when p_payload ? 'responsable' then p_payload->>'responsable' else responsable end,
      tiempo_ejecucion  = case when p_payload ? 'tiempo_ejecucion' then p_payload->>'tiempo_ejecucion' else tiempo_ejecucion end
    where id = (p_payload->>'id')::bigint and sesion_id = p_sesion;
  elsif p_op = 'set_estado' then            -- {id, estado}
    update ideas set estado = p_payload->>'estado' where id = (p_payload->>'id')::bigint and sesion_id = p_sesion;
  elsif p_op = 'deshacer' then              -- {id} → vuelve a 'nueva' con el texto original
    update ideas set estado = 'nueva', padre_id = null,
           texto = coalesce(texto_original, texto), texto_original = null, es_editado = false
     where id = (p_payload->>'id')::bigint and sesion_id = p_sesion and tipo = 'idea';
  elsif p_op = 'crear_grupo' then           -- {pilar_id, titulo, descripcion_corta, detalle, ideas: [ids], origen?}
    insert into ideas(sesion_id, pilar_id, tipo, texto, estado, titulo, descripcion_corta, detalle, origen, participante_nombre)
    values (p_sesion, nullif(p_payload->>'pilar_id','')::bigint, 'grupo', coalesce(p_payload->>'titulo','(sin título)'), 'consolidada',
            p_payload->>'titulo', p_payload->>'descripcion_corta', p_payload->>'detalle', coalesce(p_payload->>'origen', rol), initcap(rol))
    returning id into v_id;
    v_ids := coalesce(p_payload->'ideas','[]'::jsonb);
    update ideas set padre_id = v_id, estado = 'agrupada'
     where sesion_id = p_sesion and tipo = 'idea' and id in (select (value#>>'{}')::bigint from jsonb_array_elements(v_ids));
    r := jsonb_build_object('id', v_id);
  elsif p_op = 'asignar_grupo' then         -- {id, padre_id|null}
    update ideas set padre_id = nullif(p_payload->>'padre_id','')::bigint,
           estado = case when nullif(p_payload->>'padre_id','') is null then 'validada' else 'agrupada' end
     where id = (p_payload->>'id')::bigint and sesion_id = p_sesion and tipo = 'idea';
  elsif p_op = 'disolver_grupo' then        -- {id}
    update ideas set padre_id = null, estado = 'validada' where padre_id = (p_payload->>'id')::bigint and sesion_id = p_sesion;
    delete from ideas where id = (p_payload->>'id')::bigint and sesion_id = p_sesion and tipo = 'grupo';
  elsif p_op = 'importar_consolidacion' then -- {grupos:[{pilar_id,titulo,descripcion_corta,detalle,ideas:[ids]}], reemplazar?: bool}
    if coalesce((p_payload->>'reemplazar')::boolean,false) then
      update ideas set padre_id = null, estado = 'validada' where sesion_id = p_sesion and estado = 'agrupada'
        and (p_payload->>'pilar_id' is null or pilar_id = (p_payload->>'pilar_id')::bigint);
      delete from ideas where sesion_id = p_sesion and tipo = 'grupo'
        and (p_payload->>'pilar_id' is null or pilar_id = (p_payload->>'pilar_id')::bigint);
    end if;
    for x in select value from jsonb_array_elements(coalesce(p_payload->'grupos','[]'::jsonb)) loop
      insert into ideas(sesion_id, pilar_id, tipo, texto, estado, titulo, descripcion_corta, detalle, origen, participante_nombre)
      values (p_sesion, nullif(x->>'pilar_id','')::bigint, 'grupo', coalesce(x->>'titulo','(sin título)'), 'consolidada',
              x->>'titulo', x->>'descripcion_corta', x->>'detalle', coalesce(x->>'origen','ia'), 'IA')
      returning id into v_id;
      update ideas set padre_id = v_id, estado = 'agrupada'
       where sesion_id = p_sesion and tipo = 'idea'
         and id in (select (value#>>'{}')::bigint from jsonb_array_elements(coalesce(x->'ideas','[]'::jsonb)));
    end loop;
  else
    raise exception 'OP_DESCONOCIDA: %', p_op;
  end if;
  return r || jsonb_build_object('ok', true, 'rol', rol);
end $$;
grant execute on function admin_op(text, text, text, jsonb) to anon, authenticated;

-- Contador de conectados (participantes vistos en los últimos 90 s)
create or replace function conectados(p_sesion text) returns int language sql stable security definer as $$
  select count(*)::int from participantes where sesion_id = p_sesion and last_seen > now() - interval '90 seconds';
$$;
grant execute on function conectados(text) to anon, authenticated;
