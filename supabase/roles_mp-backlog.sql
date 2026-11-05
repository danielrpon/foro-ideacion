-- Roles de MP (Orfa, 4-nov-2026). Solo cambia perfiles y afinidad; no toca claves, pilares ni ideas.
update sesiones set config = config || '{"perfiles":["Gerencia General","Comercial","Mercadeo","Cadena de Abastecimiento","Financiera","Operaciones","Desarrollo Humano y Organizacional","Tecnología"],"afinidad":{"Gerencia General":"Dirección","Comercial":"Comercial","Mercadeo":"Mercadeo","Cadena de Abastecimiento":"Demanda","Financiera":"Dirección","Operaciones":"Operación y servicio","Desarrollo Humano y Organizacional":"Dirección","Tecnología":"Dirección"}}'::jsonb where id = 'mp-backlog';

select config->'perfiles' as roles from sesiones where id = 'mp-backlog';
