!function () {
  'use strict';

  const dias = Array.from({ length: 24 }, (_, i) => i + 1);
  const tipos = {
    escrita: 'Respuesta escrita',
    opciones: 'Elección entre opciones',
    ordenar: 'Ordenar elementos',
    combinacion: 'Combinación final'
  };
  const texto = valor => typeof valor === 'string' ? valor : '';
  const lista = valor => Array.isArray(valor) ? valor.filter(item => typeof item === 'string') : [];
  const fechaPuerta = dia => `2026-12-${String(dia).padStart(2, '0')}`;
  const relojMadrid = new Intl.DateTimeFormat('sv-SE', {
    timeZone: 'Europe/Madrid', year: 'numeric', month: '2-digit', day: '2-digit'
  });

  function capitulo(entrada = {}) {
    const campos = ['titulo', 'instrucciones', 'pregunta', 'apoyo', 'imagen', 'alt', 'audio',
      'acierto', 'premio', 'evidenciaTitulo', 'evidenciaTexto', 'combinacion',
      'recursoTipo', 'recursoDatos', 'transcripcion', 'evidenciaDibujo', 'evidenciaDatos'];
    return {
      ...Object.fromEntries(campos.map(campo => [campo, texto(entrada[campo])])),
      tipo: Object.hasOwn(tipos, entrada.tipo) ? entrada.tipo : 'escrita',
      listo: entrada.listo === true,
      respuestas: lista(entrada.respuestas),
      opciones: lista(entrada.opciones),
      correcta: Number.isInteger(entrada.correcta) ? entrada.correcta : -1,
      orden: lista(entrada.orden),
      pistas: lista(entrada.pistas),
      dependencias: [...new Set(lista(entrada.dependencias))]
    };
  }

  function calendario(datos) {
    if (datos?.esquema !== 1 || !Array.isArray(datos.capitulos) || datos.capitulos.length !== 24
        || datos.capitulos.some(item => !item || typeof item !== 'object' || Array.isArray(item))) {
      throw new Error('El archivo debe contener 24 capítulos y usar el formato de respaldo del editor.');
    }
    return {
      esquema: 1,
      partida: typeof datos.partida === 'string' && /^[a-zA-Z0-9-]{1,80}$/.test(datos.partida)
        ? datos.partida : 'demo-2026',
      capitulos: datos.capitulos.map(capitulo)
    };
  }

  // Una tarjeta por día. Su ID depende del día que la otorga y conserva el vínculo al editarla.
  const idEvidencia = dia => `evidencia-${dia}`;

  function evidencias(datos) {
    return dias.flatMap(dia => {
      const reto = datos.capitulos[dia - 1];
      if (!reto.evidenciaTitulo.trim() || !reto.evidenciaTexto.trim()) return [];
      return [{ id: idEvidencia(dia), dia, titulo: reto.evidenciaTitulo, texto: reto.evidenciaTexto,
        dibujo: reto.evidenciaDibujo, datos: reto.evidenciaDatos }];
    });
  }

  function rutaMultimedia(valor) {
    const ruta = valor.trim();
    if (!ruta || ruta.startsWith('//') || ruta.startsWith('\\')) return '';
    try {
      const url = new URL(ruta, 'https://calendario.example/');
      return ['https:', 'http:'].includes(url.protocol) ? ruta : '';
    } catch {
      return '';
    }
  }

  function normalizar(valor) {
    return valor.normalize('NFD').replace(/\p{M}/gu, '').trim().replace(/\s+/g, ' ').toLocaleLowerCase('es');
  }

  function errores(datos, dia) {
    const reto = datos.capitulos[dia - 1];
    const avisos = [];
    if (!reto.titulo.trim()) avisos.push('escribe un título');
    if (!reto.instrucciones.trim()) avisos.push('escribe las instrucciones');
    if (reto.tipo === 'escrita' && !reto.respuestas.some(normalizar)) avisos.push('añade una respuesta válida');
    if (reto.tipo === 'opciones' && (reto.opciones.filter(opcion => opcion.trim()).length < 2
        || !reto.opciones[reto.correcta]?.trim())) avisos.push('añade dos opciones y selecciona la correcta');
    if (reto.tipo === 'ordenar' && (reto.orden.length < 2 || reto.orden.some(pieza => !pieza.trim())
        || new Set(reto.orden.map(normalizar)).size !== reto.orden.length)) {
      avisos.push('añade al menos dos piezas distintas en su orden correcto');
    }
    if (reto.tipo === 'combinacion' && !normalizar(reto.combinacion)) avisos.push('escribe la combinación válida');
    if (dia === 24 && !reto.premio.trim()) avisos.push('añade el premio o su escondite');
    if (Boolean(reto.evidenciaTitulo.trim()) !== Boolean(reto.evidenciaTexto.trim())) {
      avisos.push('completa el título y el contenido de la evidencia');
    }
    for (const campo of ['imagen', 'audio']) {
      if (reto[campo].trim() && !rutaMultimedia(reto[campo])) avisos.push(`revisa la ruta de ${campo}`);
    }
    if (reto.imagen.trim() && !reto.alt.trim()) avisos.push('describe la imagen para quien no pueda verla');
    for (const dibujo of [reto.recursoTipo, reto.evidenciaDibujo]) {
      if (dibujo && !Object.hasOwn(window.EscapeRoom.recursos?.tipos ?? {}, dibujo)) {
        avisos.push('selecciona un tipo de dibujo válido');
      }
    }
    const disponibles = new Set(evidencias(datos).map(item => item.id));
    for (const id of reto.dependencias) {
      const origen = /^(?:evidencia-)([1-9]|1\d|2[0-4])$/.exec(id)?.[1];
      if (!origen) avisos.push('elimina la referencia a una evidencia desconocida');
      else if (+origen >= dia) avisos.push(`la evidencia del día ${origen} debe ganarse antes del día ${dia}`);
      else if (!disponibles.has(id)) avisos.push(`falta la evidencia del día ${origen}`);
    }
    return avisos;
  }

  function progreso(datos) {
    const abiertos = Array.isArray(datos?.abiertos) ? datos.abiertos : [];
    const resueltos = Array.isArray(datos?.resueltos) ? datos.resueltos : [];
    const cadena = dias.filter(dia => dias.slice(0, dia).every(anterior => resueltos.includes(anterior)));
    return {
      abiertos: [...new Set([...abiertos.filter(dia => dias.includes(dia)), ...cadena])],
      resueltos: cadena,
      pistas: Object.fromEntries(dias.flatMap(dia => {
        const cantidad = datos?.pistas?.[dia];
        return Number.isInteger(cantidad) && cantidad > 0 ? [[dia, cantidad]] : [];
      }))
    };
  }

  function estado(dia, fecha, avance) {
    if (fecha < fechaPuerta(dia)) return 'futura';
    if (avance.resueltos.includes(dia)) return 'resuelta';
    if (dia > 1 && !avance.resueltos.includes(dia - 1)) return 'sin-llave';
    return 'disponible';
  }

  function acertada(reto, respuesta) {
    if (reto.tipo === 'opciones') return Number.isInteger(respuesta) && respuesta === reto.correcta;
    if (reto.tipo === 'ordenar') {
      return Array.isArray(respuesta) && respuesta.length === reto.orden.length
        && reto.orden.every((pieza, i) => pieza === respuesta[i]);
    }
    const valor = normalizar(texto(respuesta));
    const validas = reto.tipo === 'combinacion' ? [reto.combinacion] : reto.respuestas;
    return Boolean(valor) && validas.some(solucion => normalizar(solucion) === valor);
  }

  function local() {
    return location.protocol === 'file:'
      || ['localhost', '127.0.0.1', '[::1]'].includes(location.hostname);
  }

  window.EscapeRoom = {
    dias, tipos, capitulo, calendario, idEvidencia, evidencias, rutaMultimedia, errores,
    progreso, estado, acertada, fechaPuerta, local, hoy: () => relojMadrid.format(new Date())
  };
}();
