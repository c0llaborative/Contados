const baseUrl = process.env.EVAL_BASE_URL || 'http://localhost:3000';
const repeticiones = Number(process.env.EVAL_RUNS || 3);

const sinAlerta = (d, riesgo) => !d.alertas?.some((a) => a.riesgo === riesgo);
const soloAlertas = (d, permitidas) => (d.alertas || []).every((a) => permitidas.includes(a.riesgo));
const accionesEsperadas = {
  arrendatario: 'Pregunte a la autoridad municipal qué alternativa admite para acreditar su situación como arrendatario y pida la respuesta por escrito.',
  sin_titulo: 'Pregunte a la autoridad municipal qué alternativa admite cuando no hay escritura y pida la respuesta por escrito.',
};
const razonesEsperadas = {
  null: 'Con lo que usted contó no hay información suficiente para ubicar el caso con seguridad. Responda las preguntas para precisar el paso.',
  reporte: 'Con lo que usted contó, el último paso que se puede ubicar es el reporte. Falta confirmar qué ocurrió después.',
  censo: 'Con lo que usted contó, el caso se ubica provisionalmente en censo. Falta confirmar qué ocurrió después.',
  evaluacion_tecnica: 'Con lo que usted contó, el último paso que se puede ubicar es la evaluación técnica. Falta confirmar qué ocurrió después.',
  rud: 'Con lo que usted contó, el último paso que se puede ubicar es el Registro Único de Damnificados. Falta confirmar qué ocurrió después.',
  subsidio: 'Con lo que usted contó, el último paso que se puede ubicar es el subsidio. Falta confirmar qué ocurrió después.',
};
const textoGenerado = (d) => [
  d.razon,
  ...(d.falta_preguntar || []),
  ...(d.hechos || []).map((h) => h.afirmacion),
  ...(d.alertas || []).flatMap((a) => [a.razon, a.accion]),
].filter(Boolean).join(' ');
const textoAfirmado = (d) => [
  d.razon,
  ...(d.hechos || []).map((h) => h.afirmacion),
  ...(d.alertas || []).flatMap((a) => [a.razon, a.accion]),
].filter(Boolean).join(' ');

function reglasGlobales(d, relato) {
  const evidenciasLiterales = (d.hechos || []).every(
    (hecho) => typeof hecho.evidencia === 'string' && relato.includes(hecho.evidencia),
  );
  const maximoTresPreguntas = Array.isArray(d.falta_preguntar) && d.falta_preguntar.length <= 3;
  const soloUsted = !/\b(tú|tu|te|contás|describís|ubicarte|preguntá|acercate)\b/iu.test(
    textoGenerado(d),
  );
  const sinDocumentosInventados = !/recibos? de servicios?|declaraci[oó]n extrajuicio|certificado catastral/iu.test(
    textoGenerado(d),
  );
  const sinRolesAgregados = (d.hechos || []).every((hecho) =>
    !/funcionari/iu.test(hecho.afirmacion) || /funcionari/iu.test(hecho.evidencia));
  const accionesDeterministas = (d.alertas || []).every(
    (alerta) => !accionesEsperadas[alerta.riesgo] || alerta.accion === accionesEsperadas[alerta.riesgo],
  );
  const razonDeterminista = d.razon === razonesEsperadas[String(d.compuerta)];
  return evidenciasLiterales && maximoTresPreguntas && soloUsted
    && sinDocumentosInventados && sinRolesAgregados && accionesDeterministas
    && razonDeterminista && !/anot[oó] (?:sus |los )?datos/iu.test(textoGenerado(d));
}

const casos = [
  {
    nombre: 'ambiguo-casa',
    relato: 'Se me cayó la casa',
    pasa: (d) => d.compuerta === null && d.falta_preguntar?.length > 0,
  },
  {
    nombre: 'ambiguo-lista',
    relato: 'Me dijeron que ya estaba en la lista',
    pasa: (d) => d.compuerta === null && d.falta_preguntar?.length > 0,
  },
  {
    nombre: 'censo-arrendataria',
    relato: 'La casa se agrietó toda, vino una señora con un chaleco y anotó en un cuaderno, pero nadie más volvió. Yo pago arriendo.',
    pasa: (d) => d.compuerta === 'censo'
      && d.alertas?.some((a) => a.riesgo === 'arrendatario')
      && sinAlerta(d, 'zona_sin_cobertura')
      && d.posible_estafa === false
      && soloAlertas(d, ['arrendatario'])
      && !/anotó (?:datos|información)|tomó sus datos|le tomó datos/iu.test(textoAfirmado(d)),
  },
  {
    nombre: 'visita-sin-titulo',
    relato: 'La casa la construí yo hace veinte años, no tengo escritura. Me censaron el martes y el ingeniero vino el jueves y dijo que estaba muy averiada.',
    pasa: (d) => d.compuerta === 'evaluacion_tecnica'
      && d.alertas?.some((a) => a.riesgo === 'sin_titulo')
      && soloAlertas(d, ['sin_titulo'])
      && !/(?:dej[oó]|registrad[ao]|emitid[ao]|pendiente).{0,35}(?:constancia|certificado|documento)|(?:constancia|certificado) formal/iu.test(textoAfirmado(d)),
  },
  {
    nombre: 'posible-estafa',
    relato: 'Vinieron dos señores de civil, me pidieron la cédula, una foto y la huella, y me dijeron que pagara veinte mil para que me metieran en la lista.',
    pasa: (d) => d.posible_estafa === true
      && d.compuerta === null
      && sinAlerta(d, 'sin_documentos')
      && soloAlertas(d, [])
      && !/sin identificaci[oó]n|no se identificaron|no se identificó/iu.test(textoAfirmado(d)),
  },
];

let fallos = 0;
for (let ronda = 1; ronda <= repeticiones; ronda += 1) {
  for (const caso of casos) {
    const inicio = performance.now();
    const response = await fetch(`${baseUrl}/api/diagnose`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ relato: caso.relato, municipio: 'Manizales' }),
    });
    const data = await response.json();
    const ms = Math.round(performance.now() - inicio);
    const paso = response.ok && reglasGlobales(data, caso.relato) && caso.pasa(data);
    if (!paso) fallos += 1;
    console.log(JSON.stringify({ ronda, caso: caso.nombre, paso, ms, status: response.status, diagnostico: data }));
  }
}

console.log(`Resultado: ${repeticiones * casos.length - fallos}/${repeticiones * casos.length} pasan.`);
if (fallos > 0) process.exitCode = 1;
