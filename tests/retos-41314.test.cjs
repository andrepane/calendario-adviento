const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
global.window=global;
for(const f of ['escape-room.js','calendario-publicado.js','recursos-reto.js','retos-avanzados.js','mecanismos.js','experiencias.js','cerradura-transmisiones.js'])vm.runInThisContext(fs.readFileSync(path.join(__dirname,'..',f),'utf8'));
const E=EscapeRoom,M=E.mecanismos,d=E.calendario(CALENDARIO_PUBLICADO);
const tub=JSON.parse(d.capitulos[3].configuracion),vit=JSON.parse(d.capitulos[13].configuracion),frase=JSON.parse(d.capitulos[12].configuracion);
assert.equal(tub.lado,6);assert.equal(tub.piezas.length,36);
assert(M.flujo(tub,tub.solucion).completa);assert(!M.completa('tuberias',tub,M.inicial('tuberias',tub)));
// Busca recorridos independientemente de flujo(): una pieza de dos bocas obliga a salir por la otra.
function recorridos(c){
  const rutas=[];
  function buscar(id,entra,vistos,ruta){
    const pieza=c.piezas[id],alternativas=new Map();
    for(let g=0;g<(pieza.fija?1:4);g++){
      const bocas=pieza.puertos.map(p=>(p+g)%4).sort();alternativas.set(bocas.join(','),bocas);
    }
    for(const bocas of alternativas.values()){
      if(!bocas.includes(entra))continue;
      const sale=bocas.find(p=>p!==entra);
      if(id===c.caldera){if(sale===1&&c.valvulas.every(v=>vistos.has(v)))rutas.push([...ruta,id]);continue;}
      const y=Math.floor(id/c.lado),x=id%c.lado,[dy,dx]=[[-1,0],[0,1],[1,0],[0,-1]][sale];
      if(y+dy<0||y+dy>=c.lado||x+dx<0||x+dx>=c.lado)continue;
      const vecino=(y+dy)*c.lado+x+dx;
      if(vecino===c.rota||vistos.has(vecino))continue;
      buscar(vecino,(sale+2)%4,new Set([...vistos,vecino]),[...ruta,id]);
    }
  }
  buscar(c.entrada,3,new Set([c.entrada]),[]);return rutas;
}
const rutas=recorridos(tub);assert.equal(rutas.length,1,'Un único recorrido de agua, sin atajos');assert.equal(rutas[0].length,35);
assert.equal(rutas[0].filter(i=>!tub.piezas[i].fija).length,31);
for(const id of rutas[0].filter(i=>!tub.piezas[i].fija)){
  const p=tub.piezas[id],antes=p.puertos.map(d=>(d+p.giro)%4).sort().join(),despues=p.puertos.slice().sort().join();
  assert.notEqual(antes,despues,'Cada una de las 31 piezas móviles del recorrido empieza girada');
}
assert.deepEqual(E.especiales.errores(d.capitulos[12]),[]);
const sinElegir=E.especiales.estadoAhorcado(frase,[]);
for(const [i,l]of [...frase.palabra].entries())if(l===' ')assert(sinElegir.descubiertas[i],'Los espacios se muestran desde el principio');
assert.equal(sinElegir.fallos,0);assert(!sinElegir.ganada);
const letras=[...new Set(frase.palabra.replace(/ /g,''))];
assert(E.acertada(d.capitulos[12],letras));assert(!E.acertada(d.capitulos[12],[]));
assert(E.especiales.estadoAhorcado(frase,letras).ganada);
assert.equal(E.especiales.estadoAhorcado(frase,['Z','Z']).fallos,1,'No se cuentan letras repetidas como dos fallos');
assert(E.especiales.estadoAhorcado({palabra:'¡YA ES NAVIDAD!',inicial:1,fallos:8},[...'YAESNVID']).ganada,'Los signos no deben adivinarse');
assert.equal(E.especiales.estadoAhorcado({palabra:'DOS PALABRAS',inicial:0,fallos:2},['Z','X']).perdida,true);
// Enumera las 384 parejas/orientaciones del vitral con un cálculo de sombras independiente.
function soluciones(objetivo){
  const lista=[];
  for(let a=0;a<4;a++)for(let b=a+1;b<4;b++)for(let x=0;x<8;x++)for(let y=0;y<8;y++){
    const resultado=Array.from({length:8},(_,i)=>vit.discos[a].opaco[(i-x+8)%8]||vit.discos[b].opaco[(i-y+8)%8]);
    if(resultado.every((v,i)=>v===objetivo[i]))lista.push({discos:[a,b],giros:vit.discos.map((_,i)=>i===a?x:i===b?y:0)});
  }
  return lista;
}
assert.equal(vit.sectores,8);assert(vit.discos.every(d=>d.opaco.some(Boolean)&&d.opaco.some(v=>!v)),'Sin discos vacíos ni completamente opacos');
const actual=M.inicial('vitral',vit);assert(!M.completa('vitral',vit,actual));
for(const modelo of vit.modelos){
  const lista=soluciones(modelo.opaco);assert.equal(lista.length,1,modelo.nombre+' tiene una solución única');
  assert.deepEqual(lista,M.solucionesVitral(vit,modelo.opaco));assert.deepEqual(lista[0],vit.soluciones[modelo.id]);
  actual.modelos[modelo.id]=lista[0];
}
assert(M.completa('vitral',vit,actual));assert(M.completa('vitral',vit,JSON.parse(JSON.stringify(actual))));
const manipulado=structuredClone(actual);manipulado.modelos[vit.modelos[0].id].giros[0]=(manipulado.modelos[vit.modelos[0].id].giros[0]+1)%8;assert(!M.completa('vitral',vit,manipulado));
assert.deepEqual(d.capitulos[13].evidenciaTexto,'Nueva → Creciente → Llena → Menguante.');
assert(d.capitulos[15].dependencias.includes('evidencia-14'));
assert.equal(d.capitulos[23].combinacion,'3946');
for(const dia of [4,13,14]){
  assert.deepEqual(E.errores(d,dia),[]);
  const avance=E.progreso({resueltos:E.dias.slice(0,dia)});
  assert.equal(E.estado(dia+1,E.fechaPuerta(dia),avance),'futura');
  assert.equal(E.estado(dia+1,E.fechaPuerta(dia+1),avance),'disponible');
}
// Los vitral y ahorcado de respaldos antiguos continúan siendo válidos.
const anterior=JSON.parse(fs.readFileSync(path.join(__dirname,'fixtures/campana-validada-a52349d.json'),'utf8'));
assert.deepEqual(E.especiales.errores(anterior.capitulos[12]),[]);assert.deepEqual(E.especiales.errores(anterior.capitulos[13]),[]);
assert.equal(d.partida,anterior.partida);
console.log('PASS: tuberías con recorrido único de 35 casillas y 31 ajustes, ahorcado por frase con separadores, cuatro modelos ópticos únicos, fechas/llaves y evidencias compatibles.');
