!function () {
  'use strict';
  const ER = window.EscapeRoom;
  const datos = structuredClone(window.CAMPANA_PRUEBA);
  datos.partida = 'campana-3946-v2';
  const usar = (...dias) => dias.map(ER.idEvidencia);
  const reemplazar = (dia, reto) => {
    datos.capitulos[dia - 1] = { listo: true, acierto: 'Bien visto. Ya tienes la llave para seguir.', ...reto };
  };
  const lunar = ['Nueva', 'Creciente', 'Llena', 'Menguante'];
  reemplazar(2, {
    titulo: 'El anagrama', instrucciones: 'Diez letras. Una sola palabra.',
    respuestas: ['NOCHEVIEJA'], tipo: 'anagrama',
    configuracion: JSON.stringify({ fichas: ['J','E','O','V','A','N','I','E','H','C'] }, null, 2),
    pistas: ['La palabra nombra una celebración.'],
    evidenciaTitulo: 'Alfabeto de Nochevieja',
    evidenciaTexto: '1 = N\n2 = O\n3 = C\n4 = H\n5 = E\n6 = V\n7 = I\n8 = J\n9 = A\nLas letras repetidas conservan el mismo número.',
    evidenciaDibujo: 'reloj'
  });
  reemplazar(5, {
    titulo: 'El mensaje cifrado',
    instrucciones: 'El alfabeto que encontraste abre este mensaje. Cada cifra sustituye una letra.',
    apoyo: '912345 67 9 U1 67582 8U1T2 9 L9 347M5159',
    respuestas: ['ANOCHE VI A UN VIEJO JUNTO A LA CHIMENEA'], normalizacion: 'frase',
    dependencias: usar(2), pistas: ['Las letras ya escritas se quedan donde están. Empieza descifrando una palabra corta.'],
    evidenciaTitulo: 'El mensaje descifrado',
    evidenciaTexto: 'ANOCHE VI A UN VIEJO JUNTO A LA CHIMENEA'
  });
  reemplazar(6, {
    titulo: 'La letra que más se repite',
    instrucciones: 'En el mensaje descifrado hay una vocal que aparece más veces que las demás. Encuéntrala. Después introduce el número que le corresponde en tu alfabeto.',
    respuestas: ['9'], dependencias: usar(2,5),
    pistas: ['Primero busca la vocal. Después consulta su número.'],
    evidenciaTitulo: 'Nochevieja = 9', evidenciaTexto: 'Nochevieja = 9.', evidenciaDibujo: 'reloj'
  });
  reemplazar(7, {
    titulo: 'El reflejo', instrucciones: 'Al otro lado se lee mejor.',
    recursoTipo: 'reflejo', recursoDatos: 'PARA ABRIR ESTA PUERTA ESCRIBE REFLEJO',
    respuestas: ['REFLEJO'], pistas: ['Un espejo puede deshacer lo que hizo otro.'],
    evidenciaTitulo: 'El espejo', evidenciaTexto: 'El espejo vuelve a aparecer más adelante.', evidenciaDibujo: 'espejo'
  });
  reemplazar(8, {
    titulo: 'El cuadro eléctrico',
    instrucciones: 'El cuadro está averiado. Cada interruptor cambia su propia luz y las que tiene justo arriba, abajo, a izquierda y a derecha. Las diagonales quedan igual. Consigue apagar todo el panel utilizando como máximo cuatro interruptores distintos.',
    tipo: 'electrico',
    configuracion: JSON.stringify({ inicial: [3,5,7,9], maximo: 4 }, null, 2),
    pistas: [
      'El orden de los interruptores no cambia el resultado. Importa cuáles dejas seleccionados.',
      'Necesitarás cuatro interruptores. Uno de ellos es el central.',
      'Dos están en el centro de los bordes superior e izquierdo. El cuarto está en una esquina.'
    ],
    acierto: 'El cuadro está apagado. Ya tienes la llave del día 9.'
  });
  reemplazar(9, {
    titulo: 'Cerradura de tres cifras',
    instrucciones: 'El código tiene tres cifras distintas. La primera no puede ser cero.',
    apoyo: '682 · Ninguna cifra pertenece al código.\n514 · Una cifra pertenece al código y está bien colocada. Las otras dos no aparecen.\n905 · Dos cifras pertenecen al código y ambas están mal colocadas. La otra no aparece.\n327 · Una cifra pertenece al código y está mal colocada. Las otras dos no aparecen.\n859 · Dos cifras pertenecen al código y ambas están mal colocadas. La otra no aparece.',
    respuestas: ['593'], recursoTipo: 'teclado', recursoDatos: '3',
    pistas: ['Empieza por descartar las cifras del primer intento.'],
    evidenciaTitulo: 'La tira de la cerradura', evidenciaTexto: '5 → 9 → 3.', evidenciaDibujo: 'fichas', evidenciaDatos: '5 | →\n9 | →\n3'
  });
  datos.capitulos[11] = { ...datos.capitulos[11], respuestas: ['3'], evidenciaTitulo: 'Espejo = 3', evidenciaTexto: 'Espejo = 3.' };
  reemplazar(10, {
    titulo: 'El recorrido navideño',
    instrucciones: 'Empieza en la segunda casilla de la última fila. Conserva su letra. Sigue el itinerario y anota solo la letra de la casilla donde termines cada movimiento. Norte sube, sur baja, este va a la derecha y oeste a la izquierda. Las casillas intermedias no aportan letras.',
    tipo: 'recorrido', respuestas: ['FELIZ NAVIDAD','FELIZNAVIDAD'],
    configuracion: JSON.stringify({
      filas: ['D N R Y F M A A','Q X E L S Z G N','D Z R Y I M T A','Q X E I S Z V N','D K R Y F M T A','Q E E L L Z G N','D K R D F M A A','Q F E L S Z D N'],
      inicio: [8,2], movimientos: [['Norte',2],['Este',3],['Norte',3],['Oeste',3],['Norte',2],['Este',5],['Sur',3],['Oeste',3],['Sur',3],['Este',3],['Sur',1]]
    },null,2),
    pistas: ['Anota la casilla de salida y después una sola letra por cada orden.']
  });
  reemplazar(13, {
    titulo: 'Ahorcado', instrucciones: 'Encuentra la palabra antes de apagar las ocho luces.',
    tipo: 'ahorcado', configuracion: JSON.stringify({palabra:'ELECTROENCEFALOGRAFISTA',fallos:8,inicial:0},null,2)
  });
  reemplazar(15, {
    titulo: 'El ascensor averiado',
    instrucciones: 'El ascensor empieza en el piso 12. Sigue las doce órdenes. Anota el piso al que llegas después de cada una. Cuando suene una campana, conserva ese piso para la combinación final. Todos los pisos tienen dos cifras.',
    pregunta: 'Introduce, seguidos y en orden, los cuatro pisos en los que sonó la campana.',
    tipo: 'ascensor', respuestas: ['83361311'],
    configuracion: JSON.stringify({inicio:'12', ordenes:[
      'Sube siete pisos.','Duplica el piso actual.','Invierte sus dos cifras. 🔔',
      'Resta al piso actual la suma de sus propias cifras.','Divide el resultado entre tres.',
      'Súmale el piso en el que empezó el ascensor. 🔔','Invierte las dos cifras.',
      'Resta el piso que anotaste después de la orden 5.','Divide el resultado entre tres. 🔔',
      'Súmale el piso que anotaste después de la orden 1.','Invierte las dos cifras.',
      'Resta el piso en el que empezó el ascensor. 🔔'
    ]},null,2),
    pistas: ['La campana marca las órdenes 3, 6, 9 y 12. Conserva las dos cifras de cada resultado.']
  });
  reemplazar(16, {
    titulo: 'El registro lunar',
    instrucciones: 'Cada fase esconde una cifra distinta del 1 al 9. Entre las cuatro suman 17.',
    apoyo: 'La luna nueva vale el doble que la creciente.\nLa luna llena vale la suma de la nueva y la creciente.\nLa menguante vale una unidad menos que la llena.',
    tipo: 'registro', configuracion: JSON.stringify({fases:lunar,valores:[4,2,6,5]},null,2),
    dependencias: usar(14), pistas: ['Prueba a elegir la creciente y deduce las otras tres a partir de ella.'],
    evidenciaTitulo: 'Registro lunar', evidenciaTexto: 'Nueva = 4 · Creciente = 2 · Llena = 6 · Menguante = 5.',
    evidenciaDibujo: 'luna', evidenciaDatos: 'Nueva | 4\nCreciente | 2\nLlena | 6\nMenguante | 5'
  });
  reemplazar(17, {
    titulo: 'El nonograma', instrucciones: 'Pinta las casillas que indican las pistas de filas y columnas.',
    tipo:'nonograma', configuracion:JSON.stringify({solucion:['10001','10001','11111','00001','00001']},null,2),
    pistas:['La fila con un 5 se pinta entera. Después compara las columnas.']
  });
  reemplazar(18, {
    titulo: 'La máquina lunar',
    instrucciones: 'Tu registro lunar contiene los valores. Ajusta cada rueda y calcula la salida de la máquina.',
    pregunta: 'La máquina entrega dos cifras. Suma esas dos cifras para obtener el valor de la Luna.',
    tipo:'maquina', configuracion:JSON.stringify({fases:lunar,valores:[4,2,6,5],salida:24,resultado:6},null,2),
    dependencias:usar(16), pistas:['Multiplica antes de restar. Después suma las dos cifras de la salida.'],
    evidenciaTitulo:'Luna = 6',evidenciaTexto:'Luna = 6.', evidenciaDibujo:'luna',evidenciaDatos:'Llena'
  });
  reemplazar(20, {
    titulo:'El papel perforado',
    instrucciones:'La plantilla decide qué letras sobreviven. Léelas de izquierda a derecha y de arriba abajo. Separa las palabras al terminar.',
    tipo:'perforado',respuestas:['BAJO LA LUZ DE LA LUNA','BAJOLALUZDELALUNA'],
    configuracion:JSON.stringify({
      filas:['B S D A Z K J G','R O N Y J L F Q','A M X I L E P A','U W H S Z O Z K','D G R E N Y J L','F Q B A X I T E','L A L W U S D O','Z N V G R C A Y'],
      agujeros:['10010010','01000100','10001000','10001000','10010001','00010000','10001000','01000010']
    },null,2), pistas:['Busca cada agujero en la misma fila y columna de la cuadrícula.','Puedes solicitar la superposición para comprobar la alineación.'],
    evidenciaTitulo:'La nota bajo la luz',evidenciaTexto:'BAJO LA LUZ DE LA LUNA.'
  });
  reemplazar(22, {
    titulo:'Tres cifras en fragmentos',
    instrucciones:'Tres cifras comparten el mismo visor. Reúne los fragmentos de cada marca y escribe el código en orden I, II, III.',
    tipo:'fragmentos',respuestas:['964'],
    configuracion:JSON.stringify({duracion:1200,pausa:400,fotogramas:[
      {marca:'I',color:'ámbar',segmentos:'ag'},{marca:'II',color:'azul',segmentos:'fe'},{marca:'III',color:'verde',segmentos:'bc'},
      {marca:'I',color:'ámbar',segmentos:'bf'},{marca:'II',color:'azul',segmentos:'ad'},{marca:'III',color:'verde',segmentos:'f'},
      {marca:'I',color:'ámbar',segmentos:'cd'},{marca:'II',color:'azul',segmentos:'cg'},{marca:'III',color:'verde',segmentos:'g'}
    ]},null,2),pistas:['Reúne por separado los trazos I, II y III.','Puedes consultar los fotogramas de uno en uno con la ayuda manual.'],
    evidenciaTitulo:'Campana = 4',evidenciaTexto:'Campana = 4.',evidenciaDibujo:'campana'
  });
  datos.capitulos[22] = {...datos.capitulos[22],
    instrucciones:'El espejo va primero.\nNochevieja está justo antes de la campana.\nLa luna va después de la campana.',
    orden:['Espejo','Nochevieja','Campana','Luna'],
    pistas:['Fija primero el espejo. Nochevieja y la campana deben quedar juntas.'],
    evidenciaTexto:'Espejo → Nochevieja → Campana → Luna.',
    evidenciaDatos:'1 | Espejo\n2 | Nochevieja\n3 | Campana\n4 | Luna'
  };
  datos.capitulos[23] = {...datos.capitulos[23], combinacion:'3946'};
  window.CAMPANA_3946 = datos;
}();
