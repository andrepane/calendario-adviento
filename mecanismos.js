!function () {
  'use strict';
  const ER = window.EscapeRoom;
  const tipos = ['tuberias','mantenimiento','diagnostico','anillos','engranajes','vitral'];
  const digitos = ['abcdef','bc','abdeg','abcdg','bcfg','acdfg','acdefg','abc','abcdefg','abcdfg'];
  const mod = (n,m) => ((n%m)+m)%m;
  const igual = (a,b) => JSON.stringify(a)===JSON.stringify(b);

  function flujo(c, giros) {
    const puertos = c.piezas.map((p,i)=>p.puertos.map(d=>mod(d+(giros[i]??p.giro??0),4)));
    const mojadas = new Set();
    const pendientes = puertos[c.entrada]?.includes(3) ? [c.entrada] : [];
    while (pendientes.length) {
      const id = pendientes.shift();
      if (mojadas.has(id)) continue;
      mojadas.add(id);
      const y=Math.floor(id/c.lado),x=id%c.lado;
      for (const d of puertos[id]) {
        const [dy,dx]=[[-1,0],[0,1],[1,0],[0,-1]][d];
        const ny=y+dy,nx=x+dx;
        if (ny<0||ny>=c.lado||nx<0||nx>=c.lado) continue;
        const vecino=ny*c.lado+nx;
        if (puertos[vecino].includes(mod(d+2,4))) pendientes.push(vecino);
      }
    }
    return {mojadas:[...mojadas], completa:mojadas.has(c.caldera)&&puertos[c.caldera].includes(1)
      &&c.valvulas.every(v=>mojadas.has(v))&&!mojadas.has(c.rota)};
  }

  function moverAscensor(c,piso,boton) {
    const b=c.botones[boton];
    if (!b) return null;
    const destino=piso+b.desplaza;
    return destino<c.minimo||destino>c.maximo||c.bloqueadas.includes(destino) ? null : destino;
  }

  function rutaAscensor(c) {
    const cola=[{piso:c.inicio,ruta:[]}], vistos=new Set([c.inicio]);
    while(cola.length){
      const {piso,ruta}=cola.shift();
      if(piso===c.destino)return ruta;
      if(ruta.length>=c.limite)continue;
      for(let b=0;b<c.botones.length;b++){
        const n=moverAscensor(c,piso,b);
        if(n===null||vistos.has(n))continue;
        vistos.add(n);cola.push({piso:n,ruta:[...ruta,b]});
      }
    }
    return null;
  }

  function candidatasVisor(v) {
    const visibles=new Set(v.visibles);
    return digitos.flatMap((segmentos,n)=>{
      const quedan=[...segmentos].filter(s=>!v.averiados.includes(s));
      return quedan.length===visibles.size&&quedan.every(s=>visibles.has(s)) ? [n] : [];
    });
  }


  const topologiasAnillos=new WeakMap();

  function topologiaAnillos(c) {
    if(topologiasAnillos.has(c))return topologiasAnillos.get(c);
    const sectores=c.sectores,cantidad=c.anillos.length;
    const pasillos=c.anillos.map(anillo=>{
      const vecinos=Array.from({length:sectores},()=>[]);
      for(const [a,b]of anillo.pasillos){
        if(!vecinos[a].includes(b))vecinos[a].push(b);
        if(!vecinos[b].includes(a))vecinos[b].push(a);
      }
      return vecinos;
    });
    const puertas=Array.from({length:cantidad+1},(_,i)=>({
      id:'puerta-'+i,
      afuera:i===0?{anillo:-1,sector:c.entrada}:{anillo:i-1,sector:c.anillos[i-1].salida},
      dentro:i===cantidad?{anillo:cantidad,sector:0}:{anillo:i,sector:c.anillos[i].entrada}
    }));
    const t={sectores,cantidad,pasillos,puertas};
    topologiasAnillos.set(c,t);return t;
  }

  function puertaAnillos(c,giros,puerta) {
    const cantidad=c.anillos.length;
    const angulo=p=>mod(p.sector+(p.anillo>=0&&p.anillo<cantidad?giros[p.anillo]:0),c.sectores);
    const exterior=angulo(puerta.afuera);
    const interior=puerta.dentro.anillo===cantidad?exterior:angulo(puerta.dentro);
    return {...puerta,exterior,interior,abierta:exterior===interior};
  }

  function pasoAnillos(c,giros,bola,tipo,paso=0) {
    const t=topologiaAnillos(c);
    if(tipo==='andar'){
      if(bola.anillo<0||bola.anillo>=t.cantidad)return null;
      const sector=mod(bola.sector+paso,t.sectores);
      return t.pasillos[bola.anillo][bola.sector].includes(sector)?{anillo:bola.anillo,sector}:null;
    }
    const i=tipo==='entrar'?bola.anillo+1:tipo==='salir'?bola.anillo:-1;
    const puerta=t.puertas[i];
    if(!puerta)return null;
    const origen=tipo==='entrar'?puerta.afuera:puerta.dentro;
    if(origen.anillo!==bola.anillo||origen.sector!==bola.sector)return null;
    if(!puertaAnillos(c,giros,puerta).abierta)return null;
    return {...(tipo==='entrar'?puerta.dentro:puerta.afuera)};
  }

  function redAnillos(c,s) {
    const t=topologiaAnillos(c);
    return {
      ...t,
      puertas:t.puertas.map(p=>puertaAnillos(c,s.giros,p)),
      radios:c.anillos.map((_,i)=>165-i*40),
      limites:Array.from({length:t.cantidad+1},(_,i)=>185-i*40),
      centro:200,anchura:18,radioBola:6
    };
  }

  function moverAnillos(c,s,accion) {
    if(accion.tipo==='girar'){
      const i=accion.anillo;
      if(!Number.isInteger(i)||i<0||i>=c.anillos.length||![-1,1].includes(accion.paso))return null;
      const siguiente=structuredClone(s);
      siguiente.rotaciones=[...(s.rotaciones??s.giros)];
      siguiente.rotaciones[i]+=accion.paso;
      siguiente.giros[i]=mod(s.giros[i]+accion.paso,c.sectores);
      return siguiente;
    }
    if(accion.tipo==='andar'&&![-1,1].includes(accion.paso))return null;
    const bola=pasoAnillos(c,s.giros,s.bola,accion.tipo,accion.paso);
    return bola?{...structuredClone(s),bola}:null;
  }

  function claveAnillos(c,s) {
    return s.giros.map(g=>mod(g,c.sectores)).join(',')+'|'+s.bola.anillo+','+s.bola.sector;
  }

  function buscarAnillos(c,origen,{auditar=false}={}) {
    const n=c.sectores,k=c.anillos.length;
    const posiciones=k*n+2,rotaciones=n**k,total=posiciones*rotaciones;
    if(total>1500000)throw new Error('El laberinto supera el tamaño de búsqueda admitido.');
    const potencias=Array.from({length:k},(_,i)=>n**i);
    const codificarBola=b=>b.anillo<0?0:b.anillo===k?posiciones-1:1+b.anillo*n+b.sector;
    const codificarGiros=giros=>giros.reduce((codigo,g,i)=>codigo+mod(g,n)*potencias[i],0);
    const inicio=codificarGiros(origen.giros)*posiciones+codificarBola(origen.bola);
    const padres=new Int32Array(total);padres.fill(-1);
    const pasos=new Uint8Array(total),cola=new Uint32Array(total);
    let cabeza=0,final=1,objetivo=-1;cola[0]=inicio;padres[inicio]=inicio;
    const acciones=Array.from({length:k},(_,i)=>[{tipo:'girar',anillo:i,paso:-1},{tipo:'girar',anillo:i,paso:1}]).flat();
    acciones.push({tipo:'andar',paso:-1},{tipo:'andar',paso:1},{tipo:'entrar'},{tipo:'salir'});
    const giros=Array(k).fill(0);
    function agregar(id,anterior,accion){
      if(padres[id]!==-1)return;
      padres[id]=anterior;pasos[id]=accion;cola[final++]=id;
    }
    while(cabeza<final){
      const id=cola[cabeza++],rot=Math.floor(id/posiciones),b=id%posiciones;
      if(b===posiciones-1){
        if(objetivo<0)objetivo=id;
        if(!auditar)break;
      }
      let tmp=rot;
      for(let i=0;i<k;i++){giros[i]=tmp%n;tmp=Math.floor(tmp/n);}
      for(let i=0;i<k;i++){
        agregar((rot+(mod(giros[i]-1,n)-giros[i])*potencias[i])*posiciones+b,id,i*2);
        agregar((rot+(mod(giros[i]+1,n)-giros[i])*potencias[i])*posiciones+b,id,i*2+1);
      }
      const bola=b===0?{anillo:-1,sector:c.entrada}:{anillo:Math.floor((b-1)/n),sector:(b-1)%n};
      for(let a=k*2;a<acciones.length;a++){
        const movimiento=acciones[a],destino=pasoAnillos(c,giros,bola,movimiento.tipo,movimiento.paso);
        if(destino)agregar(rot*posiciones+codificarBola(destino),id,a);
      }
    }
    if(objetivo<0)return {acciones:null,visitados:cabeza};
    const ruta=[];
    for(let id=objetivo;id!==inicio;id=padres[id])ruta.push(acciones[pasos[id]]);
    return {acciones:ruta.reverse(),visitados:cabeza,
      ...(auditar?{alcanzables:Uint8Array.from(padres,p=>p!==-1?1:0)}:{})};
  }

  function girarEngranajes(c,s,paso) {
    const cambios=s.posiciones.map((_,i)=>(i===1?-paso:paso)*(i===2&&!s.embrague?0:1));
    const posiciones=s.posiciones.map((p,i)=>mod(p+cambios[i],c.dientes[i]));
    const vueltas=(s.vueltas??s.posiciones).map((p,i)=>p+cambios[i]);
    return {...s,posiciones,vueltas,arrastre:(s.arrastre??0)+paso};
  }

  function superponer(c,s) {
    const elegidos=s.discos;
    if(!Array.isArray(elegidos)||elegidos.length!==2||new Set(elegidos).size!==2)return null;
    return Array.from({length:4},(_,i)=>elegidos.some(id=>c.discos[id]?.opaco[mod(i-(s.giros[id]??0),4)]===1)?1:0);
  }

  function resolverNonograma(filas, limite=2) {
    const pistas=ER.especiales.pistasNonograma(filas);
    const ancho=filas[0].length;
    function patrones(grupos,largo){
      const salida=[];
      function poner(indice,pos,fila){
        if(indice===grupos.length){salida.push([...fila,...Array(largo-fila.length).fill(0)]);return;}
        const faltan=grupos.slice(indice).reduce((a,n)=>a+n,0)+grupos.length-indice-1;
        for(let p=pos;p<=largo-faltan;p++){
          const nueva=[...fila,...Array(p-fila.length).fill(0),...Array(grupos[indice]).fill(1)];
          if(indice<grupos.length-1)nueva.push(0);
          poner(indice+1,nueva.length,nueva);
        }
      }
      poner(0,0,[]);return salida;
    }
    const opcionesFilas=pistas.filas.map(p=>patrones(p,ancho));
    const opcionesColumnas=pistas.columnas.map(p=>patrones(p,filas.length));
    const soluciones=[];
    function buscar(tabla,columnas){
      if(soluciones.length>=limite)return;
      if(tabla.length===filas.length){soluciones.push(tabla.map(f=>f.join('')));return;}
      const y=tabla.length;
      for(const fila of opcionesFilas[y]){
        const nuevas=columnas.map((posibles,x)=>posibles.filter(col=>col[y]===fila[x]));
        if(nuevas.every(p=>p.length))buscar([...tabla,fila],nuevas);
      }
    }
    buscar([],opcionesColumnas);
    // Intersecciones de todas las alternativas de una línea, sin adivinaciones.
    const tabla=filas.map(()=>Array(ancho).fill(-1));
    let progreso=true,pasos=0;
    while(progreso){
      progreso=false;
      for(const [horizontal,opciones] of [[true,opcionesFilas],[false,opcionesColumnas]]){
        for(let i=0;i<opciones.length;i++){
          const posibles=opciones[i].filter(p=>p.every((v,j)=>{
            const conocido=horizontal?tabla[i][j]:tabla[j][i];return conocido===-1||conocido===v;
          }));
          if(!posibles.length)continue;
          for(let j=0;j<posibles[0].length;j++){
            if(posibles.every(p=>p[j]===posibles[0][j])){
              const y=horizontal?i:j,x=horizontal?j:i;
              if(tabla[y][x]===-1){tabla[y][x]=posibles[0][j];progreso=true;pasos++;}
            }
          }
        }
      }
    }
    return {soluciones,deducible:tabla.every(f=>f.every(n=>n!==-1)),pasos};
  }

  function inicial(tipo,c) {
    if(tipo==='tuberias')return {giros:c.piezas.map(p=>p.giro??0)};
    if(tipo==='mantenimiento')return {piso:c.inicio,ruta:[]};
    if(tipo==='anillos')return {giros:[...c.giros],bola:{anillo:-1,sector:c.entrada},seleccionado:0};
    if(tipo==='engranajes')return {posiciones:[...c.inicio],embrague:true};
    if(tipo==='vitral')return {discos:[0,1],giros:[0,0,0,0],modelos:{}};
    return {codigo:''};
  }

  function completa(tipo,c,s) {
    if(tipo==='tuberias')return Array.isArray(s?.giros)&&s.giros.length===c.piezas.length&&flujo(c,s.giros).completa;
    if(tipo==='mantenimiento'){
      if(!Array.isArray(s?.ruta)||s.ruta.length>c.limite)return false;
      let piso=c.inicio;
      for(const b of s.ruta){piso=moverAscensor(c,piso,b);if(piso===null)return false;}
      return piso===c.destino;
    }
    if(tipo==='diagnostico')return String(s?.codigo??'').trim()===c.visores.map(v=>candidatasVisor(v)[0]).join('');
    if(tipo==='anillos'){
      if(!Array.isArray(s?.acciones))return false;
      let actual=inicial(tipo,c);
      for(const accion of s.acciones){actual=moverAnillos(c,actual,accion);if(!actual)return false;}
      return actual.bola.anillo===c.anillos.length;
    }
    if(tipo==='engranajes')return Array.isArray(s?.posiciones)&&igual(s.posiciones,c.objetivos);
    if(tipo==='vitral')return c.modelos.every(m=>s?.modelos?.[m.id]&&igual(superponer(c,s.modelos[m.id]),m.opaco));
    return false;
  }

  function errores(tipo,c) {
    try{
      if(tipo==='tuberias'){
        if(!Number.isInteger(c.lado)||c.lado<3||c.lado>6||c.piezas.length!==c.lado*c.lado
          ||c.piezas.some(p=>!Array.isArray(p.puertos)||p.puertos.some(n=>!Number.isInteger(n)||n<0||n>3))
          ||!Array.isArray(c.solucion)||!completa(tipo,c,{giros:c.solucion}))return ['revisa las piezas y la solución de referencia de las tuberías'];
      }
      if(tipo==='mantenimiento'&&(!Number.isInteger(c.limite)||!rutaAscensor(c)))return ['el ascensor no llega al destino dentro del límite'];
      if(tipo==='diagnostico'&&(c.visores.length!==4||c.visores.some(v=>!candidatasVisor(v)||candidatasVisor(v).length!==1)))return ['cada visor y su diagnóstico deben identificar una sola cifra'];
      if(tipo==='anillos'){
        if(!Number.isInteger(c.sectores)||c.sectores!==12||c.anillos.length!==4
          ||!Array.isArray(c.giros)||c.giros.length!==4||c.giros.some(g=>!Number.isInteger(g))
          ||!Number.isInteger(c.entrada)||c.entrada<0||c.entrada>=c.sectores
          ||c.anillos.some(a=>![a.entrada,a.salida].every(v=>Number.isInteger(v)&&v>=0&&v<c.sectores)
            ||!Array.isArray(a.pasillos)||a.pasillos.some(p=>!Array.isArray(p)||p.length!==2
              ||!p.every(v=>Number.isInteger(v)&&v>=0&&v<c.sectores)
              ||![1,c.sectores-1].includes(Math.abs(p[0]-p[1])))))return ['configura cuatro anillos de doce posiciones con pasillos entre sectores vecinos'];
        let s=inicial(tipo,c);
        for(const a of c.solucion){s=moverAnillos(c,s,a);if(!s)return ['la solución de los anillos atraviesa una pared o una puerta desconectada'];}
        if(s.bola.anillo!==c.anillos.length)return ['la solución de los anillos no llega al centro'];
      }
      if(tipo==='engranajes'){
        let s=inicial(tipo,c);
        if(c.dientes.length!==3||c.dientes.some(n=>!Number.isInteger(n)||n<8||n>48))return ['configura tres cantidades de dientes entre 8 y 48'];
        for(const a of c.solucion)s=a==='embrague'?{...s,embrague:!s.embrague}:girarEngranajes(c,s,a);
        if(!completa(tipo,c,s))return ['la secuencia de referencia no alinea los engranajes'];
      }
      if(tipo==='vitral'){
        if(c.discos.length!==4||c.discos.some(d=>d.opaco.length!==4||d.opaco.some(v=>![0,1].includes(v))))return ['configura cuatro discos con cuatro cuadrantes opacos o transparentes'];
        for(const m of c.modelos){
          if(!c.soluciones[m.id]||!igual(superponer(c,c.soluciones[m.id]),m.opaco))return ['cada fase necesita una superposición de referencia válida'];
        }
      }
      return [];
    }catch{return ['revisa los datos específicos y la solución de referencia del mecanismo'];}
  }

  ER.mecanismos={tipos,digitos,mod,flujo,moverAscensor,rutaAscensor,candidatasVisor,moverAnillos,girarEngranajes,
    superponer,resolverNonograma,inicial,completa,errores,topologiaAnillos,puertaAnillos,pasoAnillos,redAnillos,claveAnillos,buscarAnillos};
}();

!function(){
  'use strict';
  const ER=window.EscapeRoom,M=ER.mecanismos;
  const NS='http://www.w3.org/2000/svg';
  function el(tag,texto='',clase=''){const n=document.createElement(tag);n.textContent=texto;n.className=clase;return n;}
  function svg(tag,attrs={}){const n=document.createElementNS(NS,tag);for(const [k,v]of Object.entries(attrs))n.setAttribute(k,v);return n;}
  function textoSVG(padre,texto,x,y,clase=''){const n=svg('text',{x,y,class:clase});n.textContent=texto;padre.append(n);return n;}
  function boton(texto,accion){const b=el('button',texto,'control-reto');b.type='button';b.addEventListener('click',accion);return b;}
  function segmentos(activos,averiados=''){
    const dibujo=svg('svg',{viewBox:'0 0 64 68',class:'segmentos-reto'});
    const trazos={a:'M18 10h28',b:'M48 13v18',c:'M48 36v18',d:'M18 57h28',e:'M15 36v18',f:'M15 13v18',g:'M18 33h28'};
    for(const [id,d]of Object.entries(trazos)){
      dibujo.append(svg('path',{d,class:activos.includes(id)?'encendido':averiados.includes(id)?'averiado':''}));
    }
    return dibujo;
  }
  function disco(opacos,clase=''){
    const dibujo=svg('svg',{viewBox:'0 0 100 100',class:'disco-vitral '+clase});
    dibujo.append(svg('circle',{cx:50,cy:50,r:45,fill:'#ffe6a4'}));
    for(let i=0;i<4;i++){
      const puntos=[[50,5],[95,50],[50,95],[5,50],[50,5]];
      if(opacos[i])dibujo.append(svg('path',{d:`M50 50L${puntos[i][0]} ${puntos[i][1]}A45 45 0 0 1 ${puntos[i+1][0]} ${puntos[i+1][1]}Z`,fill:'#344343'}));
    }
    dibujo.append(svg('circle',{cx:50,cy:50,r:45,fill:'none',stroke:'#8b704e','stroke-width':3}));
    return dibujo;
  }

  function mostrar(padre,reto,opciones){
    const c=JSON.parse(reto.configuracion),tipo=reto.tipo;
    const contenedor=el('section','','mecanismo mecanismo-'+tipo);
    const pantalla=el('div','','pantalla-mecanismo');
    const controles=el('div','','controles-mecanismo');
    const aviso=el('p','','aviso-mecanismo');aviso.setAttribute('role','status');
    const guardado=opciones.interaccion;
    let s=guardado?.actual&&typeof guardado.actual==='object'?structuredClone(guardado.actual):M.inicial(tipo,c);
    let historial=Array.isArray(guardado?.historial)?guardado.historial.slice(-200):[];
    let finalizada=false;
    const persistir=()=>opciones.guardarInteraccion?.({actual:structuredClone(s),historial:structuredClone(historial)});
    const deshacer=boton('Deshacer',()=>{
      if(!historial.length)return;
      s=historial.pop();aviso.textContent='Última acción deshecha.';actualizar();
    });
    const reiniciar=boton('Reiniciar',()=>{
      historial.push(structuredClone(s));s=M.inicial(tipo,c);aviso.textContent='Mecanismo reiniciado.';actualizar();
    });
    let dibujar=()=>{};
    let demostrar=null,ayuda=null,limpiarExtra=()=>{};
    function actualizar(){
      dibujar();deshacer.disabled=!historial.length;persistir();
    }
    function completar(){
      if(finalizada||!contenedor.isConnected||!M.completa(tipo,c,s))return;
      finalizada=Boolean(opciones.comprobar?.(structuredClone(s)));
    }
    function actuar(cambiar){
      const siguiente=cambiar(structuredClone(s));
      if(!siguiente){return;}
      historial.push(structuredClone(s));historial=historial.slice(-200);s=siguiente;
      actualizar();completar();
    }

    if(tipo==='tuberias'){
      const scroll=el('div','','tablero-scroll');
      const tablero=el('div','','tablero-tuberias');
      tablero.style.setProperty('--lado',c.lado);
      const botones=c.piezas.map((p,id)=>{
        const b=boton('',()=>actuar(actual=>{
          actual.giros[id]=M.mod(actual.giros[id]+1,4);return actual;
        }));
        b.disabled=p.fija;b.dataset.tubo=id;
        const dibujo=svg('svg',{viewBox:'0 0 60 60',class:'pieza-tubo'});
        const grupo=svg('g');
        for(const d of p.puertos){
          const [x,y]=[[30,0],[60,30],[30,60],[0,30]][d];
          grupo.append(svg('path',{d:`M30 30L${x} ${y}`,class:'metal-tubo'}),svg('path',{d:`M30 30L${x} ${y}`,class:'agua-tubo'}));
        }
        grupo.append(svg('circle',{cx:30,cy:30,r:6,class:'junta-tubo'}));dibujo.append(grupo);
        const nombre=id===c.entrada?'Entrada':id===c.caldera?'Caldera':id===c.rota?'Rota':c.valvulas.includes(id)?'V'+(c.valvulas.indexOf(id)+1):p.fija?'Fija':'';
        const etiqueta=el('span',nombre,'etiqueta-tubo');
        b.append(dibujo,etiqueta);b.setAttribute('aria-label',`Tubería fila ${Math.floor(id/c.lado)+1}, columna ${id%c.lado+1}${nombre?', '+nombre:''}${p.fija?', fija':', girar 90 grados'}`);
        tablero.append(b);return {b,grupo};
      });
      scroll.append(tablero);pantalla.append(scroll);
      const estadoAgua=el('p');pantalla.append(estadoAgua);
      const previos=[...s.giros],angulos=s.giros.map(g=>g*90);
      dibujar=()=>{
        const f=M.flujo(c,s.giros);
        botones.forEach(({b,grupo},id)=>{
          const cambio=M.mod(s.giros[id]-previos[id],4);
          angulos[id]+=(cambio===3?-1:cambio)*90;previos[id]=s.giros[id];
          grupo.setAttribute('transform',`rotate(${angulos[id]} 30 30)`);
          b.classList.toggle('mojada',f.mojadas.includes(id));
          b.classList.toggle('rota',id===c.rota);
        });
        estadoAgua.textContent=`Válvulas con agua: ${c.valvulas.filter(v=>f.mojadas.includes(v)).length}/2`+(f.mojadas.includes(c.rota)?' · El agua llega a la salida rota.':'');
      };
    }else if(tipo==='mantenimiento'){
      const placa=el('p','Placa: letra → número del alfabeto → pisos. La flecha indica subir o bajar.','placa-mecanismo');
      const dibujo=svg('svg',{viewBox:`0 0 250 ${(c.maximo-c.minimo+1)*20+35}`,class:'edificio-mantenimiento'});
      const alto=(c.maximo-c.minimo+1)*20;
      dibujo.append(svg('rect',{x:65,y:15,width:125,height:alto+8,rx:3,class:'fachada-ascensor'}));
      for(let p=c.minimo;p<=c.maximo;p++){
        const y=alto-(p-c.minimo)*20;
        dibujo.append(svg('line',{x1:70,y1:y+10,x2:185,y2:y+10,class:'planta-linea'}));
        textoSVG(dibujo,String(p).padStart(2,'0'),30,y+5);
        if(c.bloqueadas.includes(p))textoSVG(dibujo,'×',165,y+5,'planta-bloqueada');
        if(p===c.destino){
          dibujo.append(svg('path',{d:`M200 ${y+8}v-16h18v16m-22 0h26M202 ${y-12}h14`,class:'chimenea-destino'}));
          textoSVG(dibujo,'Destino',192,y+24,'etiqueta-destino');
        }
      }
      const cabina=svg('g',{class:'cabina-mantenimiento'});
      cabina.append(svg('rect',{x:92,y:-9,width:44,height:18,rx:2}),svg('line',{x1:114,y1:-9,x2:114,y2:9}));
      dibujo.append(cabina);
      const contador=el('p');
      pantalla.append(placa,dibujo,contador);
      for(const [i,b]of c.botones.entries()){
        controles.append(boton((b.desplaza>0?'↑ ':'↓ ')+b.letra,()=>actuar(actual=>{
          if(actual.ruta.length>=c.limite){aviso.textContent='Límite de movimientos. Deshaz o reinicia para probar otra ruta.';return null;}
          const siguiente=M.moverAscensor(c,actual.piso,i);
          if(siguiente===null){aviso.textContent='Movimiento inválido. No consume un movimiento.';return null;}
          actual.piso=siguiente;actual.ruta.push(i);aviso.textContent='';return actual;
        })));
      }
      dibujar=()=>{
        cabina.style.transform=`translateY(${alto-(s.piso-c.minimo)*20}px)`;
        contador.textContent=`Planta ${s.piso} · Movimientos: ${s.ruta.length}/${c.limite}`;
      };
    }else if(tipo==='diagnostico'){
      const panel=el('div','','visores-diagnostico');
      c.visores.forEach((v,i)=>{
        const ficha=el('article');
        ficha.append(el('h3','Visor '+(i+1)),segmentos(v.visibles));
        const diagnostico=el('div','','diagnostico-segmentos');
        diagnostico.append(segmentos('',v.averiados),el('p','Averiados: '+v.averiados.split('').join(', ')));
        ficha.append(diagnostico);panel.append(ficha);
      });
      const leyenda=el('details');leyenda.append(el('summary','Referencia de las diez cifras'));
      const ejemplos=el('div','','cifras-referencia');
      M.digitos.forEach((seg,n)=>{const figura=el('figure');figura.append(segmentos(seg),el('figcaption',String(n)));ejemplos.append(figura);});
      leyenda.append(ejemplos);
      const etiqueta=el('label','Código de cuatro cifras');
      const entrada=el('input');entrada.type='text';entrada.inputMode='numeric';entrada.maxLength=4;entrada.value=s.codigo??'';
      entrada.addEventListener('input',()=>{s.codigo=entrada.value;persistir();});etiqueta.append(entrada);
      pantalla.append(panel,leyenda,etiqueta);
      controles.append(boton('Comprobar código',()=>{
        if(!M.completa(tipo,c,s)){aviso.textContent='El código todavía no coincide.';return;}
        completar();
      }));
    }else if(tipo==='anillos'){
      const dibujo=svg('svg',{viewBox:'0 0 400 400',class:'laberinto-anillos','aria-label':'Laberinto. Usa los controles para avanzar y cruzar puertas.'});
      const fondos=svg('g'),pasillos=svg('g'),paredes=svg('g'),puertas=svg('g');
      const bolita=svg('circle',{r:6,class:'bolita-anillos'});
      dibujo.append(fondos,pasillos,paredes,puertas,bolita);
      const red=M.redAnillos(c,s),centro=red.centro;
      const punto=(r,sector)=>[centro+r*Math.sin(sector*2*Math.PI/c.sectores),centro-r*Math.cos(sector*2*Math.PI/c.sectores)];
      const hora=sector=>String(M.mod(sector,c.sectores)||12)+' h';
      const instruccion=el('p','Avanzar mueve la bola una posición por el pasillo. Llega a la salida de tu anillo, alinea ambas puertas y pulsa «Cruzar hacia el centro». «Cruzar hacia fuera» permite volver por una puerta abierta. La bola viaja con el anillo ocupado si lo giras.');
      const estadoBola=el('p','','estado-anillos');estadoBola.setAttribute('role','status');
      const conexiones=el('ul','','conexiones-anillos');
      pantalla.append(instruccion,dibujo,estadoBola,conexiones);
      const grupos=[],fondosAnillos=[];
      s.seleccionado=Number.isInteger(s.seleccionado)?s.seleccionado:Math.max(0,Math.min(c.anillos.length-1,s.bola.anillo));
      for(let i=0;i<c.anillos.length;i++){
        const r=red.radios[i],fondo=svg('circle',{cx:centro,cy:centro,r,fill:'none','stroke-width':40,class:'fondo-anillo'});
        fondos.append(fondo);fondosAnillos.push(fondo);
        const grupo=svg('g',{class:'anillo-giratorio'}),nodos=new Set([red.puertas[i].dentro.sector,red.puertas[i+1].afuera.sector]);
        red.pasillos[i].forEach((vecinos,a)=>{
          for(const b of vecinos){
            nodos.add(a);nodos.add(b);if(a>b)continue;
            const [x1,y1]=punto(r,a),[x2,y2]=punto(r,b),sentido=M.mod(b-a,c.sectores)===1?1:0;
            grupo.append(svg('path',{d:'M'+x1+' '+y1+'A'+r+' '+r+' 0 0 '+sentido+' '+x2+' '+y2,class:'pasillo-anillo'}));
          }
        });
        for(const sector of nodos){
          const [cx,cy]=punto(r,sector);grupo.append(svg('circle',{cx,cy,r:red.anchura/2,class:'nodo-anillo'}));
        }
        for(const [tipoPuerta,sector]of [['entrada',red.puertas[i].dentro.sector],['salida',red.puertas[i+1].afuera.sector]]){
          const [x1,y1]=punto(r,sector),[x2,y2]=punto(r+(tipoPuerta==='entrada'?20:-20),sector);
          grupo.append(svg('path',{d:'M'+x1+' '+y1+'L'+x2+' '+y2,class:'pasillo-anillo puerta-media'}));
        }
        pasillos.append(grupo);grupos.push(grupo);
        const fila=el('div','','control-anillo');
        const elegir=boton('Anillo '+(i+1),()=>{s.seleccionado=i;actualizar();});
        elegir.dataset.seleccionarAnillo=i;
        const izquierda=boton('↶',()=>accion({tipo:'girar',anillo:i,paso:-1}));
        const derecha=boton('↷',()=>accion({tipo:'girar',anillo:i,paso:1}));
        izquierda.setAttribute('aria-label','Girar anillo '+(i+1)+' a la izquierda');
        derecha.setAttribute('aria-label','Girar anillo '+(i+1)+' a la derecha');
        izquierda.dataset.giro=-1;derecha.dataset.giro=1;fila.dataset.anillo=i;
        fila.append(elegir,izquierda,derecha);controles.append(fila);
      }
      for(const r of red.limites)paredes.append(svg('circle',{cx:centro,cy:centro,r,class:'pared-circular'}));
      fondos.append(svg('circle',{cx:centro,cy:centro,r:20,class:'centro-laberinto'}));
      const atras=boton('Avanzar ↶',()=>accion({tipo:'andar',paso:-1}));
      const adelante=boton('Avanzar ↷',()=>accion({tipo:'andar',paso:1}));
      const entrar=boton('Cruzar hacia el centro',()=>accion({tipo:'entrar'}));
      const salir=boton('Cruzar hacia fuera',()=>accion({tipo:'salir'}));
      atras.dataset.movimiento='antihorario';adelante.dataset.movimiento='horario';
      entrar.dataset.movimiento='entrar';salir.dataset.movimiento='salir';
      controles.append(atras,adelante,entrar,salir);
      let enDemostracion=false,ruta=[],cursor=0,esperada='',temporizador,running=false,visitados=0;
      const panelDemo=el('section','','demo-anillos');panelDemo.hidden=true;
      const resumenDemo=el('p');resumenDemo.setAttribute('role','status');
      const avanzarDemo=boton('Paso siguiente',()=>{pausar();pasoDemo();});
      const reproducir=boton('Reproducir',()=>{
        if(running){pausar();return;}
        if(!ruta.length||cursor>=ruta.length)calcular();
        if(!ruta.length)return;
        running=true;reproducir.textContent='Pausa';reproducir.setAttribute('aria-pressed','true');reproducirPaso();
      });
      const recalcular=boton('Calcular desde aquí',()=>calcular()),listaDemo=el('ol','','ruta-demo');
      panelDemo.append(el('h3','Demostrar solución'),resumenDemo,avanzarDemo,reproducir,recalcular,listaDemo);
      function descripcion(a){
        if(a.tipo==='girar')return 'Girar anillo '+(a.anillo+1)+' una posición a la '+(a.paso===-1?'izquierda':'derecha');
        if(a.tipo==='andar')return 'Avanzar una posición en sentido '+(a.paso===1?'horario':'antihorario');
        return a.tipo==='entrar'?'Cruzar hacia el centro':'Cruzar hacia fuera';
      }
      function pausar(){
        clearTimeout(temporizador);running=false;reproducir.textContent='Reproducir';reproducir.setAttribute('aria-pressed','false');
      }
      function actualizarDemo(){
        avanzarDemo.disabled=!ruta.length||cursor>=ruta.length;
        resumenDemo.textContent=ruta.length?'Paso '+cursor+'/'+ruta.length+'. '+(cursor<ruta.length?'Siguiente: '+descripcion(ruta[cursor]):'Ruta completada.')+' Estados explorados: '+visitados+'.':'Calcula una ruta desde la posición actual.';
        for(const [i,nodo]of [...listaDemo.children].entries())nodo.classList.toggle('paso-ejecutado',i<cursor);
      }
      function calcular(){
        pausar();
        const resultado=M.buscarAnillos(c,s);ruta=resultado.acciones??[];visitados=resultado.visitados;cursor=0;esperada=M.claveAnillos(c,s);
        listaDemo.replaceChildren(...ruta.map(a=>el('li',descripcion(a))));actualizarDemo();
      }
      function pasoDemo(){
        if(!ruta.length||cursor>=ruta.length)return false;
        if(M.claveAnillos(c,s)!==esperada){calcular();return false;}
        enDemostracion=true;const valido=accion(ruta[cursor]);enDemostracion=false;
        if(!valido){pausar();aviso.textContent='La ruta cambió. Calcula una nueva demostración.';return false;}
        cursor++;esperada=M.claveAnillos(c,s);actualizarDemo();return true;
      }
      function reproducirPaso(){
        if(!running||!contenedor.isConnected||document.hidden){pausar();return;}
        if(!pasoDemo()||cursor>=ruta.length){pausar();return;}
        temporizador=setTimeout(reproducirPaso,700);
      }
      demostrar=()=>{
        panelDemo.hidden=false;if(!panelDemo.isConnected)contenedor.append(panelDemo);
        calcular();panelDemo.scrollIntoView({block:'nearest'});
      };
      ayuda=()=>boton('Demostrar solución desde aquí',()=>demostrar());
      const visibilidad=()=>{if(document.hidden)pausar();};
      document.addEventListener('visibilitychange',visibilidad);
      limpiarExtra=()=>{pausar();document.removeEventListener('visibilitychange',visibilidad);};
      function accion(a){
        const siguiente=M.moverAnillos(c,s,a);
        if(!siguiente){
          aviso.textContent=a.tipo==='andar'?'En esa dirección hay una pared. Prueba el otro sentido.':'Para cruzar, coloca la bola en la puerta y alinea las dos aberturas.';
          return false;
        }
        actuar(actual=>{
          siguiente.acciones=[...(actual.acciones??[]),a];
          if(a.tipo==='girar')siguiente.seleccionado=a.anillo;
          aviso.textContent='';return siguiente;
        });
        return true;
      }
      let inicioPuntero;
      dibujo.style.touchAction='none';
      dibujo.addEventListener('pointerdown',e=>{
        const rect=dibujo.getBoundingClientRect(),x=(e.clientX-rect.left)/rect.width*400-centro,y=(e.clientY-rect.top)/rect.height*400-centro;
        const i=Math.round((red.radios[0]-Math.hypot(x,y))/40);
        if(i<0||i>=c.anillos.length)return;
        s.seleccionado=i;actualizar();
        inicioPuntero={angulo:Math.atan2(y,x),anillo:i,x:e.clientX,y:e.clientY};
        try{dibujo.setPointerCapture(e.pointerId);}catch{}
      });
      dibujo.addEventListener('pointerup',e=>{
        if(!inicioPuntero)return;
        const rect=dibujo.getBoundingClientRect(),x=(e.clientX-rect.left)/rect.width*400-centro,y=(e.clientY-rect.top)/rect.height*400-centro;
        const dif=Math.atan2(Math.sin(Math.atan2(y,x)-inicioPuntero.angulo),Math.cos(Math.atan2(y,x)-inicioPuntero.angulo));
        if(Math.hypot(e.clientX-inicioPuntero.x,e.clientY-inicioPuntero.y)>18&&Math.abs(dif)>.1)accion({tipo:'girar',anillo:inicioPuntero.anillo,paso:dif>0?1:-1});
        inicioPuntero=null;
      });
      dibujo.addEventListener('pointercancel',()=>{inicioPuntero=null;});
      dibujar=()=>{
        const actual=M.redAnillos(c,s);
        if(!Number.isInteger(s.seleccionado)||s.seleccionado<0||s.seleccionado>=c.anillos.length)s.seleccionado=Math.max(0,Math.min(c.anillos.length-1,s.bola.anillo));
        if(!enDemostracion&&ruta.length&&esperada&&M.claveAnillos(c,s)!==esperada){
          pausar();ruta=[];cursor=0;listaDemo.replaceChildren();actualizarDemo();
        }
        grupos.forEach((g,i)=>{
          g.style.transformOrigin=centro+'px '+centro+'px';
          g.style.transform='rotate('+((s.rotaciones??s.giros)[i]*360/c.sectores)+'deg)';
          g.classList.toggle('anillo-ocupado',s.bola.anillo===i);
          fondosAnillos[i].classList.toggle('anillo-seleccionado',s.seleccionado===i);
          const b=controles.querySelector('[data-seleccionar-anillo="'+i+'"]');
          b.textContent=(s.seleccionado===i?'✓ ':'')+'Anillo '+(i+1)+(s.bola.anillo===i?' · bola':'');
          b.setAttribute('aria-pressed',String(s.seleccionado===i));
        });
        puertas.replaceChildren();conexiones.replaceChildren();
        for(const p of actual.puertas){
          if(p.abierta){
            const r1=p.afuera.anillo<0?194:actual.radios[p.afuera.anillo],r2=p.dentro.anillo===c.anillos.length?0:actual.radios[p.dentro.anillo];
            const [x1,y1]=punto(r1,p.exterior),[x2,y2]=punto(r2,p.interior);
            const paso=svg('path',{d:'M'+x1+' '+y1+'L'+x2+' '+y2,class:'paso-abierto','data-puerta':p.id});
            paso.dataset.anchura=actual.anchura;puertas.append(paso);
          }
          if(p.afuera.anillo>=0&&p.dentro.anillo<c.anillos.length){
            conexiones.append(el('li','Anillos '+(p.afuera.anillo+1)+' → '+(p.dentro.anillo+1)+': '+(p.abierta?'paso abierto a las '+hora(p.exterior):'cerrado. Salida '+hora(p.exterior)+'; entrada '+hora(p.interior))));
          }
        }
        const i=s.bola.anillo,r=i<0?194:i>=c.anillos.length?0:actual.radios[i],sector=i<0?c.entrada:s.bola.sector+(s.giros[i]??0);
        const [x,y]=punto(r,sector);bolita.setAttribute('cx',x);bolita.setAttribute('cy',y);
        estadoBola.textContent=(i<0?'Bola en la entrada exterior.':i>=c.anillos.length?'Bola en el centro.':'Bola en el anillo '+(i+1)+', a las '+hora(sector)+'.')+' Seleccionado para girar: anillo '+(s.seleccionado+1)+'.';
        atras.disabled=!M.pasoAnillos(c,s.giros,s.bola,'andar',-1);adelante.disabled=!M.pasoAnillos(c,s.giros,s.bola,'andar',1);
        entrar.disabled=!M.pasoAnillos(c,s.giros,s.bola,'entrar');salir.disabled=!M.pasoAnillos(c,s.giros,s.bola,'salir');
      };
    }else if(tipo==='engranajes'){
      const tapa=el('div','','tapa-espejo');tapa.append(ER.recursos.svg('espejo'),el('span','Compartimento del espejo'));
      const dibujo=svg('svg',{viewBox:'0 0 540 280',class:'engranajes-svg'});
      const radios=c.dientes.map(n=>n*4.6667);
      const xs=[radios[0]+20,radios[0]*2+radios[1]+20,radios[0]*2+radios[1]*2+radios[2]+20],ruedas=[];
      dibujo.setAttribute('viewBox',`0 ${Math.min(0,125-Math.max(...radios))} ${xs[2]+radios[2]+20} ${Math.max(...radios)*2+56}`);
      let nucleo;
      c.dientes.forEach((dientes,i)=>{
        const r=radios[i],grupo=svg('g',{class:'rueda-dentada'});
        const puntos=[];
        for(let p=0;p<dientes*4;p++){
          const a=p*Math.PI*2/(dientes*4),rr=p%4<2?r:r-7;
          puntos.push((xs[i]+rr*Math.sin(a))+','+(140-rr*Math.cos(a)));
        }
        grupo.append(svg('polygon',{points:puntos.join(' ')}));
        const centro=svg('g',{class:'nucleo-engranaje'});
        centro.append(svg('circle',{cx:xs[i],cy:140,r:r*.7,class:'centro-engranaje'}),
          svg('line',{x1:xs[i],y1:140-r*.7+3,x2:xs[i],y2:140-r*.7+20,class:'marca-engranaje'}));
        if(i===2){nucleo=centro;}else grupo.append(centro);
        dibujo.append(grupo);ruedas.push(grupo);
        if(i===2)dibujo.append(centro);
        const a=c.objetivos[i]*2*Math.PI/dientes;
        const xx=xs[i]+(r+7)*Math.sin(a),yy=140-(r+7)*Math.cos(a);
        dibujo.append(svg('circle',{cx:xx,cy:yy,r:5,class:'objetivo-engranaje'}));
        textoSVG(dibujo,dientes+' dientes',xs[i],140+Math.max(...radios)+25,'etiqueta-engranaje');
      });
      const embrague=boton('Embrague',()=>actuar(actual=>({...actual,embrague:!actual.embrague})));
      controles.append(boton('Girar −',()=>actuar(actual=>M.girarEngranajes(c,actual,-1))),
        boton('Girar +',()=>actuar(actual=>M.girarEngranajes(c,actual,1))),embrague);
      const estado=el('p');
      pantalla.append(tapa,dibujo,el('p','El embrague conecta el núcleo marcado de la tercera rueda con su corona dentada. Al liberarlo, la corona sigue girando y el núcleo conserva su marca.'),estado);
      dibujar=()=>{
        ruedas.forEach((g,i)=>{g.style.transformOrigin=`${xs[i]}px 140px`;g.style.transform=`rotate(${(i===2?(s.arrastre??0):(s.vueltas??s.posiciones)[i])*360/c.dientes[i]}deg)`;});
        nucleo.style.transformOrigin=`${xs[2]}px 140px`;
        nucleo.style.transform=`rotate(${(s.vueltas??s.posiciones)[2]*360/c.dientes[2]}deg)`;
        embrague.textContent=s.embrague?'Embrague conectado · liberar':'Embrague libre · conectar';
        embrague.setAttribute('aria-pressed',String(s.embrague));
        estado.textContent='Marcas alineadas: '+s.posiciones.filter((p,i)=>p===c.objetivos[i]).length+'/3. La tercera rueda está '+(s.embrague?'conectada.':'libre.');
        dibujo.classList.toggle('embrague-libre',!s.embrague);
      };
    }else if(tipo==='vitral'){
      const discos=el('div','','discos-vitral');
      const controlesDiscos=[];
      c.discos.forEach((d,i)=>{
        const ficha=el('div');
        const elegir=boton('Disco '+d.nombre,()=>actuar(actual=>{
          const pos=actual.discos.indexOf(i);
          if(pos>=0)actual.discos.splice(pos,1);
          else if(actual.discos.length<2)actual.discos.push(i);
          else{aviso.textContent='Retira un disco antes de colocar otro.';return null;}
          aviso.textContent='';return actual;
        }));
        const dibujo=disco(d.opaco);
        const fila=el('div','','giro-disco');
        fila.append(boton('↶',()=>girar(i,-1)),boton('↷',()=>girar(i,1)));
        fila.children[0].setAttribute('aria-label','Girar disco '+d.nombre+' a la izquierda');
        fila.children[1].setAttribute('aria-label','Girar disco '+d.nombre+' a la derecha');
        ficha.append(elegir,dibujo,fila);discos.append(ficha);controlesDiscos.push({elegir,dibujo});
      });
      function girar(i,paso){actuar(actual=>{
        actual.angulos=[...(actual.angulos??actual.giros)];actual.angulos[i]+=paso;
        actual.giros[i]=M.mod(actual.giros[i]+paso,4);return actual;
      });}
      const lampara=el('div','','lampara-vitral');
      const modelos=el('div','','modelos-vitral');
      const botonesModelo=c.modelos.map(m=>{
        const ficha=el('div');ficha.append(disco(m.opaco),el('p',m.nombre));
        const guardarModelo=boton('Guardar '+m.nombre,()=>actuar(actual=>{
          if(JSON.stringify(M.superponer(c,actual))!==JSON.stringify(m.opaco)){aviso.textContent='La lámpara no coincide con ese modelo.';return null;}
          actual.modelos[m.id]={discos:[...actual.discos],giros:[...actual.giros]};aviso.textContent=m.nombre+' guardada.';return actual;
        }));
        ficha.append(guardarModelo);modelos.append(ficha);return {b:guardarModelo,m};
      });
      pantalla.append(el('p','Coloca dos discos sobre la lámpara.'),discos,lampara,modelos);
      dibujar=()=>{
        controlesDiscos.forEach(({elegir,dibujo},i)=>{
          elegir.setAttribute('aria-pressed',String(s.discos.includes(i)));
          dibujo.style.transform=`rotate(${(s.angulos??s.giros)[i]*90}deg)`;
        });
        const resultado=M.superponer(c,s);
        lampara.replaceChildren(el('p','Lámpara · resultado actual'));
        if(resultado)lampara.append(disco(resultado));
        else lampara.append(el('p','Selecciona dos discos.'));
        botonesModelo.forEach(({b,m})=>{b.textContent=s.modelos[m.id]?'✓ '+m.nombre+' guardada':'Guardar '+m.nombre;});
      };
    }
    const herramientas=el('div','','herramientas-mecanismo');herramientas.append(deshacer,reiniciar);
    contenedor.append(pantalla,controles,herramientas,aviso);padre.append(contenedor);
    try{actualizar();}catch{s=M.inicial(tipo,c);historial=[];actualizar();}
    queueMicrotask(completar);
    return {obtener:()=>structuredClone(s),limpiar:limpiarExtra,ayuda,demostrar};
  }
  M.mostrar=mostrar;
}();
