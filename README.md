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
