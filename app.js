const MODO_DEMO = true;
const ANIO = 2026;

const sorpresas = {
  1: {
    titulo: 'Madrugar para esto',
    texto: 'Tú dijiste «va a estar nublado». Yo dije «seguro que no». Esta foto es de los tres minutos en los que los dos tuvimos razón.',
    foto: './fotos/amanecer.jpg',
    descripcionFoto: 'Un valle entre nubes al amanecer'
  },
  2: {
    titulo: 'Vale por una cena',
    texto: 'El viernes cocino yo. ¿Carbonara o pizza? Tú eliges. También friego, que luego dices que los vales tienen letra pequeña.'
  },
  3: {
    titulo: '¿Quién dijo esto?',
    texto: '«No tengo hambre, pero te robo una patata».',
    respuesta: 'Yo. Y fueron siete. Las contaste.'
  },
  24: {
    titulo: 'Cosas que me guardo',
    texto: 'Cintia,\n\nEste año me guardo el café de aquel sitio al que entramos porque llovía. Y el paseo que iba a durar diez minutos. Y las veces que nos quedamos en la cocina charlando con todo ya recogido.\n\nEl año que viene hacemos más de eso. Y pedimos dos croissants, por favor.',
    fotos: [
      { src: './fotos/cafe.jpg', alt: 'Dos cafés y un croissant junto a una ventana lluviosa' },
      { src: './fotos/paseo.jpg', alt: 'Una calle nevada iluminada por una farola' }
    ],
    pista: 'Mira donde guardamos las tazas que nunca usamos.'
  }
};

const mensajesDemo = [
  'La próxima vez que digamos «salimos en cinco minutos», pongo un cronómetro.',
  'Hoy eliges peli. Prometo no buscar cuánto dura antes de decir que sí.',
  'Te he dejado la última galleta. Esto sí que merece una puerta.',
  'Tenemos pendiente un café de esos que se alargan hasta la hora de comer.',
  'Vale por un paseo sin tener que decidir adónde vamos.',
  'He hecho una lista de la compra. Sí, he apuntado también el chocolate.',
  '¿Hacemos desayuno de domingo aunque no sea domingo?',
  'Hoy pongo yo la música. Puedes vetar una canción. Solo una.',
  'Me acordé de nuestra teoría de que las sobras de pizza mejoran al día siguiente.',
  'Un día de estos volvemos a pedir ese postre que íbamos a compartir.',
  'Hoy te cambio el lado frío del sofá por el mío.',
  '¿Pedimos algo para cenar y usamos los platos buenos?',
  'Hoy el paseo acaba donde vendan algo caliente para beber.',
  'Si me ves mirando recetas, sí, la de la cena sigue en pie.',
  'Vale por una siesta con el móvil en silencio.',
  'He puesto el agua a calentar. Ya puedes ir cogiendo la taza grande.',
  'Hoy hacemos esa foto que siempre decimos que hay que imprimir.',
  'Adivina quién ha comprado mandarinas como si vinieran quince personas.',
  'Te toca ponerle nombre a nuestra playlist de cocina.',
  'Hoy podemos desayunar turrón. Técnicamente sigue siendo diciembre.'
];

const portada = document.querySelector('#portada');
const calendario = document.querySelector('#calendario');
const puertas = document.querySelector('#puertas');
const sorpresa = document.querySelector('#sorpresa');
const contenido = document.querySelector('#contenido');
const cerrar = sorpresa.querySelector('.cerrar');
const abrir = document.querySelector('#abrir');
const mensaje = document.querySelector('#mensaje');
const leyendaDestacada = document.querySelector('#leyenda-destacada');
const movimientoReducido = window.matchMedia('(prefers-reduced-motion: reduce)');
const relojMadrid = new Intl.DateTimeFormat('sv-SE', {
  timeZone: 'Europe/Madrid',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit'
});
const claveProgreso = `adviento-cintia-${ANIO}-${MODO_DEMO ? 'demo' : 'real'}`;
const abiertas = leerProgreso();
let ventanaActiva;
let temporizador;

function leerProgreso() {
  try {
    const dias = JSON.parse(localStorage.getItem(claveProgreso));
    return new Set(Array.isArray(dias) ? dias.filter(dia => Number.isInteger(dia) && dia >= 1 && dia <= 24) : []);
  } catch {
    return new Set();
  }
}

function fechaPuerta(dia) {
  return `${ANIO}-12-${String(dia).padStart(2, '0')}`;
}

function disponible(dia, hoy) {
  return MODO_DEMO || fechaPuerta(dia) <= hoy;
}

function crearPuertas() {
  for (let dia = 1; dia <= 24; dia++) {
    const boton = document.createElement('button');
    boton.type = 'button';
    boton.className = dia === 24 ? 'ventana portal' : 'ventana';
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
  const hoy = relojMadrid.format(new Date());
  const diaDeHoy = hoy.startsWith(`${ANIO}-12-`) && hoy <= fechaPuerta(24)
    ? Number(hoy.slice(-2))
    : 0;
  const siguienteDemo = MODO_DEMO
    ? Array.from({ length: 24 }, (_, i) => i + 1).find(dia => !abiertas.has(dia))
    : undefined;
  const destacada = diaDeHoy || siguienteDemo;

  leyendaDestacada.textContent = MODO_DEMO && !diaDeHoy ? 'Siguiente en la demo' : 'Hoy';
  mensaje.textContent = MODO_DEMO ? 'En la demo puedes abrir las 24 puertas.'
    : hoy < fechaPuerta(1) ? 'La primera puerta se abre el 1 de diciembre.'
    : 'Toca una puerta iluminada para ver tu sorpresa.';

  for (const [indice, boton] of Array.from(puertas.children).entries()) {
    const dia = indice + 1;
    const futura = !disponible(dia, hoy);
    const abierta = !futura && abiertas.has(dia);
    const destaca = !futura && !abierta && dia === destacada;
    const etiquetas = [
      dia === 24 ? 'Portal del 24 de diciembre' : `${dia} de diciembre`,
      futura ? 'Aún cerrada' : abierta ? 'Ya abierta' : 'Disponible'
    ];
    if (dia === diaDeHoy) etiquetas.push('Hoy');

    boton.disabled = futura;
    boton.dataset.estado = futura ? 'futura' : abierta ? 'abierta' : destaca ? 'destacada' : 'disponible';
    boton.querySelector('.estado').textContent = futura ? '—' : abierta ? '✓' : destaca ? '✦' : '';
    boton.setAttribute('aria-label', etiquetas.join(', '));
  }
}

function anadirParrafo(padre, texto) {
  const parrafo = document.createElement('p');
  parrafo.textContent = texto;
  padre.append(parrafo);
}

function prepararTarjeta(dia) {
  const entrada = sorpresas[dia] ?? {
    titulo: 'Para hoy',
    texto: MODO_DEMO ? mensajesDemo[dia - 4] : 'Un ratito para nosotros. ¿Nos hacemos un café?'
  };

  document.querySelector('#dia').textContent = `${dia} de diciembre`;
  document.querySelector('#titulo').textContent = entrada.titulo;
  contenido.replaceChildren();
  if (entrada.texto) anadirParrafo(contenido, entrada.texto);

  const fotos = [
    ...(entrada.foto ? [{ src: entrada.foto, alt: entrada.descripcionFoto }] : []),
    ...(entrada.fotos ?? [])
  ];
  if (fotos.length) {
    const galeria = document.createElement('div');
    galeria.className = 'galeria';
    for (const { src, alt } of fotos) {
      const foto = document.createElement('img');
      foto.src = src;
      foto.alt = alt ?? '';
      foto.decoding = 'async';
      galeria.append(foto);
    }
    contenido.append(galeria);
  }

  for (const tipo of ['audio', 'video']) {
    if (!entrada[tipo]) continue;
    const reproductor = document.createElement(tipo);
    reproductor.src = entrada[tipo];
    reproductor.controls = true;
    reproductor.preload = 'none';
    if (tipo === 'video') reproductor.playsInline = true;
    contenido.append(reproductor);
  }

  if (entrada.enlace) {
    const enlace = document.createElement('a');
    enlace.href = entrada.enlace;
    enlace.textContent = entrada.textoEnlace ?? 'Abrir enlace';
    contenido.append(enlace);
  }

  if (entrada.respuesta) {
    const desplegable = document.createElement('details');
    const cabecera = document.createElement('summary');
    cabecera.textContent = 'Ver respuesta';
    desplegable.append(cabecera);
    anadirParrafo(desplegable, entrada.respuesta);
    contenido.append(desplegable);
  }

  if (entrada.pista) {
    const pista = document.createElement('aside');
    pista.className = 'pista';
    const titulo = document.createElement('strong');
    titulo.textContent = 'Última pista';
    pista.append(titulo);
    anadirParrafo(pista, entrada.pista);
    contenido.append(pista);
  }
}

function mostrarSorpresa(dia, boton) {
  if (sorpresa.open || ventanaActiva) return;
  const hoy = relojMadrid.format(new Date());
  if (!disponible(dia, hoy)) {
    actualizarPuertas();
    return;
  }

  prepararTarjeta(dia);
  ventanaActiva = boton;
  boton.classList.add('girada');
  sorpresa.classList.toggle('tarjeta-final', dia === 24);

  abiertas.add(dia);
  try {
    localStorage.setItem(claveProgreso, JSON.stringify([...abiertas]));
  } catch {
    // El progreso sigue disponible en memoria si el navegador bloquea el almacenamiento.
  }

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
  // Divisores de 60 para actualizar también al cambiar el día en Madrid.
  temporizador = window.setTimeout(programarActualizacion, 15000 - Date.now() % 15000);
}

crearPuertas();
actualizarPuertas();

abrir.addEventListener('click', () => {
  if (portada.classList.contains('abriendo')) return;
  portada.classList.add('abriendo');
  abrir.setAttribute('aria-disabled', 'true');

  const mostrar = () => {
    portada.hidden = true;
    calendario.hidden = false;
    document.querySelector('#titulo-calendario').focus({ preventScroll: true });
    window.scrollTo(0, 0);
    programarActualizacion();
  };

  if (movimientoReducido.matches) mostrar();
  else window.setTimeout(mostrar, 620);
});

document.addEventListener('visibilitychange', () => {
  if (!calendario.hidden) programarActualizacion();
});
window.addEventListener('pageshow', () => {
  if (!calendario.hidden) programarActualizacion();
});
window.addEventListener('storage', evento => {
  if (evento.key !== claveProgreso && evento.key !== null) return;
  abiertas.clear();
  for (const dia of leerProgreso()) abiertas.add(dia);
  actualizarPuertas();
});

document.querySelector('#inicio-tarjeta').addEventListener('focus', () => {
  const controles = contenido.querySelectorAll('a[href], summary, audio[controls], video[controls]');
  (controles[controles.length - 1] ?? cerrar).focus();
});
document.querySelector('#fin-tarjeta').addEventListener('focus', () => cerrar.focus());

sorpresa.addEventListener('close', () => {
  document.documentElement.classList.remove('modal-abierto');
  ventanaActiva.classList.remove('girada');
  ventanaActiva.focus({ preventScroll: true });
  ventanaActiva = undefined;
  contenido.replaceChildren();
});
