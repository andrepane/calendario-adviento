!function(){
  'use strict';
  const ER=window.EscapeRoom,datos=ER.calendario(window.CALENDARIO_PUBLICADO),clave='adviento-prueba-online-'+datos.partida;
  const marco=document.getElementById('partida-prueba'),selector=document.getElementById('dia-prueba'),estado=document.getElementById('estado-prueba');
  const origen=location.protocol==='file:'?'*':location.origin;
  let guardado;try{guardado=JSON.parse(localStorage.getItem(clave));}catch{}
  let dia=ER.dias.includes(guardado?.dia)?guardado.dia:1,avance=ER.progreso(guardado?.avance);
  for(const n of ER.dias)selector.add(new Option('Día '+n,n));selector.value=String(dia);
  function guardar(){try{localStorage.setItem(clave,JSON.stringify({dia,avance}));estado.textContent='Día '+dia+' · progreso de prueba guardado en este navegador.';}catch{estado.textContent='El navegador no permite guardar. Puedes seguir probando durante esta visita.';}}
  function cargar(){document.getElementById('ajustes').open=false;guardar();marco.src='./index.html?prueba=online';}
  document.getElementById('empezar-dia').addEventListener('click',()=>{
    dia=Number(selector.value);avance=ER.progreso({resueltos:ER.dias.filter(n=>n<dia),introduccionVista:dia>1,historiaVista:avance.historiaVista||dia>1});cargar();
  });
  document.getElementById('repetir-historia').addEventListener('click',()=>{
    document.getElementById('ajustes').open=false;
    marco.contentWindow.postMessage({tipo:'escape-historia'},origen);
  });
  document.getElementById('reiniciar-online').addEventListener('click',()=>{dia=1;selector.value='1';avance=ER.progreso();cargar();});
  window.addEventListener('message',evento=>{
    if(evento.source!==marco.contentWindow||evento.origin!==(origen==='*'?'null':origen))return;
    if(evento.data?.tipo==='escape-listo')marco.contentWindow.postMessage({tipo:'escape-iniciar',datos,fecha:'2026-12-24',avance,abrirDia:dia},origen);
    else if(evento.data?.tipo==='escape-progreso'){avance=ER.progreso(evento.data.avance);guardar();}
  });
  cargar();
}();
