!function () {
  'use strict';

  const ER = window.EscapeRoom;
  const porId = id => document.getElementById(id);
  if (!ER.local()) {
    porId('solo-local').hidden = false;
    return;
  }

  const prefijo = 'adviento-editor-2026-';
  const claveEspacio = prefijo + 'espacio';
  const claveCopias = prefijo + 'copias';
  const formulario = porId('formulario-editor');
  const campos = formulario.elements;
  const vista = porId('vista-previa');
  const marco = porId('casa-prueba');
  const fecha = porId('fecha-prueba');
  const origen = location.protocol === 'file:' ? '*' : location.origin;
  const arrays = ['respuestas', 'opciones', 'orden', 'pistas'];
  const plantilla = ER.capitulo();
  const camposTexto = Object.keys(plantilla).filter(campo => typeof plantilla[campo] === 'string');
  const desdeLineas = valor => valor.split(/\r?\n/).map(linea => linea.trim()).filter(Boolean);

  const restauradas = leer(claveCopias);
  const copias = Array.isArray(restauradas) ? restauradas.filter(copia =>
    typeof copia?.id === 'string' && /^copia-[a-z0-9-]+$/.test(copia.id) && typeof copia.nombre === 'string') : [];
  const nombres = new Map([['original', 'Mis borradores'], ['campana', 'Escape room de prueba'],
    ['campana3946', 'Campaña 3946 · versión 2'],
    ['mecanismos', 'Campaña de mecanismos · versión 3'],
    ['caja', 'La caja de Adviento · versión 4'],
    ['transmisiones', 'Cerradura de transmisiones · versión 5'],
    ['historia', 'La búsqueda del huevo · campaña actual'],
    ...copias.map(copia => [copia.id, copia.nombre])]);
  const abiertos = new Map();
  let espacio = leer(claveEspacio);
  if (!nombres.has(espacio)) espacio = 'original';
  const clave = (tipo, id = espacio) => prefijo + tipo + (id === 'original' ? '' : '-' + id);
  let datos, dia, prueba, hayCambios, hayRespaldo;
  let sesionPrueba;
  let ultimaExperiencia='dia1';
  porId('reducir-movimiento-pruebas').addEventListener('change',e=>document.documentElement.classList.toggle('movimiento-reducido',e.target.checked));
  const camposExperiencia=porId('formulario-experiencias').elements;
  function mostrarExperienciaConfig(){
    for(const [campo,valor]of Object.entries(datos.experiencia)){
      const control=camposExperiencia.namedItem(campo);
      if(control.type==='checkbox')control.checked=valor;else control.value=valor;
    }
  }
  function guardarExperienciaConfig(){
    for(const campo of Object.keys(datos.experiencia)){
      const control=camposExperiencia.namedItem(campo);
      datos.experiencia[campo]=control.type==='checkbox'?control.checked:control.value;
    }
  }
  porId('formulario-experiencias').addEventListener('input',()=>{guardarExperienciaConfig();hayCambios=true;hayRespaldo=false;anunciar('Configuración pendiente de guardar.');});
  porId('formulario-experiencias').addEventListener('submit',e=>{e.preventDefault();guardarExperienciaConfig();formulario.requestSubmit();});
  function probarExperiencia(tipo,reiniciar=false){
    guardarDia();guardarExperienciaConfig();ultimaExperiencia=tipo;
    const inicio=porId('inicio-final').value;
    const id=tipo==='final'?'final-'+inicio:tipo;
    const pruebas=leer(clave('escenas-previas'))??{};
    if(tipo==='dia1'&&pruebas[id]?.configuracion!==datos.capitulos[0].configuracion)delete pruebas[id];
    if(reiniciar)delete pruebas[id];
    const estado=pruebas[id]??{resuelto:tipo==='final'&&inicio!=='antes',desenlace:{etapa:inicio==='paquete'?6:0}};
    pruebas[id]=estado;
    if(tipo==='dia1')estado.configuracion=datos.capitulos[0].configuracion;
    const persistir=()=>guardar(clave('escenas-previas'),pruebas);
    if(tipo==='introduccion'){
      sesionPrueba={datos:structuredClone(datos),fecha:'2026-12-24',avance:ER.progreso(),temporal:true,movimientoReducido:porId('reducir-movimiento-pruebas').checked};
      marco.src='./index.html?prueba&introduccion';marco.hidden=false;marco.scrollIntoView({block:'start'});
      anunciar('Prueba independiente de la introducción. Usa Saltar o abre el cierre.');return;
    }
    const numero=tipo==='dia1'?1:24,reto=datos.capitulos[numero-1],padre=porId('contenido-vista');
    porId('dia-vista').textContent='Prueba independiente · día '+numero;
    porId('titulo-vista').textContent=reto.titulo;
    function dibujar(){
      ER.vista.renderizar(padre,reto,{
        esEditor:true,
        ganadas:ER.evidencias(datos),resuelto:estado.resuelto,interaccion:estado.interaccion,
        experiencia:datos.experiencia,desenlace:estado.desenlace,
        guardarDesenlace:s=>{estado.desenlace=s;persistir();},
        guardarInteraccion:s=>{estado.interaccion=s;persistir();},
        comprobar:respuesta=>{if(!ER.acertada(reto,respuesta))return false;estado.resuelto=true;persistir();dibujar();padre.querySelector('.resultado-reto')?.focus({preventScroll:true});return true;},
        mensajeLlave:numero===1?'Has ganado la llave del día 2. Su fecha sigue siendo necesaria.':undefined,
        volverAJugar:()=>{estado.resuelto=false;delete estado.interaccion;persistir();dibujar();}
      });
      const reset=document.createElement('button');reset.type='button';reset.className='control-reto';reset.textContent='Reiniciar esta previsualización';reset.addEventListener('click',()=>probarExperiencia(tipo,true));padre.append(reset);
    }
    persistir();dibujar();if(!vista.open)vista.showModal();vista.scrollTop=0;
  }
  porId('probar-introduccion').addEventListener('click',()=>probarExperiencia('introduccion',true));
  porId('probar-dia-1').addEventListener('click',()=>probarExperiencia('dia1'));
  porId('probar-final').addEventListener('click',()=>probarExperiencia('final'));
  porId('reiniciar-experiencia').addEventListener('click',()=>probarExperiencia(ultimaExperiencia,true));

  function leer(clave) {
    try { return JSON.parse(localStorage.getItem(clave)); } catch { return undefined; }
  }

  function leerBorrador(id = espacio) {
    try { return ER.calendario(leer(clave('borrador', id))); }
    catch {
      if(id==='historia')return ER.calendario(window.CALENDARIO_PUBLICADO);
      if(id==='transmisiones')return ER.cerradura4.campana(abiertos.get('caja')?.datos??leer(clave('borrador','caja'))??window.CALENDARIO_PUBLICADO);
      if(id==='caja')return ER.experiencias.campana(abiertos.get('mecanismos')?.datos??leer(clave('borrador','mecanismos'))??window.CAMPANA_MECANISMOS);
      if(id==='mecanismos'){
        const nueva=ER.calendario(window.CAMPANA_MECANISMOS);
        const previa=abiertos.get('campana3946')?.datos??leer(clave('borrador','campana3946'));
        if(previa){
          const base=ER.calendario(previa);
          const sustituidos=new Set([4,6,7,11,12,14,17,21]);
          const dependencias=new Map([16,18,23,24].map(dia=>[dia,[...nueva.capitulos[dia-1].dependencias]]));
          for(const dia of ER.dias)if(!sustituidos.has(dia))nueva.capitulos[dia-1]=structuredClone(base.capitulos[dia-1]);
          for(const [dia,referencias]of dependencias)nueva.capitulos[dia-1].dependencias=referencias;
          nueva.capitulos[23].combinacion='3946';
        }
        const publicada=ER.calendario(window.CALENDARIO_PUBLICADO);
        nueva.capitulos[0]=structuredClone(publicada.capitulos[0]);
        for(const anterior of ['campana3946','original','campana']){
          const guardada=abiertos.get(anterior)?.datos??leer(clave('borrador',anterior));
          if(!guardada)continue;
          nueva.capitulos[0]=structuredClone(ER.calendario(guardada).capitulos[0]);break;
        }
        return nueva;
      }
      if (id === 'campana3946') {
        const nueva = ER.calendario(window.CAMPANA_3946);
        for (const anterior of ['original', 'campana']) {
          const previa = abiertos.get(anterior)?.datos ?? leer(clave('borrador', anterior));
          if (!previa) continue;
          const personal = ER.calendario(previa).capitulos[0];
          const ejemplo = ER.capitulo(anterior === 'campana'
            ? window.CAMPANA_PRUEBA.capitulos[0] : window.CALENDARIO_PUBLICADO.capitulos[0]);
          if (JSON.stringify(personal) !== JSON.stringify(ejemplo)) {
            nueva.capitulos[0] = structuredClone(personal);
            break;
          }
        }
        return nueva;
      }
      if (id === 'campana') return ER.calendario(window.CAMPANA_PRUEBA);
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

  function cerrarPrueba() {
    sesionPrueba = undefined;
    marco.hidden = true;
    marco.removeAttribute('src');
  }

  function elegirEspacio(id) {
    if (datos && espacio !== id) {
      guardarDia();
      abiertos.set(espacio, { datos, dia, prueba, hayCambios, hayRespaldo });
      cerrarPrueba();
    }
    espacio = id;
    const estado = abiertos.get(id);
    datos = estado?.datos ?? leerBorrador();
    const seleccionado = Number(estado?.dia ?? leer(clave('dia')));
    dia = ER.dias.includes(seleccionado) ? seleccionado : 1;
    const anterior = estado?.prueba ?? leer(clave('prueba'));
    const fechaAnterior = anterior?.fecha;
    fecha.value = /^\d{4}-\d{2}-\d{2}$/.test(fechaAnterior) ? fechaAnterior : '2026-12-01';
    prueba = { fecha: fecha.value, avance: ER.progreso(anterior?.avance) };
    hayCambios = estado?.hayCambios ?? false;
    hayRespaldo = estado?.hayRespaldo ?? false;
    guardar(claveEspacio, espacio);

    porId('espacio-activo').textContent = nombres.get(id);
    porId('cargar-campana').hidden = id === 'campana';
    porId('cargar-3946').hidden = id === 'campana3946';
    porId('cargar-mecanismos').hidden=id==='mecanismos';
    porId('cargar-caja').hidden=id==='caja';
    porId('cargar-transmisiones').hidden=id==='transmisiones';
    porId('cargar-historia').hidden=id==='historia';
    mostrarExperienciaConfig();
    porId('volver-borradores').hidden = id === 'original';
    const original = (abiertos.get('original')?.datos ?? leerBorrador('original')).capitulos[0];
    const demo = ER.capitulo(window.CALENDARIO_PUBLICADO.capitulos[0]);
    porId('copiar-dia-uno').hidden = !['campana', 'campana3946','mecanismos'].includes(id) || !(original.titulo || original.imagen)
      || JSON.stringify(original) === JSON.stringify(demo);
    const selector = porId('copias');
    selector.replaceChildren(new Option('Elige un respaldo', ''),
      ...copias.map(copia => new Option(copia.nombre, copia.id)));
    selector.value = copias.some(copia => copia.id === id) ? id : '';
    porId('selector-copias').hidden = !copias.length;
    mostrarDia();
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
    porId('respuestas-especiales').value = reto.respuestas.join('\n');
    campos.listo.checked = reto.listo;
    campos.correcta.replaceChildren(new Option('Elige la respuesta', '-1'),
      ...reto.opciones.map((opcion, i) => new Option(opcion, String(i))));
    campos.correcta.value = String(reto.opciones[reto.correcta] ? reto.correcta : -1);
    listaDependencias(reto);
    mostrarParametros();
    actualizarVistaEditor();
  }

  function mostrarParametros() {
    const panel = porId('parametros-juego');
    panel.replaceChildren();
    let config;
    try { config = JSON.parse(campos.configuracion.value); } catch { return; }
    if (!config || typeof config !== 'object' || Array.isArray(config)) return;
    function control(nombre, valor, tipo, modificar) {
      const etiqueta = document.createElement('label');
      etiqueta.textContent = nombre;
      const entrada = document.createElement(tipo === 'textarea' ? 'textarea' : 'input');
      if (tipo !== 'textarea') entrada.type = tipo;
      else entrada.rows = 6;
      entrada.value = valor ?? '';
      entrada.addEventListener('input', () => {
        modificar(entrada.value);
        campos.configuracion.value = JSON.stringify(config, null, 2);
      });
      etiqueta.append(entrada);
      panel.append(etiqueta);
      return entrada;
    }
    if(campos.tipo.value==='cerradura'&&config.version===2){
      const resumen=document.createElement('p');
      function distancia(){
        const revision=ER.cerradura4.revision(config);
        resumen.textContent=revision.error??('Distancia mínima comprobada: '+revision.minimo+' giros. '+(revision.soloA===null&&revision.soloB===null?'Ambas transmisiones son necesarias.':'Aviso: puede resolverse usando una sola transmisión.'));
        if(!revision.error)config.solucion=revision.solucion;
      }
      for(const [campo,nombre]of [['inicio','Estado inicial, ruedas 1–4 (0–7)'],['objetivos','Posiciones objetivo, ruedas 1–4 (0–7)']]){
        control(nombre,(config[campo]??[]).join(', '),'text',valor=>{config[campo]=valor.split(',').map(v=>Number(v.trim()));distancia();});
      }
      const transmision=document.createElement('label');transmision.textContent='Transmisión inicial';
      const select=document.createElement('select');select.add(new Option('Transmisión A','A'));select.add(new Option('Transmisión B','B'));select.value=config.transmision;
      select.addEventListener('change',()=>{config.transmision=select.value;distancia();campos.configuracion.value=JSON.stringify(config,null,2);campos.configuracion.dispatchEvent(new Event('input',{bubbles:true}));});transmision.append(select);panel.append(transmision);
      const recalcular=document.createElement('button');recalcular.type='button';recalcular.className='control-reto';recalcular.textContent='Recalcular solución de referencia';
      recalcular.addEventListener('click',()=>{distancia();campos.configuracion.value=JSON.stringify(config,null,2);campos.configuracion.dispatchEvent(new Event('input',{bubbles:true}));});
      distancia();panel.append(resumen,recalcular);
    }else if(campos.tipo.value==='cerradura'){
      const resumen=document.createElement('p');
      function distancia(){resumen.textContent=ER.experiencias.configValida(config)?'Distancia mínima comprobada: '+ER.experiencias.ruta(config).length+' giros.':'Usa tres números enteros entre 0 y 5.';}
      for(const [campo,nombre]of [['inicio','Estado inicial (exterior, central, interior; 0–5)'],['objetivos','Posiciones objetivo (exterior, central, interior; 0–5)']]){
        control(nombre,(config[campo]??[]).join(', '),'text',valor=>{config[campo]=valor.split(',').map(v=>Number(v.trim()));distancia();});
      }
      distancia();panel.append(resumen);
    }
    if (campos.tipo.value === 'electrico') {
      const grupo = document.createElement('fieldset');
      grupo.className = 'config-luces';
      const leyenda = document.createElement('legend');
      leyenda.textContent = 'Luces encendidas al empezar';
      grupo.append(leyenda);
      const resumen = document.createElement('p');
      resumen.setAttribute('role','status');
      function informar() {
        if (!ER.especiales.configuracionElectricaValida(config)) {
          resumen.textContent = 'Configura nueve posiciones válidas y el límite de interruptores.';
          return;
        }
        const soluciones = ER.especiales.solucionesElectricas(config);
        resumen.textContent = soluciones.length === 1 ? 'Solución única dentro del límite elegido.'
          : soluciones.length ? `${soluciones.length} soluciones dentro del límite elegido.`
          : 'Este tablero no puede resolverse dentro del límite elegido.';
      }
      grupo.style.setProperty('--lado-electrico',config.lado??3);
      for (let n=1;n<=(config.lado??3)**2;n++) {
        const etiqueta = document.createElement('label');
        const check = document.createElement('input');
        check.type = 'checkbox';
        check.checked = Array.isArray(config.inicial) && config.inicial.includes(n);
        check.dataset.luz = n;
        check.addEventListener('input',()=>{
          config.inicial = [...grupo.querySelectorAll('input:checked')].map(c=>Number(c.dataset.luz));
          campos.configuracion.value = JSON.stringify(config,null,2);
          informar();
        });
        etiqueta.append(check,String(n));
        grupo.append(etiqueta);
      }
      panel.append(grupo);
      const maximo = control('Máximo de interruptores seleccionados',config.maximo,'number',valor=>{
        config.maximo = Number(valor); informar();
      });
      maximo.min=1;
      maximo.max=(config.lado??3)**2;
      panel.append(resumen);
      informar();
    }
    if (campos.tipo.value === 'ahorcado') {
      control('Palabra o frase del ahorcado', config.palabra, 'text', valor => { config.palabra = valor.toUpperCase(); });
      const fallos = control('Fallos permitidos', config.fallos, 'number', valor => { config.fallos = Number(valor); });
      fallos.min = 1;
      fallos.max = 20;
      const inicial = control('Posición revelada al empezar (0 es la primera)', config.inicial, 'number', valor => { config.inicial = Number(valor); });
      inicial.min = 0;
    }
    if (campos.tipo.value === 'fragmentos') {
      const duracion = control('Duración de cada fotograma (ms)', config.duracion, 'number', valor => { config.duracion = Number(valor); });
      duracion.min = 100;
      duracion.max = 30000;
      const pausa = control('Pausa entre fotogramas (ms)', config.pausa, 'number', valor => { config.pausa = Number(valor); });
      pausa.min = 100;
      pausa.max = 10000;
    }
    if (campos.tipo.value === 'nonograma') {
      const filas = Array.isArray(config.solucion) ? config.solucion : [];
      const resumen = document.createElement('p');
      function actualizarResumen() {
        if (!config.solucion?.length || !config.solucion.every(f => /^[01]+$/.test(f))
            || new Set(config.solucion.map(f=>f.length)).size !== 1) {
          resumen.textContent = 'La solución debe ser rectangular y usar 0 y 1.';
          return;
        }
        const pistas = ER.especiales.pistasNonograma(config.solucion);
        resumen.textContent = 'Pistas de filas: ' + pistas.filas.map(p => p.join(' ') || '0').join(' / ')
          + '. Columnas: ' + pistas.columnas.map(p => p.join(' ') || '0').join(' / ') + '.';
        if(ER.mecanismos&&config.solucion.length<=10&&config.solucion[0].length<=10){
          const revision=ER.mecanismos.resolverNonograma(config.solucion);
          resumen.textContent+=' '+(revision.soluciones.length===1?'Solución única.':'El dibujo admite varias soluciones.')
            +(revision.deducible?' Se resuelve por deducciones de líneas.':' Puede requerir más deducción o revisar las pistas.');
        }
      }
      const solucion = control('Solución del nonograma, una fila por línea (1 pintada, 0 vacía)',
        filas.join('\n'), 'textarea', valor => {
          config.solucion = valor.split(/\r?\n/).filter(Boolean);
          actualizarResumen();
        });
      const alto = control('Número de filas', filas.length, 'number', () => {});
      const ancho = control('Número de columnas', filas[0]?.length ?? 5, 'number', () => {});
      for (const dimension of [alto, ancho]) { dimension.min = 2; dimension.max = 12; }
      const redimensionar = document.createElement('button');
      redimensionar.type = 'button';
      redimensionar.className = 'control-reto';
      redimensionar.textContent = 'Aplicar dimensiones y generar pistas';
      redimensionar.addEventListener('click', () => {
        const h = Number(alto.value), w = Number(ancho.value);
        if (!Number.isInteger(h) || h < 2 || h > 12 || !Number.isInteger(w) || w < 2 || w > 12) {
          anunciar('El nonograma permite de 2 a 12 filas y columnas.');
          return;
        }
        config.solucion = Array.from({length:h},(_,y) => (config.solucion[y] ?? '').padEnd(w,'0').slice(0,w));
        solucion.value = config.solucion.join('\n');
        campos.configuracion.value = JSON.stringify(config,null,2);
        campos.configuracion.dispatchEvent(new Event('input',{bubbles:true}));
      });
      panel.append(redimensionar,resumen);
      actualizarResumen();
    }
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
    porId('configuracion-especial').hidden = !ER.especiales.esEspecial(campos.tipo.value);
    for (const panel of formulario.querySelectorAll('[data-tipo]')) {
      panel.hidden = panel.dataset.tipo !== campos.tipo.value;
    }
    for (const [selector, campo, idAyuda] of [
      ['recursoTipo', 'campo-recurso', 'ayuda-recurso'],
      ['evidenciaDibujo', 'campo-evidencia', 'ayuda-evidencia']
    ]) {
      const tipo = campos.namedItem(selector).value;
      porId(campo).hidden = !tipo;
      porId(idAyuda).textContent = ER.recursos.tipos[tipo]?.[1] ?? '';
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
      guardar(clave('dia'), dia);
      mostrarDia();
    });
    porId('dias-editor').append(boton);
  }

  formulario.addEventListener('input', evento => {
    if (evento.target === campos.tipo || evento.target === campos.configuracion) mostrarParametros();
    if (evento.target === porId('respuestas-especiales')) {
      campos.respuestas.value = evento.target.value;
    }
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
    const guardado = guardar(clave('borrador'), datos);
    hayCambios = !guardado;
    anunciar(guardado ? `Borrador guardado. Puedes continuar desde el día ${dia}.`
      : 'El navegador bloqueó el guardado. Exporta un respaldo para conservar los cambios.');
  });

  porId('cargar-historia').addEventListener('click',()=>{
    elegirEspacio('historia');
    if(!leer(clave('borrador')))guardar(clave('borrador'),datos);
    anunciar('Historia actual cargada en su propio borrador. Tus otros borradores siguen disponibles.');
  });
  porId('actualizar-retos-41314').addEventListener('click',()=>{
    guardarDia();
    for(const numero of [4,13,14])datos.capitulos[numero-1]=ER.capitulo(window.CALENDARIO_PUBLICADO.capitulos[numero-1]);
    hayCambios=true;hayRespaldo=false;mostrarDia();
    anunciar('Días 4, 13 y 14 actualizados en este borrador. Los demás capítulos se conservan. Guarda el borrador para mantenerlos.');
  });

  porId('cargar-campana').addEventListener('click', () => {
    elegirEspacio('campana');
    anunciar('Campaña de prueba cargada en un espacio separado.');
  });
  porId('cargar-3946').addEventListener('click', () => {
    elegirEspacio('campana3946');
    if (!leer(clave('borrador'))) guardar(clave('borrador'), datos);
    anunciar('Campaña 3946 cargada como una versión nueva. El día 1 conserva tu reto personal si ya estaba guardado.');
  });
  porId('cargar-mecanismos').addEventListener('click',()=>{
    elegirEspacio('mecanismos');
    if(!leer(clave('borrador')))guardar(clave('borrador'),datos);
    anunciar('Nueva campaña de mecanismos cargada en un espacio propio. Sus soluciones de referencia están en la configuración de cada reto.');
  });
  porId('cargar-caja').addEventListener('click',()=>{
    guardarDia();
    guardarExperienciaConfig();
    if(!guardar(clave('borrador'),datos)){anunciar('No se pudo conservar el borrador actual. Exporta un respaldo antes de cambiar de versión.');return;}
    hayCambios=false;
    const base=structuredClone(datos);
    if(!leer(clave('borrador','caja'))&&!abiertos.has('caja'))abiertos.set('caja',{datos:ER.experiencias.campana(base),dia:1});
    elegirEspacio('caja');
    guardar(clave('borrador'),datos);
    anunciar('Versión 4 creada en un espacio separado. Los otros 23 capítulos conservan tus datos.');
  });
  porId('cargar-transmisiones').addEventListener('click',()=>{
    guardarDia();guardarExperienciaConfig();
    if(!guardar(clave('borrador'),datos)){anunciar('No se pudo conservar el borrador. Exporta un respaldo antes de cambiar de versión.');return;}
    hayCambios=false;
    if(!leer(clave('borrador','transmisiones'))&&!abiertos.has('transmisiones'))abiertos.set('transmisiones',{datos:ER.cerradura4.campana(datos),dia:1});
    elegirEspacio('transmisiones');guardar(clave('borrador'),datos);
    anunciar('Versión 5 cargada en un espacio independiente. Previsualiza el día 1 para usar «Demostrar solución».');
  });
  porId('actualizar-dia-8').addEventListener('click', () => {
    guardarDia();
    datos.capitulos[7] = ER.capitulo(structuredClone(window.CAMPANA_3946.capitulos[7]));
    dia = 8;
    hayCambios = true;
    hayRespaldo = false;
    guardar(clave('dia'),dia);
    cerrarPrueba();
    mostrarDia();
    anunciar('Día 8 actualizado en este borrador. Pulsa «Guardar borrador». Reinicia la partida de prueba para volver a jugarlo si ya estaba resuelto.');
  });
  porId('volver-borradores').addEventListener('click', () => {
    elegirEspacio('original');
    anunciar('Has vuelto a tus borradores.');
  });
  porId('copias').addEventListener('change', evento => {
    if (nombres.has(evento.target.value)) elegirEspacio(evento.target.value);
  });
  porId('copiar-dia-uno').addEventListener('click', () => {
    guardarDia();
    const original = (abiertos.get('original')?.datos ?? leerBorrador('original')).capitulos[0];
    datos.capitulos[0] = structuredClone(original);
    dia = 1;
    guardar(clave('dia'), dia);
    hayCambios = true;
    hayRespaldo = false;
    cerrarPrueba();
    mostrarDia();
    anunciar('Tu día 1 se copió en la campaña de prueba. Guarda el borrador para conservar la copia.');
  });

  porId('previsualizar').addEventListener('click', () => {
    guardarDia();
    const reto = datos.capitulos[dia - 1];
    porId('dia-vista').textContent = `Vista previa · ${dia} de diciembre`;
    porId('titulo-vista').textContent = reto.titulo || 'Capítulo sin título';
    const pruebaVista = porId('contenido-vista');
    const ganadas = ER.evidencias(datos).filter(evidencia => evidencia.dia < dia);
    const estadoPrevio = leer(clave('previas')) ?? {};
    if (reto.dependencias.length && ganadas.some(item => reto.dependencias.includes(item.id))) {
      porId('dia-vista').textContent += ' · evidencias de ejemplo';
    }

    function reiniciarVista(){
      delete estadoPrevio[dia];
      guardar(clave('previas'),estadoPrevio);
      dibujarVista();
      vista.scrollTop=0;
      pruebaVista.querySelector('button:enabled, input, select, summary')?.focus({preventScroll:true});
    }
    function dibujarVista(){
      ER.vista.renderizar(pruebaVista,reto,{
        esEditor:true,
        ganadas,
        interaccion:estadoPrevio[dia],
        experiencia:datos.experiencia,
        guardarInteraccion:estado=>{
          estadoPrevio[dia]=estado;
          guardar(clave('previas'),estadoPrevio);
        },
        comprobar:respuesta=>{
          if(!ER.acertada(reto,respuesta))return false;
          ER.vista.renderizar(pruebaVista,reto,{
        esEditor:true,
            ganadas,
            resuelto:true,
            interaccion:estadoPrevio[dia],
            experiencia:datos.experiencia,
            desenlace:leer(clave('final-previa')),
            guardarDesenlace:estado=>guardar(clave('final-previa'),estado),
            evidenciaNueva:ER.evidencias(datos).find(evidencia=>evidencia.dia===dia),
            volverAJugar:reiniciarVista
          });
          pruebaVista.querySelector('.resultado-reto').focus();
          return true;
        }
      });
    }
    dibujarVista();
    vista.showModal();
    vista.scrollTop = 0;
  });

  vista.addEventListener('close', () => {
    if (vista.open) return;
    ER.vista.limpiar(porId('contenido-vista'));
    porId('contenido-vista').replaceChildren();
  });

  fecha.addEventListener('change', () => {
    prueba.fecha = fecha.value;
    guardar(clave('prueba'), prueba);
  });

  porId('formulario-prueba').addEventListener('submit', evento => {
    evento.preventDefault();
    guardarDia();
    prueba.fecha = fecha.value;
    guardar(clave('prueba'), prueba);
    sesionPrueba = { datos: structuredClone(datos), fecha: prueba.fecha };
    marco.src = './index.html?prueba';
    marco.hidden = false;
    marco.scrollIntoView({ block: 'nearest' });
  });

  porId('reiniciar-prueba').addEventListener('click', () => {
    prueba.avance = ER.progreso();
    guardar(clave('prueba'), prueba);
    cerrarPrueba();
    anunciar('Progreso de prueba reiniciado.');
  });

  window.addEventListener('message', evento => {
    if (!sesionPrueba || evento.source !== marco.contentWindow
        || evento.origin !== (origen === '*' ? 'null' : origen)) return;
    if (evento.data?.tipo === 'escape-listo') {
      marco.contentWindow.postMessage({
        tipo: 'escape-iniciar', ...sesionPrueba, avance: sesionPrueba.avance??prueba.avance
      }, origen);
    } else if (evento.data?.tipo === 'escape-progreso') {
      if(sesionPrueba.temporal)return;
      prueba.avance = ER.progreso(evento.data.avance);
      if (!guardar(clave('prueba'), prueba)) anunciar('El navegador no pudo guardar el progreso de prueba.');
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
  function importarCopia(contenido,nombreArchivo){
    try {
      const copia=ER.calendario(JSON.parse(contenido));
      const id='copia-'+Date.now().toString(36)+'-'+Math.random().toString(36).slice(2,8);
      const nombre='Copia · '+nombreArchivo,registro={id,nombre};
      const guardado=guardar(clave('borrador',id),copia)&&guardar(claveCopias,[...copias,registro]);
      copias.push(registro);nombres.set(id,nombre);abiertos.set(id,{datos:copia,dia:1,hayCambios:!guardado});
      elegirEspacio(id);
      anunciar(guardado?'Respaldo importado como copia separada.':'Copia disponible en esta pestaña. Exporta un respaldo para conservarla.');
    }catch(error){anunciar('No se pudo importar el respaldo. '+error.message);}
  }
  archivo.addEventListener('change',async()=>{
    if(!archivo.files.length)return;
    const fichero=archivo.files[0];
    try{importarCopia(await fichero.text(),fichero.name);}catch(error){anunciar('No se pudo leer el archivo. '+error.message);}finally{archivo.value='';}
  });
  porId('ver-respaldo').addEventListener('click',()=>{guardarDia();guardarExperienciaConfig();porId('texto-respaldo').value=JSON.stringify(datos,null,2);});
  porId('importar-texto').addEventListener('click',()=>importarCopia(porId('texto-respaldo').value,'respaldo en texto'));

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
  for (const [valor, [etiqueta]] of Object.entries(ER.recursos.tipos)) {
    campos.recursoTipo.add(new Option(etiqueta, valor));
    if (!['cajas', 'interruptores', 'objetos', 'ruta', 'teclado', 'palabra', 'plantilla', 'caja'].includes(valor)) {
      campos.evidenciaDibujo.add(new Option(etiqueta, valor));
    }
  }
  porId('editor-local').hidden = false;
  elegirEspacio(espacio);
}();
