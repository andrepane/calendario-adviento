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
3. Sustituye `calendario-publicado.js` en la copia que quieras entregar. Si la entregas para jugar en local, incluye `index.html`, `estilos.css`, `app.js`, `escape-room.js`, `vista-reto.js`, `calendario-publicado.js`, `fuentes/` y los medios referenciados. Abre `index.html` en esa carpeta para comprobar la versión. El calendario usa la fecha real de Madrid y guarda el avance por separado del editor y de la demo.

El proyecto de Vercel es estático. El editor se habilita solo en local y `.vercelignore` indica a Vercel que excluya sus archivos. Los cambios en borradores nunca modifican el sitio por sí solos. En Vercel o GitHub Pages, las soluciones y los medios de la versión publicada se pueden consultar directamente en los archivos públicos. Mantén la demo ficticia en el sitio público y guarda el respaldo JSON y la versión real fuera del repositorio público si quieres reservar las sorpresas.
