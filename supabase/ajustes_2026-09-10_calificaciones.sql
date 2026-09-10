-- ============================================================
-- AJUSTES 2026-09-10 (2) · Tope de calificaciones por participante en la matriz
-- Correr en el SQL Editor del proyecto zccrvdytrmrloahnbajl. Idempotente.
-- ============================================================

-- 1) Parámetro (8 por defecto; se cambia en Admin › Configuración)
update sesiones set config = config || '{"max_calificaciones": 8}'::jsonb where id = 'impercap' and not (config ? 'max_calificaciones');

-- 2) Permiso para quitar una calificación propia mientras la etapa sea 'matriz'
drop policy if exists p_eva_del on evaluaciones; create policy p_eva_del on evaluaciones for delete using (exists (select 1 from sesiones s where s.id = sesion_id and s.etapa = 'matriz'));

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

-- 3) Verificación
select config->>'max_calificaciones' as max_calificaciones from sesiones where id = 'impercap';
select tgname from pg_trigger where tgname = 'evaluaciones_limite_trg';
