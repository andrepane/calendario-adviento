const ER = window.EscapeRoom;
const portada = document.querySelector('#portada');
const calendario = document.querySelector('#calendario');
const puertas = document.querySelector('#puertas');
const sorpresa = document.querySelector('#sorpresa');
const contenido = document.querySelector('#contenido');
const cerrar = sorpresa.querySelector('.cerrar');
const abrir = document.querySelector('#abrir');
const cuaderno = document.querySelector('#cuaderno');
const abrirCuaderno = document.querySelector('#abrir-cuaderno');
const tarjetasCuaderno = document.querySelector('#tarjetas-cuaderno');
const movimientoReducido = window.matchMedia('(prefers-reduced-motion: reduce)');
const enPrueba = ER.local() && window.parent !== window
  && new URLSearchParams(location.search).has('prueba');
const origenLocal = location.protocol === 'file:' ? '*' : location.origin;

let datos = ER.calendario(window.CALENDARIO_PUBLICADO);
const claveProgreso = `adviento-escape-2026-${datos.partida}`;
let avance = enPrueba ? ER.progreso() : leerProgreso();
let fechaSimulada;
let ventanaActiva;
let siguiente;
let temporizador;

function leerProgreso() {
  try {
    return ER.progreso(JSON.parse(localStorage.getItem(claveProgreso)));
  } catch {
    return ER.progreso();
  }
}

function guardarProgreso() {
  if (enPrueba) {
    window.parent.postMessage({ tipo: 'escape-progreso', avance }, origenLocal);
    return;
  }
  try {
    // Combina avances de pestañas abiertas antes de guardar.
    const guardado = leerProgreso();
    const pistas = Object.fromEntries(ER.dias.map(dia => [
      dia, Math.max(avance.pistas[dia] ?? 0, guardado.pistas[dia] ?? 0)
    ]));
    avance = ER.progreso({
      abiertos: [...guardado.abiertos, ...avance.abiertos],
      resueltos: [...guardado.resueltos, ...avance.resueltos],
      pistas,
      interacciones: { ...guardado.interacciones, ...avance.interacciones },
      introduccionVista:avance.introduccionVista||guardado.introduccionVista,desenlace:avance.desenlace
    });
    localStorage.setItem(claveProgreso, JSON.stringify(avance));
  } catch {
    // El progreso sigue disponible durante esta visita.
  }
}

const hoy = () => fechaSimulada ?? ER.hoy();
const ganadas = () => ER.evidencias(datos).filter(item => avance.resueltos.includes(item.dia));

function crearPuertas() {
  for (const dia of ER.dias) {
    const boton = document.createElement('button');
    boton.type = 'button';
    boton.className = dia === 24 ? 'ventana portal' : 'ventana';
    boton.setAttribute('aria-haspopup', 'dialog');
    boton.innerHTML = `
      <span class="hueco" aria-hidden="true"></span>
      <span class="hojas" aria-hidden="true"><span></span>${dia === 24 ? '<span></span>' : ''}</span>
      <span class="numero" aria-hidden="true">${dia}</span>
      <span class="estado" aria-hidden="true"></span>
    `;
    boton.addEventListener('click', () => mostrarSorpresa(dia, boton));
    puertas.append(boton);
  }
}

function actualizarPuertas() {
  const fecha = hoy();

  const etiquetas = {
    futura: 'Aún no ha llegado su fecha',
    'sin-llave': 'Requiere la llave del reto anterior',
    disponible: 'Reto disponible',
    resuelta: 'Reto resuelto'
  };
  const marcas = { futura: '—', 'sin-llave': '◇', disponible: '✦', resuelta: '✓' };

  for (const dia of ER.dias) {
    const boton = puertas.children[dia - 1];
    const estado = ER.estado(dia, fecha, avance);
    const abierta = estado === 'disponible' && avance.abiertos.includes(dia);
    boton.disabled = estado === 'futura' || estado === 'sin-llave';
    boton.dataset.estado = abierta ? 'abierta' : estado === 'disponible' ? 'destacada' : estado;
    boton.querySelector('.estado').textContent = abierta ? '↺' : marcas[estado];
    const nombre = dia === 24 ? 'Portal del 24 de diciembre' : `${dia} de diciembre`;
    boton.setAttribute('aria-label', `${nombre}, ${etiquetas[estado]}${abierta ? ', ya abierta' : ''}`);
  }
  abrirCuaderno.textContent = `Cuaderno · ${ganadas().length}`;
}

function prepararTarjeta(dia, recienResuelto = false) {
  const reto = datos.capitulos[dia - 1];
  document.querySelector('#dia').textContent = `${dia} de diciembre`;
  document.querySelector('#titulo').textContent = reto.titulo || 'Capítulo por preparar';
  const repitiendo = enPrueba && avance.repeticiones[dia] === true;
  const resuelto = avance.resueltos.includes(dia) && !repitiendo;
  const evidencia = ganadas();
  const proximo = dia + 1;
  const fechaLlegada = dia < 24 && hoy() >= ER.fechaPuerta(proximo);
  const errores = ER.errores(datos, dia);
  if (errores.length && !resuelto) {
    const aviso = document.createElement('p');
    aviso.textContent = enPrueba ? `Día ${dia}: ${errores.join('; ')}.` : 'Este capítulo se está preparando.';
    contenido.replaceChildren(aviso);
    return;
  }

  ER.vista.renderizar(contenido, reto, {
    ganadas: evidencia,
    esEditor:enPrueba,
    resuelto,
    experiencia:datos.experiencia,
    desenlace:avance.desenlace,
    guardarDesenlace:estado=>{avance.desenlace=estado;guardarProgreso();},
    volverAJugar: enPrueba ? () => {
      avance.repeticiones[dia] = true;
      delete avance.interacciones[dia];
      delete avance.pistas[dia];
      guardarProgreso();
      prepararTarjeta(dia);
      sorpresa.scrollTop = 0;
      contenido.querySelector('button:enabled, input, select, summary')?.focus({preventScroll:true});
    } : undefined,
    evidenciaNueva: evidencia.find(item => item.dia === dia),
    pistasVistas: avance.pistas[dia],
    interaccion: avance.interacciones[dia],
    guardarInteraccion: estado => {
      avance.interacciones[dia] = estado;
      guardarProgreso();
    },
    guardarPistas: cantidad => {
      avance.pistas[dia] = cantidad;
      guardarProgreso();
    },
    comprobar: respuesta => {
      if (!enPrueba) {
        const guardado = leerProgreso();
        avance = ER.progreso({
          abiertos: [...avance.abiertos, ...guardado.abiertos],
          resueltos: [...avance.resueltos, ...guardado.resueltos],
          pistas: avance.pistas,
          interacciones: avance.interacciones,
          introduccionVista:avance.introduccionVista,desenlace:avance.desenlace
        });
      }
      if (avance.resueltos.includes(dia)) {
        if (enPrueba && avance.repeticiones[dia]) {
          if (!['disponible','resuelta'].includes(ER.estado(dia,hoy(),avance)) || !ER.acertada(reto,respuesta)) return false;
          delete avance.repeticiones[dia];
          guardarProgreso();
          actualizarPuertas();
        }
        prepararTarjeta(dia, true);
        return true;
      }
      if (ER.estado(dia, hoy(), avance) !== 'disponible' || !ER.acertada(reto, respuesta)) return false;
      avance.resueltos.push(dia);
      guardarProgreso();
      actualizarPuertas();
      prepararTarjeta(dia, true);
      if(dia===1){calendario.classList.remove('casa-despierta');void calendario.offsetWidth;calendario.classList.add('casa-despierta');}
      return true;
    },
    mensajeLlave: dia < 24 && (fechaLlegada ? `Has ganado la llave del día ${proximo}.`
      : `Has ganado la llave del día ${proximo}. Podrás usarla el ${proximo} de diciembre.`),
    irSiguiente: fechaLlegada ? () => {
      siguiente = proximo;
      sorpresa.close();
    } : undefined
  });
  if (recienResuelto) contenido.querySelector('.resultado-reto').focus();
}

function mostrarSorpresa(dia, boton) {
  if (sorpresa.open || ventanaActiva) return;
  if (!['disponible', 'resuelta'].includes(ER.estado(dia, hoy(), avance))) {
    actualizarPuertas();
    return;
  }

  if (!avance.abiertos.includes(dia)) {
    avance.abiertos.push(dia);
    guardarProgreso();
  }
  prepararTarjeta(dia);
  ventanaActiva = boton;
  boton.classList.add('girada');
  sorpresa.classList.toggle('tarjeta-final', dia === 24);

  const mostrar = () => {
    const rect = boton.getBoundingClientRect();
    const ancho = document.documentElement.clientWidth;
    const alto = document.documentElement.clientHeight;
    sorpresa.style.setProperty('--origen-x', `${rect.left + rect.width / 2 - ancho / 2}px`);
    sorpresa.style.setProperty('--origen-y', `${rect.top + rect.height / 2 - alto / 2}px`);
    sorpresa.showModal();
    document.documentElement.classList.add('modal-abierto');
    sorpresa.scrollTop = 0;
    actualizarPuertas();
  };

  if (movimientoReducido.matches) mostrar();
  else window.setTimeout(mostrar, dia === 24 ? 230 : 160);
}

function programarActualizacion() {
  window.clearTimeout(temporizador);
  if (document.hidden) return;
  actualizarPuertas();
  if (!enPrueba) temporizador = window.setTimeout(programarActualizacion, 15000 - Date.now() % 15000);
}

crearPuertas();
actualizarPuertas();

/* La introducción mueve la casa real entre la caja y su posición en el calendario. */
let entrada;
function prepararEntrada(){
  entrada?.limpiar();
  entrada=ER.experiencias.introduccion(portada,calendario,datos.experiencia,{
    vista:avance.introduccionVista,
    guardar:()=>{avance.introduccionVista=true;guardarProgreso();},
    terminar:()=>{document.querySelector('#titulo-calendario').focus({preventScroll:true});programarActualizacion();}
  });
}
document.querySelector('#repetir-introduccion').addEventListener('click',()=>entrada.repetir());
if(!enPrueba)prepararEntrada();

abrirCuaderno.addEventListener('click', () => {
  tarjetasCuaderno.replaceChildren();
  const evidencias = ganadas();
  ER.vista.tarjetas(evidencias, tarjetasCuaderno);
  if (!evidencias.length) tarjetasCuaderno.textContent = 'Aquí aparecerán las evidencias que consigas al resolver retos.';
  if(avance.desenlace.confirmado&&avance.desenlace.nombre){
    const recuerdo=document.createElement('article');recuerdo.className='evidencia';
    const titulo=document.createElement('h3');titulo.textContent='El habitante de la casa';
    const nombre=document.createElement('p');nombre.textContent=avance.desenlace.nombre;
    recuerdo.append(titulo,nombre);tarjetasCuaderno.append(recuerdo);
  }
  cuaderno.showModal();
  document.documentElement.classList.add('modal-abierto');
  cuaderno.scrollTop = 0;
});

cuaderno.addEventListener('close', () => {
  document.documentElement.classList.remove('modal-abierto');
  abrirCuaderno.focus({ preventScroll: true });
});

for (const evento of ['visibilitychange', 'pageshow']) {
  (evento === 'pageshow' ? window : document).addEventListener(evento, () => {
    if (!calendario.hidden) programarActualizacion();
  });
}

window.addEventListener('storage', evento => {
  if (enPrueba || (evento.key !== claveProgreso && evento.key !== null)) return;
  avance = leerProgreso();
  actualizarPuertas();
});

for (const dialogo of [sorpresa, cuaderno]) {
  const primero = dialogo.querySelector('.cerrar');
  const limites = dialogo.querySelectorAll('.limite-foco');
  limites[0].addEventListener('focus', () => {
    const controles = [...dialogo.querySelectorAll('button:enabled, input:enabled, select:enabled, textarea:enabled, summary, audio[controls]')]
      .filter(control => control.getClientRects().length);
    (controles.at(-1) ?? primero).focus();
  });
  limites[1].addEventListener('focus', () => primero.focus());
}

sorpresa.addEventListener('close', () => {
  document.documentElement.classList.remove('modal-abierto');
  ventanaActiva?.classList.remove('girada');
  ventanaActiva?.focus({ preventScroll: true });
  ventanaActiva = undefined;
  ER.vista.limpiar(contenido);
  contenido.replaceChildren();
  if (!siguiente) return;
  const dia = siguiente;
  siguiente = undefined;
  const boton = puertas.children[dia - 1];
  boton.scrollIntoView({ block: 'nearest' });
  boton.focus({ preventScroll: true });
  mostrarSorpresa(dia, boton);
});

if (enPrueba) {
  abrir.disabled = true;
  window.addEventListener('message', evento => {
    if (evento.source !== window.parent || evento.origin !== (origenLocal === '*' ? 'null' : origenLocal)
        || evento.data?.tipo !== 'escape-iniciar' || !/^\d{4}-\d{2}-\d{2}$/.test(evento.data.fecha)) return;
    datos = ER.calendario(evento.data.datos);
    fechaSimulada = evento.data.fecha;
    avance = ER.progreso(evento.data.avance);
    document.documentElement.classList.toggle('movimiento-reducido',evento.data.movimientoReducido===true);
    abrir.disabled = false;
    actualizarPuertas();
    prepararEntrada();
  });
  window.parent.postMessage({ tipo: 'escape-listo' }, origenLocal);
}
