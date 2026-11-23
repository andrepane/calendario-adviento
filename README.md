# Diciembre para Cintia

El calendario es una web estática. Los capítulos de muestra son ficticios. Para jugar, abre **index.html** y pulsa **Abrir el sobre**. La puerta 1 se abre el 1 de diciembre de 2026 según la hora de Madrid. Las puertas 2 a 24 requieren su fecha y la llave que se gana al resolver el reto anterior. Puedes recuperar las evidencias en el **Cuaderno** y volver a leer retos resueltos.

## Editar y previsualizar

1. Abre **editor.html** desde la carpeta del calendario en tu equipo. También puedes usar un servidor local en `localhost`. El editor guarda los borradores en el almacenamiento de ese navegador y recuerda el último día seleccionado. Usa la misma dirección y el mismo navegador para recuperarlos.
2. Elige un día, rellena su reto y pulsa **Previsualizar día**. Puedes responder y revelar pistas en la propia vista previa. Para consultar una evidencia anterior, añade su tarjeta en el día donde se gana y selecciónala en el apartado **Pistas y evidencias** del día que la usa.
3. Marca **Marcar como listo** cuando el capítulo esté preparado y pulsa **Guardar borrador**. Los avisos indican qué día está incompleto o hace referencia a una evidencia inexistente, del mismo día o de uno posterior. Cambiar el título de una evidencia conserva sus referencias.

Para probar el recorrido, elige una fecha en **Probar la historia** y pulsa **Probar**. Cambia la fecha y vuelve a pulsar **Probar** para conservar la partida simulada. Puedes reiniciarla sin afectar los borradores ni el progreso de Cintia. La demo incluye un audio el día 1, un código de cuatro cifras el día 2, una secuencia el día 3 y una caja fuerte el día 24. Los capítulos 4 a 23 empiezan como borradores de ejemplo que ya se pueden probar. Revísalos y márcalos como listos antes de preparar la publicación.

## Hacer un respaldo y moverlo a otro equipo

**Exportar respaldo** descarga un JSON con los 24 capítulos, soluciones, pistas, evidencias y rutas. El archivo no incluye las fotos ni los audios. Conserva una copia de las carpetas de medios junto al respaldo y respeta su estructura al moverlos. Por ejemplo, si un reto usa `./medios/nota.mp3`, coloca la carpeta `medios` junto a `editor.html` e `index.html` en el otro equipo. Allí, abre el editor, pulsa **Importar respaldo** y luego **Guardar borrador**.

## Preparar la versión para Cintia

1. Completa y marca los 24 capítulos como listos. Prueba el encadenamiento y el premio final.
2. Pulsa **Preparar versión para Cintia**. El editor descargará `calendario-publicado.js` si los capítulos están listos y las dependencias son válidas.
3. Sustituye `calendario-publicado.js` en la copia que quieras entregar. Si la entregas para jugar en local, incluye `index.html`, `estilos.css`, `app.js`, `escape-room.js`, `vista-reto.js`, `recursos-reto.js`, `calendario-publicado.js`, `fuentes/` y los medios referenciados. Abre `index.html` en esa carpeta para comprobar la versión. El calendario usa la fecha real de Madrid y guarda el avance por separado del editor y de la demo.

El proyecto de Vercel es estático. El editor se habilita solo en local y `.vercelignore` indica a Vercel que excluya sus archivos. Los cambios en borradores nunca modifican el sitio por sí solos. En Vercel o GitHub Pages, las soluciones y los medios de la versión publicada se pueden consultar directamente en los archivos públicos. Mantén la demo ficticia en el sitio público y guarda el respaldo JSON y la versión real fuera del repositorio público si quieres reservar las sorpresas.

## Cargar la campaña completa de prueba

Abre **editor.html** y pulsa **Cargar escape room de prueba**. Se abre un espacio independiente con los 24 capítulos rellenados. **Volver a mis borradores** recupera el calendario original. Cada espacio guarda su borrador, último día y partida simulada por separado. Pulsa **Guardar borrador** para conservar los cambios antes de cerrar la pestaña.

La conversación del día 1 es ficticia. Si ya preparaste tu reto de Instagram, el botón **Usar una copia de mi día 1** lo copia al espacio de prueba. Guarda esa copia si quieres probar tu captura. Puedes seguir editando el original desde **Mis borradores**. Sus datos se conservan al cargar la campaña.

### Empezar una partida desde el día 1

1. Carga el escape room de prueba.
2. En **Probar la historia**, pulsa **Reiniciar progreso de prueba**.
3. Para jugar todos los capítulos seguidos, elige **24/12/2026** y pulsa **Jugar campaña**. Abre el sobre y la ventana 1. Las siguientes puertas se habilitan al resolver la anterior.
4. Para comprobar la llave diferida, usa **01/12/2026**. Al resolver el día 1 se guarda la llave del 2. Cambia a **02/12/2026** y vuelve a pulsar **Jugar campaña** para usarla.

**Previsualizar día** abre el reto seleccionado y ofrece las evidencias de ejemplo necesarias en esa vista. La campaña jugable muestra las evidencias que hayas ganado en su propia partida.

### Dibujos, grabación y respaldos

En **Material de apoyo**, elige el tipo de dibujo y edita sus datos siguiendo la ayuda del formulario. Las cuadrículas se escriben con una fila por línea, las etiquetas con una ficha por línea y las fases con su nombre y su cifra. Las opciones de las cajas e interruptores se editan en el formulario de opciones. Las fichas reordenables usan las piezas del reto. El dibujo de cada evidencia se configura en **Pistas y evidencias**.

La grabación de prueba está en `./fotos/grabacion-campana.wav` y dice «nueve, cuatro, seis». Puedes sustituir su ruta y su transcripción desde el editor. La reproducción se inicia al pulsar los controles.

**Exportar respaldo** incluye los datos de los dibujos, respuestas, pistas, recompensas y referencias del cuaderno. **Importar respaldo como copia** crea otro espacio, con progreso propio y acceso desde el selector de respaldos importados. Lleva las carpetas de medios junto con el JSON al cambiar de equipo. Los SVG de los objetos se generan con `recursos-reto.js`, que también debe acompañar a la vista del jugador.

Esta campaña se carga desde el editor local. La versión publicada se sigue preparando mediante **Preparar versión para Cintia**.

## Campaña 3946 · versión 2

Abre **editor.html** y pulsa **Cargar campaña 3946 · versión 2**. Se crea otro espacio con borrador, vista previa y progreso de prueba propios. La versión anterior sigue disponible en **Cargar escape room de prueba**. El botón **Volver a mis borradores** recupera tus capítulos personales.

Al crear la versión 2 por primera vez, el editor copia tu día 1 personal desde el borrador original, si ya está preparado. También busca una copia personalizada en la campaña anterior. Guarda tu día 1 antes de cargar la nueva versión. La copia se conserva en el espacio de la versión 2 y se incluye al exportarla.

Para jugar desde el principio, pulsa **Reiniciar progreso de prueba**, elige **24/12/2026** y pulsa **Jugar campaña**. Abre la ventana 1 y avanza resolviendo los retos en orden. Para comprobar la llave diferida usa **01/12/2026**. El modo real sigue usando la fecha de Madrid.

En los juegos nuevos, el editor muestra una **Configuración del juego** con sus datos. El ahorcado tiene controles para palabra, fallos y posición revelada. El nonograma permite editar la solución binaria, cambiar filas y columnas y generar las pistas. El visor permite editar duración de cada fotograma y pausa en milisegundos. Los demás datos, como letras, itinerario, órdenes del ascensor, valores lunares, agujeros y fragmentos, se editan en el cuadro JSON. **Guardar borrador**, la recarga y el respaldo conservan esa configuración. Las evidencias mantienen sus referencias por día.

El recorrido y el papel perforado tienen tableros de 8 × 8 con casillas de 44 px. En móvil se desplazan horizontalmente. La plantilla y la cuadrícula conservan el mismo tamaño al alternarlas. La superposición se solicita desde **Pistas** mediante **Solicitar ayuda avanzada**. El visor también ofrece su navegación manual desde esa ayuda. La libreta del ascensor, las letras usadas del ahorcado y las casillas marcadas se guardan con el progreso de cada partida. Las vistas previas usan un cuaderno y anotaciones de ejemplo separados.

Esta versión usa la combinación **3946**. En el mensaje cifrado del día 5 se corrigió el primer bloque a **912345** para representar **ANOCHE** con el alfabeto del día 2. Los capítulos de las versiones anteriores se conservan.

Para entregar la campaña, prepara **calendario-publicado.js** desde el editor e incluye también **retos-avanzados.js** junto con los archivos de la vista del jugador. Los SVG siguen en **recursos-reto.js**. Los respaldos conservan las rutas de los medios. Lleva las carpetas multimedia junto al JSON al cambiar de equipo.

## Día 8 · El cuadro eléctrico

El día 8 de la campaña 3946 usa nueve interruptores. El editor permite elegir qué luces empiezan encendidas y cuántos interruptores se pueden seleccionar a la vez. Comprueba las 512 combinaciones posibles e informa de la cantidad de soluciones dentro del límite. Un tablero sin solución muestra un aviso e impide preparar la publicación.

Para actualizar un borrador ya guardado, ábrelo y pulsa **Aplicar cuadro eléctrico al día 8**, seguido de **Guardar borrador**. Este botón sustituye solo el capítulo 8 del espacio abierto. Para volver a jugarlo desde una partida que ya lo había completado, usa **Reiniciar progreso de prueba**. El enunciado y las tres pistas se editan en sus campos habituales.

El cuadro guarda los interruptores seleccionados y calcula las luces a partir de la configuración inicial. Volver a tocar un interruptor deshace su efecto. Al apagar las nueve luces dentro del límite, el reto se completa automáticamente y entrega la llave del día 9. La fecha real o simulada sigue siendo necesaria para abrir esa puerta. El día 8 no entrega una evidencia y la caja final mantiene 3946.

## Campaña de mecanismos · versión 3

Abre **editor.html** y pulsa **Cargar campaña de mecanismos · versión 3**. La primera carga crea otro espacio de borrador con su propia partida. Copia el día 1 personal y conserva los capítulos que no se sustituyen de tu versión 2 guardada, incluidos los días 8, 15 y 22. Las versiones anteriores siguen accesibles desde sus botones. Guarda el nuevo borrador después de editarlo.

Para jugar desde el principio, pulsa **Reiniciar progreso de prueba**, elige **24/12/2026** y pulsa **Jugar campaña**. Para revisar un reto aislado, selecciónalo y pulsa **Previsualizar día**. Las evidencias necesarias aparecen como ejemplo en esa vista. Los datos específicos y las soluciones de referencia están en **Configuración del juego**. Exportar e importar conserva esa configuración y las referencias.

Reglas y decisiones de los nuevos mecanismos:

- **Día 4, tuberías.** Cada boca se conecta solo con otra boca enfrentada. El agua se propaga desde la entrada y la validación exige alcanzar la caldera, visitar las dos válvulas y evitar la salida rota. Las piezas se editan mediante sus puertos 0 arriba, 1 derecha, 2 abajo y 3 izquierda. Los índices de casilla empiezan en 0. El campo **solucion** guarda los cuartos de vuelta de referencia.
- **Día 6, mantenimiento.** El ascensor empieza en 4 y busca la chimenea del 21. H sube 4 y C baja 3, según el alfabeto del día 2. Está permitido pasar por una planta bloqueada, pero no terminar en ella. Salir del edificio o intentar detenerse en una planta bloqueada no consume movimiento. La ruta mínima tiene seis movimientos. **solucion** indica los índices de botón.
- **Día 7, diagnóstico.** Cada visor tiene sus segmentos visibles y sus averías. Se verifica que esa pareja permita reconstruir una sola cifra. La leyenda muestra las diez cifras completas. El código de referencia está en la configuración.
- **Día 11, anillos.** Cada anillo gira en doce posiciones discretas. Los pasillos conectan sectores vecinos y las puertas unen anillos solo cuando coinciden. La bolita se mueve con el anillo ocupado y conserva su sector local al girarlo. Los pasillos principales y los ramales sin salida se editan como conexiones. La secuencia de referencia combina giros, pasos y entradas.
- **Día 12, engranajes.** Cada pulso avanza un diente de la motriz. Con 12, 18 y 24 dientes, los giros son de 30°, −20° y 15°. El embrague desacopla el núcleo marcado de la tercera corona. La corona sigue engranada y el núcleo conserva su orientación. Se necesitan cinco pasos conectados y dos pasos de vuelta con el núcleo liberado.
- **Día 14, vitral.** Se superponen dos discos distintos. Una zona opaca bloquea la luz aunque el otro disco sea transparente. Para poder formar la luna llena se incluyen dos discos totalmente transparentes y dos con media superficie opaca. Cada modelo guarda sus discos y giros. La tarjeta conserva Nueva → Creciente → Llena → Menguante.
- **Día 17, nonograma.** La casa de invierno de 8 × 8 tiene una sola solución, comprobada con un solucionador y con deducciones de intersecciones de líneas. Cada número tiene su ficha propia. Las herramientas Pintar y Marcar vacío permiten corregir casillas, deshacer y reiniciar.
- **Día 21, segundo cuadro.** Las conexiones adicionales unen 1 ↔ 16 y 4 ↔ 13. Sus extremos se identifican con A y B además de los cables dibujados. Una luz afectada por varias conexiones de una misma pulsación cambia una sola vez. El mínimo verificado es seis interruptores y ese es el límite configurado.

El editor conserva el progreso de estos mecanismos al cerrar o recargar. La partida de prueba, la vista previa y la partida real usan sus propios guardados. El código final continúa siendo **3946**.

Para instalar una versión preparada para Cintia, incluye **mecanismos.js** junto a **retos-avanzados.js**, **recursos-reto.js** y los demás archivos del jugador. El archivo **campana-mecanismos.js** se usa para cargar el ejemplo desde el editor local. La versión de Cintia se genera como **calendario-publicado.js**.

## Volver a jugar un reto en el editor

Después de resolver una **Previsualización de día**, pulsa **Volver a jugar** para empezar ese reto desde cero. También puedes hacerlo en una ventana ya resuelta de **Jugar campaña**. La repetición de la campaña conserva sus llaves, evidencias y capítulos completados. Si recargas durante una repetición, puedes continuarla desde el estado guardado.

Para reiniciar todos los días de la campaña de prueba sigue disponible **Reiniciar progreso de prueba**.

## La caja de Adviento · versión 4

Abre **editor.html**, recarga con Ctrl + F5 y pulsa **Cargar La caja de Adviento · versión 4**. La primera carga copia el espacio que tengas abierto y sustituye únicamente el día 1; los demás capítulos, sus soluciones y la combinación final se conservan. La versión 4 guarda su borrador y sus pruebas en claves propias. Tus espacios anteriores siguen disponibles.

En el panel **La caja y el habitante**, encima de los 24 días, están **Probar introducción**, **Probar día 1** y **Probar final del día 24**. Las pruebas usan los campos que estás editando. El selector del final permite empezar antes de la combinación, después del acierto o en la confirmación del paquete. Cada vista tiene reinicio; la introducción se reinicia desde el botón del panel y también ofrece Saltar y Volver a abrir la caja. Ninguna de estas pruebas modifica el progreso real de Cintia. El control **Reducir movimiento en las pruebas** permite ensayar la alternativa simplificada; el jugador respeta también la preferencia del sistema.

El día 1 tiene seis posiciones por rueda. Los campos **Estado inicial** y **Posiciones objetivo** se encuentran en **Configuración del juego**; instrucciones y pistas usan sus campos habituales. El editor muestra la distancia mínima calculada mediante búsqueda de los 216 estados. El inicio [3,0,3] y objetivo [0,0,0] requiere seis giros. La llave se entrega únicamente después de accionar el pestillo. La fecha del día 2 sigue siendo obligatoria. Deshacer, reinicio y estado parcial se guardan con el mecanismo.

El final se activa y configura en **La caja y el habitante**. La confirmación del paquete es independiente de la combinación del día 24, que sigue saliendo de su campo actual. Se guardan la etapa, la confirmación y el nombre; el cuaderno y el reto resuelto se conservan. Repetir la escena no borra el nombre ni la confirmación. Los valores de prueba son la pista «Busca el paquete bajo la manta del sofá» y el código «NACIMIENTO». Cámbialos antes de preparar tu versión definitiva.

La caja contiene la misma casa y los mismos elementos de calendario, que se trasladan a su posición final al abrirla. Se ha implementado la variante con la casa montada. Los dibujos de ruedas, caja, huevo y criatura se generan en el código: no necesitan descargas ni recursos externos. **Exportar respaldo** incluye la configuración completa. **Respaldo en texto** ofrece otra forma de copiar e importar ese mismo JSON como espacio independiente. Las fotografías y audios existentes mantienen sus rutas habituales.

Al entregar una copia, incluye también **experiencias.js** y **experiencias.css** junto a los archivos existentes. El editor local continúa excluido de Vercel. Guardar un borrador no publica cambios: prepara calendario-publicado.js cuando quieras instalar tus propios textos.

Verificación de la lógica: ejecuta `node tests/experiencias.test.cjs` desde el repositorio. Contrasta las 216 búsquedas de la cerradura con una distancia calculada de forma independiente, comprueba el pestillo, las fechas, el respaldo y las etapas persistentes del final.

## Cerradura de transmisiones · versión 5

Abre **editor.html**, recarga con **Ctrl + F5** y pulsa **Cargar cerradura de transmisiones · versión 5**. Se conserva el borrador abierto y se crea otro espacio que sustituye solo el día 1. Los demás capítulos, la caja de entrada y el desenlace mantienen su configuración. Las campañas anteriores y los respaldos importados siguen disponibles.

En **La caja y el habitante**, pulsa **Probar día 1**. Dentro de esa vista están **Demostrar solución** y **Avanzar un paso**. La demostración empieza desde el inicio, ejecuta los mismos movimientos del juego y muestra por separado los cambios de transmisión y el pestillo. Puedes detenerla haciendo un movimiento o deshaciendo. Cambiar los datos del mecanismo reinicia automáticamente su vista previa para que no se conserve como resuelta una configuración diferente.

La cerradura tiene cuatro ruedas, numeradas del exterior al interior, con ocho posiciones de 0 a 7. En **Configuración del juego** se editan el inicio, los objetivos y la transmisión inicial. Los campos actualizan la referencia ejecutable y muestran la distancia mínima, junto con el aviso de si basta una transmisión. Si editas directamente el JSON, usa **Recalcular solución de referencia**. El enunciado y las pistas se editan en sus campos habituales; la tercera pista añade una orientación calculada desde la partida actual.

El inicio es **[4,0,0,0]**, con objetivos **[0,0,0,0]** y transmisión **A**. Requiere **16 giros mínimos**. Ni A ni B por sí solas alcanzan el objetivo. Aunque tres ruedas empiezan alineadas, hay que moverlas y volverlas a alinear. La búsqueda del juego cuenta cada giro como uno y el cambio de transmisión como cero. La prueba independiente recorre los **8192 estados** que incluyen las cuatro posiciones y el selector, con una búsqueda 0–1. La solución guardada contiene 16 giros, un cambio de transmisión y la apertura del pestillo.

El estado conserva posiciones, transmisión, vueltas continuas, contador e historial. Deshacer restaura también los cambios de transmisión. El pestillo solo abre si coinciden las cuatro posiciones objetivo; entonces se entrega la llave del día 2, que sigue necesitando su fecha. La partida de Cintia y las pruebas del editor guardan su avance por separado. Los borradores antiguos de tres ruedas siguen siendo compatibles.

Para entregar una copia incluye **cerradura-transmisiones.js** además de los archivos de la versión 4. Los respaldos incluyen la configuración y la solución de referencia. Ejecuta **node tests/cerradura-transmisiones.test.cjs** para verificar la búsqueda independiente, los movimientos, la apertura, la referencia, la exportación y la fecha de la llave.

La cerradura nueva se ha instalado también en el calendario publicado de Vercel, conservando el identificador de partida y los capítulos 2–24. No hace falta preparar ni subir un archivo para ver esta actualización. Una recarga con Ctrl + F5 obtiene los archivos nuevos. Las ediciones posteriores que hagas en tu borrador siguen requiriendo preparar e instalar tu calendario-publicado.js.

## Enlace de prueba online

Abre **prueba.html** en el sitio publicado para jugar con la fecha simulada del **24 de diciembre de 2026**. Usa exactamente **calendario-publicado.js**. El selector permite empezar por cualquier día, otorgando en la simulación las llaves y evidencias anteriores. **Empezar prueba de este día** comienza ese ensayo de nuevo; **Reiniciar prueba completa** vuelve al día 1. La recarga conserva el progreso del ensayo y su desenlace.

El avance se guarda bajo **adviento-prueba-online-…**, separado del progreso real **adviento-escape-2026-…**. La página principal sigue usando la fecha real. El modo simulado requiere estar dentro de un iframe con el parámetro prueba; ambas partes verifican el origen y la ventana que envía los mensajes.

## Publicación de la prueba validada de mejora-movil

La campaña instalada en **calendario-publicado.js** contiene los 24 retos y la configuración del desenlace de la prueba validada en el commit **a52349d** de la PR #14. Se materializó la composición de mecanismos, experiencias y cerradura una sola vez. Tanto **index.html** como **prueba.html** leen ese mismo archivo; la prueba no vuelve a construir ni modifica los retos. El selector solo cambia el acceso, la fecha simulada y su progreso independiente.

Se conserva el identificador real **caja-adviento-v4** para mantener el almacenamiento **adviento-escape-2026-caja-adviento-v4**, incluidos días resueltos, pistas, interacciones, introducción vista y recuerdo del desenlace. No hay que migrar ni borrar la partida. El calendario de Cintia conserva la hora de Madrid, las fechas y la llave del día anterior. La prueba sigue guardando con el prefijo **adviento-prueba-online-**.

Se preservan los mandos compactos, los ajustes móviles y el nacimiento. Las instrucciones y pistas son desplegables mientras el reto está pendiente y se retiran al resolverlo. La entrega de llave aparece una sola vez. **campana-mecanismos.js** se incluye en el despliegue; el editor y las campañas antiguas privadas conservan sus exclusiones.

Ejecuta **node tests/publicacion.test.cjs** para contrastar los 24 retos con la instantánea de validación (solo usada por las pruebas), comprobar la fuente única de campaña, los archivos del despliegue, el progreso compatible, las fechas, las llaves y los mensajes. Las pruebas de la cerradura y las experiencias siguen disponibles en **tests/**.

## La búsqueda del huevo

La historia comparte **calendario-publicado.js** con el calendario real y su prueba. Añade una entrada con el pedestal vacío, contexto dentro de las instrucciones, una transición por día y cuatro notas principales (6, 12, 18 y 24). Las reglas, respuestas, pistas, configuraciones y evidencias anteriores permanecen intactas. La secuencia de pantalla, huevo, criatura, nota y paquete se conserva; la referencia al Tamagotchi aparece después de confirmar el código del paquete.

La introducción de la historia se guarda con **historiaVista**, independiente de la caja ya vista. Las partidas anteriores mantienen la misma clave **caja-adviento-v4**, sus mecanismos, días y desenlace. El cuaderno reconstruye el diario a partir de los días resueltos, también para partidas anteriores; no cambia los identificadores de las evidencias. **Volver a leer la introducción**, en el cuaderno, y **Volver a ver la introducción**, en las herramientas de prueba, no borran ningún avance. «Examinar la casa» cierra la introducción sin abrir retos. Para jugar, pulsa la ventana del día; se conservan sus fechas y llaves.

En el editor local, pulsa **Cargar historia del huevo · campaña actual** para abrir esta campaña en un borrador separado de los anteriores. En **La caja y el habitante → La búsqueda del huevo** puedes editar título, párrafos, botón y revelación final. En **Historia de este día** puedes editar contexto, transición y nota del cuaderno. La transición sustituye al mensaje de acierto cuando está escrita; la evidencia y la llave siguen apareciendo una vez. Los campos vacíos y la historia desactivada por defecto permiten importar respaldos anteriores. Guardar borrador continúa siendo local; preparar la versión incluye todos estos campos.

Verificación: **node tests/historia.test.cjs**, **node tests/publicacion.test.cjs**, **node tests/experiencias.test.cjs** y **node tests/cerradura-transmisiones.test.cjs**. La instantánea anterior se usa para contrastar todos sus campos originales; solo se añaden metadatos narrativos.

## Prueba estética · casa de mecanismos

La capa **acabado.css**, cargada después de las hojas existentes, unifica abeto, nogal, latón e iluminación ámbar. Conserva la arquitectura y las 24 ventanas; las marcas de estado complementan los colores. No introduce imágenes externas ni animación ambiental continua. Incluye esta hoja al entregar una copia local del calendario o del editor.

La entrada utiliza la misma casa interactiva dentro de la caja. El cierre se libera, la tapa gira sobre el borde de las bisagras y el interior se ilumina durante 1,8 segundos. Un acercamiento de 0,7 segundos devuelve ese mismo elemento a su posición en el calendario; después continúa la historia existente. Solo se animan transformaciones y opacidad. La entrada guarda su inicio: recargar durante el movimiento lleva a la casa y a la historia pendiente. Si se oculta la página durante la secuencia, esta termina de inmediato. Saltar y movimiento reducido usan el mismo punto de llegada. La apertura no altera días, llaves ni progreso del juego.

En **prueba.html → Prueba · Cambiar día**, **Momento de la apertura** permite reproducirla o verla detenida al inicio, con el cierre liberado, durante el giro y con el interior abierto. **Movimiento reducido** permite revisar esa variante. Estas herramientas usan la entrada real y conservan el avance de los retos. Tocar el cierre desde una imagen en pausa reproduce la apertura completa.

Revisión en navegador: 375, 390 y 440 píxeles, más escritorio a 1440; caja y tapa sin recortes, sin desplazamiento horizontal y 24 ventanas con áreas táctiles de al menos 44 × 48. Se comprobó la apertura completa, primera visita, recarga durante el giro, visitas posteriores, movimiento reducido, los estados de ventana, el cuaderno y la resolución del cuadro eléctrico con una única entrega de llave. Las cuatro pruebas existentes siguen contrastando la campaña, la historia, las fechas y las mecánicas.


## Icono y nombre de la app instalada

**index.html** enlaza **manifest.webmanifest** y usa **fotos/icono-192.png** como apple-touch-icon. Tanto name como short_name y apple-mobile-web-app-title son **Adviento**. El modo instalado es standalone, con inicio, ámbito e identificador en **/**: abre el calendario real, sin parámetros de simulación. El título del documento y el título visible del calendario se conservan, al igual que las claves del progreso. No se añade caché sin conexión.

Se reutilizan los dos PNG aportados. Los originales subidos tenían ambos 1254 × 1254 píxeles; se han reducido, sin cambiar el diseño, a **192 × 192** y **512 × 512**, coincidiendo con el manifiesto.

Para comprobar la instalación en un iPhone real: abre el calendario en Safari, pulsa **Compartir → Añadir a pantalla de inicio**, confirma que el icono es el cierre dorado y el nombre **Adviento**, y comprueba que al tocarlo se abre el calendario real. Esta verificación física en iPhone queda pendiente; la comprobación de archivos y metadatos del despliegue no la sustituye.
