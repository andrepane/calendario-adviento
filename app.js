const MODO_DEMO = true;
const ANIO = 2026;

const sorpresas = {
  1: {
    titulo: 'Lo que pasó antes de la foto',
    texto: 'Aquí puedes poner una foto vuestra y contar qué pasó justo antes.',
    foto: 'https://images.unsplash.com/photo-1470252649378-9c29740c9fa8?w=900&auto=format&fit=crop',
    descripcionFoto: 'Paisaje al amanecer de ejemplo'
  },
  2: {
    titulo: 'Vale por una cena',
    texto: 'El viernes hago la cena. Tú eliges entre carbonara y pizza. Yo recojo.'
  },
  3: {
    titulo: '¿Quién dijo esto?',
    texto: '«En cinco minutos estoy lista».',
    respuesta: 'Aquí puedes poner la respuesta o la historia detrás de la frase.'
  },
  24: {
    titulo: 'Cosas de este año que quiero guardar',
    texto: 'Aquí puedes poner la carta final y una pista para encontrar el regalo.'
  }
};

const portada = document.querySelector('#portada');
const calendario = document.querySelector('#calendario');
const puertas = document.querySelector('#puertas');
const sorpresa = document.querySelector('#sorpresa');
const contenido = document.querySelector('#contenido');

function fechaDeMadrid() {
  return new Intl.DateTimeFormat('sv-SE', {
    timeZone: 'Europe/Madrid'
  }).format(new Date());
}

function mostrarSorpresa(dia) {
  const entrada = sorpresas[dia] ?? {
    titulo: 'Sorpresa por preparar',
    texto: 'Edita app.js para rellenar esta puerta.'
  };

  document.querySelector('#dia').textContent = `${dia} de diciembre`;
  document.querySelector('#titulo').textContent = entrada.titulo;
  contenido.replaceChildren();

  if (entrada.texto) {
    const parrafo = document.createElement('p');
    parrafo.textContent = entrada.texto;
    contenido.append(parrafo);
  }

  if (entrada.foto) {
    const foto = document.createElement('img');
    foto.src = entrada.foto;
    foto.alt = entrada.descripcionFoto ?? '';
    contenido.append(foto);
  }

  for (const tipo of ['audio', 'video']) {
    if (!entrada[tipo]) continue;
    const reproductor = document.createElement(tipo);
    reproductor.src = entrada[tipo];
    reproductor.controls = true;
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
    const respuesta = document.createElement('p');

    cabecera.textContent = 'Ver respuesta';
    respuesta.textContent = entrada.respuesta;
    desplegable.append(cabecera, respuesta);
    contenido.append(desplegable);
  }

  sorpresa.showModal();
}

function dibujarPuertas() {
  const hoy = fechaDeMadrid();

  document.querySelector('#mensaje').textContent =
    MODO_DEMO || hoy >= `${ANIO}-12-01`
      ? 'Toca una puerta para abrirla.'
      : 'La primera puerta se abre el 1 de diciembre.';

  puertas.replaceChildren();

  for (let dia = 1; dia <= 24; dia++) {
    const fecha = `${ANIO}-12-${String(dia).padStart(2, '0')}`;
    const boton = document.createElement('button');

    boton.type = 'button';
    boton.textContent = dia;
    boton.disabled = !MODO_DEMO && hoy < fecha;
    boton.setAttribute('aria-label', `${dia} de diciembre`);
    boton.classList.toggle('especial', dia === 24);
    boton.addEventListener('click', () => mostrarSorpresa(dia));
    puertas.append(boton);
  }
}

document.querySelector('#abrir').addEventListener('click', () => {
  portada.hidden = true;
  calendario.hidden = false;
  dibujarPuertas();
});

sorpresa.addEventListener('close', () => contenido.replaceChildren());
