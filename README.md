# Diciembre para Cintia

Abre **index.html** en el navegador y pulsa **Abrir el sobre**. La demo deja explorar las 24 puertas y utiliza contenido ficticio. Para publicar en GitHub Pages, sirve la carpeta raíz del repositorio. La página, las fotos y las fuentes usan rutas relativas.

## Editar las sorpresas

Edita el objeto `sorpresas` al principio de `app.js`. Cada clave es el número de la puerta. Usa `titulo` y `texto` para escribir el mensaje y añade los campos opcionales que necesites.

| Campos | Uso |
| --- | --- |
| `foto`, `descripcionFoto` | Ruta de una foto y su texto alternativo. |
| `fotos` | Lista de fotos, cada una con `src` y `alt`. |
| `audio`, `video` | Rutas de los archivos multimedia. Los controles permiten iniciar la reproducción. |
| `enlace`, `textoEnlace` | Destino y texto del enlace. |
| `respuesta` | Texto que se revela al pulsar «Ver respuesta». |
| `pista` | Nota destacada al final de la tarjeta. |

La puerta 24 muestra un ejemplo con carta, galería y pista. Guarda los archivos propios en una subcarpeta y referencia rutas como `./fotos/mi-foto.jpg`. Las fotos de muestra fueron generadas para la demo.

## Activar el calendario real

1. Sustituye el contenido ficticio por las sorpresas que quieras regalar.
2. Cambia `MODO_DEMO` a `false` al principio de `app.js`.
3. Abre la página o vuelve a publicarla. Cada puerta se habilita a medianoche de su día, del 1 al 24 de diciembre de 2026, según la zona horaria `Europe/Madrid`. Las puertas habilitadas se pueden visitar también después de Navidad.

El progreso se guarda en el navegador. Cada modo usa su propia clave de `localStorage`. En GitHub Pages el bloqueo por fecha funciona en la interfaz. Los archivos publicados siguen siendo accesibles mediante sus URLs directas.
