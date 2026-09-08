/* Panel reutilizable de consolidación MECE con IA (admin y líderes) */
window.MeceUI = {
  mount(el, opts) {
    this.opts = opts; this.el = el; this.preview = null;
    el.innerHTML = `
      <div class="bg-white rounded-xl shadow p-5 border-t-4 border-purple-500">
        <h3 class="font-black text-lg text-purple-800"><i class="fas fa-wand-magic-sparkles mr-2"></i>Consolidación MECE con IA</h3>
        <p class="text-xs text-gray-500 mt-1">Agrupa las ideas ${opts.pilarId ? 'de este pilar' : 'de todos los pilares'} en ideas consolidadas (cada idea en un solo grupo, ninguna por fuera). Las ideas marcadas como repetidas no se envían.</p>
        <div class="grid md:grid-cols-2 gap-4 mt-4">
          <div class="space-y-2">
            <label class="block text-xs font-bold text-gray-600">API key de Anthropic (solo vive en este navegador)</label>
            <div class="flex gap-2"><input id="meceKey" type="password" class="flex-1 p-2 border rounded text-sm" placeholder="sk-ant-..." value="${MECE.getKey()}"><button onclick="MeceUI.saveKey()" class="px-3 bg-gray-200 rounded text-xs font-bold">Guardar</button></div>
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
  },
  saveKey() { MECE.setKey($('meceKey').value); toast('API key guardada en este navegador'); },
  datos() {
    const snap = this.opts.getSnap();
    const pilares = this.opts.pilarId ? snap.pilares.filter(p => p.id === this.opts.pilarId) : snap.pilares;
    const ideas = snap.ideas.filter(i => i.tipo === 'idea' && i.estado !== 'repetida' && pilares.some(p => p.id === i.pilar_id));
    return { sesion: snap.sesion, pilares, ideas };
  },
  async copiarPrompt() { const d = this.datos(); if (!d.ideas.length) return toast('No hay ideas para consolidar', 'warn'); const p = MECE.buildPrompt(d); try { await navigator.clipboard.writeText(p); toast('Prompt copiado (' + d.ideas.length + ' ideas)'); } catch (e) { prompt('Copia el prompt:', p); } },
  pegar() { try { const d = this.datos(); this.preview = MECE.validate(MECE.parse($('meceJson').value), d); this.renderPreview(); } catch (e) { toast('JSON inválido: ' + e.message, 'err'); } },
  async generar() {
    const key = $('meceKey').value.trim(); if (!key) return toast('Pega tu API key de Anthropic', 'warn'); MECE.setKey(key);
    const d = this.datos(); if (!d.ideas.length) return toast('No hay ideas para consolidar', 'warn');
    const btn = $('meceGen'); btn.disabled = true; btn.innerHTML = '<i class="fas fa-circle-notch fa-spin mr-2"></i>Consolidando ' + d.ideas.length + ' ideas…'; $('meceStatus').textContent = 'Llamando a ' + MECE.MODEL + '…';
    try { const txt = await MECE.call(MECE.buildPrompt(d), key); $('meceJson').value = txt; this.preview = MECE.validate(MECE.parse(txt), d); $('meceStatus').textContent = 'Listo: revisa y aplica.'; this.renderPreview(); }
    catch (e) { $('meceStatus').textContent = 'Error: ' + e.message; toast('Error IA: ' + e.message, 'err'); }
    finally { btn.disabled = false; btn.innerHTML = '<i class="fas fa-robot mr-2"></i>Generar consolidación con IA'; }
  },
  renderPreview() {
    const d = this.datos(), pv = this.preview, box = $('mecePreview');
    const cubiertas = new Set(pv.grupos.flatMap(g => g.ideas));
    box.innerHTML = `<div class="border rounded-lg p-4 bg-purple-50"><div class="flex justify-between items-center flex-wrap gap-2"><div class="font-bold text-purple-900">Previsualización: ${pv.grupos.length} grupos · ${cubiertas.size} de ${d.ideas.length} ideas cubiertas</div>
      <div class="flex gap-2"><button onclick="MeceUI.aplicar(true)" class="bg-purple-700 text-white px-4 py-2 rounded font-bold text-sm"><i class="fas fa-check mr-1"></i>Aplicar (reemplaza grupos IA anteriores)</button><button onclick="MeceUI.aplicar(false)" class="bg-white border px-4 py-2 rounded font-bold text-sm">Agregar sin reemplazar</button></div></div>
      <div class="grid md:grid-cols-2 gap-3 mt-3">${pv.grupos.map((g, k) => { const p = d.pilares.find(p => p.id === g.pilar_id) || {}; const c = col(p.color); return `<div class="bg-white rounded-lg p-3 border-l-4 ${c.border}"><div class="text-[10px] font-mono uppercase ${c.text}">${esc(p.nombre || 'Sin pilar')}</div>
        <input class="w-full font-bold text-sm mt-1 border-b" value="${esc(g.titulo)}" onchange="MeceUI.preview.grupos[${k}].titulo=this.value"><input class="w-full text-xs text-gray-600 mt-1 border-b" value="${esc(g.descripcion_corta)}" onchange="MeceUI.preview.grupos[${k}].descripcion_corta=this.value"><textarea class="w-full text-xs text-gray-500 mt-1 border rounded p-1" rows="2" onchange="MeceUI.preview.grupos[${k}].detalle=this.value">${esc(g.detalle)}</textarea>
        <ul class="mt-2 text-xs text-gray-700 list-disc pl-4">${g.ideas.map(id => { const i = d.ideas.find(x => x.id === id) || {}; return `<li>${esc(i.texto || ('#' + id))}</li>`; }).join('')}</ul></div>`; }).join('')}</div></div>`;
  },
  async aplicar(reemplazar) {
    if (!this.preview) return; if (reemplazar && !confirm('¿Reemplazar los grupos existentes ' + (this.opts.pilarId ? 'de este pilar' : 'de todos los pilares') + ' por esta consolidación? Las ideas originales no se pierden.')) return;
    try { await DB.admin('importar_consolidacion', { grupos: this.preview.grupos, reemplazar, pilar_id: this.opts.pilarId || null }); toast('Consolidación aplicada ✓'); this.preview = null; $('mecePreview').innerHTML = ''; this.opts.onApplied && this.opts.onApplied(); } catch (e) { toast(errMsg(e), 'err'); }
  }
};
