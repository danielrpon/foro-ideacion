-- ============================================================
-- AJUSTES 2026-09-10 (3) · "Reiniciar tablero" devuelve la matriz al modo "todas a la vez"
-- Sin esto, si se probó Proyectar y luego se reinicia, la etapa 6 arranca bloqueada.
-- Reemplaza la función admin_op completa (misma que schema.sql). Idempotente.
-- ============================================================

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
    update sesiones set etapa = 'bienvenida', etapa_ts = now(), fin_etapa = null, proyectada_id = null, modo_matriz = 'todas' where id = p_sesion;
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

-- Por si acaso, limpiar el estado actual
update sesiones set modo_matriz = 'todas', proyectada_id = null where id = 'impercap';
select etapa, modo_matriz, proyectada_id from sesiones where id = 'impercap';
