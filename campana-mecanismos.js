!function(){
  'use strict';
  const nueva=structuredClone(window.CALENDARIO_PUBLICADO??window.CAMPANA_3946);
  nueva.partida='campana-mecanismos-v3';
  const usar=(...dias)=>dias.map(EscapeRoom.idEvidencia);
  const configurar=(dia,reto)=>{nueva.capitulos[dia-1]={listo:true,acierto:'Mecanismo resuelto. Ya tienes la siguiente llave.',...reto};};
  const datos=c=>JSON.stringify(c,null,2);
  const ruta=[0,1,6,7,2,3,4,9,14,13,12,11,10,15,20,21,22,23,24];
  const direccion=(a,b)=>b===a-5?0:b===a+1?1:b===a+5?2:3;
  const piezas=Array.from({length:25},(_,id)=>{
    const i=ruta.indexOf(id);
    const puertos=i<0?[0,1]:[i===0?3:direccion(id,ruta[i-1]),i===ruta.length-1?1:direccion(id,ruta[i+1])];
    const fija=[0,4,10,20,24,18].includes(id);
    return {id:'tubo-'+id,puertos,fija,giro:fija?0:(id*3+1)%4};
  });
  configurar(4,{
    titulo:'Las tuberías congeladas',
    instrucciones:'Lleva el agua desde la entrada hasta la caldera, pasando por las dos válvulas y evitando la salida rota. Toca una tubería móvil para girarla un cuarto de vuelta. Las piezas con remaches están fijas.',
    tipo:'tuberias',configuracion:datos({lado:5,piezas,entrada:0,caldera:24,valvulas:[4,20],rota:5,solucion:Array(25).fill(0)}),
    pistas:['Sigue el agua desde la entrada. Solo cruza una unión si las dos bocas coinciden.','La primera válvula está en la esquina superior derecha; la segunda, abajo a la izquierda.','Al principio, baja por la segunda columna, gira a la derecha y vuelve arriba por la tercera. Después cruza el centro hacia la izquierda y termina por abajo.']
  });
  configurar(6,{
    titulo:'El ascensor de mantenimiento',
    instrucciones:'El mensaje habla de una chimenea: esa es la planta de destino. La placa traduce cada letra con tu alfabeto. Puedes pasar por plantas bloqueadas, pero no detenerte en ellas. Salir del edificio o intentar llegar a una planta bloqueada no consume movimientos. Llega en seis movimientos o menos.',
    tipo:'mantenimiento',dependencias:usar(2,5),
    configuracion:datos({minimo:0,maximo:24,inicio:4,destino:21,limite:6,bloqueadas:[12,16,20],botones:[{letra:'H',desplaza:4},{letra:'C',desplaza:-3}],solucion:[0,1,0,0,0,0]}),
    pistas:['H y C se traducen usando la tarjeta del día 2. La flecha indica el sentido.','Intentar subir siempre te deja ante una planta bloqueada. Necesitas bajar una vez.','Tras llegar al piso 8, baja tres plantas. Después podrás subir de cuatro en cuatro.'],
    evidenciaTitulo:'Nochevieja = 9',evidenciaTexto:'Nochevieja = 9.',evidenciaDibujo:'reloj'
  });
  configurar(7,{
    titulo:'El visor averiado',
    instrucciones:'Cada visor perdió los segmentos marcados en su diagnóstico. Esos trazos no se encienden aunque la cifra los necesite. Reconstruye las cuatro cifras originales y escribe el código.',
    tipo:'diagnostico',configuracion:datos({visores:[
      {averiados:'ac',visibles:'bdefg'},{averiados:'ab',visibles:'cdef'},
      {averiados:'ac',visibles:'dfg'},{averiados:'ab',visibles:'deg'}
    ],solucion:'8052'}),
    pistas:['Compara los segmentos que funcionan con la referencia de cifras completas.','Un trazo apagado que funciona descarta cualquier cifra que lo necesite.','Las cuatro cifras son 8, 0, 5 y 2, en ese orden.'],
    evidenciaTitulo:'El espejo',evidenciaTexto:'El espejo abre la tapa de otro mecanismo.',evidenciaDibujo:'espejo'
  });
  const anillos=[
    {entrada:0,salida:5,pasillos:[[0,1],[1,2],[2,3],[3,4],[4,5],[0,11],[11,10]]},
    {entrada:2,salida:8,pasillos:[[2,3],[3,4],[4,5],[5,6],[6,7],[7,8],[2,1],[1,0]]},
    {entrada:7,salida:1,pasillos:[[7,8],[8,9],[9,10],[10,11],[11,0],[0,1],[7,6],[6,5]]},
    {entrada:10,salida:4,pasillos:[[10,11],[11,0],[0,1],[1,2],[2,3],[3,4],[10,9],[9,8]]}
  ];
  const giros=[3,5,2,7],solucion=[];
  const orientaciones=[...giros];
  const girar=(anillo,destino)=>{
    let dif=(destino-orientaciones[anillo]+12)%12;
    const paso=dif>6?-1:1;
    if(dif>6)dif=12-dif;
    for(let i=0;i<dif;i++)solucion.push({tipo:'girar',anillo,paso});
    orientaciones[anillo]=destino;
  };
  girar(0,0);solucion.push({tipo:'entrar'});
  for(let i=0;i<4;i++){
    let pos=anillos[i].entrada;
    while(pos!==anillos[i].salida){solucion.push({tipo:'andar',paso:1});pos=(pos+1)%12;}
    if(i<3)girar(i+1,(anillos[i].salida+orientaciones[i]-anillos[i+1].entrada+12)%12);
    solucion.push({tipo:'entrar'});
  }
  configurar(11,{
    titulo:'El laberinto de los anillos',
    instrucciones:'Lleva la bolita del borde al centro. Gira cada anillo con los botones o deslizando sobre él. La bolita viaja con su anillo cuando lo giras y permanece en el mismo pasillo. Avanza por los pasillos claros y entra al siguiente anillo solo cuando sus puertas estén conectadas.',
    tipo:'anillos',configuracion:datos({sectores:12,entrada:0,anillos,giros,solucion}),
    pistas:['Primero alinea la entrada del anillo exterior con la bolita de arriba.','Recorre el pasillo de tu anillo hasta la puerta interior y alinea la entrada del siguiente. Los ramales cortos terminan en paredes.','Los pasillos principales avanzan en sentido horario. Ajusta cada anillo interior cuando alcances la salida del anterior.']
  });
  configurar(12,{
    titulo:'El mecanismo del espejo',
    instrucciones:'Gira la rueda motriz hasta alinear las tres marcas con sus indicadores fijos. Cada paso mueve un diente: las ruedas vecinas giran en sentidos opuestos. El embrague conecta o libera la tercera rueda. Al liberarla, esa rueda conserva su posición.',
    tipo:'engranajes',dependencias:usar(7),configuracion:datos({dientes:[12,18,24],inicio:[0,0,0],objetivos:[3,15,5],solucion:[1,1,1,1,1,'embrague',-1,-1]}),
    pistas:['Con el embrague conectado, la tercera rueda acumula el movimiento. Al liberarlo puedes corregir las dos primeras.','La tercera marca necesita cinco pasos; las dos primeras necesitan un total de tres.','Avanza cinco pasos con el embrague, libéralo y retrocede dos pasos.'],
    evidenciaTitulo:'Espejo = 3',evidenciaTexto:'Espejo = 3.',evidenciaDibujo:'espejo'
  });
  configurar(14,{
    titulo:'El vitral lunar',
    instrucciones:'Elige dos discos y gíralos sobre la lámpara. Cualquier zona opaca de cualquiera de ellos bloquea la luz. Reproduce y guarda los cuatro modelos de la tarjeta. Los discos A y B son transparentes; C y D tienen media superficie opaca.',
    tipo:'vitral',configuracion:datos({
      discos:[{nombre:'A',opaco:[0,0,0,0]},{nombre:'B',opaco:[0,0,0,0]},{nombre:'C',opaco:[0,0,1,1]},{nombre:'D',opaco:[1,1,0,0]}],
      modelos:[{id:'nueva',nombre:'Nueva',opaco:[1,1,1,1]},{id:'creciente',nombre:'Creciente',opaco:[0,0,1,1]},{id:'llena',nombre:'Llena',opaco:[0,0,0,0]},{id:'menguante',nombre:'Menguante',opaco:[1,1,0,0]}],
      soluciones:{nueva:{discos:[2,3],giros:[0,0,0,0]},creciente:{discos:[0,2],giros:[0,0,0,0]},llena:{discos:[0,1],giros:[0,0,0,0]},menguante:{discos:[0,3],giros:[0,0,0,0]}}
    }),
    pistas:['Dos zonas opacas nunca se anulan. La luz solo pasa donde los dos discos son transparentes.','Combina las dos mitades para apagar la lámpara y los dos discos transparentes para iluminarla entera.','Nueva: C+D sin girar. Creciente: A+C. Llena: A+B. Menguante: A+D.'],
    evidenciaTitulo:'Las cuatro fases de la luna',evidenciaTexto:'Nueva → Creciente → Llena → Menguante.',
    evidenciaDibujo:'luna',evidenciaDatos:'Nueva\nCreciente\nLlena\nMenguante'
  });
  configurar(17,{
    titulo:'El nonograma de la casa',
    instrucciones:'Completa el dibujo de una casa de invierno. Cada ficha de una pista representa un grupo separado por al menos una casilla vacía. Puedes pintar o marcar los vacíos con las herramientas.',
    tipo:'nonograma',configuracion:datos({solucion:['00011000','00111100','01100110','11000011','11111111','10100101','10100101','11111111']}),
    pistas:['Empieza por las filas completas y usa sus cruces para situar los grupos verticales.','Los grupos 1, 1 se mantienen separados: no equivalen a un 2.','El dibujo tiene tejado arriba y dos filas de ventanas debajo de una línea completa.']
  });
  configurar(21,{
    titulo:'El segundo cuadro eléctrico',
    instrucciones:'Apaga el cuadro con seis interruptores seleccionados como máximo. Cada pulsación cambia su luz y las vecinas ortogonales. Los cables unen 1 con 16 y 4 con 13: pulsar un extremo cambia también el otro. Una luz cambia una sola vez en cada pulsación. Tocar de nuevo un interruptor deshace su efecto.',
    tipo:'electrico',configuracion:datos({lado:4,inicial:[2,3,7,9,10,11,12],maximo:6,conexiones:[[1,16],[4,13]],solucion:[3,4,7,10,11,14]}),
    pistas:['Los cables actúan en ambos sentidos. Cuenta sus extremos además de los vecinos.','El mínimo es seis. Puedes deshacer una selección sin gastar otro interruptor.','Una solución es 3, 4, 7, 10, 11 y 14.']
  });
  nueva.capitulos[15].dependencias=usar(14);
  nueva.capitulos[17].dependencias=usar(16);
  nueva.capitulos[22].dependencias=usar(6,12,18,22);
  nueva.capitulos[23].dependencias=usar(6,12,18,22,23);
  nueva.capitulos[23].combinacion='3946';
  window.CAMPANA_MECANISMOS=nueva;
}();
