const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
global.window=global;
const root=path.resolve(__dirname,'..');for(const f of ['escape-room.js','calendario-publicado.js','mecanismos.js','experiencias.js','cerradura-transmisiones.js'])vm.runInThisContext(fs.readFileSync(path.join(root,f),'utf8'),{filename:f});
const ER=EscapeRoom,C=ER.cerradura4,c=JSON.parse(C.capitulo().configuracion),mod=n=>((n%8)+8)%8;
// Motor independiente, escrito a partir de las reglas, con selector como parte del estado.
const vectores=[[[1,-1,0,0],[0,0,1,-1]],[[0,1,1,0],[0,0,0,1]]];
const codificar=(p,t)=>p[0]+8*p[1]+64*p[2]+512*p[3]+4096*t;
const decodificar=n=>[n%8,(n>>3)%8,(n>>6)%8,(n>>9)%8];
function buscar(inicio,permitidas=[0,1]){
  const d=new Int16Array(8192).fill(-1),cola=new Map([[0,codificar(inicio,0)]]);let izquierda=0,derecha=1;d[codificar(inicio,0)]=0;
  while(izquierda<derecha){
    const k=cola.get(izquierda);cola.delete(izquierda++);const p=decodificar(k),t=k>>12;
    const cambiar=codificar(p,1-t);
    if(d[cambiar]<0||d[cambiar]>d[k]){d[cambiar]=d[k];cola.set(--izquierda,cambiar);}
    if(!permitidas.includes(t))continue;
    for(const v of vectores[t])for(const signo of [-1,1]){
      const q=p.map((n,i)=>mod(n+v[i]*signo)),j=codificar(q,t);
      if(d[j]<0||d[j]>d[k]+1){d[j]=d[k]+1;cola.set(derecha++,j);}
    }
  }
  return d;
}
const distancia=buscar(c.objetivos);assert.equal(distancia[codificar(c.inicio,0)],16);
for(let n=0;n<4096;n++){
  const p=decodificar(n),d=p.map((v,i)=>c.objetivos[i]-v),a=d[0],exteriorB=d[1]+a,interiorA=d[2]-exteriorB,interiorB=d[3]+interiorA;
  const cuenta=[a,exteriorB,interiorA,interiorB].reduce((s,v)=>s+Math.min(mod(v),8-mod(v)),0);
  assert.equal(distancia[n],cuenta);assert.equal(distancia[n+4096],cuenta);
  if(n%31===0)for(const transmision of ['A','B']){
    const s={posiciones:p,giros:p,transmision,movimientos:0,abierta:false},ruta=C.ruta(c,s);assert.equal(C.giros(ruta),cuenta);
    let actual=s;for(const paso of ruta){actual=C.aplicar(c,actual,paso);assert(actual);}assert(C.alineada(c,actual));assert(actual.abierta);
  }
}
for(const permitidas of [[0],[1]])assert.equal(buscar(c.inicio,permitidas)[codificar(c.objetivos,0)],-1,'Una sola transmisión no basta');
for(const [t,transmision]of ['A','B'].entries())for(const [i,control]of ['exterior','interior'].entries())for(const signo of [-1,1]){
  const s={posiciones:[0,0,0,0],giros:[0,0,0,0],transmision,movimientos:0,abierta:false},nuevo=C.girar(s,control,signo);
  assert.deepEqual(nuevo.posiciones,vectores[t][i].map(v=>mod(v*signo)));assert.equal(nuevo.movimientos,1);
  const cambio=C.aplicar(c,nuevo,{tipo:'transmision',transmision:transmision==='A'?'B':'A'});assert.equal(cambio.movimientos,1);assert.deepEqual(cambio.posiciones,nuevo.posiciones);
}
assert.equal(C.aplicar(c,C.inicial(c),{tipo:'abrir'}),null);assert(C.referenciaValida(c));
let solucion=C.inicial(c);for(const p of c.solucion)solucion=C.aplicar(c,solucion,p);
assert(ER.mecanismos.completa('cerradura',c,solucion));assert(!ER.mecanismos.completa('cerradura',c,{...solucion,abierta:false}));
const copia=ER.calendario(JSON.parse(JSON.stringify(C.campana(CALENDARIO_PUBLICADO))));assert.deepEqual(JSON.parse(copia.capitulos[0].configuracion),c);
assert.deepEqual(copia.capitulos.slice(1),ER.calendario(CALENDARIO_PUBLICADO).capitulos.slice(1));
assert(C.pista(c,C.inicial(c)).includes('16 giros'));
assert.equal(ER.estado(2,'2026-12-01',ER.progreso({resueltos:[1]})),'futura');
assert.equal(ER.estado(2,'2026-12-02',ER.progreso({resueltos:[1]})),'disponible');
for(const objetivos of [[1,0,0,0],[7,2,5,1]]){
  const custom={...c,objetivos};custom.solucion=C.ruta(custom);
  assert(C.referenciaValida(custom));
  const independiente=buscar(objetivos);
  assert.equal(C.revision(custom).minimo,independiente[codificar(custom.inicio,0)]);
  let estado=C.inicial(custom);for(const paso of custom.solucion)estado=C.aplicar(custom,estado,paso);
  assert.deepEqual(estado.posiciones,objetivos);assert(estado.abierta);
}
console.log('PASS: búsqueda 0–1 independiente con 8192 estados, mínimo 16, ambas transmisiones obligatorias, referencia ejecutable, acoplamientos, pestillo, respaldo y fecha.');
