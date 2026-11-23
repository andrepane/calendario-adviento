!function(){
  'use strict';
  const ER=window.EscapeRoom, M=ER.mecanismos;
  const mod=n=>((n%6)+6)%6;
  const el=(tag,text='',clase='')=>{const n=document.createElement(tag);n.textContent=text;n.className=clase;return n;};
  const btn=(texto,fn)=>{const b=el('button',texto,'control-reto');b.type='button';b.addEventListener('click',fn);return b;};
  const svg=(tag,attrs={})=>{const n=document.createElementNS('http://www.w3.org/2000/svg',tag);for(const [k,v]of Object.entries(attrs))n.setAttribute(k,v);return n;};
  const reducido=()=>matchMedia('(prefers-reduced-motion: reduce)').matches||document.documentElement.classList.contains('movimiento-reducido');
  function girar(s,rueda,sentido){
    const posiciones=[...s.posiciones],giros=[...(s.giros??s.posiciones)];
    for(const i of rueda===0?[0,1]:rueda===1?[1,2]:[2]){posiciones[i]=mod(posiciones[i]+sentido);giros[i]+=sentido;}
    return {...s,posiciones,giros,abierta:false};
  }
  function ruta(c){
    const cola=[{p:[...c.inicio],ruta:[]}],vistos=new Set([c.inicio.join(',')]);
    for(let n=0;n<cola.length;n++){
      const actual=cola[n];if(actual.p.every((v,i)=>v===c.objetivos[i]))return actual.ruta;
      for(let rueda=0;rueda<3;rueda++)for(const sentido of [-1,1]){
        const p=girar({posiciones:actual.p},rueda,sentido).posiciones,k=p.join(',');
        if(!vistos.has(k)){vistos.add(k);cola.push({p,ruta:[...actual.ruta,{rueda,sentido}]});}
      }
    }
    return null;
  }
  function configValida(c){return [c?.inicio,c?.objetivos].every(a=>Array.isArray(a)&&a.length===3&&a.every(n=>Number.isInteger(n)&&n>=0&&n<6));}
  function alineada(c,s){return configValida(c)&&Array.isArray(s?.posiciones)&&s.posiciones.length===3&&s.posiciones.every((v,i)=>Number.isInteger(v)&&v===c.objetivos[i]);}
  function campana(base){
    const nueva=ER.calendario(structuredClone(base));nueva.partida='caja-adviento-v4';nueva.experiencia.final=true;
    nueva.capitulos[0]=ER.capitulo({listo:true,tipo:'cerradura',titulo:'La cerradura de las tres ruedas',
      instrucciones:'Alinea las tres muescas con el pestillo. Algunas ruedas arrastran a otras.',
      configuracion:JSON.stringify({inicio:[3,0,3],objetivos:[0,0,0]},null,2),
      pistas:['La rueda exterior arrastra a la central. La central arrastra a la interior.','Empieza por la rueda exterior y termina por la interior.','Puedes retroceder. Cada pulso cuenta como un giro.'],
      acierto:'La casa despierta. Has ganado la llave del día 2.'});
    return nueva;
  }
  function cerradura(padre,reto,opciones){
    const c=JSON.parse(reto.configuracion),guardado=opciones.interaccion;
    let s=configValida({inicio:guardado?.actual?.posiciones,objetivos:c.objetivos})?structuredClone(guardado.actual):{posiciones:[...c.inicio],giros:[...c.inicio],abierta:false};
    let historial=Array.isArray(guardado?.historial)?guardado.historial.slice(-100):[],timer;
    const caja=el('section','','cerradura-mecanica'),dibujo=svg('svg',{viewBox:'0 0 330 280',role:'img','aria-label':'Cerradura de tres ruedas. Las aberturas deben apuntar al pestillo de la derecha.'});
    dibujo.append(svg('rect',{x:5,y:5,width:320,height:270,rx:20,fill:'#373e39',stroke:'#aa8c55','stroke-width':4}));
    const ruedas=[];
    [104,76,48].forEach((r,i)=>{
      const g=svg('g',{'data-rueda-cerradura':i,class:'aro-cerradura'}),a=14*Math.PI/180;
      const x=140+r*Math.cos(a),y=140+r*Math.sin(a),xx=140+r*Math.cos(-a),yy=140+r*Math.sin(-a);
      g.append(svg('path',{d:`M${x} ${y} A${r} ${r} 0 1 1 ${xx} ${yy}`,fill:'none',stroke:['#b39564','#ddc18a','#a28a64'][i],'stroke-width':20,'stroke-linecap':'butt'}));
      for(let j=1;j<6;j++){const t=j*Math.PI/3;g.append(svg('circle',{cx:140+r*Math.cos(t),cy:140+r*Math.sin(t),r:2.5,fill:'#534635'}));}
      dibujo.append(g);ruedas.push(g);
    });
    dibujo.append(svg('circle',{cx:140,cy:140,r:24,fill:'#705c3e',stroke:'#ddc18a','stroke-width':3}));
    const pestillo=svg('rect',{x:257,y:132,width:60,height:16,rx:3,fill:'#e2c58c',stroke:'#76613c','stroke-width':2});dibujo.append(pestillo);
    const estado=el('p','','estado-cerradura');estado.setAttribute('role','status');
    const controles=el('div','','controles-ruedas');
    ['Exterior','Central','Interior'].forEach((nombre,i)=>{
      const fila=el('div'),izquierda=btn('↶',()=>actuar(girar(s,i,-1))),derecha=btn('↷',()=>actuar(girar(s,i,1)));
      izquierda.setAttribute('aria-label','Girar '+nombre.toLowerCase()+' a la izquierda');derecha.setAttribute('aria-label','Girar '+nombre.toLowerCase()+' a la derecha');
      fila.append(el('span',nombre),izquierda,derecha);controles.append(fila);
    });
    const deslizar=btn('Deslizar pestillo →',abrir);deslizar.classList.add('pestillo-control');
    deslizar.setAttribute('aria-label','Deslizar pestillo: arrastra a la izquierda o pulsa para abrir');
    let origen,arrastrado=false;
    deslizar.addEventListener('pointerdown',e=>{origen=e.clientX;arrastrado=false;deslizar.setPointerCapture(e.pointerId);});
    deslizar.addEventListener('pointermove',e=>{if(origen===undefined)return;const distancia=Math.max(0,Math.min(52,origen-e.clientX));deslizar.style.setProperty('--arrastre',distancia+'px');if(distancia>=30)arrastrado=true;});
    deslizar.addEventListener('pointerup',()=>{const listo=arrastrado;origen=undefined;deslizar.style.removeProperty('--arrastre');if(listo){arrastrado=false;abrir();arrastrado=true;}});
    deslizar.addEventListener('pointercancel',()=>{origen=undefined;deslizar.style.removeProperty('--arrastre');});
    const deshacer=btn('Deshacer',()=>{if(historial.length){s=historial.pop();actualizar();}});
    const reiniciar=btn('Reiniciar',()=>actuar({posiciones:[...c.inicio],giros:[...c.inicio],abierta:false}));
    caja.append(dibujo,estado,controles,deslizar,el('p','Arrastra el pestillo hacia la izquierda o púlsalo. También puedes enfocarlo y pulsar Intro o Espacio.','ayuda'),deshacer,reiniciar);padre.append(caja);
    function actualizar(){
      ruedas.forEach((g,i)=>g.style.transform=`rotate(${((s.giros??s.posiciones)[i]-c.objetivos[i])*60}deg)`);
      const listo=alineada(c,s);caja.classList.toggle('alineada',listo);
      pestillo.setAttribute('x',s.abierta?140:257);pestillo.setAttribute('width',s.abierta?177:60);
      estado.textContent=listo?'Las tres muescas están alineadas. Acciona el pestillo.':'Alinea las aberturas con el pestillo de la derecha.';
      deshacer.disabled=!historial.length;
      opciones.guardarInteraccion?.({actual:structuredClone(s),historial:structuredClone(historial)});
    }
    function actuar(nueva){historial.push(structuredClone(s));historial=historial.slice(-100);s=nueva;actualizar();}
    function abrir(){
      if(arrastrado){arrastrado=false;return;}
      if(!alineada(c,s)){estado.textContent='El pestillo choca con las ruedas. Aún hay una abertura desalineada.';return;}
      s.abierta=true;actualizar();clearTimeout(timer);timer=setTimeout(()=>{if(caja.isConnected)opciones.comprobar?.(structuredClone(s));},reducido()?100:400);
    }
    actualizar();if(s.abierta&&alineada(c,s))timer=setTimeout(()=>opciones.comprobar?.(structuredClone(s)),100);
    return {obtener:()=>structuredClone(s),limpiar:()=>clearTimeout(timer),ayuda:null};
  }
  const anterior={inicial:M.inicial,completa:M.completa,errores:M.errores,mostrar:M.mostrar};
  M.tipos.push('cerradura');
  M.inicial=(tipo,c)=>tipo==='cerradura'?{posiciones:[...c.inicio],giros:[...c.inicio],abierta:false}:anterior.inicial(tipo,c);
  M.completa=(tipo,c,s)=>tipo==='cerradura'?alineada(c,s)&&s.abierta===true:anterior.completa(tipo,c,s);
  M.errores=(tipo,c)=>tipo==='cerradura'?(configValida(c)?[]:['configura tres posiciones entre 0 y 5 para el inicio y el objetivo']):anterior.errores(tipo,c);
  M.mostrar=(padre,reto,opciones)=>reto.tipo==='cerradura'?cerradura(padre,reto,opciones):anterior.mostrar(padre,reto,opciones);

  function estadoFinal(s){return {etapa:Math.max(0,Math.min(6,Number.isInteger(s?.etapa)?s.etapa:0)),confirmado:s?.confirmado===true,nombre:typeof s?.nombre==='string'?s.nombre.slice(0,40):''};}
  function final(padre,config,guardado,guardar){
    let s=estadoFinal(guardado),etapa=s.etapa,timer,revalidando=false;
    const panel=el('section','','habitante'),pantalla=el('div','','pantalla-habitante'),acciones=el('div','','acciones-habitante');
    pantalla.setAttribute('aria-label','Pantalla del habitante de la casa');
    const anuncio=el('p','','estado-habitante');anuncio.setAttribute('role','status');
    const caja=el('div','','caja-fuerte-habitante');
    caja.append(pantalla,el('div','','hoja-caja hoja-izquierda'),el('div','','hoja-caja hoja-derecha'));
    const repetir=btn('Volver a ver la escena',()=>{etapa=0;dibujar();});
    panel.append(el('h3','El habitante de la casa'),caja,anuncio,acciones,repetir);padre.append(panel);
    function persistir(){s.etapa=Math.max(s.etapa,etapa);guardar?.({...s});}
    function ir(n){etapa=n;persistir();dibujar();}
    function despues(n,ms){timer=setTimeout(()=>{if(panel.isConnected)ir(n);},reducido()?160:ms);}
    function criatura(){
      const figura=el('div','','criatura-pixel');figura.setAttribute('role','img');figura.setAttribute('aria-label','Una pequeña criatura con orejas y ojos curiosos');
      // Arte original en una cuadrícula de 16 × 16. Las celdas mantienen bordes nítidos.
      const mapa=['0003300000330000','0034430003443000','0034443334443000','0344444444444300','0344444444444300','3441144441144430','3441144441144430','3444445544444430','0344444444444300','0034444444443000','0003333333330000','0003344004433000'];
      const colores={3:'#304a41',4:'#a9dc9c',1:'#162e2b',5:'#f3bc90'};
      mapa.forEach((fila,y)=>[...fila].forEach((v,x)=>{if(v==='0')return;const p=el('i');p.style.cssText=`left:${x*6.25}%;top:${y*8.333}%;background:${colores[v]}`;figura.append(p);}));return figura;
    }
    function dibujar(){
      clearTimeout(timer);pantalla.replaceChildren();acciones.replaceChildren();pantalla.dataset.etapa=String(etapa);panel.dataset.etapa=String(etapa);
      anuncio.textContent='';
      if(etapa===0){pantalla.append(el('span','•','piloto-apagado'));acciones.append(btn('Encender pantalla',()=>ir(1)));anuncio.textContent='Las dos hojas se abren. Hay una pequeña pantalla apagada.';}
      if(etapa===1){pantalla.append(el('span','INICIANDO…','arranque-pixel'));anuncio.textContent='La pantalla se enciende.';despues(2,800);}
      if(etapa===2){pantalla.append(el('div','','huevo-pixel'));anuncio.textContent='Un huevo se mueve y empieza a agrietarse.';acciones.append(btn('Ver nacimiento',()=>ir(3)));despues(3,2200);}
      if(etapa===3){pantalla.append(criatura(),el('span','✉','nota-cayendo'));anuncio.textContent='La criatura mira alrededor, se acerca al borde y deja caer una nota.';acciones.append(btn('Recoger nota',()=>ir(4)));despues(4,2200);}
      if(etapa>=4){pantalla.append(criatura());if(s.nombre)pantalla.append(el('span',s.nombre,'nombre-pixel'));}
      if(etapa===4){const nota=btn('✉ Leer la nota',()=>ir(5));nota.classList.add('nota-habitante');acciones.append(nota);anuncio.textContent='La nota te está esperando.';}
      if(etapa>=5){const nota=el('article','','nota-habitante');nota.append(el('p',config.nota),el('p',config.pista));acciones.append(nota);}
      if(etapa===5)acciones.append(btn('Ya tengo el paquete',()=>ir(6)));
      if(etapa===6&&(!s.confirmado||revalidando)){
        const form=el('form'),label=el('label','Código que hay dentro del paquete'),input=el('input'),error=el('p');input.name='codigo-paquete';input.autocomplete='off';input.required=true;label.append(input);error.setAttribute('role','status');
        const enviar=el('button','Confirmar paquete','control-reto');enviar.type='submit';form.append(label,enviar,error);
        form.addEventListener('submit',e=>{e.preventDefault();const normal=v=>v.normalize('NFD').replace(/\p{M}/gu,'').trim().toLocaleUpperCase('es');if(normal(input.value)!==normal(config.codigo)){error.textContent='Ese código no coincide. Mira dentro del paquete.';return;}s.confirmado=true;revalidando=false;persistir();dibujar();});acciones.append(form);
      }
      if(etapa===6&&s.confirmado&&!revalidando){
        if(config.revelacion)acciones.append(el('p',config.revelacion,'revelacion-historia'));
        acciones.append(el('p',config.mensaje,'mision-final'));
        if(config.permitirNombre){const form=el('form'),label=el('label','Nombre de tu criatura (opcional)'),input=el('input'),aviso=el('p');input.name='nombre-criatura';input.maxLength=40;input.value=s.nombre;label.append(input);aviso.setAttribute('role','status');const guardarNombre=el('button','Guardar nombre','control-reto');guardarNombre.type='submit';form.append(label,guardarNombre,aviso);form.addEventListener('submit',e=>{e.preventDefault();s.nombre=input.value.trim();persistir();pantalla.querySelector('.nombre-pixel')?.remove();if(s.nombre)pantalla.append(el('span',s.nombre,'nombre-pixel'));aviso.textContent=s.nombre?'Nombre guardado: '+s.nombre:'Nombre borrado.';});acciones.append(form);}
        acciones.append(btn('Introducir el código de nuevo',()=>{revalidando=true;dibujar();}));
      }
    }
    dibujar();return ()=>clearTimeout(timer);
  }

  function introduccion(portada,calendario,config,{vista=false,guardar=()=>{},terminar=()=>{}}={}){
    calendario.style.animation='none';
    const escena=calendario.querySelector('.escena'),ancla=document.createComment('casa del calendario');escena.before(ancla);
    let timer,animacion,fundido,abriendo=false;
    portada.replaceChildren();portada.className='entrada-caja';
    const perspectiva=el('div','','perspectiva-caja'),caja=el('div','','caja-adviento'),interior=el('div','','interior-caja'),tapa=el('div','','tapa-caja'),fuera=el('div','','tapa-exterior'),dentro=el('div','','tapa-interior');
    const nombre=el('h1','Para Cintia');nombre.id='dedicatoria';fuera.append(nombre);tapa.append(fuera,dentro);
    interior.append(escena);caja.append(interior,tapa);perspectiva.append(caja);
    const cierre=btn('Abrir cierre',abrir);cierre.className='cierre-metalico';cierre.setAttribute('aria-label','Abrir el cierre de la caja');caja.append(cierre);
    const saltar=btn('Saltar',()=>finalizar(true));saltar.classList.add('saltar-introduccion');portada.append(perspectiva,saltar);
    function encajar(){
      if(portada.hidden)return;
      const escala=Math.min(interior.clientWidth/escena.offsetWidth,interior.clientHeight/escena.offsetHeight)*.92;
      escena.style.transform=`translate(-50%,-50%) scale(${escala})`;
    }
    const observador=new ResizeObserver(encajar);observador.observe(interior);
    function colocar(){
      animacion?.cancel();fundido?.cancel();portada.style.cssText='';
      ancla.after(escena);escena.style.cssText='';calendario.hidden=false;
      const ancho=escena.getBoundingClientRect().width;
      portada.hidden=false;calendario.hidden=true;interior.append(escena);escena.inert=true;
      escena.style.cssText=`position:absolute;left:50%;top:50%;margin:0;width:${ancho}px`;
      encajar();portada.classList.remove('caja-abierta','acercando');abriendo=false;cierre.disabled=false;
    }
    function finalizar(inmediato=false){
      clearTimeout(timer);animacion?.cancel();
      const desde=escena.getBoundingClientRect();
      escena.style.cssText='';ancla.after(escena);escena.inert=false;calendario.hidden=false;
      if(inmediato){portada.hidden=true;portada.style.cssText='';}
      else{
        portada.style.cssText='position:fixed;inset:0;z-index:20;pointer-events:none';escena.style.zIndex='21';
        fundido=portada.animate([{opacity:1},{opacity:0}],{duration:reducido()?180:850,easing:'ease-out'});
        fundido.finished.then(()=>{portada.hidden=true;portada.style.cssText='';escena.style.zIndex='';},()=>{});
      }
      if(!inmediato&&!reducido()){
        const hasta=escena.getBoundingClientRect();
        animacion=escena.animate([{transformOrigin:'0 0',transform:`translate(${desde.left-hasta.left}px,${desde.top-hasta.top}px) scale(${desde.width/hasta.width},${desde.height/hasta.height})`},{transformOrigin:'0 0',transform:'none'}],{duration:850,easing:'cubic-bezier(.2,.7,.2,1)'});
      }
      guardar();terminar();
    }
    function abrir(){if(abriendo)return;abriendo=true;cierre.disabled=true;portada.classList.add('caja-abierta');timer=setTimeout(()=>{portada.classList.add('acercando');finalizar();},reducido()?180:2100);}
    function repetir(){colocar();cierre.focus({preventScroll:true});}
    if(vista||config.introduccion===false)finalizar(true);else colocar();
    return {repetir,limpiar:()=>{observador.disconnect();clearTimeout(timer);animacion?.cancel();fundido?.cancel();portada.style.cssText='';escena.style.cssText='';if(!calendario.contains(escena))ancla.after(escena);ancla.remove();}};
  }
  function historia(config,{guardar=()=>{},terminar=()=>{}}={}){
    const dialogo=el('dialog','','historia-entrada');
    dialogo.setAttribute('aria-labelledby','titulo-historia');
    const cabecera=el('header','','cabecera-historia');
    const cerrar=btn('×',()=>dialogo.close());cerrar.classList.add('cerrar-historia');cerrar.setAttribute('aria-label','Volver al calendario');
    cabecera.append(el('p','ARCHIVO DE LA CASA · DICIEMBRE','sello-historia'),cerrar);
    const dibujo=el('div','','pedestal-historia');
    dibujo.setAttribute('role','img');dibujo.setAttribute('aria-label','Un pedestal vacío, con la huella ovalada que dejó el huevo y una nota al lado');
    dibujo.innerHTML='<svg viewBox="0 0 360 128" aria-hidden="true"><defs><linearGradient id="piedra-historia" x2="0" y2="1"><stop stop-color="#776e60"/><stop offset="1" stop-color="#313e40"/></linearGradient></defs><path d="M110 58h140l-13 61H123z" fill="url(#piedra-historia)" stroke="#c7a574"/><ellipse cx="180" cy="58" rx="73" ry="24" fill="#384747" stroke="#c7a574"/><ellipse cx="180" cy="56" rx="23" ry="15" fill="#18282d" stroke="#efd6a1" stroke-dasharray="3 4"/><path d="M273 71l43-8 8 37-43 8z" fill="#ecd5a9"/><path d="M283 78l22-4m-20 11 22-4m-20 11 15-3" stroke="#866341"/><path d="M71 31v10m-5-5h10m211-13v8m-4-4h8" stroke="#f0c78e"/></svg>';
    const titulo=el('h2',config.historiaTitulo);titulo.id='titulo-historia';titulo.tabIndex=-1;
    const nota=el('div','','texto-historia');
    for(const parrafo of config.historiaTexto.split(/\n\s*\n/).filter(Boolean))nota.append(el(parrafo.startsWith('«')?'blockquote':'p',parrafo));
    let examinar=false;
    const pie=el('footer'),empezar=btn(config.historiaBoton||'Examinar la cerradura',()=>{examinar=true;guardar();dialogo.close();});
    pie.append(empezar);dialogo.append(cabecera,dibujo,titulo,nota,pie);document.body.append(dialogo);
    dialogo.addEventListener('close',()=>{dialogo.remove();terminar(examinar);},{once:true});
    dialogo.showModal();dialogo.scrollTop=0;titulo.focus({preventScroll:true});
    return {limpiar:()=>{dialogo.remove();}};
  }
  ER.experiencias={girar,ruta,alineada,configValida,campana,final,estadoFinal,introduccion,historia};
}();
