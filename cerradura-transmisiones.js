!function(){
  'use strict';
  const ER=window.EscapeRoom,M=ER.mecanismos;
  const mod=n=>((n%8)+8)%8;
  const transmisiones=['A','B'],controles=['exterior','interior'];
  const conexiones={A:{exterior:[1,-1,0,0],interior:[0,0,1,-1]},B:{exterior:[0,1,1,0],interior:[0,0,0,1]}};
  const valida=c=>c?.version===2&&[c.inicio,c.objetivos].every(a=>Array.isArray(a)&&a.length===4&&a.every(n=>Number.isInteger(n)&&n>=0&&n<8))&&transmisiones.includes(c.transmision);
  const posicionesValidas=p=>Array.isArray(p)&&p.length===4&&p.every(n=>Number.isInteger(n)&&n>=0&&n<8);
  const inicial=c=>({posiciones:[...c.inicio],giros:[...c.inicio],transmision:c.transmision,movimientos:0,abierta:false});
  const alineada=(c,s)=>valida(c)&&posicionesValidas(s?.posiciones)&&s.posiciones.every((p,i)=>p===c.objetivos[i]);
  function girar(s,control,sentido){
    if(!posicionesValidas(s?.posiciones)||!conexiones[s.transmision]?.[control]||![1,-1].includes(sentido))return null;
    const vector=conexiones[s.transmision][control];
    return {...s,posiciones:s.posiciones.map((p,i)=>mod(p+sentido*vector[i])),
      giros:(s.giros??s.posiciones).map((p,i)=>p+sentido*vector[i]),movimientos:(s.movimientos??0)+1,abierta:false};
  }
  function aplicar(c,s,paso){
    if(paso?.tipo==='transmision'&&transmisiones.includes(paso.transmision))return {...s,transmision:paso.transmision,abierta:false};
    if(paso?.tipo==='giro')return girar(s,paso.control,paso.sentido);
    if(paso?.tipo==='abrir'&&alineada(c,s))return {...s,abierta:true};
    return null;
  }
  const indice=p=>p.reduce((n,v,i)=>n+v*8**i,0);
  const posicion=n=>[n%8,(n>>3)%8,(n>>6)%8,(n>>9)%8];
  const cache=new Map();
  function distancias(c,permitidas=transmisiones){
    const clave=c.objetivos.join(',')+permitidas.join('');if(cache.has(clave))return cache.get(clave);
    // Cambiar de transmisión cuesta cero y no mueve las ruedas. Se contraen esas aristas
    // antes de la BFS; cada arista restante representa exactamente un giro.
    const dist=new Int16Array(4096).fill(-1),cola=new Uint16Array(4096);let fin=1;
    cola[0]=indice(c.objetivos);dist[cola[0]]=0;
    for(let n=0;n<fin;n++){
      const id=cola[n],p=posicion(id);
      for(const transmision of permitidas)for(const control of controles)for(const sentido of [-1,1]){
        const q=p.map((v,i)=>mod(v+sentido*conexiones[transmision][control][i])),k=indice(q);
        if(dist[k]===-1){dist[k]=dist[id]+1;cola[fin++]=k;}
      }
    }
    if(cache.size>=12)cache.delete(cache.keys().next().value);cache.set(clave,dist);return dist;
  }
  function ruta(c,estado=inicial(c),permitidas=transmisiones){
    if(!valida(c)||!posicionesValidas(estado?.posiciones))return null;
    const dist=distancias(c,permitidas);let s=structuredClone(estado);const pasos=[];
    if(dist[indice(s.posiciones)]<0)return null;
    while(dist[indice(s.posiciones)]>0){
      let elegido;
      for(const transmision of [s.transmision,...permitidas.filter(t=>t!==s.transmision)].filter(t=>permitidas.includes(t))){
        for(const control of controles)for(const sentido of [-1,1]){
          const siguiente=girar({...s,transmision},control,sentido);
          if(!elegido&&dist[indice(siguiente.posiciones)]===dist[indice(s.posiciones)]-1)elegido={transmision,control,sentido};
        }
      }
      if(elegido.transmision!==s.transmision){const cambio={tipo:'transmision',transmision:elegido.transmision};pasos.push(cambio);s=aplicar(c,s,cambio);}
      const giro={tipo:'giro',control:elegido.control,sentido:elegido.sentido};pasos.push(giro);s=aplicar(c,s,giro);
    }
    pasos.push({tipo:'abrir'});return pasos;
  }
  const giros=ruta=>ruta?.filter(p=>p.tipo==='giro').length??null;
  function revision(c){
    if(!valida(c))return {error:'Configura cuatro posiciones de 0 a 7 y una transmisión inicial A o B.'};
    const solucion=ruta(c);return {minimo:giros(solucion),solucion,soloA:giros(ruta(c,inicial(c),['A'])),soloB:giros(ruta(c,inicial(c),['B']))};
  }
  function referenciaValida(c){
    if(!valida(c)||!Array.isArray(c.solucion))return false;
    let s=inicial(c);for(const paso of c.solucion){s=aplicar(c,s,paso);if(!s)return false;}
    return alineada(c,s)&&s.abierta===true&&giros(c.solucion)===revision(c).minimo;
  }
  function capitulo(){
    const c={version:2,inicio:[4,0,0,0],objetivos:[0,0,0,0],transmision:'A'};c.solucion=ruta(c);
    return ER.capitulo({listo:true,tipo:'cerradura',titulo:'La cerradura de las cuatro ruedas',
      instrucciones:'Las cuatro muescas deben coincidir con el pestillo. Cambia la transmisión para elegir qué ruedas arrastras. Cada giro prepara el siguiente.',
      configuracion:JSON.stringify(c,null,2),pistas:['Observa qué rueda solo puedes mover con la transmisión A.','La rueda exterior puede quedar alineada mientras sigues ajustando las otras.','Orientación calculada desde el estado actual.'],
      acierto:'La casa despierta. Has ganado la llave del día 2.'});
  }
  function campana(base){const nueva=ER.calendario(structuredClone(base));nueva.partida='caja-adviento-v5';nueva.capitulos[0]=capitulo();return nueva;}
  function describir(paso){
    if(paso.tipo==='transmision')return 'Cambiar a Transmisión '+paso.transmision+' (0 giros)';
    if(paso.tipo==='abrir')return 'Accionar el pestillo';
    return 'Girar el control '+paso.control+' un paso '+(paso.sentido===1?'a la derecha':'a la izquierda');
  }
  function pista(c,s=inicial(c)){
    if(alineada(c,s))return 'Las cuatro muescas ya están alineadas. Acciona el pestillo.';
    const pasos=ruta(c,s),primero=pasos[0];
    return (primero.tipo==='transmision'?describir(primero)+'. '+describir(pasos[1]):describir(primero))+'. Esta acción reduce la distancia a la apertura; quedan '+giros(pasos)+' giros antes de realizarla.';
  }
  const el=(tag,text='',clase='')=>{const n=document.createElement(tag);n.textContent=text;n.className=clase;return n;};
  const boton=(text,fn)=>{const n=el('button',text,'control-reto');n.type='button';n.addEventListener('click',fn);return n;};
  const svg=(tag,attrs={})=>{const n=document.createElementNS('http://www.w3.org/2000/svg',tag);for(const [k,v]of Object.entries(attrs))n.setAttribute(k,v);return n;};
  function esquema(t){
    const contenedor=el('div','','conexiones-transmision');
    const dibujo=svg('svg',{viewBox:'0 0 280 70',role:'img','aria-label':'Conexiones activas en transmisión '+t});
    const xs=[30,103,176,249];
    for(const control of controles){const indices=conexiones[t][control].flatMap((v,i)=>v?[i]:[]);
      if(indices.length===2)dibujo.append(svg('line',{x1:xs[indices[0]],y1:25,x2:xs[indices[1]],y2:25,stroke:'#866d3b','stroke-width':4}));
    }
    xs.forEach((x,i)=>{dibujo.append(svg('circle',{cx:x,cy:25,r:17,fill:'#f0deb7',stroke:'#746442','stroke-width':2}));const texto=svg('text',{x,y:31,'text-anchor':'middle',fill:'#273d34'});texto.textContent=String(i+1);dibujo.append(texto);});
    contenedor.append(dibujo);
    for(const control of controles){const movimientos=conexiones[t][control].flatMap((v,i)=>v?['rueda '+(i+1)+(v===1?' ↻':' ↺')]:[]).join(' · ');contenedor.append(el('p',(control==='exterior'?'Exterior: ':'Interior: ')+movimientos));}
    contenedor.append(el('p','El esquema muestra un giro a la derecha; a la izquierda se invierten todos los sentidos.','ayuda'));
    return contenedor;
  }
  function mostrar(padre,reto,opciones){
    const c=JSON.parse(reto.configuracion),firma=JSON.stringify([c.inicio,c.objetivos,c.transmision]),g=opciones.interaccion;
    const restaurable=g?.version===2&&g.configuracion===firma&&posicionesValidas(g.actual?.posiciones)&&transmisiones.includes(g.actual?.transmision);
    let s=restaurable?structuredClone(g.actual):inicial(c),historial=restaurable&&Array.isArray(g.historial)?g.historial.filter(e=>posicionesValidas(e?.posiciones)&&transmisiones.includes(e.transmision)).slice(-200):[],timer,demo,pasoDemo=0;
    if(!Array.isArray(s.giros)||s.giros.length!==4||s.giros.some((v,i)=>!Number.isInteger(v)||mod(v)!==s.posiciones[i]))s.giros=[...s.posiciones];
    const caja=el('section','','cerradura-mecanica cerradura-transmisiones');
    const dibujo=svg('svg',{viewBox:'0 0 330 280',role:'img','aria-label':'Cuatro ruedas, numeradas de fuera a dentro. Las aberturas deben apuntar al pestillo de la derecha.'});
    dibujo.append(svg('rect',{x:5,y:5,width:320,height:270,rx:20,fill:'#373e39',stroke:'#aa8c55','stroke-width':4}));
    const ruedas=[],etiquetas=[];
    [110,86,62,38].forEach((r,i)=>{
      const grupo=svg('g',{'data-rueda-cerradura':i+1,class:'aro-cerradura'}),a=17*Math.PI/180;
      grupo.append(svg('path',{d:`M${140+r*Math.cos(a)} ${140+r*Math.sin(a)} A${r} ${r} 0 1 1 ${140+r*Math.cos(-a)} ${140+r*Math.sin(-a)}`,fill:'none',stroke:['#bc9a61','#ecd39e','#acb7a1','#c2a986'][i],'stroke-width':14}));
      for(let j=1;j<8;j++){const t=j*Math.PI/4;grupo.append(svg('circle',{cx:140+r*Math.cos(t),cy:140+r*Math.sin(t),r:2,fill:'#534635'}));}
      dibujo.append(grupo);ruedas.push(grupo);
      const etiqueta=svg('text',{x:140,y:140-r+4,'text-anchor':'middle',class:'numero-rueda'});etiqueta.textContent=String(i+1);etiquetas.push(etiqueta);
    });
    dibujo.append(...etiquetas,svg('circle',{cx:140,cy:140,r:18,fill:'#705c3e',stroke:'#ddc18a','stroke-width':3}));
    const pestillo=svg('rect',{x:260,y:134,width:58,height:12,rx:2,fill:'#e2c58c',stroke:'#76613c','stroke-width':2});dibujo.append(pestillo);
    const estado=el('p','','estado-cerradura');estado.setAttribute('role','status');
    const selector=el('div','','selector-transmision');selector.setAttribute('role','group');selector.setAttribute('aria-label','Elegir transmisión');
    const selectores=transmisiones.map(t=>boton(t,()=>{if(s.transmision!==t)actuar(aplicar(c,s,{tipo:'transmision',transmision:t}));}));selectores.forEach((b,i)=>b.setAttribute('aria-label','Transmisión '+transmisiones[i]));selector.append(...selectores);
    const controlesUI=el('div','','controles-ruedas'),controlBotones=[];
    let focoControl;
    function resaltar(control){focoControl=control;ruedas.forEach((n,i)=>n.classList.toggle('rueda-afectada',Boolean(control&&conexiones[s.transmision][control][i])));}
    for(const control of controles){const fila=el('div');fila.append(el('span',control==='exterior'?'Exterior':'Interior'));
      for(const sentido of [-1,1]){const b=boton(sentido===1?'↻':'↺',()=>actuar(girar(s,control,sentido)));b.setAttribute('aria-label','Girar '+control+' a la '+(sentido===1?'derecha':'izquierda'));b.addEventListener('focus',()=>resaltar(control));b.addEventListener('blur',()=>resaltar());b.addEventListener('pointerdown',()=>resaltar(control));b.addEventListener('pointerup',()=>{if(document.activeElement!==b)resaltar();});b.addEventListener('pointercancel',()=>resaltar());fila.append(b);controlBotones.push(b);}
      controlesUI.append(fila);
    }
    const deslizar=boton('Deslizar pestillo ←',abrir);deslizar.classList.add('pestillo-control');deslizar.setAttribute('aria-label','Deslizar pestillo: arrastra a la izquierda o pulsa para abrir');
    let origen,arrastrado=false;
    deslizar.addEventListener('pointerdown',e=>{origen=e.clientX;arrastrado=false;deslizar.setPointerCapture(e.pointerId);});
    deslizar.addEventListener('pointermove',e=>{if(origen===undefined)return;const d=Math.max(0,Math.min(52,origen-e.clientX));if(alineada(c,s))deslizar.style.setProperty('--arrastre',d+'px');if(d>=30)arrastrado=true;});
    deslizar.addEventListener('pointerup',()=>{const valido=arrastrado;origen=undefined;deslizar.style.removeProperty('--arrastre');if(valido){arrastrado=false;abrir();arrastrado=true;}});
    deslizar.addEventListener('pointercancel',()=>{origen=undefined;deslizar.style.removeProperty('--arrastre');arrastrado=false;});
    const deshacer=boton('Deshacer',()=>{detenerDemo();clearTimeout(timer);if(historial.length){s=historial.pop();actualizar();}});
    const reiniciar=boton('Reiniciar',()=>{detenerDemo();actuar(inicial(c));});
    const ayuda=el('details','','esquema-transmisiones');ayuda.append(el('summary','Cómo se conectan las ruedas'));for(const t of transmisiones)ayuda.append(el('h4','Transmisión '+t),esquema(t));
    ayuda.insertBefore(el('p','Ruedas 1 a 4, del exterior al interior.'),ayuda.children[1]);
    const panel=el('div','','panel-cerradura');
    const modos=el('div','','modos-cerradura');
    modos.append(el('span','Transmisión'),selector);
    const acciones=el('div','','acciones-cerradura');
    acciones.append(deshacer,reiniciar);
    panel.append(modos,controlesUI,deslizar,estado,acciones);
    caja.append(dibujo,panel,ayuda);
    const demoPanel=el('div','','demostracion-cerradura'),estadoDemo=el('p'),avanzar=boton('Avanzar un paso',()=>{
      if(!demo||pasoDemo>=demo.length)return;
      const paso=demo[pasoDemo++];if(paso.tipo==='abrir')abrir();else actuar(aplicar(c,s,paso),true);
      estadoDemo.textContent='Paso '+pasoDemo+'/'+demo.length+': '+describir(paso)+'.';avanzar.disabled=pasoDemo>=demo.length;
    });
    function detenerDemo(){if(demo)estadoDemo.textContent='Demostración detenida. Puedes empezar otra vez desde el inicio.';demo=undefined;avanzar.disabled=true;}
    if(opciones.esEditor){demoPanel.append(boton('Demostrar solución',()=>{clearTimeout(timer);s=inicial(c);historial=[];demo=structuredClone(c.solucion);pasoDemo=0;actualizar();avanzar.disabled=false;estadoDemo.textContent='Desde el inicio: '+giros(demo)+' giros. Cambios de transmisión y pestillo se muestran como pasos separados.';}),avanzar,estadoDemo);avanzar.disabled=true;caja.append(demoPanel);}
    padre.append(caja);
    function actualizar(){
      ruedas.forEach((g,i)=>g.style.transform=`rotate(${(s.giros[i]-c.objetivos[i])*45}deg)`);
      selectores.forEach((b,i)=>b.setAttribute('aria-pressed',String(s.transmision===transmisiones[i])));resaltar(focoControl);
      const listo=alineada(c,s);caja.classList.toggle('alineada',listo);pestillo.setAttribute('x',s.abierta?160:260);pestillo.setAttribute('width',s.abierta?158:58);
      estado.textContent=listo?'Muescas alineadas. Desliza el pestillo.':'';
      deshacer.disabled=!historial.length;opciones.guardarInteraccion?.({version:2,configuracion:firma,actual:structuredClone(s),historial:structuredClone(historial)});
      controlBotones.forEach(b=>b.disabled=s.abierta);selectores.forEach(b=>b.disabled=s.abierta);
    }
    function actuar(nueva,desdeDemo=false){if(!nueva)return;if(!desdeDemo&&demo)detenerDemo();clearTimeout(timer);historial.push(structuredClone(s));historial=historial.slice(-200);s=nueva;actualizar();}
    function abrir(){
      if(arrastrado){arrastrado=false;return;}
      if(!alineada(c,s)){estado.textContent='El pestillo está bloqueado: deben alinearse las cuatro muescas.';return;}
      s=aplicar(c,s,{tipo:'abrir'});actualizar();controlBotones.forEach(b=>b.disabled=true);selectores.forEach(b=>b.disabled=true);
      timer=setTimeout(()=>{if(caja.isConnected)opciones.comprobar?.(structuredClone(s));},matchMedia('(prefers-reduced-motion: reduce)').matches||document.documentElement.classList.contains('movimiento-reducido')?100:400);
    }
    actualizar();if(s.abierta&&alineada(c,s))timer=setTimeout(()=>opciones.comprobar?.(structuredClone(s)),100);
    return {obtener:()=>structuredClone(s),limpiar:()=>clearTimeout(timer),ayuda:null};
  }
  const anterior={inicial:M.inicial,completa:M.completa,errores:M.errores,mostrar:M.mostrar};
  M.inicial=(tipo,c)=>tipo==='cerradura'&&c.version===2?inicial(c):anterior.inicial(tipo,c);
  M.completa=(tipo,c,s)=>tipo==='cerradura'&&c.version===2?alineada(c,s)&&transmisiones.includes(s?.transmision)&&s.abierta===true:anterior.completa(tipo,c,s);
  M.errores=(tipo,c)=>tipo==='cerradura'&&c.version===2?(!valida(c)?[revision(c).error]:!referenciaValida(c)?['recalcula la solución de referencia para estas posiciones']:[]):anterior.errores(tipo,c);
  M.mostrar=(padre,reto,opciones)=>reto.tipo==='cerradura'&&JSON.parse(reto.configuracion).version===2?mostrar(padre,reto,opciones):anterior.mostrar(padre,reto,opciones);
  ER.cerradura4={conexiones,mod,inicial,girar,aplicar,ruta,revision,alineada,valida,referenciaValida,capitulo,campana,pista,giros};
}();
