!function () {
  'use strict';

  const ER = window.EscapeRoom;
  const limpiezas = new WeakMap();
  function mensajeAcierto(texto, mensajeLlave) {
    let mensaje = texto || '';
    if (mensajeLlave) {
      mensaje = mensaje.replace(/(?:Has ganado|Ya tienes)\s+(?:la siguiente llave|la llave (?:del día \d+|para seguir))\.?/gi, '').trim();
    }
    return /^(?:Bien visto|Mecanismo resuelto|Reto resuelto)\.?(?: Ya tienes lo que necesitas para seguir\.)?$/i.test(mensaje) ? '' : mensaje;
  }
  function limpiar(padre) {
    limpiezas.get(padre)?.();
    limpiezas.delete(padre);
  }

  function elemento(etiqueta, texto, clase) {
    const nodo = document.createElement(etiqueta);
    if (texto) nodo.textContent = texto;
    if (clase) nodo.className = clase;
    return nodo;
  }

  function boton(texto, accion) {
    const control = elemento('button', texto, 'control-reto');
    control.type = 'button';
    control.addEventListener('click', accion);
    return control;
  }

  function tarjetas(evidencias, padre) {
    for (const item of evidencias) {
      const tarjeta = elemento('article', '', 'evidencia');
      tarjeta.append(elemento('span', `Día ${item.dia}`, 'fecha'),
        elemento('h3', item.titulo), elemento('p', item.texto));
      const dibujo = ER.recursos.dibujar(item.dibujo, item.datos ?? '');
      if (dibujo) tarjeta.append(dibujo);
      padre.append(tarjeta);
    }
  }

  function escribir(reto, padre) {
    const etiqueta = elemento('label', reto.tipo === 'combinacion' ? 'Combinación' : 'Tu respuesta');
    const entrada = elemento('input');
    entrada.type = 'text';
    entrada.autocomplete = 'off';
    entrada.spellcheck = false;
    entrada.required = true;
    etiqueta.append(entrada);
    padre.append(etiqueta);
    const cambios = [];
    const acciones = {
      valor: () => entrada.value,
      poner: valor => {
        entrada.value = valor;
        entrada.dispatchEvent(new Event('input'));
      },
      agregar: valor => acciones.poner(entrada.value + valor),
      borrar: () => acciones.poner(entrada.value.slice(0, -1)),
      alCambiar: funcion => cambios.push(funcion)
    };
    entrada.addEventListener('input', () => cambios.forEach(funcion => funcion()));
    const dibujo = ER.recursos.dibujar(reto.recursoTipo, reto.recursoDatos, acciones);
    if (dibujo) padre.prepend(dibujo);
    return () => entrada.value;
  }

  function elegir(reto, padre) {
    const grupo = elemento('fieldset', '', 'opciones-reto');
    grupo.append(elemento('legend', 'Elige una opción'));
    for (const [indice, opcion] of reto.opciones.entries()) {
      if (!opcion.trim()) continue;
      const etiqueta = elemento('label');
      const entrada = elemento('input');
      entrada.type = 'radio';
      entrada.name = 'opcion';
      entrada.value = indice;
      entrada.required = true;
      etiqueta.append(entrada, elemento('span', opcion));
      if (reto.recursoTipo === 'cajas' || reto.recursoTipo === 'interruptores') {
        etiqueta.prepend(ER.recursos.svg(reto.recursoTipo === 'cajas' ? 'cajaSencilla' : 'interruptor'));
      }
      grupo.append(etiqueta);
    }
    padre.append(grupo);
    return () => Number(grupo.querySelector(':checked')?.value);
  }

  function ordenar(reto, padre) {
    const piezas = [...reto.orden];
    for (let i = piezas.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [piezas[i], piezas[j]] = [piezas[j], piezas[i]];
    }
    if (piezas.length > 1 && piezas.every((pieza, i) => pieza === reto.orden[i])) {
      piezas.push(piezas.shift());
    }
    const lista = elemento('ol', '', 'piezas-reto');
    const estado = elemento('p', '', 'solo-lector');
    estado.setAttribute('role', 'status');

    function dibujar() {
      lista.replaceChildren();
      for (const [indice, pieza] of piezas.entries()) {
        const fila = elemento('li');
        const mover = (paso, control) => {
          const destino = indice + paso;
          [piezas[destino], piezas[indice]] = [piezas[indice], piezas[destino]];
          dibujar();
          const botones = lista.children[destino].querySelectorAll('button');
          (botones[control].disabled ? botones[1 - control] : botones[control]).focus();
          estado.textContent = `${pieza}, posición ${destino + 1}`;
        };
        const subir = boton('↑', () => mover(-1, 0));
        const bajar = boton('↓', () => mover(1, 1));
        subir.setAttribute('aria-label', `Subir «${pieza}»`);
        bajar.setAttribute('aria-label', `Bajar «${pieza}»`);
        subir.disabled = indice === 0;
        bajar.disabled = indice === piezas.length - 1;
        fila.append(elemento('span', pieza), subir, bajar);
        if (reto.recursoTipo === 'objetos') {
          const dibujo = ER.recursos.svg(pieza === 'Nochevieja' ? 'reloj' : pieza.toLocaleLowerCase('es'));
          if (dibujo) fila.prepend(dibujo);
        }
        lista.append(fila);
      }
    }
    dibujar();
    padre.append(elemento('p', 'Usa las flechas para mover las piezas.'), lista, estado);
    return () => piezas;
  }

  function renderizar(padre, reto, opciones = {}) {
    limpiar(padre);
    const { ganadas = [], resuelto = false } = opciones;
    padre.replaceChildren();
    if (!resuelto) {
      if (reto.instrucciones || reto.apoyo || reto.contexto) {
        const instrucciones = elemento('details');
        instrucciones.append(elemento('summary', 'Instrucciones'));
        if (reto.contexto) instrucciones.append(elemento('p', reto.contexto, 'contexto-historia'));
        if (reto.instrucciones) instrucciones.append(elemento('p', reto.instrucciones));
        if (reto.apoyo) instrucciones.append(elemento('p', reto.apoyo));
        padre.append(instrucciones);
      }
      const imagen = ER.rutaMultimedia(reto.imagen);
      const audio = ER.rutaMultimedia(reto.audio);
      if (imagen) {
        const foto = elemento('img', '', 'foto-reto');
        foto.src = imagen;
        foto.alt = reto.alt;
        padre.append(foto);
      }
      if (audio) {
        const reproductor = elemento('audio');
        reproductor.src = audio;
        reproductor.preload = 'none';
        reproductor.controls = true;
        reproductor.setAttribute('aria-label', 'Audio de apoyo');
        padre.append(reproductor);
      }
      if (reto.transcripcion) {
        const transcripcion = elemento('details');
        transcripcion.append(elemento('summary', 'Leer transcripción'), elemento('p', reto.transcripcion));
        padre.append(transcripcion);
      }

      if (reto.dependencias.length) {
        const consulta = elemento('details');
        consulta.append(elemento('summary', 'Consultar evidencias de este reto'));
        tarjetas(ganadas.filter(item => reto.dependencias.includes(item.id)), consulta);
        if (consulta.children.length === 1) consulta.append(elemento('p', 'Todavía no hay evidencias ganadas para este reto.'));
        padre.append(consulta);
      }
    }

    let ayudaEspecial,obtenerEstado;
    function textoPista(i){
      const texto=reto.pistas[i];
      if(!resuelto&&i===2&&reto.tipo==='cerradura'&&ER.cerradura4){
        try{const c=JSON.parse(reto.configuracion);if(c.version===2)return texto+' '+ER.cerradura4.pista(c,obtenerEstado?.());}catch{}
      }
      return texto;
    }
    const estado = elemento('p', '', 'feedback-reto');
    estado.setAttribute('role', 'status');
    if (resuelto) {
      const resultado = elemento('section', '', 'resultado-reto');
      resultado.tabIndex = -1;
      resultado.append(elemento('h3', 'Reto resuelto'));
      if (reto.recursoTipo === 'caja' && !opciones.experiencia?.final) {
        const portal = elemento('div', '', 'portal-premio');
        portal.setAttribute('aria-hidden', 'true');
        portal.append(elemento('span'), elemento('span'));
        resultado.prepend(portal);
      }
      if(['diagnostico','engranajes'].includes(reto.tipo)){
        resultado.classList.add('compartimento-abierto');
        const compartimento=elemento('div','','compartimento-espejo');
        const tapa=elemento('div','','tapa-compartimento');
        tapa.setAttribute('aria-hidden','true');
        tapa.append(ER.recursos.svg('espejo'));
        compartimento.append(tapa,elemento('p','Compartimento abierto'));
        resultado.prepend(compartimento);
      }
      const acierto = mensajeAcierto(reto.acierto, opciones.mensajeLlave);
      if (reto.transicion) resultado.append(elemento('p', reto.transicion, 'transicion-historia'));
      else if (acierto) {
        resultado.append(elemento('p', acierto));
      }
      if (reto.descubrimientoTexto) {
        const nota = elemento('article', '', 'hallazgo-historia');
        if (reto.descubrimientoTitulo) nota.append(elemento('h4', reto.descubrimientoTitulo));
        nota.append(elemento('p', reto.descubrimientoTexto));
        resultado.append(nota);
      }
      if(reto.tipo==='combinacion'&&opciones.experiencia?.final){
        limpiezas.set(padre,ER.experiencias.final(resultado,opciones.experiencia,opciones.desenlace,opciones.guardarDesenlace));
      }
      if(reto.tipo==='engranajes'){
        const configuracion=ER.especiales.configuracion(reto);
        if(!ER.mecanismos.errores('engranajes',configuracion).length){
          let final=opciones.interaccion?.actual;
          if(!final){
            final=ER.mecanismos.inicial('engranajes',configuracion);
            for(const paso of configuracion.solucion){
              final=paso==='embrague'?{...final,embrague:!final.embrague}
                :ER.mecanismos.girarEngranajes(configuracion,final,paso);
            }
          }
          const esquema=ER.mecanismos.esquemaEngranajes(configuracion);
          esquema.actualizar(final);
          resultado.append(esquema.dibujo,elemento('p','Cada raya móvil coincide con la muesca fija de su rueda.'));
        }
      }
      if (opciones.evidenciaNueva) tarjetas([opciones.evidenciaNueva], resultado);
      if (opciones.mensajeLlave) resultado.append(elemento('p', opciones.mensajeLlave));
      if (opciones.irSiguiente) resultado.append(boton('Abrir la siguiente ventana', opciones.irSiguiente));
      if (reto.premio && !opciones.experiencia?.final) resultado.append(elemento('h3', 'El premio'), elemento('p', reto.premio));
      if (opciones.volverAJugar) resultado.append(boton('Volver a jugar', opciones.volverAJugar));
      padre.append(resultado);
    } else {
      const formulario = elemento('form', '', 'form-reto');
      if (reto.pregunta) formulario.append(elemento('p', reto.pregunta, 'pregunta-reto'));
      let obtener;
      if (ER.especiales?.esEspecial(reto.tipo)) {
        const errores = ER.especiales.errores(reto);
        if (errores.length) {
          formulario.append(elemento('p', 'Revisa la configuración en el editor. ' + errores.join('. ')));
          padre.append(formulario);
          return;
        }
        const juego = ER.especiales.mostrar(formulario, reto, opciones);
        obtener = juego.obtener;
        obtenerEstado=juego.obtener;
        ayudaEspecial = juego.ayuda;
        limpiezas.set(padre, juego.limpiar);
      } else {
        obtener = reto.tipo === 'opciones' ? elegir(reto, formulario)
          : reto.tipo === 'ordenar' ? ordenar(reto, formulario) : escribir(reto, formulario);
      }
      const comprobar = elemento('button', 'Comprobar', 'control-reto principal');
      comprobar.type = 'submit';
      if (!['electrico','tuberias','mantenimiento','anillos','engranajes','vitral','diagnostico','cerradura'].includes(reto.tipo)) formulario.append(comprobar);
      formulario.append(estado);
      formulario.addEventListener('submit', evento => {
        evento.preventDefault();
        if (!opciones.comprobar?.(obtener())) {
          estado.textContent = 'No encaja todavía. Puedes volver a intentarlo.';
        } else if (estado.isConnected) {
          estado.textContent = 'Respuesta correcta.';
        }
      });
      padre.append(formulario);
    }

    if (resuelto || !reto.pistas.length) return;
    const bloque = elemento('details', '', 'pistas-reto');
    const lista = elemento('ol');
    const aviso = elemento('p', '', 'solo-lector');
    aviso.setAttribute('role', 'status');
    let vistas = resuelto ? reto.pistas.length : Math.min(opciones.pistasVistas ?? 0, reto.pistas.length);
    for (let i=0;i<vistas;i++) lista.append(elemento('li',textoPista(i)));
    const revelar = boton('Dame una pista', () => {
      if (vistas >= reto.pistas.length) return;
      const pista=textoPista(vistas);
      lista.append(elemento('li',pista));
      aviso.textContent = `Pista ${vistas + 1}: ${pista}`;
      vistas++;
      opciones.guardarPistas?.(vistas);
      revelar.textContent = vistas < reto.pistas.length ? 'Dame otra pista' : 'Has visto todas las pistas';
      revelar.setAttribute('aria-disabled', String(vistas >= reto.pistas.length));
    });
    // Mantiene el foco al revelar la última pista.
    bloque.append(elemento('summary', 'Pistas'), lista, aviso);
    if (vistas < reto.pistas.length) bloque.append(revelar);
    if (ayudaEspecial) {
      const solicitar = boton('Solicitar ayuda avanzada', () => {
        const ayuda = ayudaEspecial();
        bloque.append(ayuda);
        solicitar.remove();
        ayuda.querySelector?.('button')?.focus();
      });
      bloque.append(solicitar);
    }
    padre.append(bloque);
  }

  ER.vista = { renderizar, tarjetas, limpiar, mensajeAcierto };
}();
