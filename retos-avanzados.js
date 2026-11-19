!function () {
  'use strict';
  const ER = window.EscapeRoom;
  const tipos = ['anagrama','recorrido','ahorcado','ascensor','registro','nonograma','maquina','perforado','fragmentos'];
  const letras = texto => texto.normalize('NFD').replace(/\p{M}/gu, '').toUpperCase();
  const compactar = texto => letras(String(texto)).replace(/\s+/g, '');
  const configuracion = reto => JSON.parse(reto.configuracion);
  const esEspecial = tipo => tipos.includes(tipo);
  const lineas = filas => filas.map(fila => fila.trim().split(/\s+/));

  function grupos(fila) {
    return fila.join('').split(/0+/).filter(Boolean).map(grupo => grupo.length);
  }

  function pistasNonograma(filas) {
    const matriz = filas.map(fila => [...fila].map(Number));
    return {
      filas: matriz.map(grupos),
      columnas: matriz[0].map((_,x) => grupos(matriz.map(fila => fila[x])))
    };
  }

  function errores(reto) {
    let c;
    try { c = configuracion(reto); } catch { return ['revisa el JSON de configuración de la prueba']; }
    if (!c || typeof c !== 'object' || Array.isArray(c)) return ['la configuración debe ser un objeto'];
    const fallos = [];
    const matriz = (filas, binaria = false) => Array.isArray(filas) && filas.length >= 2 && filas.length <= 12
      && filas.every(fila => typeof fila === 'string' && (binaria ? /^[01]{2,12}$/.test(fila) : fila.trim()))
      && new Set(filas.map(fila => binaria ? fila.length : fila.trim().split(/\s+/).length)).size === 1;
    if (reto.tipo === 'anagrama' && (!Array.isArray(c.fichas) || c.fichas.length < 2 || c.fichas.length > 30
        || c.fichas.some(ficha => typeof ficha !== 'string' || [...ficha].length !== 1)
        || !reto.respuestas.some(r => compactar(r).split('').sort().join('') === c.fichas.map(letras).sort().join('')))) {
      fallos.push('las fichas deben formar una de las respuestas válidas');
    }
    if (reto.tipo === 'ahorcado' && (typeof c.palabra !== 'string' || !/^[A-ZÑ]+$/.test(letras(c.palabra))
        || !Number.isInteger(c.fallos) || c.fallos < 1 || c.fallos > 20
        || !Number.isInteger(c.inicial) || c.inicial < 0 || c.inicial >= c.palabra.length)) {
      fallos.push('configura una palabra, de 1 a 20 fallos y el índice de la posición inicial revelada (desde 0)');
    }
    if (['recorrido','perforado'].includes(reto.tipo) && !matriz(c.filas)) {
      fallos.push('configura filas de cuadrícula rectangulares, entre 2 y 12');
    }
    if (reto.tipo === 'recorrido' && matriz(c.filas)) {
      const filas = lineas(c.filas);
      if (!Array.isArray(c.inicio) || c.inicio.length !== 2 || !c.inicio.every(Number.isInteger)
          || c.inicio[0] < 1 || c.inicio[0] > filas.length || c.inicio[1] < 1 || c.inicio[1] > filas[0].length
          || !Array.isArray(c.movimientos) || c.movimientos.some(m => !Array.isArray(m)
            || !['Norte','Sur','Este','Oeste'].includes(m[0]) || !Number.isInteger(m[1]) || m[1] < 1)) {
        fallos.push('revisa la salida y los movimientos del recorrido');
      }
    }
    if (reto.tipo === 'perforado' && (!matriz(c.agujeros,true)
        || c.agujeros.length !== c.filas?.length
        || c.agujeros[0]?.length !== c.filas?.[0]?.trim().split(/\s+/).length)) {
      fallos.push('la plantilla binaria debe tener las mismas dimensiones que la cuadrícula');
    }
    if (reto.tipo === 'nonograma' && !matriz(c.solucion,true)) fallos.push('usa una solución rectangular de ceros y unos, de 2 a 12 casillas por lado');
    if (reto.tipo === 'ascensor' && (typeof c.inicio !== 'string' || !/^\d{2}$/.test(c.inicio)
        || !Array.isArray(c.ordenes) || !c.ordenes.length || c.ordenes.length > 30
        || c.ordenes.some(orden => typeof orden !== 'string' || !orden.trim()))) {
      fallos.push('configura un piso inicial de dos cifras y una lista de órdenes');
    }
    if (['registro','maquina'].includes(reto.tipo) && (!Array.isArray(c.fases) || c.fases.length !== 4
        || c.fases.some(fase => !['Nueva','Creciente','Llena','Menguante'].includes(fase))
        || new Set(c.fases).size !== 4 || !Array.isArray(c.valores) || c.valores.length !== 4
        || c.valores.some(v => !Number.isInteger(v) || v < 1 || v > 9))) {
      fallos.push('configura las cuatro fases y sus cuatro valores del 1 al 9');
    }
    if (reto.tipo === 'maquina' && (!Number.isInteger(c.salida) || !Number.isInteger(c.resultado))) {
      fallos.push('configura la salida de la máquina y la suma de sus cifras');
    }
    if (reto.tipo === 'maquina' && Array.isArray(c.valores) && c.valores.length === 4) {
      const calculada = c.valores[2]*c.valores[3]-(c.valores[0]+c.valores[1]);
      const suma = [...String(c.salida)].reduce((total,cifra)=>total+Number(cifra),0);
      if (calculada !== c.salida || c.resultado !== suma) {
        fallos.push('la salida y su suma deben corresponder a los valores de las cuatro ruedas');
      }
    }
    if (reto.tipo === 'fragmentos' && (!Number.isFinite(c.duracion) || c.duracion < 100 || c.duracion > 30000
        || !Number.isFinite(c.pausa) || c.pausa < 100 || c.pausa > 10000
        || !Array.isArray(c.fotogramas) || !c.fotogramas.length || c.fotogramas.length > 60
        || c.fotogramas.some(f => !f || !['I','II','III'].includes(f.marca)
          || !['ámbar','azul','verde'].includes(f.color) || typeof f.segmentos !== 'string'
          || !/^[a-g]+$/.test(f.segmentos)))) {
      fallos.push('revisa los fotogramas, duración y pausa del visor');
    }
    if (!['ahorcado','nonograma','registro','maquina'].includes(reto.tipo) && !reto.respuestas.some(r=>r.trim())) {
      fallos.push('añade la respuesta válida de la prueba');
    }
    return fallos;
  }

  function estadoAhorcado(c, usadas) {
    const palabra = letras(c.palabra);
    const elegidas = [...new Set(usadas.filter(l => /^[A-ZÑ]$/.test(l)))];
    const fallos = elegidas.filter(l => !palabra.includes(l)).length;
    const descubiertas = [...palabra].map((l,i) => i === c.inicial || elegidas.includes(l));
    return { elegidas, fallos, descubiertas, ganada: descubiertas.every(Boolean), perdida: fallos >= c.fallos };
  }

  function acertada(reto, respuesta) {
    if (errores(reto).length) return false;
    const c = configuracion(reto);
    if (reto.tipo === 'ahorcado') {
      const estado = estadoAhorcado(c, Array.isArray(respuesta) ? respuesta : []);
      return estado.ganada && !estado.perdida;
    }
    if (reto.tipo === 'nonograma') {
      return Array.isArray(respuesta) && respuesta.length === c.solucion.length
        && c.solucion.every((fila,y) => Array.isArray(respuesta[y]) && respuesta[y].length === fila.length
          && [...fila].every((valor,x) => (respuesta[y][x] === 1) === (valor === '1')));
    }
    if (reto.tipo === 'registro') {
      return Array.isArray(respuesta) && respuesta.length === 4 && c.valores.every((v,i) => String(v) === respuesta[i]);
    }
    if (reto.tipo === 'maquina') {
      return respuesta && Array.isArray(respuesta.ruedas)
        && c.valores.every((v,i) => String(v) === respuesta.ruedas[i])
        && String(c.salida) === respuesta.salida && String(c.resultado) === respuesta.resultado;
    }
    return reto.respuestas.some(solucion => compactar(solucion) === compactar(respuesta));
  }

  function el(tag, texto = '', clase = '') {
    const nodo = document.createElement(tag);
    nodo.textContent = texto;
    nodo.className = clase;
    return nodo;
  }

  function boton(texto, accion) {
    const b = el('button',texto,'control-reto');
    b.type = 'button';
    b.addEventListener('click',accion);
    return b;
  }

  function entrada(padre, nombre, valor = '', guardar = () => {}, max = null) {
    const etiqueta = el('label',nombre);
    const campo = el('input');
    campo.type = 'text';
    campo.value = String(valor);
    campo.autocomplete = 'off';
    campo.spellcheck = false;
    if (max) campo.maxLength = max;
    campo.addEventListener('input',() => guardar(campo.value));
    etiqueta.append(campo);
    padre.append(etiqueta);
    return campo;
  }

  function matriz(padre, filas, accion, clase = '') {
    const scroll = el('div','','tablero-scroll');
    scroll.tabIndex = 0;
    scroll.setAttribute('role','region');
    scroll.setAttribute('aria-label','Tablero. Desplaza horizontalmente para ver todas las columnas.');
    const tabla = el('div','', 'tablero-grande ' + clase);
    tabla.style.setProperty('--columnas',filas[0].length);
    for (const [y,fila] of filas.entries()) {
      for (const [x,valor] of fila.entries()) {
        const celda = accion ? boton(valor,() => accion(y,x,celda)) : el('span',valor);
        celda.classList.add('casilla-grande');
        celda.dataset.fila = y;
        celda.dataset.columna = x;
        celda.setAttribute('aria-label',`Fila ${y+1}, columna ${x+1}${valor ? ', '+valor : ''}`);
        tabla.append(celda);
      }
    }
    scroll.append(tabla);
    padre.append(scroll);
    return tabla;
  }

  function mostrar(padre,reto,opciones) {
    const c = configuracion(reto);
    const estado = opciones.interaccion && typeof opciones.interaccion === 'object'
      ? structuredClone(opciones.interaccion) : {};
    const guardar = () => opciones.guardarInteraccion?.(structuredClone(estado));
    const bloque = el('section','','juego-especial juego-' + reto.tipo);
    padre.append(bloque);
    let limpiar = () => {};
    let ayuda = null;
    let respuesta;
    const responder = (valor = estado.respuesta ?? '') => {
      const campo = entrada(bloque,reto.tipo === 'fragmentos' ? 'Código I, II, III' : 'Tu respuesta',valor,v => {
        estado.respuesta = v; guardar();
      });
      respuesta = () => campo.value;
      return campo;
    };

    if (reto.tipo === 'anagrama') {
      const campo = responder();
      const fichas = el('div','','fichas-anagrama');
      const huecos = el('div','','huecos-anagrama');
      const colocadas = Array.isArray(estado.colocadas) ? [...new Set(estado.colocadas.filter(id => Number.isInteger(id) && id >= 0 && id < c.fichas.length))] : [];
      function dibujar() {
        const botones = c.fichas.map((letra,id) => {
          const b = boton(letra,() => {
            colocadas.push(id); actualizar();
            huecos.lastElementChild.focus();
          });
          b.disabled = colocadas.includes(id);
          b.dataset.ficha = id;
          b.setAttribute('aria-label',`Ficha ${id+1}, letra ${letra}`);
          return b;
        });
        fichas.replaceChildren(...botones);
        huecos.replaceChildren(...c.fichas.map((_,i) => {
          const id = colocadas[i];
          const b = boton(id === undefined ? '·' : c.fichas[id],() => {
            if (id === undefined) return;
            colocadas.splice(i,1); actualizar();
            fichas.children[id].focus();
          });
          b.disabled = id === undefined;
          b.setAttribute('aria-label',`Posición ${i+1}${id === undefined ? ', vacía' : ', '+c.fichas[id]+', quitar ficha'}`);
          return b;
        }));
      }
      function actualizar() {
        estado.colocadas = [...colocadas];
        campo.value = colocadas.map(id=>c.fichas[id]).join('');
        estado.respuesta = campo.value;
        guardar(); dibujar();
      }
      campo.addEventListener('input',() => {
        colocadas.length = 0; estado.colocadas = []; guardar(); dibujar();
      });
      bloque.prepend(el('p','Toca las fichas para colocarlas. Toca una ficha colocada para retirarla.'),huecos,fichas);
      dibujar();
    } else if (reto.tipo === 'ahorcado') {
      let usadas = Array.isArray(estado.usadas) ? estado.usadas : [];
      const palabra = el('div','','palabra-ahorcado');
      const luces = el('div','','luces-ahorcado');
      const cuenta = el('p');
      cuenta.setAttribute('role','status');
      const teclado = el('div','','teclado-letras');
      const usadasTexto = el('p');
      const reinicio = boton('Reiniciar reto',() => {usadas=[];actualizar();});
      function actualizar() {
        const a = estadoAhorcado(c,usadas);
        usadas = a.elegidas;
        palabra.replaceChildren(...[...letras(c.palabra)].map((l,i) => el('span',a.descubiertas[i] ? l : '·')));
        luces.replaceChildren(...Array.from({length:c.fallos},(_,i)=>el('span',i<a.fallos ? '○' : '●')));
        cuenta.textContent = a.perdida ? 'Sin intentos. Puedes reiniciar el reto.' : a.ganada ? 'Palabra completa. Pulsa Comprobar.' : `${c.fallos-a.fallos} fallos disponibles`;
        usadasTexto.textContent = 'Letras utilizadas: ' + (usadas.join(' · ') || 'ninguna');
        teclado.replaceChildren(...[...'ABCDEFGHIJKLMNÑOPQRSTUVWXYZ'].map(letra => {
          const b = boton(letra,() => {
            if (usadas.includes(letra)) return;
            usadas.push(letra); actualizar();
            const siguiente = teclado.querySelector('button:enabled');
            if (siguiente) siguiente.focus({preventScroll:true});
            else if (!reinicio.hidden) reinicio.focus({preventScroll:true});
            else cuenta.focus({preventScroll:true});
          });
          b.disabled = a.perdida || a.ganada || usadas.includes(letra);
          return b;
        }));
        reinicio.hidden = !a.perdida;
        estado.usadas = [...usadas]; guardar();
      }
      bloque.append(palabra,luces,cuenta,teclado,usadasTexto,reinicio);
      cuenta.tabIndex = -1;
      actualizar();
      respuesta = () => usadas;
    } else if (reto.tipo === 'ascensor') {
      const dibujo = ER.recursos.svg('ascensor');
      const visor = el('output',c.inicio,'visor-ascensor');
      const libreta = el('ol','','libreta-ascensor');
      const anotaciones = Array.isArray(estado.notas) ? estado.notas : [];
      c.ordenes.forEach((orden,i) => {
        const item = el('li');
        item.append(el('p',orden));
        const campo = entrada(item,`Piso tras la orden ${i+1}`,anotaciones[i] ?? '',valor => {
          anotaciones[i] = valor; estado.notas = anotaciones;
          visor.value = valor || c.inicio; guardar();
        },2);
        campo.inputMode = 'numeric';
        libreta.append(item);
      });
      const notas = el('label','Mis cálculos');
      const texto = el('textarea');
      texto.rows = 4;
      texto.value = typeof estado.calculos === 'string' ? estado.calculos : '';
      texto.addEventListener('input',() => {estado.calculos=texto.value;guardar();});
      notas.append(texto);
      bloque.append(dibujo,visor,libreta,notas);
      responder();
    } else if (['registro','maquina'].includes(reto.tipo)) {
      if (reto.tipo === 'maquina') {
        const expresion = el('div','','expresion-lunar');
        for (const parte of ['(', 'Llena', '×', 'Menguante', ') − (', 'Nueva', '+', 'Creciente', ')']) {
          const fase = c.fases.includes(parte) ? ER.recursos.dibujar('luna',parte) : el('span',parte);
          expresion.append(fase);
        }
        bloque.append(expresion);
      }
      const ruedas = el('div','','ruedas-lunares');
      const valores = Array.isArray(estado.ruedas) ? estado.ruedas : [];
      const campos = c.fases.map((fase,i) => {
        const rueda = el('div');
        rueda.append(ER.recursos.dibujar('luna',fase));
        const etiqueta = el('label',fase);
        const select = el('select');
        select.append(new Option('—',''),...Array.from({length:9},(_,n)=>new Option(String(n+1),String(n+1))));
        select.value = String(valores[i] ?? '');
        select.addEventListener('change',() => {
          estado.ruedas = campos.map(campo=>campo.value); guardar();
        });
        etiqueta.append(select);rueda.append(etiqueta);ruedas.append(rueda);
        return select;
      });
      bloque.append(ruedas);
      if (reto.tipo === 'maquina') {
        const salida = entrada(bloque,'Salida de la máquina',estado.salida ?? '',valor=>{estado.salida=valor;guardar();});
        const resultado = entrada(bloque,'Suma de sus dos cifras',estado.resultado ?? '',valor=>{estado.resultado=valor;guardar();});
        respuesta = () => ({ruedas:campos.map(campo=>campo.value),salida:salida.value,resultado:resultado.value});
      } else respuesta = () => campos.map(campo=>campo.value);
    } else if (reto.tipo === 'nonograma') {
      const filas = c.solucion.length;
      const columnas = c.solucion[0].length;
      const marcas = Array.from({length:filas},(_,y)=>Array.from({length:columnas},(_,x)=>
        [0,1,2].includes(estado.marcas?.[y]?.[x]) ? estado.marcas[y][x] : 0));
      const ayudaReglas = el('details');
      ayudaReglas.append(el('summary','Cómo jugar al nonograma'),el('p','Los números indican grupos de casillas pintadas consecutivas. Entre grupos deja al menos una casilla vacía. Cada toque cambia entre vacía, pintada y descartada. Las casillas descartadas cuentan como vacías.'));
      bloque.append(ayudaReglas);
      const pistas = pistasNonograma(c.solucion);
      const tablero = [];
      tablero.push(['',...pistas.columnas.map(p=>p.join(' ') || '0')]);
      for(let y=0;y<filas;y++) tablero.push([pistas.filas[y].join(' ') || '0',...Array(columnas).fill('')]);
      const tabla = matriz(bloque,tablero,(y,x,b) => {
        if (!y || !x) return;
        marcas[y-1][x-1] = (marcas[y-1][x-1]+1)%3;
        actualizar(b,y-1,x-1);
        estado.marcas=marcas;guardar();
      },'nonograma');
      function actualizar(b,y,x) {
        const marca=marcas[y][x];
        b.textContent=['','■','×'][marca];
        b.dataset.marca=marca;
        b.setAttribute('aria-label',`Fila ${y+1}, columna ${x+1}, ${['vacía','pintada','descartada'][marca]}`);
      }
      for(const b of tabla.children){
        const y=Number(b.dataset.fila),x=Number(b.dataset.columna);
        if (!y || !x) {b.disabled=true;b.classList.add('pista-nonograma');}
        else actualizar(b,y-1,x-1);
      }
      respuesta=()=>marcas;
    } else if (reto.tipo === 'recorrido') {
      const itinerario = el('ol','','itinerario');
      c.movimientos.forEach(([direccion,pasos])=>itinerario.append(el('li',`${direccion}, ${pasos} ${pasos===1 ? 'casilla' : 'casillas'}.`)));
      bloque.append(itinerario,el('p','Puedes marcar las casillas donde terminas. Desliza el tablero para ver las ocho columnas.'));
      const campo=responder();
      const marcadas=Array.isArray(estado.marcadas) ? estado.marcadas.filter(p=>Number.isInteger(p)&&p>=0&&p<144) : [];
      const filas=lineas(c.filas);
      const tabla=matriz(bloque,filas,(y,x,b)=>{
        const id=y*filas[0].length+x;
        const posicion=marcadas.indexOf(id);
        if(posicion>=0) marcadas.splice(posicion,1); else marcadas.push(id);
        estado.marcadas=marcadas;
        campo.value=marcadas.map(id=>filas[Math.floor(id/filas[0].length)][id%filas[0].length]).join('');
        estado.respuesta=campo.value; guardar(); actualizar();
      });
      function actualizar(){
        for(const b of tabla.children){
          const id=Number(b.dataset.fila)*filas[0].length+Number(b.dataset.columna);
          b.setAttribute('aria-pressed',String(marcadas.includes(id)));
        }
      }
      actualizar();
    } else if (reto.tipo === 'perforado') {
      const filas=lineas(c.filas);
      const selector=el('div','','selector-piezas');
      const piezas=el('div','','piezas-perforado');
      const letrasPieza=el('section');
      letrasPieza.append(el('p','↑ ARRIBA · Cuadrícula'));
      const tabla=matriz(letrasPieza,filas);
      const plantilla=el('section');
      plantilla.append(el('p','↑ ARRIBA · Plantilla'));
      const agujeros=c.agujeros.map(fila=>[...fila].map(v=>v==='1' ? '○' : ''));
      const mascara=matriz(plantilla,agujeros,null,'papel-perforado');
      for(const celda of mascara.children) {
        const hueco=c.agujeros[celda.dataset.fila][celda.dataset.columna]==='1';
        celda.dataset.agujero=String(hueco);
        celda.setAttribute('aria-label',`Fila ${Number(celda.dataset.fila)+1}, columna ${Number(celda.dataset.columna)+1}, ${hueco ? 'agujero' : 'papel'}`);
      }
      piezas.append(letrasPieza,plantilla);
      for(const modo of ['Cuadrícula','Plantilla','Juntas']){
        const b=boton(modo,()=>cambiar(modo));
        selector.append(b);
      }
      function cambiar(modo){
        letrasPieza.hidden=modo==='Plantilla';plantilla.hidden=modo==='Cuadrícula';
        piezas.classList.toggle('juntas',modo==='Juntas');
        for(const b of selector.children)b.setAttribute('aria-pressed',String(b.textContent===modo));
      }
      bloque.append(selector,piezas);
      cambiar('Cuadrícula');
      responder();
      ayuda = () => {
        const b=boton('Superponer la plantilla',()=>{
          const puesta=b.getAttribute('aria-pressed')!=='true';
          b.setAttribute('aria-pressed',String(puesta));
          for(const celda of tabla.children){
            const tapada=puesta&&c.agujeros[celda.dataset.fila][celda.dataset.columna]!=='1';
            celda.classList.toggle('tapada',tapada);
            celda.setAttribute('aria-hidden',String(tapada));
          }
          cambiar('Cuadrícula');
        });
        b.setAttribute('aria-pressed','false');
        return b;
      };
    } else if(reto.tipo==='fragmentos'){
      const tramos={a:'M18 10h28',b:'M48 13v18',c:'M48 36v18',d:'M18 57h28',e:'M15 36v18',f:'M15 13v18',g:'M18 33h28'};
      const pantalla=el('div','','visor-fragmentos');
      pantalla.setAttribute('aria-live','off');
      const marca=el('p','Visor apagado');
      let timer, paso=-1, enMarcha=false;
      function dibujar(f){
        const svg=document.createElementNS('http://www.w3.org/2000/svg','svg');
        svg.setAttribute('viewBox','0 0 64 68');
        svg.setAttribute('aria-hidden','true');
        svg.classList.add('segmentos-reto');
        for(const [id,d] of Object.entries(tramos)){
          const path=document.createElementNS(svg.namespaceURI,'path');
          path.setAttribute('d',d);
          if(f?.segmentos.includes(id))path.classList.add('encendido');
          svg.append(path);
        }
        pantalla.dataset.color=f?.color ?? '';
        pantalla.replaceChildren(svg);
        marca.textContent=f ? `${f.marca} · ${f.color} · fotograma ${paso+1} de ${c.fotogramas.length}` : 'Separación';
      }
      function detener(){
        clearTimeout(timer);enMarcha=false;
        reproducir.textContent='Ver secuencia completa';
      }
      function ciclo(){
        if(!bloque.isConnected || document.hidden){detener();return;}
        paso++;
        if(paso>=c.fotogramas.length){detener();dibujar(null);return;}
        dibujar(c.fotogramas[paso]);
        timer=setTimeout(()=>{
          dibujar(null);
          timer=setTimeout(ciclo,c.pausa);
        },c.duracion);
      }
      const reproducir=boton('Ver secuencia completa',()=>{
        if(enMarcha){detener();return;}
        paso=-1;enMarcha=true;reproducir.textContent='Detener secuencia';ciclo();
      });
      const visibilidad=()=>{if(document.hidden)detener();};
      document.addEventListener('visibilitychange',visibilidad);
      limpiar=()=>{detener();document.removeEventListener('visibilitychange',visibilidad);};
      bloque.append(pantalla,marca,reproducir);
      dibujar(null);
      responder();
      ayuda=()=>{
        const grupo=el('div','','ayuda-fotogramas');
        const aviso=el('p','Navegación manual de ayuda. Cada paso sustituye al anterior.');
        const atras=boton('Anterior',()=>manual(-1));
        const adelante=boton('Siguiente',()=>manual(1));
        function manual(delta){
          detener();
          paso=(paso+delta+c.fotogramas.length)%c.fotogramas.length;
          dibujar(c.fotogramas[paso]);
          aviso.textContent=marca.textContent+', segmentos '+c.fotogramas[paso].segmentos.split('').join(', ');
        }
        aviso.setAttribute('role','status');
        grupo.append(aviso,atras,adelante);
        return grupo;
      };
    }
    return { obtener:respuesta, ayuda, limpiar };
  }

  ER.especiales={esEspecial,configuracion,errores,acertada,mostrar,estadoAhorcado,pistasNonograma};
}();
