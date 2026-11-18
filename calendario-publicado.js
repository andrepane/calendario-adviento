window.CALENDARIO_PUBLICADO = {
  esquema: 1,
  partida: 'demo-2026',
  capitulos: EscapeRoom.dias.map(dia => ({
    titulo: 'Una palabra para seguir',
    instrucciones: 'Capítulo ficticio. Escribe la palabra que aparece en la nota.',
    apoyo: 'La nota dice: «diciembre».',
    respuestas: ['diciembre'],
    listo: true
  }))
};

Object.assign(CALENDARIO_PUBLICADO.capitulos, {
  0: {
    titulo: 'El ruido en la cocina',
    instrucciones: 'Dale al play. Cuenta los golpes de la grabación y elige la respuesta.',
    pregunta: '¿Cuántos golpes has oído?',
    tipo: 'opciones',
    opciones: ['Dos', 'Tres', 'Cuatro'],
    correcta: 1,
    audio: './fotos/golpes-demo.wav',
    pistas: ['Hay una pausa entre cada golpe.', 'Marca «Tres».'],
    acierto: 'Eran tres. Ya tenemos la primera pista de la caja.',
    evidenciaTitulo: 'Primer dígito',
    evidenciaTexto: 'El primer dígito de la caja es 0.',
    listo: true
  },
  1: {
    titulo: 'El sobre de la nevera',
    instrucciones: 'Busca el sobre bajo el imán de la nevera. Escribe el código entero, con sus ceros.',
    apoyo: 'Ejemplo para probar en casa. El papel ficticio lleva el código 0042.',
    respuestas: ['0042'],
    pistas: ['El código tiene cuatro cifras.', 'Para esta demo, escribe 0042.'],
    acierto: 'Ya puedes volver a poner el imán en su sitio.',
    evidenciaTitulo: 'Segundo dígito',
    evidenciaTexto: 'El segundo dígito de la caja es 7.',
    listo: true
  },
  2: {
    titulo: 'Una frase en tres pedazos',
    instrucciones: 'Ordena las piezas para recomponer la frase.',
    tipo: 'ordenar',
    orden: ['El último', 'símbolo es', 'una estrella'],
    pistas: ['La frase empieza por «El último».'],
    evidenciaTitulo: 'Último símbolo',
    evidenciaTexto: 'El tercer carácter de la caja es ★.',
    listo: true
  },
  23: {
    titulo: 'La caja fuerte',
    instrucciones: 'Consulta las tres tarjetas del cuaderno y escribe los dígitos y el símbolo juntos, en el orden indicado.',
    pregunta: '¿Cuál es la combinación?',
    tipo: 'combinacion',
    combinacion: '07★',
    dependencias: ['evidencia-1', 'evidencia-2', 'evidencia-3'],
    pistas: ['Empieza por el cero. La estrella que necesitas es ★.', 'La combinación es 07★.'],
    acierto: 'La caja se ha abierto.',
    premio: 'Premio de ejemplo: vale por una cena. En esta historia, el vale está donde guardamos las tazas que nunca usamos.',
    listo: true
  }
});
