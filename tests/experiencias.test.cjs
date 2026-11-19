const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
global.window=global;
const root=path.resolve(__dirname,'..');
for(const archivo of ['escape-room.js','calendario-publicado.js','mecanismos.js','experiencias.js'])vm.runInThisContext(fs.readFileSync(path.join(root,archivo),'utf8'),{filename:archivo});
const ER=EscapeRoom,E=ER.experiencias,M=ER.mecanismos;
const original=structuredClone(CALENDARIO_PUBLICADO),nueva=E.campana(original),c=JSON.parse(nueva.capitulos[0].configuracion);
assert.deepEqual(original,CALENDARIO_PUBLICADO,'Crear la campaña no modifica el origen');
assert.deepEqual(nueva.capitulos.slice(1),ER.calendario(original).capitulos.slice(1),'Se conservan los otros 23 retos');
assert.equal(nueva.capitulos[23].combinacion,original.capitulos[23].combinacion);
assert.equal(E.ruta(c).length,6);
// Verificación independiente de la distancia: desacoplar los giros netos de las tres ruedas.
const mod=n=>((n%6)+6)%6,coste=n=>Math.min(mod(n),6-mod(n));
for(let a=0;a<6;a++)for(let b=0;b<6;b++)for(let d=0;d<6;d++){
  const inicio=[a,b,d],objetivos=[4,2,1],config={inicio,objetivos},ruta=E.ruta(config);
  const exterior=objetivos[0]-a,central=objetivos[1]-b-exterior,interior=objetivos[2]-d-central;
  assert.equal(ruta.length,coste(exterior)+coste(central)+coste(interior));
  let s=M.inicial('cerradura',config);for(const paso of ruta)s=E.girar(s,paso.rueda,paso.sentido);
  assert(E.alineada(config,s));assert(!M.completa('cerradura',config,s),'Alinear no abre el pestillo');
  assert(M.completa('cerradura',config,{...s,abierta:true}));
  assert.deepEqual(JSON.parse(JSON.stringify(s)),s,'Se puede restaurar el estado serializado');
}
for(let rueda=0;rueda<3;rueda++){
  const inicial={posiciones:[3,0,3],giros:[3,0,3],abierta:false};
  assert.deepEqual(E.girar(E.girar(inicial,rueda,1),rueda,-1),inicial);
}
assert(M.errores('cerradura',{inicio:[6,0,0],objetivos:[0,0,0]}).length);
assert.equal(ER.estado(2,'2026-12-01',ER.progreso({resueltos:[1]})),'futura');
assert.equal(ER.estado(2,'2026-12-02',ER.progreso({resueltos:[1]})),'disponible');
const copia=ER.calendario(JSON.parse(JSON.stringify(nueva)));assert.deepEqual(copia,nueva,'El respaldo conserva toda la configuración');
for(let etapa=0;etapa<=6;etapa++){
  const p=ER.progreso({resueltos:ER.dias,desenlace:{etapa,confirmado:etapa===6,nombre:'Lumi'},introduccionVista:true});
  assert(p.resueltos.includes(24));assert.equal(p.desenlace.etapa,etapa);assert.equal(p.desenlace.nombre,'Lumi');assert(p.introduccionVista);
}
console.log('PASS: 216 búsquedas contrastadas con distancias independientes, acoplamientos, pestillo, fecha, respaldo y etapas del final.');
