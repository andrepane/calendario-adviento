!function () {
  'use strict';

  const ER = window.EscapeRoom;
  const porId = id => document.getElementById(id);
  if (!ER.local()) {
    porId('solo-local').hidden = false;
    return;
  }

  const claveBorrador = 'adviento-editor-2026-borrador';
  const clavePrueba = 'adviento-editor-2026-prueba';
  const claveDia = 'adviento-editor-2026-dia';
  const formulario = porId('formulario-editor');
  const campos = formulario.elements;
  const vista = porId('vista-previa');
  const marco = porId('casa-prueba');
  const fecha = porId('fecha-prueba');
  const origen = location.protocol === 'file:' ? '*' : location.origin;
  const arrays = ['respuestas', 'opciones', 'orden', 'pistas'];
  const camposTexto = Object.keys(ER.capitulo()).filter(campo =>
    typeof ER.capitulo()[campo] === 'string');
  const desdeLineas = valor => valor.split(/\r?\n/).map(linea => linea.trim()).filter(Boolean);

  let datos = leerBorrador();
  let dia = Number(leer(claveDia));
  let prueba = leer(clavePrueba);
  let sesionPrueba;
  let hayCambios = false;
  let hayRespaldo = false;
  if (!ER.dias.includes(dia)) dia = 1;
  if (/^\d{4}-\d{2}-\d{2}$/.test(prueba?.fecha)) fecha.value = prueba.fecha;
  prueba = { fecha: fecha.value, avance: ER.progreso(prueba?.avance) };

  function leer(clave) {
    try { return JSON.parse(localStorage.getItem(clave)); } catch { return undefined; }
  }

  function leerBorrador() {
    try { return ER.calendario(leer(claveBorrador)); }
    catch {
      const demo = ER.calendario(window.CALENDARIO_PUBLICADO);
      if (demo.partida === 'demo-2026') {
        for (const dia of ER.dias.slice(3, 23)) demo.capitulos[dia - 1].listo = false;
      }
      return { ...demo, partida: 'cintia-2026' };
    }
  }

  function guardar(clave, valor) {
    try {
      localStorage.setItem(clave, JSON.stringify(valor));
      return true;
    } catch { return false; }
  }

  function anunciar(texto) {
    porId('estado-editor').textContent = texto;
  }

  function guardarDia() {
    const reto = Object.fromEntries(camposTexto.map(campo => [campo, campos.namedItem(campo).value]));
    for (const campo of arrays) reto[campo] = desdeLineas(campos.namedItem(campo).value);
    reto.correcta = Number(campos.correcta.value);
    reto.listo = campos.listo.checked;
    reto.dependencias = [...porId('lista-evidencias').querySelectorAll('input:checked')].map(input => input.value);
    datos.capitulos[dia - 1] = ER.capitulo(reto);
  }

  function listaDependencias(reto) {
    const padre = porId('lista-evidencias');
    const evidencias = ER.evidencias(datos);
    for (const id of reto.dependencias) {
      if (evidencias.some(evidencia => evidencia.id === id)) continue;
      evidencias.push({ id, dia: id.replace('evidencia-', ''), titulo: 'Evidencia que falta' });
    }
    padre.replaceChildren();
    for (const evidencia of evidencias) {
      const etiqueta = document.createElement('label');
      const control = document.createElement('input');
      control.type = 'checkbox';
      control.value = evidencia.id;
      control.checked = reto.dependencias.includes(evidencia.id);
      const tarde = Number(evidencia.dia) >= dia ? ' · se gana demasiado tarde' : '';
      etiqueta.append(control, ` Día ${evidencia.dia} · ${evidencia.titulo}${tarde}`);
      padre.append(etiqueta);
    }
    if (!evidencias.length) padre.textContent = 'Añade primero una evidencia en otro capítulo.';
  }

  function actualizarOpciones() {
    const seleccionada = Number(campos.correcta.value);
    const anterior = campos.correcta.selectedOptions[0]?.textContent;
    const opciones = desdeLineas(campos.opciones.value);
    campos.correcta.replaceChildren(new Option('Elige la respuesta', '-1'),
      ...opciones.map((opcion, i) => new Option(opcion, String(i))));
    const nuevoIndice = opciones.indexOf(anterior);
    const indice = opciones[seleccionada] === anterior ? seleccionada : nuevoIndice;
    campos.correcta.value = String(indice);
  }

  function mostrarDia() {
    const reto = datos.capitulos[dia - 1];
    porId('dia-editor').textContent = `Día ${dia}`;
    porId('campo-premio').hidden = dia !== 24;
    for (const campo of camposTexto) campos.namedItem(campo).value = reto[campo];
    for (const campo of arrays) campos.namedItem(campo).value = reto[campo].join('\n');
    campos.listo.checked = reto.listo;
    campos.correcta.replaceChildren(new Option('Elige la respuesta', '-1'),
      ...reto.opciones.map((opcion, i) => new Option(opcion, String(i))));
    campos.correcta.value = String(reto.opciones[reto.correcta] ? reto.correcta : -1);
    listaDependencias(reto);
    actualizarVistaEditor();
  }

  function estado(reto, errores) {
    if (reto.listo && !errores.length) return 'listo';
    const campos = [...camposTexto.filter(campo => campo !== 'tipo'), ...arrays, 'dependencias'];
    return campos.some(campo => reto[campo].length) ? 'borrador' : 'vacío';
  }

  function rellenarAvisos(padre, mensajes) {
    padre.replaceChildren(...mensajes.map(mensaje => {
      const aviso = document.createElement('li');
      aviso.textContent = mensaje;
      return aviso;
    }));
  }

  function actualizarVistaEditor() {
    for (const panel of formulario.querySelectorAll('[data-tipo]')) {
      panel.hidden = panel.dataset.tipo !== campos.tipo.value;
    }

    let listos = 0;
    const avisos = [];
    const marcas = { listo: '✓', borrador: '·', vacío: '–' };
    for (const numero of ER.dias) {
      const reto = datos.capitulos[numero - 1];
      const errores = ER.errores(datos, numero);
      const estadoDia = estado(reto, errores);
      const boton = porId('dias-editor').children[numero - 1];
      boton.dataset.estado = estadoDia;
      boton.setAttribute('aria-label', `Día ${numero}, ${estadoDia}`);
      boton.setAttribute('aria-current', String(dia === numero));
      boton.lastElementChild.textContent = marcas[estadoDia];
      if (estadoDia === 'listo') listos++;
      if (errores.length) avisos.push(`Día ${numero}: ${errores.join('; ')}. El capítulo incompleto impide avanzar.`);
      else if (!reto.listo) avisos.push(`Día ${numero}: se puede probar. Márcalo como listo para preparar la publicación.`);
      if (dia === numero) rellenarAvisos(porId('avisos-dia'), errores.map(error => `Día ${dia}: ${error}.`));
    }
    porId('resumen-capitulos').textContent = `${listos} de 24 listos · ✓ listo · · borrador · – vacío`;
    rellenarAvisos(porId('avisos-publicacion'), avisos);
    if (!avisos.length) {
      const listo = document.createElement('li');
      listo.textContent = 'Los 24 capítulos están listos.';
      porId('avisos-publicacion').append(listo);
    }
    const dependenciasRotas = avisos.filter(aviso => /evidencia del día/.test(aviso));
    porId('revision-publicacion').querySelector('summary').textContent = dependenciasRotas.length
      ? `Revisar capítulos y dependencias · ${dependenciasRotas.length} con avisos de evidencias`
      : 'Revisar capítulos y dependencias';
    return avisos;
  }

  function descargar(nombre, contenido, tipo) {
    const url = URL.createObjectURL(new Blob([contenido], { type: tipo }));
    const enlace = document.createElement('a');
    enlace.href = url;
    enlace.download = nombre;
    enlace.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  for (const numero of ER.dias) {
    const boton = document.createElement('button');
    const marca = document.createElement('span');
    marca.setAttribute('aria-hidden', 'true');
    boton.type = 'button';
    boton.append(String(numero), marca);
    boton.addEventListener('click', () => {
      guardarDia();
      dia = numero;
      guardar(claveDia, dia);
      mostrarDia();
    });
    porId('dias-editor').append(boton);
  }

  formulario.addEventListener('input', evento => {
    if (evento.target === campos.opciones) actualizarOpciones();
    guardarDia();
    hayCambios = true;
    hayRespaldo = false;
    const avisos = actualizarVistaEditor();
    const afectado = avisos.find(aviso => aviso.startsWith('Día ')
      && aviso.includes(`falta la evidencia del día ${dia}`));
    anunciar(afectado || 'Cambios pendientes de guardar.');
  });

  formulario.addEventListener('submit', evento => {
    evento.preventDefault();
    guardarDia();
    const guardado = guardar(claveBorrador, datos);
    hayCambios = !guardado;
    anunciar(guardado ? `Borrador guardado. Puedes continuar desde el día ${dia}.`
      : 'El navegador bloqueó el guardado. Exporta un respaldo para conservar los cambios.');
  });

  porId('previsualizar').addEventListener('click', () => {
    guardarDia();
    const reto = datos.capitulos[dia - 1];
    porId('dia-vista').textContent = `Vista previa · ${dia} de diciembre`;
    porId('titulo-vista').textContent = reto.titulo || 'Capítulo sin título';
    const pruebaVista = porId('contenido-vista');
    const ganadas = ER.evidencias(datos).filter(evidencia => evidencia.dia < dia);
    ER.vista.renderizar(pruebaVista, reto, {
      ganadas,
      comprobar: respuesta => {
        if (!ER.acertada(reto, respuesta)) return false;
        ER.vista.renderizar(pruebaVista, reto, {
          ganadas,
          resuelto: true,
          evidenciaNueva: ER.evidencias(datos).find(evidencia => evidencia.dia === dia)
        });
        pruebaVista.querySelector('.resultado-reto').focus();
        return true;
      }
    });
    vista.showModal();
    vista.scrollTop = 0;
  });

  vista.addEventListener('close', () => porId('contenido-vista').replaceChildren());

  fecha.addEventListener('change', () => {
    prueba.fecha = fecha.value;
    guardar(clavePrueba, prueba);
  });

  porId('formulario-prueba').addEventListener('submit', evento => {
    evento.preventDefault();
    guardarDia();
    prueba.fecha = fecha.value;
    guardar(clavePrueba, prueba);
    sesionPrueba = { datos: structuredClone(datos), fecha: prueba.fecha };
    marco.src = './index.html?prueba';
    marco.hidden = false;
    marco.scrollIntoView({ block: 'nearest' });
  });

  porId('reiniciar-prueba').addEventListener('click', () => {
    prueba.avance = ER.progreso();
    guardar(clavePrueba, prueba);
    sesionPrueba = undefined;
    marco.hidden = true;
    marco.removeAttribute('src');
    anunciar('Progreso de prueba reiniciado.');
  });

  window.addEventListener('message', evento => {
    if (!sesionPrueba || evento.source !== marco.contentWindow
        || evento.origin !== (origen === '*' ? 'null' : origen)) return;
    if (evento.data?.tipo === 'escape-listo') {
      marco.contentWindow.postMessage({
        tipo: 'escape-iniciar', ...sesionPrueba, avance: prueba.avance
      }, origen);
    } else if (evento.data?.tipo === 'escape-progreso') {
      prueba.avance = ER.progreso(evento.data.avance);
      if (!guardar(clavePrueba, prueba)) anunciar('El navegador no pudo guardar el progreso de prueba.');
    }
  });

  porId('exportar').addEventListener('click', () => {
    guardarDia();
    descargar('respaldo-calendario.json', JSON.stringify(datos, null, 2), 'application/json');
    hayRespaldo = true;
    anunciar('Respaldo exportado. Conserva los archivos multimedia en sus mismas rutas.');
  });

  const archivo = porId('archivo-respaldo');
  porId('importar').addEventListener('click', () => archivo.click());
  archivo.addEventListener('change', async () => {
    if (!archivo.files.length) return;
    try {
      if (hayCambios && !hayRespaldo) {
        anunciar('Guarda o exporta los cambios pendientes antes de importar un respaldo.');
        return;
      }
      datos = ER.calendario(JSON.parse(await archivo.files[0].text()));
      hayCambios = true;
      hayRespaldo = false;
      mostrarDia();
      anunciar('Respaldo importado. Pulsa «Guardar borrador» para conservarlo en este navegador.');
    } catch (error) {
      anunciar(`No se pudo importar el respaldo. ${error.message}`);
    } finally {
      archivo.value = '';
    }
  });

  porId('preparar').addEventListener('click', () => {
    guardarDia();
    const avisos = actualizarVistaEditor();
    if (avisos.length) {
      const revision = porId('revision-publicacion');
      revision.open = true;
      revision.querySelector('summary').focus();
      anunciar('Revisa los avisos y marca los 24 capítulos como listos.');
      return;
    }
    const publicado = { ...datos, partida: datos.partida === 'demo-2026' ? 'cintia-2026' : datos.partida };
    descargar('calendario-publicado.js',
      `window.CALENDARIO_PUBLICADO = ${JSON.stringify(publicado, null, 2)};\n`, 'text/javascript');
    anunciar('Archivo preparado. Sustituye calendario-publicado.js para instalar la versión de Cintia.');
  });

  for (const [valor, etiqueta] of Object.entries(ER.tipos)) campos.tipo.add(new Option(etiqueta, valor));
  porId('editor-local').hidden = false;
  mostrarDia();
}();
