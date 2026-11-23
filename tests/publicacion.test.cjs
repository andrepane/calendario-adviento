const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.resolve(__dirname,'..');global.window=global;
for(const file of ['escape-room.js','calendario-publicado.js','recursos-reto.js','retos-avanzados.js','mecanismos.js','experiencias.js','cerradura-transmisiones.js','vista-reto.js'])vm.runInThisContext(fs.readFileSync(path.join(root,file),'utf8'),{filename:file});
const ER=EscapeRoom,actual=ER.calendario(CALENDARIO_PUBLICADO),validada=JSON.parse(fs.readFileSync(path.join(__dirname,'fixtures/campana-validada-a52349d.json'),'utf8'));
assert.deepEqual(actual,validada,'Los 24 retos y el desenlace deben coincidir con la prueba validada a52349d');
assert.equal(actual.partida,'caja-adviento-v4','Se conserva la clave de progreso real ya publicada');
assert.equal(actual.capitulos[3].titulo,'Las tuberías congeladas');assert.equal(actual.capitulos[3].tipo,'tuberias');
assert.equal(actual.capitulos[23].combinacion,'3946');assert(actual.experiencia.final);
for(const dia of ER.dias)assert.deepEqual(ER.errores(actual,dia),[],'Configuración válida del día '+dia);
const tuberias=JSON.parse(actual.capitulos[3].configuracion);assert(ER.mecanismos.completa('tuberias',tuberias,{giros:tuberias.solucion}));
const cerradura=JSON.parse(actual.capitulos[0].configuracion);assert.equal(cerradura.inicio.length,4);assert(ER.cerradura4.referenciaValida(cerradura));assert.equal(ER.cerradura4.revision(cerradura).minimo,16);
const prueba=fs.readFileSync(path.join(root,'prueba-online.js'),'utf8'),app=fs.readFileSync(path.join(root,'app.js'),'utf8');
assert.match(prueba,/datos\s*=\s*ER\.calendario\(window\.CALENDARIO_PUBLICADO\)/);assert.match(app,/datos\s*=\s*ER\.calendario\(window\.CALENDARIO_PUBLICADO\)/);
assert(!/CAMPANA_MECANISMOS|\.campana\(/.test(prueba),'La prueba no construye otra campaña');
assert.match(prueba,/marco\.src='\.\/index\.html\?prueba=online'/);assert.match(prueba,/adviento-prueba-online-/);assert.match(app,/adviento-escape-2026-/);
const excluidos=fs.readFileSync(path.join(root,'.vercelignore'),'utf8').split(/\r?\n/).filter(Boolean);
const requeridos=new Set(['campana-mecanismos.js']);
for(const pagina of ['index.html','prueba.html']){
  const html=fs.readFileSync(path.join(root,pagina),'utf8');for(const match of html.matchAll(/(?:src|href)="\.\/([^"?]+)(?:\?[^\"]*)?"/g))if(/\.(?:js|css)$/.test(match[1]))requeridos.add(match[1]);
}
for(const f of requeridos){assert(fs.existsSync(path.join(root,f)),f+' debe existir');assert(!excluidos.includes(f),f+' debe incluirse en el despliegue');}
for(const resueltos of [[1,2,3],ER.dias]){
  const anterior={abiertos:[...resueltos],resueltos,pistas:{1:2},interacciones:{1:{version:2,actual:{posiciones:[3,1,0,0],transmision:'B'}}},introduccionVista:true,desenlace:{etapa:6,confirmado:true,nombre:'Lumi'}};
  const restaurado=ER.progreso(JSON.parse(JSON.stringify(anterior)));
  for(const campo of ['resueltos','pistas','interacciones','introduccionVista','desenlace'])assert.deepEqual(restaurado[campo],anterior[campo],campo+' se conserva');
  const claveAnterior='adviento-escape-2026-caja-adviento-v4';assert.equal('adviento-escape-2026-'+actual.partida,claveAnterior);
}
assert.equal(ER.estado(1,'2026-11-23',ER.progreso()),'futura');
assert.equal(ER.estado(2,'2026-12-01',ER.progreso({resueltos:[1]})),'futura');
assert.equal(ER.estado(2,'2026-12-02',ER.progreso()),'sin-llave');
assert.equal(ER.estado(2,'2026-12-02',ER.progreso({resueltos:[1]})),'disponible');
assert.equal(ER.estado(24,'2026-12-24',ER.progreso({resueltos:ER.dias.slice(0,23)})),'disponible');
for(const reto of actual.capitulos.slice(0,23)){
  const llave='Has ganado la llave del día siguiente.';
  const mensaje=ER.vista.mensajeAcierto(reto.acierto,llave);
  assert.equal(((mensaje+' '+llave).match(/llave/gi)??[]).length,1,'Una sola entrega de llave: '+reto.titulo);
}
assert.equal(ER.vista.mensajeAcierto('Mecanismo resuelto. Ya tienes la siguiente llave.','Has ganado la llave del día 5.'),'');
assert.equal(ER.vista.mensajeAcierto('La casa despierta. Has ganado la llave del día 2.','Llave del día 2.'),'La casa despierta.');
console.log('PASS: 24 retos idénticos a la prueba validada, fuente única real/prueba, tuberías y cerradura, recursos incluidos, fechas/llaves, progreso anterior compatible y éxito sin duplicados.');
