!function () {
  'use strict';

  const usar = (...dias) => dias.map(EscapeRoom.idEvidencia);
  const fases = 'Nueva\nCreciente\nLlena\nMenguante';
  const capitulos = [
    {
      titulo: 'El primer mensaje',
      instrucciones: 'Lee esta conversación ficticia. La fecha también forma parte de la pista.',
      pregunta: '¿En qué fecha pasó esta conversación?',
      respuestas: ['18/02/2020', '18/2/2020', '18-02-2020', '18-2-2020',
        '18 de febrero de 2020', 'dieciocho de febrero de dos mil veinte'],
      recursoTipo: 'conversacion',
      recursoDatos: '18 de febrero de 2020\n¿Tienes un minuto?\nSí, aunque ese «un minuto» me da miedo.\nGuarda esta conversación. Algún día nos hará gracia.',
      pistas: ['Busca la línea que separa los mensajes del encabezado. Copia también el año.'],
      acierto: 'Menos mal que alguien se acordó de guardar la conversación.'
    },
    {
      titulo: 'La flor',
      instrucciones: 'Lee las letras de las fichas en este orden: 3 → 1 → 2 → 4.',
      respuestas: ['FLOR'],
      recursoTipo: 'fichas', recursoDatos: '1 | L\n2 | O\n3 | F\n4 | R',
      pistas: ['Empieza por la ficha con el número 3. El número solo indica qué ficha coger.'],
      evidenciaTitulo: 'Flor', evidenciaTexto: 'La palabra guardada es FLOR. En cada pétalo, P indica su posición.',
      evidenciaDibujo: 'flor', evidenciaDatos: '1 | 3 | 5 | 7'
    },
    {
      titulo: 'El archivo protegido',
      instrucciones: 'La primera cifra es el doble de la última. La de en medio es una más que la primera. Las tres suman 16.',
      pregunta: '¿Qué código abre el archivador?',
      respuestas: ['673'], recursoTipo: 'archivador', recursoDatos: '3',
      pistas: ['Empieza probando valores para la última cifra. Las otras dos se calculan a partir de ella.']
    },
    {
      titulo: 'Tres cajas',
      instrucciones: 'Solo un cartel dice la verdad. Toca la caja donde crees que está la llave.',
      tipo: 'opciones', recursoTipo: 'cajas',
      opciones: ['A · La llave está en B', 'B · La llave no está aquí', 'C · La llave no está en A'],
      correcta: 0,
      pistas: ['Supón que la llave está en una caja y cuenta cuántos carteles serían ciertos. Repite con las demás.']
    },
    {
      titulo: 'Las cuatro etiquetas',
      instrucciones: 'La palabra que guardaste el día 2 indica en qué orden leerlas.',
      pregunta: '¿Qué palabra forman las letras que quedan a la derecha?',
      respuestas: ['GIRA'], recursoTipo: 'fichas', recursoDatos: 'R | → A\nL | → I\nO | → R\nF | → G',
      dependencias: usar(2),
      pistas: ['Busca primero la etiqueta que empieza con la primera letra de la palabra del cuaderno.'],
      evidenciaTitulo: 'Sello del pétalo', evidenciaTexto: 'El sello marca el cuarto pétalo. Se cuentan desde arriba en sentido horario.',
      evidenciaDibujo: 'sello', evidenciaDatos: '4'
    },
    {
      titulo: 'La flor sellada',
      instrucciones: '¿Qué cifra contiene el pétalo que marca el sello?',
      dependencias: usar(2, 5), respuestas: ['7'],
      pistas: ['El sello te dice la posición. La flor te dice el valor que hay en esa posición.'],
      evidenciaTitulo: 'Flor = 7', evidenciaTexto: 'La cifra de la flor es 7.',
      evidenciaDibujo: 'flor', evidenciaDatos: '1 | 3 | 5 | 7'
    },
    {
      titulo: 'El mensaje del espejo',
      instrucciones: 'Alguien dejó un mensaje junto al espejo.',
      pregunta: '¿Qué objeto menciona el mensaje?',
      respuestas: ['ESPEJO'], recursoTipo: 'espejo', recursoDatos: 'OJEPSE LE NE ARIM',
      pistas: ['Empieza por la letra más a la derecha y lee hacia el otro lado.'],
      evidenciaTitulo: 'El espejo', evidenciaTexto: 'Guarda el espejo por si vuelve a aparecer.',
      evidenciaDibujo: 'espejo'
    },
    {
      titulo: 'El cuadro de luces',
      instrucciones: 'Enciende solo una luz. El cartel de esa luz debe ser el único verdadero. Puedes cambiar tu elección antes de comprobar.',
      tipo: 'opciones', recursoTipo: 'interruptores',
      opciones: ['A · C está encendida', 'B · B está encendida', 'C · A está encendida'],
      correcta: 1,
      pistas: ['Además de contar los carteles verdaderos, fíjate en qué interruptor tiene ese cartel.']
    },
    {
      titulo: 'La tecla gastada',
      instrucciones: 'La cerradura usa dos cifras distintas. Estos son los últimos intentos.',
      apoyo: '42 · Una cifra correcta y bien colocada. La otra no aparece.\n28 · Las dos cifras son correctas y están mal colocadas.\n47 · Ninguna aparece.',
      respuestas: ['82'], recursoTipo: 'teclado', recursoDatos: '2',
      pistas: ['Empieza por el intento que descarta dos cifras de golpe.'],
      evidenciaTitulo: 'La tira de la cerradura', evidenciaTexto: 'Conserva el sentido de la flecha.',
      evidenciaDibujo: 'fichas', evidenciaDatos: '8 | →\n2'
    },
    {
      titulo: 'La ruta del mensajero',
      instrucciones: 'Empieza abajo a la izquierda. Anota esa letra. Luego anota una letra después de cada paso: derecha, arriba, derecha, abajo.',
      respuestas: ['CLAVE'], recursoTipo: 'ruta', recursoDatos: 'B R U\nX A V\nC L E',
      pistas: ['Cuenta la casilla de salida. Tu respuesta tiene cinco letras.']
    },
    {
      titulo: 'La grabación',
      instrucciones: 'Escucha la grabación. Introduce las cifras empezando por la última que oigas.',
      audio: './fotos/grabacion-campana.wav', transcripcion: 'Nueve… cuatro… seis.',
      respuestas: ['649'],
      pistas: ['Anota las tres cifras tal como suenan y después cambia el sentido de lectura.'],
      evidenciaTitulo: 'Nota de la grabación', evidenciaTexto: 'Cuando veas el espejo, lee desde la derecha.'
    },
    {
      titulo: 'La cifra del espejo',
      instrucciones: 'Lee la tira como indica la nota. ¿Qué cifra lees primero?',
      recursoTipo: 'espejo', dependencias: usar(7, 9, 11), respuestas: ['2'],
      pistas: ['La nota te indica por qué extremo de la tira debes empezar.'],
      evidenciaTitulo: 'Espejo = 2', evidenciaTexto: 'La cifra del espejo es 2.', evidenciaDibujo: 'espejo'
    },
    {
      titulo: 'La palabra partida',
      instrucciones: 'Coloca dos fichas D en los huecos o escribe la palabra completa.',
      respuestas: ['CANDADO'], recursoTipo: 'palabra', recursoDatos: 'CAN_A_O\nD',
      pistas: ['Sirve para cerrar algo y cabe en la mano.']
    },
    {
      titulo: 'El mensaje de cuatro líneas',
      instrucciones: 'Lee la nota.', pregunta: '¿Qué palabra esconde la nota?',
      recursoTipo: 'nota',
      recursoDatos: 'La puerta sigue cerrada.\nUna copia quedó dentro.\nNadie ha vuelto a buscarla.\nAntes de salir, mira el principio',
      respuestas: ['LUNA'],
      pistas: ['La última línea te dice en qué parte de cada línea fijarte.'],
      evidenciaTitulo: 'Las cuatro fases de la luna', evidenciaTexto: 'Conserva las fases en este orden.',
      evidenciaDibujo: 'luna', evidenciaDatos: fases
    },
    {
      titulo: 'El ascensor',
      instrucciones: 'Empieza en el piso 2. Sube tres pisos. Baja uno. El último piso es el doble del piso en el que estás.',
      pregunta: 'Introduce los cuatro pisos visitados, incluido el inicial.',
      respuestas: ['2548'], recursoTipo: 'teclado', recursoDatos: '4',
      pistas: ['Escribe un piso cada vez que acaba una instrucción. El 2 ya cuenta como el primero.']
    },
    {
      titulo: 'La lectura por columnas',
      instrucciones: 'Lee cada columna de arriba abajo, empezando por la izquierda. De la secuencia que obtengas, escribe la segunda, la cuarta y la sexta letra.',
      respuestas: ['LAS'], recursoTipo: 'cuadricula', recursoDatos: 'R U E\nL A S',
      pistas: ['Anota las dos letras de una columna antes de pasar a la siguiente.'],
      evidenciaTitulo: 'Instrucción de la luna', evidenciaTexto: 'La luna llena marca la casilla que buscas.'
    },
    {
      titulo: 'Dos notas superpuestas',
      instrucciones: 'Lee de izquierda a derecha las letras que aparecen en el mismo sitio en ambas tiras.',
      respuestas: ['LUZ'], recursoTipo: 'tiras', recursoDatos: 'L A U N Z\nL O U P Z',
      pistas: ['Compara cada letra con la que tiene justo debajo, aunque otra se repita más adelante.']
    },
    {
      titulo: 'Las fases de la luna',
      instrucciones: 'Usa la instrucción del día 16 para elegir una cifra.',
      respuestas: ['4'], recursoTipo: 'luna', recursoDatos: 'Nueva | 3\nCreciente | 8\nLlena | 4\nMenguante | 6',
      dependencias: usar(14, 16),
      pistas: ['Identifica primero la fase que nombra la instrucción y mira la cifra de su columna.'],
      evidenciaTitulo: 'Luna = 4', evidenciaTexto: 'La cifra de la luna es 4.', evidenciaDibujo: 'luna', evidenciaDatos: fases
    },
    {
      titulo: 'Las cuatro fichas',
      instrucciones: 'La campana está inmediatamente a la izquierda de la luna. La estrella está a la derecha de la luna. El espejo está en un extremo. La estrella no está al lado del espejo.',
      tipo: 'ordenar', recursoTipo: 'objetos', orden: ['Espejo', 'Campana', 'Luna', 'Estrella'],
      pistas: ['Coloca la campana y la luna como pareja. Después prueba los dos extremos para el espejo.']
    },
    {
      titulo: 'El papel perforado',
      instrucciones: 'Coloca la plantilla. Lee las letras visibles de arriba abajo y de izquierda a derecha.',
      respuestas: ['PURA'], recursoTipo: 'plantilla', recursoDatos: 'P C E\nA U R\nT O A\n1 5 6 9',
      pistas: ['Recorre las filas como si leyeras un párrafo. Salta las casillas tapadas.']
    },
    {
      titulo: 'La letra repetida',
      instrucciones: 'Busca una letra presente en las tres palabras y repetida en una de ellas.',
      respuestas: ['N'], recursoTipo: 'tiras', recursoDatos: 'T R U E N O\nN U B E S\nN I E B L I N A',
      pistas: ['Empieza por la palabra más larga y apunta qué letras se repiten en ella.']
    },
    {
      titulo: 'La campana muda',
      instrucciones: 'Mira los tres pasos del visor. ¿Qué cifra forman si juntas todos los trazos?',
      respuestas: ['9'], recursoTipo: 'campana', recursoDatos: 'adg\nf\nbc',
      pistas: ['Fíjate también en el segmento inferior izquierdo. Que quede apagado es parte de la pista.'],
      evidenciaTitulo: 'Campana = 9', evidenciaTexto: 'La cifra de la campana es 9.', evidenciaDibujo: 'campana'
    },
    {
      titulo: 'La nota sobre el orden',
      instrucciones: 'El espejo va primero. La flor está justo antes de la campana. La luna va después de la campana.',
      tipo: 'ordenar', recursoTipo: 'objetos', orden: ['Espejo', 'Flor', 'Campana', 'Luna'],
      pistas: ['Fija primero el espejo. Las fichas de la flor y la campana tienen que quedar juntas.'],
      evidenciaTitulo: 'El orden de las cuatro fichas', evidenciaTexto: 'Espejo → Flor → Campana → Luna.',
      evidenciaDibujo: 'fichas', evidenciaDatos: '1 | Espejo\n2 | Flor\n3 | Campana\n4 | Luna'
    },
    {
      titulo: 'La caja fuerte',
      instrucciones: 'Cada objeto tiene una cifra. Usa el orden que descubriste ayer.',
      tipo: 'combinacion', combinacion: '2794', recursoTipo: 'caja', recursoDatos: '4',
      dependencias: usar(6, 12, 18, 22, 23),
      pistas: ['Lee primero la tarjeta que ordena los objetos. Después sustituye cada objeto por su cifra.'],
      acierto: 'La caja se ha abierto.',
      premio: 'Busca un sobre bajo la manta del sofá.'
    }
  ];

  window.CAMPANA_PRUEBA = {
    esquema: 1, partida: 'campana-prueba-2026',
    capitulos: capitulos.map(reto => ({
      listo: true, acierto: 'Bien visto. Ya tienes lo que necesitas para seguir.', ...reto
    }))
  };
}();
