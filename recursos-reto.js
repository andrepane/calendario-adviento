!function () {
  'use strict';

  const ER = window.EscapeRoom;
  const tipos = {
    '': ['Sin dibujo', ''],
    conversacion: ['Conversación de papel', 'Primera línea: fecha. Después, un mensaje por línea.'],
    fichas: ['Fichas o etiquetas', 'Una ficha por línea. Separa sus dos caras con | si la numeras o la emparejas.'],
    flor: ['Flor con cuatro pétalos', 'Cuatro cifras en una línea, separadas por |, desde arriba y en sentido horario.'],
    sello: ['Sello del pétalo', 'Número del pétalo marcado, del 1 al 4.'],
    archivador: ['Archivador', 'Número de huecos.'],
    cajas: ['Cajas seleccionables', 'Edita las opciones en la sección del tipo de prueba.'],
    espejo: ['Espejo', 'Texto que debe aparecer al lado del espejo.'],
    interruptores: ['Interruptores seleccionables', 'Edita las etiquetas en las opciones del reto.'],
    teclado: ['Teclado de números', 'Número de cifras del visor. Los intentos se editan en «Texto de apoyo».'],
    ruta: ['Cuadrícula que se puede tocar', 'Una fila por línea, con las letras separadas por espacios.'],
    palabra: ['Palabra con huecos', 'Palabra con guiones bajos para los huecos. Después, en otra línea, la letra de la ficha.'],
    nota: ['Nota de papel', 'Escribe el texto tal como se debe mostrar, una línea debajo de otra.'],
    luna: ['Fases lunares', 'Una fase por línea. Añade | y una cifra si quieres mostrarla debajo.'],
    cuadricula: ['Cuadrícula de lectura', 'Una fila por línea, con las letras separadas por espacios.'],
    tiras: ['Tiras alineadas', 'Una tira por línea, con las letras separadas por espacios.'],
    objetos: ['Fichas de objetos', 'Los objetos se toman de «Piezas en el orden correcto».'],
    plantilla: ['Papel perforado', 'Cuadrícula con una fila por línea. Última línea: posiciones visibles separadas por espacios.'],
    campana: ['Campana y visor', 'Un paso por línea. Usa letras a–g para los segmentos.'],
    caja: ['Caja fuerte', 'Número de huecos.']
  };
  const figuras = {
    caja: '<rect x="8" y="11" width="48" height="43" rx="4"/><path d="M13 17h38v31H13zM46 24v17"/><circle cx="31" cy="32" r="8"/><path d="M31 24v16m-8-8h16"/>',
    cajaSencilla: '<path d="M7 25h50v28H7zM4 16h56v11H4zM27 27h10v10H27z"/>',
    archivador: '<path d="M10 7h44v50H10zM14 26h36m-36 19h36M27 17h10m-10 17h10m-10 18h10"/>',
    espejo: '<ellipse cx="32" cy="25" rx="20" ry="22"/><ellipse cx="32" cy="25" rx="15" ry="17"/><path d="M29 47v11q3 4 6 0V47m-12-18 10-12m-4 18 10-13"/>',
    flor: '<ellipse cx="32" cy="17" rx="11" ry="15"/><ellipse cx="47" cy="32" rx="15" ry="11"/><ellipse cx="32" cy="47" rx="11" ry="15"/><ellipse cx="17" cy="32" rx="15" ry="11"/><circle cx="32" cy="32" r="5"/>',
    campana: '<path d="M10 48q8-5 8-20a14 14 0 0 1 28 0q0 15 8 20ZM26 49a6 6 0 0 0 12 0M29 13q3-9 6 0"/>',
    luna: '<path d="M43 7A25 25 0 1 0 55 45C33 49 23 19 43 7Z"/>',
    estrella: '<path d="m32 5 7 18 20 1-15 13 5 20-17-11-17 11 5-20L5 24l20-1Z"/>',
    interruptor: '<rect x="13" y="7" width="38" height="50" rx="5"/><path d="M23 24h18v19H23zM25 30l4-13h12v13z"/>',
    ficha: '<path d="M8 4h48l4 6v44l-6 6H10l-6-6V10zM11 10h42v44H11z"/>',
    sello: '<path d="m32 4 7 6 9-1 3 9 8 5-2 9 2 9-8 5-3 9-9-1-7 6-7-6-9 1-3-9-8-5 2-9-2-9 8-5 3-9 9 1Z"/>',
    plantilla: '<path d="M9 6h46v52H9zM16 15h9v9h-9zm12 12h9v9h-9zm12 0h9v9h-9zm0 13h9v9h-9z"/>',
    fase: '<circle cx="32" cy="32" r="23"/>'
  };

  function nodo(tag, contenido = '', clase = '') {
    const el = document.createElement(tag);
    el.textContent = contenido;
    el.className = clase;
    return el;
  }

  function svg(nombre) {
    if (!Object.hasOwn(figuras, nombre)) return null;
    const el = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    el.setAttribute('viewBox', '0 0 64 64');
    el.setAttribute('aria-hidden', 'true');
    el.classList.add('dibujo-reto');
    el.innerHTML = figuras[nombre];
    return el;
  }

  function boton(texto, accion) {
    const el = nodo('button', texto, 'control-reto');
    el.type = 'button';
    el.addEventListener('click', accion);
    return el;
  }

  function flor(padre, cifras, marcada) {
    const figura = nodo('figure', '', 'flor-reto');
    figura.append(svg(marcada ? 'sello' : 'flor'));
    for (let i = 0; i < 4; i++) {
      const petalo = nodo('span', '', 'petalo');
      petalo.dataset.posicion = i + 1;
      if (marcada === i + 1) petalo.classList.add('marcado');
      petalo.append(nodo('small', `P${i + 1}`));
      if (cifras[i]) petalo.append(nodo('strong', cifras[i]));
      petalo.setAttribute('aria-label', `Pétalo ${i + 1}${cifras[i] ? ', cifra ' + cifras[i] : ''}${marcada === i + 1 ? ', marcado' : ''}`);
      figura.append(petalo);
    }
    padre.append(figura);
  }

  function fases(padre, datos) {
    const fasesDibujo = nodo('div', '', 'fases-reto');
    const clases = {nueva: 'nueva', creciente: 'creciente', llena: 'llena', menguante: 'menguante'};
    datos.forEach((fila, i) => {
      const [fase, cifra] = fila.split('|').map(parte => parte.trim());
      const pieza = nodo('figure');
      const dibujo = svg('fase');
      const clase = clases[fase.toLocaleLowerCase('es')] ?? ['nueva', 'creciente', 'llena', 'menguante'][i % 4];
      dibujo.classList.add(clase);
      if (clase === 'creciente' || clase === 'menguante') {
        const mitad = document.createElementNS(dibujo.namespaceURI, 'path');
        mitad.setAttribute('d', clase === 'creciente'
          ? 'M32 9a23 23 0 0 1 0 46Z' : 'M32 9a23 23 0 0 0 0 46Z');
        mitad.setAttribute('fill', '#f6dfab');
        mitad.setAttribute('stroke', 'none');
        dibujo.append(mitad);
      }
      pieza.append(dibujo, nodo('figcaption', fase));
      if (cifra) pieza.append(nodo('strong', cifra));
      fasesDibujo.append(pieza);
    });
    padre.append(fasesDibujo);
  }

  function casillas(padre, filas, tipo, acciones) {
    const tabla = nodo('div', '', 'cuadricula-reto');
    const celdas = [];
    for (const [y, fila] of filas.entries()) {
      const letras = fila.split(/\s+/);
      const renglon = nodo('div', '', 'fila-reto');
      renglon.style.setProperty('--columnas', letras.length);
      for (const [x, letra] of letras.entries()) {
        const celda = tipo === 'ruta' && acciones
          ? boton(letra, () => {
            acciones.agregar(letra);
            const paso = nodo('small', String(acciones.valor().length), 'paso-ruta');
            celda.replaceChildren(document.createTextNode(letra), paso);
          }) : nodo('span', letra);
        if (tipo === 'ruta' && acciones) celda.setAttribute('aria-label', `${letra}, fila ${y + 1}, columna ${x + 1}`);
        celda.classList.add('casilla-reto');
        celdas.push(celda);
        renglon.append(celda);
      }
      tabla.append(renglon);
    }
    padre.append(tabla);
    return celdas;
  }

  function teclado(padre, digitos, acciones, fuerte) {
    if (!acciones) return;
    const visor = nodo('div', '', 'visor-reto');
    visor.setAttribute('aria-hidden', 'true');
    const cantidad = Math.max(1, Math.min(8, Number(digitos) || 4));
    function actualizar() {
      const numeros = [...acciones.valor()];
      visor.replaceChildren(...Array.from({length: cantidad}, (_, i) => nodo('span', numeros[i] ?? '·')));
    }
    acciones.alCambiar(actualizar);
    actualizar();
    padre.append(visor);
    if (fuerte) return;
    const teclas = nodo('div', '', 'teclas-reto');
    for (const numero of '1234567890') {
      teclas.append(boton(numero, () => {
        if (acciones.valor().length < cantidad) acciones.agregar(numero);
      }));
    }
    teclas.append(boton('Borrar último', acciones.borrar));
    padre.append(teclas);
  }

  function visor(padre, lineas) {
    const segmentos = {
      a: 'M18 10h28', b: 'M48 13v18', c: 'M48 36v18',
      d: 'M18 57h28', e: 'M15 36v18', f: 'M15 13v18', g: 'M18 33h28'
    };
    const nombres = {
      a: 'horizontal de arriba', b: 'vertical superior derecho', c: 'vertical inferior derecho',
      d: 'horizontal de abajo', e: 'vertical inferior izquierdo',
      f: 'vertical superior izquierdo', g: 'horizontal del centro'
    };
    const pasos = lineas.map(linea => [...new Set([...linea.toLowerCase()].filter(l => Object.hasOwn(segmentos, l)))]).filter(paso => paso.length);
    if (!pasos.length) return;
    function mostrar(activos) {
      const dibujo = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      dibujo.setAttribute('viewBox', '0 0 64 68');
      dibujo.classList.add('segmentos-reto');
      dibujo.setAttribute('aria-hidden', 'true');
      for (const [id, forma] of Object.entries(segmentos)) {
        const trazo = document.createElementNS(dibujo.namespaceURI, 'path');
        trazo.setAttribute('d', forma);
        if (activos.includes(id)) trazo.classList.add('encendido');
        dibujo.append(trazo);
      }
      return dibujo;
    }
    const pantalla = nodo('div', '', 'pasos-reto');
    const aviso = nodo('p');
    aviso.setAttribute('role', 'status');
    const alternativo = nodo('details');
    const comparacion = nodo('div', '', 'comparacion-reto');
    for (const [i, paso] of pasos.entries()) {
      const etapa = nodo('figure');
      etapa.append(mostrar(paso), nodo('figcaption', `Paso ${i + 1}: ${paso.map(id => nombres[id]).join(', ')}`));
      comparacion.append(etapa);
    }
    alternativo.append(nodo('summary', 'Ver los pasos juntos'), comparacion);

    let indice = -1;
    const avanzar = boton('Ver secuencia', () => {
      indice = (indice + 1) % pasos.length;
      pantalla.replaceChildren(mostrar(pasos[indice]));
      aviso.textContent = `Paso ${indice + 1} de ${pasos.length}: ${pasos[indice].map(id => nombres[id]).join(', ')}.`;
      avanzar.textContent = indice === pasos.length - 1 ? 'Repetir secuencia' : 'Ver siguiente paso';
    });
    pantalla.append(mostrar([]));
    padre.append(pantalla, avanzar, aviso, alternativo);
  }

  function dibujar(tipo, texto, acciones) {
    if (!tipo || !Object.hasOwn(tipos, tipo) || ['cajas', 'interruptores', 'objetos'].includes(tipo)) return null;
    const datos = texto.split(/\r?\n/).map(linea => linea.trim()).filter(Boolean);
    const padre = nodo('section', '', `recurso-reto recurso-${tipo}`);

    if (tipo === 'conversacion') {
      const [fecha, ...mensajes] = datos;
      padre.append(nodo('p', fecha, 'fecha-chat'));
      mensajes.forEach(mensaje => padre.append(nodo('p', mensaje, 'burbuja-reto')));
    } else if (tipo === 'fichas') {
      const fichas = nodo('div', '', 'fichas-reto');
      for (const dato of datos) {
        const [primero, segundo] = dato.split('|').map(texto => texto.trim());
        const pieza = nodo('div', '', 'ficha-reto');
        pieza.append(svg('ficha'), nodo('small', primero));
        if (segundo) pieza.append(nodo('strong', segundo));
        fichas.append(pieza);
      }
      padre.append(fichas);
    } else if (tipo === 'flor' || tipo === 'sello') {
      flor(padre, tipo === 'flor' ? (datos[0] ?? '').split('|').map(cifra => cifra.trim()) : [],
        tipo === 'sello' ? Number(datos[0]) : 0);
    } else if (tipo === 'espejo' || tipo === 'archivador' || tipo === 'caja') {
      padre.append(svg(tipo));
      if (tipo === 'espejo' && datos.length) padre.append(nodo('p', datos.join(' '), 'texto-espejo'));
      if (tipo !== 'espejo') {
        if (acciones) teclado(padre, datos[0], acciones, true);
        else {
          const cantidad = Math.max(1, Math.min(8, Number(datos[0]) || 3));
          const visor = nodo('div', '', 'visor-reto');
          visor.setAttribute('aria-hidden', 'true');
          visor.replaceChildren(...Array.from({length: cantidad}, () => nodo('span', '·')));
          padre.append(visor);
        }
      }
    } else if (tipo === 'luna') {
      fases(padre, datos);
    } else if (tipo === 'nota') {
      padre.append(nodo('p', texto, 'nota-reto'));
    } else if (tipo === 'teclado') {
      teclado(padre, datos[0], acciones, false);
    } else if (tipo === 'palabra') {
      const muestra = nodo('p', datos[0] ?? '', 'palabra-reto');
      if (acciones) {
        const plantilla = datos[0] ?? '';
        const carta = datos[1] ?? '';
        const huecos = [...plantilla].filter(l => l === '_').length;
        let fichas = 0;
        const poner = boton(`Colocar ${carta}`, () => {
          if (fichas >= huecos) return;
          fichas++;
          let asignadas = 0;
          muestra.textContent = plantilla.replaceAll('_', () => ++asignadas <= fichas ? carta : '_');
          if (fichas === huecos) acciones.poner(muestra.textContent);
          poner.setAttribute('aria-disabled', String(fichas >= huecos));
        });
        padre.append(muestra, poner);
      } else padre.append(muestra);
    } else if (tipo === 'campana') {
      padre.append(svg('campana'));
      visor(padre, datos);
    } else {
      const mascara = tipo === 'plantilla' ? new Set((datos.pop() ?? '').split(/\s+/).map(Number)) : null;
      const celdas = casillas(padre, datos, tipo, acciones);
      if (tipo === 'ruta' && acciones) {
        padre.append(boton('Deshacer paso', () => {
          const ultimo = acciones.valor().length;
          acciones.borrar();
          for (const celda of celdas) {
            if (Number(celda.querySelector('small')?.textContent) === ultimo) celda.querySelector('small').remove();
          }
        }));
      }
      if (mascara) {
        const plantilla = svg('plantilla');
        padre.prepend(plantilla);
        const colocar = boton('Colocar plantilla', () => {
          const puesta = colocar.getAttribute('aria-pressed') !== 'true';
          colocar.setAttribute('aria-pressed', String(puesta));
          celdas.forEach((celda, i) => {
            celda.classList.toggle('tapada', puesta && !mascara.has(i + 1));
            celda.setAttribute('aria-hidden', String(puesta && !mascara.has(i + 1)));
          });
          colocar.textContent = puesta ? 'Quitar plantilla' : 'Colocar plantilla';
        });
        colocar.setAttribute('aria-pressed', 'false');
        padre.append(colocar);
      }
    }
    return padre.childElementCount ? padre : null;
  }

  ER.recursos = { tipos, dibujar, svg };
}();
