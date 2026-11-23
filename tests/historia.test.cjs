const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const root=path.resolve(__dirname,'..');global.window=global;
for(const file of ['escape-room.js','calendario-publicado.js'])vm.runInThisContext(fs.readFileSync(path.join(root,file),'utf8'),{filename:file});
const ER=EscapeRoom,datos=ER.calendario(CALENDARIO_PUBLICADO);
const anterior=JSON.parse(fs.readFileSync(path.join(__dirname,'fixtures/campana-validada-a52349d.json'),'utf8'));
const antigua=ER.calendario(anterior);
assert.equal(antigua.experiencia.historiaActiva,false);
assert.equal(antigua.capitulos[0].transicion,'');
assert.equal(ER.progreso({introduccionVista:true,resueltos:[1,2]}).historiaVista,false);
assert.equal(ER.progreso({historiaVista:true}).historiaVista,true);
assert.deepEqual(ER.calendario(JSON.parse(JSON.stringify(datos))),datos,'Los textos sobreviven al respaldo y a la importación');
assert.equal(datos.partida,anterior.partida,'El almacenamiento de Cintia no cambia');
for(const [i,c]of datos.capitulos.entries()){
  for(const campo of Object.keys(anterior.capitulos[i]))assert.deepEqual(c[campo],anterior.capitulos[i][campo],'Se conserva día '+(i+1)+': '+campo);
  assert(c.contexto&&c.transicion,'Todos los días tienen contexto y transición');
  assert(!/llave|Tamagotchi/i.test(c.transicion+c.descubrimientoTexto),'El relato no duplica llaves ni anticipa el regalo');
  assert(c.transicion.split(/(?<=[.!?])\s+/).length<=2,'Transiciones de una o dos frases');
}
assert.deepEqual(ER.descubrimientos(datos,ER.progreso()),[],'Sin descubrimientos antes de resolver');
for(const n of [1,6,12,18,24]){
  const progreso=ER.progreso({resueltos:ER.dias.slice(0,n),introduccionVista:true,historiaVista:true,
    interacciones:{8:{seleccionados:[2,4]}},desenlace:{etapa:6,confirmado:true,nombre:'Lumi'}});
  const restaurado=ER.progreso(JSON.parse(JSON.stringify(progreso)));
  assert.deepEqual(restaurado,progreso,'La recarga conserva tanto la historia como los mecanismos y el desenlace');
  const diario=ER.descubrimientos(datos,restaurado);
  assert.deepEqual(diario.map(x=>x.dia),ER.dias.slice(0,n),'Cuaderno ordenado y sin anticipar días');
  assert.deepEqual(diario.filter(x=>x.texto).map(x=>x.dia),[6,12,18,24].filter(x=>x<=n),'Cuatro revelaciones principales');
}
// Una partida anterior gana su diario a partir de los días ya resueltos, sin migrar ni perder datos.
assert.equal(ER.descubrimientos(datos,ER.progreso({resueltos:ER.dias.slice(0,12)})).length,12);
assert.equal(ER.estado(1,'2026-11-23',ER.progreso({historiaVista:true})),'futura');
assert.equal(ER.estado(9,'2026-12-08',ER.progreso({resueltos:ER.dias.slice(0,8)})),'futura');
assert.equal(ER.estado(9,'2026-12-09',ER.progreso({resueltos:ER.dias.slice(0,8)})),'disponible');
assert.equal(datos.capitulos[23].combinacion,'3946');
const experiencia=fs.readFileSync(path.join(root,'experiencias.js'),'utf8');
assert.match(experiencia,/if\(etapa===6&&s\.confirmado&&!revalidando\)\{\s*if\(config\.revelacion\)/,'La revelación del regalo espera al código del paquete');
console.log('PASS: historia completa, respaldo compatible, progreso anterior conservado, 24 descubrimientos ordenados, cuatro revelaciones y regalo reservado al paquete.');
