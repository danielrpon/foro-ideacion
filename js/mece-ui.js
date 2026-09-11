/* Panel reutilizable de consolidación MECE con IA (admin y líderes) */
window.MeceUI = {
  mount(el, opts) {
    this.opts = opts; this.el = el; this.preview = null;
    el.innerHTML = `
      <div class="bg-white rounded-xl shadow p-5 border-t-4 border-purple-500">
        <h3 class="font-black text-lg text-purple-800"><i class="fas fa-wand-magic-sparkles mr-2"></i>Consolidación MECE con IA</h3>
        <p class="text-xs text-gray-500 mt-1">Agrupa las ideas ${opts.pilarId ? 'de este pilar' : 'del foro'} en ideas consolidadas (cada idea en un solo grupo, ninguna por fuera; una idea puede quedar sola). Las ideas marcadas como repetidas no se envían.</p>
        ${opts.pilarId ? '' : `<div class="mt-3 flex flex-wrap items-center gap-2 bg-purple-50 border border-purple-200 rounded-lg p-3"><label class="text-xs font-bold text-purple-900"><i class="fas fa-layer-group mr-1"></i>Alcance de la corrida</label><select id="meceScope" onchange="MeceUI.scope=this.value;MeceUI.preview=null;$('mecePreview').innerHTML='';MeceUI.resumen()" class="p-2 border rounded text-sm bg-white"><option value="">Todos los pilares en una sola corrida (recomendado)</option></select><span id="meceResumen" class="text-xs text-gray-600"></span></div>`}
        <div class="grid md:grid-cols-2 gap-4 mt-4">
          <div class="space-y-2">
            <label class="block text-xs font-bold text-gray-600">API key de Anthropic (queda guardada solo en este navegador) <button onclick="MeceUI.olvidarKey()" class="ml-2 text-[10px] text-red-600 underline font-normal">olvidar</button></label>
            <div class="flex gap-2"><input id="meceKey" type="password" class="flex-1 p-2 border rounded text-sm" placeholder="sk-ant-..." value="${MECE.getKey()}"><button onclick="MeceUI.saveKey()" class="px-3 bg-gray-200 rounded text-xs font-bold">Guardar</button></div>
            <label class="block text-xs font-bold text-gray-600">Workspace ID <span class="font-normal text-gray-400">(solo si la clave NO está asociada a un espacio de trabajo; Consola › Espacios de trabajo › Default)</span></label>
            <input id="meceWs" class="w-full p-2 border rounded text-sm" placeholder="wrkspc_..." value="${MECE.getWs()}" onchange="MECE.setWs(this.value)">
            <label class="block text-xs font-bold text-gray-600">Modelo</label>
            <select id="meceModel" onchange="MECE.setModel(this.value)" class="w-full p-2 border rounded text-sm bg-white">${MECE.MODELOS.map(([id, l]) => `<option value="${id}" ${MECE.MODEL === id ? 'selected' : ''}>${l}</option>`).join('')}</select>
            <button id="meceGen" onclick="MeceUI.generar()" class="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-2.5 rounded-lg"><i class="fas fa-robot mr-2"></i>Generar consolidación con IA</button>
            <div id="meceStatus" class="text-xs text-gray-500"></div>
          </div>
          <div class="space-y-2">
            <label class="block text-xs font-bold text-gray-600">Ruta manual (si no hay API): copiar el prompt, correrlo en claude.ai y pegar el JSON</label>
            <div class="flex gap-2"><button onclick="MeceUI.copiarPrompt()" class="flex-1 bg-gray-100 hover:bg-gray-200 py-2 rounded text-xs font-bold"><i class="fas fa-copy mr-1"></i>Copiar prompt</button><button onclick="MeceUI.pegar()" class="flex-1 bg-gray-100 hover:bg-gray-200 py-2 rounded text-xs font-bold"><i class="fas fa-paste mr-1"></i>Previsualizar JSON pegado</button></div>
            <textarea id="meceJson" rows="3" class="w-full p-2 border rounded text-xs font-mono" placeholder='{"grupos":[...]}'></textarea>
          </div>
        </div>
        <div id="mecePreview" class="mt-4"></div>
      </div>`;
    this.scope = ''; this.resumen();
  },
  /* Llena el selector de alcance con los pilares y muestra cuántas ideas cubre la corrida */
  resumen() {
    const snap = this.opts.getSnap(); const sc = $('meceScope'); if (sc && sc.options.length === 1) snap.pilares.forEach(p => { const o = document.createElement('option'); o.value = p.id; o.textContent = 'Solo ' + p.nombre; sc.appendChild(o); });
    const d = this.datos(); const r = $('meceResumen'); if (!r) return;
    const porPilar = d.pilares.map(p => ({ p, n: d.ideas.filter(i => i.pilar_id === p.id).length }));
    r.innerHTML = `Cubre <b>${d.ideas.length}</b> ideas: ${porPilar.map(x => `<span class="${x.n ? '' : 'text-gray-400'}">${esc(x.p.nombre)} ${x.n}</span>`).join(' · ')}`;
  },
  saveKey() { MECE.setKey($('meceKey').value); if ($('meceWs')) MECE.setWs($('meceWs').value); toast('API key guardada en este navegador'); },
  olvidarKey() { MECE.clearKey(); $('meceKey').value = ''; if ($('meceWs')) $('meceWs').value = ''; toast('API key borrada de este navegador'); },
  datos() {
    const snap = this.opts.getSnap();
    const pid = this.opts.pilarId || (this.scope ? Number(this.scope) : null);
    const pilares = pid ? snap.pilares.filter(p => p.id === pid) : snap.pilares;
    const ideas = snap.ideas.filter(i => i.tipo === 'idea' && i.estado !== 'repetida' && pilares.some(p => p.id === i.pilar_id));
    return { sesion: snap.sesion, pilares, ideas };
  },
  async copiarPrompt() { const d = this.datos(); if (!d.ideas.length) return toast('No hay ideas para consolidar', 'warn'); const p = MECE.buildPrompt(d); try { await navigator.clipboard.writeText(p); toast('Prompt copiado (' + d.ideas.length + ' ideas)'); } catch (e) { prompt('Copia el prompt:', p); } },
  pegar() { try { const d = this.datos(); const obj = MECE.parse($('meceJson').value); this.preview = MECE.validate(obj, d); if (obj.rescatado) toast('JSON incompleto: se rescataron ' + obj.grupos.length + ' grupos', 'warn'); this.renderPreview(); } catch (e) { toast('JSON inválido: ' + e.message, 'err'); } },
  async generar() {
    const key = $('meceKey').value.trim(); if (!key) return toast('Pega tu API key de Anthropic', 'warn'); MECE.setKey(key);
    const d = this.datos(); if (!d.ideas.length) return toast('No hay ideas para consolidar', 'warn');
    const btn = $('meceGen'); btn.disabled = true; btn.innerHTML = '<i class="fas fa-circle-notch fa-spin mr-2"></i>Consolidando ' + d.ideas.length + ' ideas…'; $('meceStatus').textContent = 'Llamando a ' + MECE.MODEL + '…';
    try { const txt = await MECE.call(MECE.buildPrompt(d), key); $('meceJson').value = txt; const obj = MECE.parse(txt); this.preview = MECE.validate(obj, d); $('meceStatus').textContent = obj.rescatado ? 'La respuesta llegó incompleta: se rescataron ' + obj.grupos.length + ' grupos; las ideas que faltaron quedaron en "Otras ideas" de su pilar. Revisa y aplica, o vuelve a generar.' : 'Listo: revisa y aplica.'; this.renderPreview(); }
    catch (e) { $('meceStatus').textContent = 'Error: ' + e.message; toast('Error IA: ' + e.message, 'err'); }
    finally { btn.disabled = false; btn.innerHTML = '<i class="fas fa-robot mr-2"></i>Generar consolidación con IA'; }
  },
  renderPreview() {
    const d = this.datos(), pv = this.preview, box = $('mecePreview');
    const cubiertas = new Set(pv.grupos.flatMap(g => g.ideas));
    const porPilar = d.pilares.map(p => ({ p, n: pv.grupos.filter(g => g.pilar_id === p.id).length, ideas: d.ideas.filter(i => i.pilar_id === p.id).length })).filter(x => x.ideas);
    box.innerHTML = `<div class="border rounded-lg p-4 bg-purple-50">
      <div class="flex justify-between items-center flex-wrap gap-2">
        <div><div class="font-black text-purple-900 text-lg">Previsualización · ${pv.grupos.length} consolidadas a partir de ${d.ideas.length} ideas</div>
          <div class="text-xs text-gray-600 mt-1">${porPilar.map(x => `<span class="inline-block mr-3"><b class="${col(x.p.color).text}">${esc(x.p.nombre)}</b>: ${x.ideas} → ${x.n}</span>`).join('')} · ${cubiertas.size === d.ideas.length ? '<span class="text-emerald-700 font-bold">todas las ideas cubiertas ✓</span>' : '<span class="text-red-700 font-bold">' + (d.ideas.length - cubiertas.size) + ' sin cubrir</span>'}</div></div>
        <div class="flex gap-2"><button onclick="MeceUI.aplicar(true)" class="bg-purple-700 hover:bg-purple-800 text-white px-4 py-2 rounded font-bold text-sm"><i class="fas fa-check mr-1"></i>Aplicar (reemplaza la consolidación anterior)</button><button onclick="MeceUI.aplicar(false)" class="bg-white border px-4 py-2 rounded font-bold text-sm">Agregar sin reemplazar</button></div></div>
      <p class="text-[11px] text-gray-500 mt-2"><i class="fas fa-pen mr-1"></i>Título, descripción y detalle son editables. Con el desplegable de cada idea original puedes moverla a otra consolidada del mismo pilar.</p>
      <div class="space-y-3 mt-3">${pv.grupos.map((g, k) => { const p = d.pilares.find(p => p.id === g.pilar_id) || {}; const c = col(p.color); const hermanos = pv.grupos.map((h, j) => [j, h]).filter(([j, h]) => h.pilar_id === g.pilar_id); return `<div class="bg-white rounded-lg border-l-4 ${c.border} shadow-sm grid md:grid-cols-2 gap-0">
        <div class="p-4"><div class="text-[10px] font-mono uppercase ${c.text}">${esc(p.nombre || 'Sin pilar')} · consolidada ${k + 1}</div>
          <input class="w-full font-black text-base mt-1 border-b border-dashed focus:border-purple-500 outline-none" value="${esc(g.titulo)}" onchange="MeceUI.preview.grupos[${k}].titulo=this.value">
          <input class="w-full text-sm text-gray-700 mt-2 border-b border-dashed outline-none" value="${esc(g.descripcion_corta)}" onchange="MeceUI.preview.grupos[${k}].descripcion_corta=this.value" placeholder="Descripción corta (muro)">
          <textarea class="w-full text-xs text-gray-600 mt-2 border rounded p-2 outline-none" rows="4" onchange="MeceUI.preview.grupos[${k}].detalle=this.value" placeholder="Detalle: qué integra">${esc(g.detalle)}</textarea></div>
        <div class="p-4 bg-gray-50 rounded-r-lg"><div class="text-[10px] font-mono uppercase text-gray-500 mb-2"><i class="fas fa-layer-group mr-1"></i>Ideas originales que integra (${g.ideas.length})</div>
          <ul class="space-y-2">${g.ideas.map(id => { const i = d.ideas.find(x => x.id === id) || {}; return `<li class="text-xs text-gray-800 flex gap-2 items-start"><span class="font-mono text-gray-400 shrink-0">#${id}</span><div class="flex-1"><div>${esc(i.texto || '')}</div><div class="text-[10px] text-gray-400 mt-0.5">${esc(i.participante_nombre || '')}${i.subfrente ? ' · ' + esc(i.subfrente) : ''}</div></div>${hermanos.length > 1 ? `<select class="text-[10px] border rounded bg-white max-w-[120px]" onchange="MeceUI.mover(${id}, ${k}, Number(this.value))"><option value="${k}">mover a…</option>${hermanos.filter(([j]) => j !== k).map(([j, h]) => `<option value="${j}">${esc((h.titulo || ('grupo ' + (j + 1))).slice(0, 40))}</option>`).join('')}</select>` : ''}</li>`; }).join('') || '<li class="text-xs text-gray-400">Sin ideas: se eliminará al aplicar.</li>'}</ul></div></div>`; }).join('')}</div></div>`;
  },
  mover(ideaId, desde, hacia) {
    if (desde === hacia) return; const g = this.preview.grupos;
    g[desde].ideas = g[desde].ideas.filter(x => x !== ideaId); g[hacia].ideas.push(ideaId);
    this.preview.grupos = g.filter(x => x.ideas.length); this.renderPreview();
  },
  async aplicar(reemplazar) {
    if (!this.preview) return; const pid = this.opts.pilarId || (this.scope ? Number(this.scope) : null);
    if (reemplazar && !confirm('¿Reemplazar los grupos existentes ' + (pid ? 'de este pilar' : 'de todos los pilares') + ' por esta consolidación? Las ideas originales no se pierden.')) return;
    try { await DB.admin('importar_consolidacion', { grupos: this.preview.grupos.filter(g => g.ideas.length), reemplazar, pilar_id: pid }); toast('Consolidación aplicada ✓'); this.preview = null; $('mecePreview').innerHTML = ''; this.opts.onApplied && this.opts.onApplied(); } catch (e) { toast(errMsg(e), 'err'); }
  }
};
