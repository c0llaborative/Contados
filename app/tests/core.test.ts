import assert from 'node:assert/strict';
import test from 'node:test';
import { crearAgrupador, debounceWhatsAppMs } from '../lib/canales/whatsapp/agrupar';
import { extraerMensajes } from '../lib/canales/whatsapp/entrante';
import { idSeguroDeTelefono } from '../lib/canales/whatsapp/identidad';
import { MAX_AUDIO_BYTES, transcribirAudio } from '../lib/canales/whatsapp/transcribir';
import { almacenEnMemoria } from '../lib/nucleo/almacen-sesiones';
import { crearConversador, ErrorLimiteConversacion } from '../lib/nucleo/conversacion';
import { asegurarInvariantes } from '../lib/nucleo/clasificar';
import { crearMensajeEnlacePeticion } from '../lib/nucleo/enlace-peticion';
import { DIAGNOSTICO_SCHEMA, type Diagnostico } from '../lib/nucleo/schema';
import {
  crearTokenPeticion,
  ErrorTokenPeticion,
  generarPeticionHtml,
  leerTokenPeticion,
  PETICION_TOKEN_TTL_MS,
} from '../lib/nucleo/peticion';

const base: Diagnostico = {
  compuerta: null,
  razon: 'No hay información suficiente.',
  hechos: [],
  alertas: [],
  falta_preguntar: ['¿Fue un funcionario?', '¿Tomaron sus datos?', '¿Hubo visita técnica?'],
  posible_estafa: false,
};

test('el schema nullable usa anyOf compatible con Anthropic', () => {
  const compuerta = DIAGNOSTICO_SCHEMA.properties.compuerta;
  assert.deepEqual(compuerta.anyOf[0], {
    type: 'string',
    enum: ['reporte', 'censo', 'evaluacion_tecnica', 'rud', 'subsidio'],
  });
  assert.deepEqual(compuerta.anyOf[1], { type: 'null' });
});

test('las invariantes eliminan evidencia alterada y alertas no sustentadas', () => {
  const diagnostico = asegurarInvariantes({
    ...base,
    hechos: [
      { afirmacion: 'Le pidieron la cédula.', evidencia: 'me pidieron la cédula' },
      { afirmacion: 'Le dieron constancia.', evidencia: 'me dieron una constancia' },
      { afirmacion: 'Un funcionario la censó.', evidencia: 'Me censaron' },
    ],
    alertas: [
      { riesgo: 'sin_documentos', razon: 'Le pidieron cédula.', accion: 'Pregunte.' },
      { riesgo: 'zona_sin_cobertura', razon: 'No volvieron.', accion: 'Pregunte.' },
      { riesgo: 'sin_titulo', razon: 'No tiene escritura.', accion: 'Lleve recibos de servicios o una declaración extrajuicio.' },
    ],
    falta_preguntar: ['¿Qué anotó los datos?', 'dos', 'tres', 'cuatro'],
    posible_estafa: true,
    razon: 'Está esperando que quede registrada una constancia formal.',
    compuerta: 'evaluacion_tecnica',
  }, 'Me censaron. Vinieron de civil y me pidieron la cédula, pero nadie más volvió. No tengo escritura.');

  assert.deepEqual(diagnostico.hechos.map((hecho) => hecho.evidencia), ['me pidieron la cédula', 'Me censaron']);
  assert.equal(diagnostico.hechos[1].afirmacion, 'Me censaron');
  assert.equal(diagnostico.alertas.length, 1);
  assert.doesNotMatch(diagnostico.alertas[0].accion, /recibos|extrajuicio/i);
  assert.equal(
    diagnostico.alertas[0].accion,
    'Pregunte a la autoridad municipal qué alternativa admite cuando no hay escritura y pida la respuesta por escrito.',
  );
  assert.equal(diagnostico.falta_preguntar.length, 3);
  assert.doesNotMatch(diagnostico.falta_preguntar[0], /anotó los datos/i);
  assert.equal(diagnostico.posible_estafa, false);
  assert.doesNotMatch(diagnostico.razon, /constancia/i);
});

test('saluda sin mandar hola al clasificador', async () => {
  let llamadas = 0;
  const chat = crearConversador(async () => {
    llamadas += 1;
    return base;
  });
  const salida = await chat.conversar({ sesionId: 'sim_1234567890123456', texto: 'hola' });
  assert.equal(llamadas, 0);
  assert.match(salida.mensajes[0], /no lo registra/i);
  assert.match(salida.mensajes[0], /cédula, datos bancarios ni huella/i);
});

test('la conversación sobrevive a un cambio de instancia', async () => {
  // Reproduce el fallo observado en WhatsApp real el 2026-08-16: cada mensaje
  // caía en una instancia distinta de Vercel, la sesión vivía sólo en la
  // memoria del proceso y Contados volvía a saludar como si no conociera a la
  // persona. Dos conversadores que comparten almacén representan esas dos
  // instancias; la segunda debe continuar la conversación, no reiniciarla.
  const almacen = almacenEnMemoria();
  const id = 'sim_instancias12345678';
  const clasificador = async () => base;

  const instanciaA = crearConversador(clasificador, Date.now, almacen);
  const primera = await instanciaA.conversar({ sesionId: id, texto: 'hola' });
  assert.match(primera.mensajes[0], /no lo registra/i);

  const instanciaB = crearConversador(clasificador, Date.now, almacen);
  const segunda = await instanciaB.conversar({ sesionId: id, texto: 'Se me agrietó la casa' });

  assert.ok(
    !segunda.mensajes.some((m) => /Soy Contados\./.test(m)),
    'no debe volver a saludar: la sesión ya existía',
  );
  assert.equal(segunda.estado, 'PREGUNTANDO');
});

test('el aviso por barrio encuentra sesiones de otra instancia', async () => {
  const almacen = almacenEnMemoria();
  const id = 'sim_barriocompartido1';
  const clasificador = async () => ({ ...base, compuerta: 'censo' as const, razon: 'x' });

  const instanciaA = crearConversador(clasificador, Date.now, almacen);
  await instanciaA.conversar({
    sesionId: id,
    texto: 'Vino una señora y anotó en un cuaderno',
    municipio: 'Manizales',
    barrio: 'San José',
  });

  const instanciaB = crearConversador(clasificador, Date.now, almacen);
  const destinatarios = await instanciaB.notificarBarrio('San José', 'La visita llegó al barrio.');
  assert.equal(destinatarios.length, 1);

  const instanciaC = crearConversador(clasificador, Date.now, almacen);
  const avisos = await instanciaC.conversar({ sesionId: id, texto: '' });
  assert.ok(avisos.mensajes.some((m) => /La visita llegó al barrio/.test(m)));
});

test('se abstiene tres veces y luego se rinde sin inventar', async () => {
  let llamadas = 0;
  const chat = crearConversador(async () => {
    const pregunta = base.falta_preguntar[llamadas] ?? base.falta_preguntar[2];
    llamadas += 1;
    return { ...base, falta_preguntar: [pregunta] };
  });
  const id = 'sim_abcdefghijklmnop';
  const uno = await chat.conversar({ sesionId: id, texto: 'Se me cayó la casa' });
  const dos = await chat.conversar({ sesionId: id, texto: 'no sé' });
  const tres = await chat.conversar({ sesionId: id, texto: 'no sé' });
  const cuatro = await chat.conversar({ sesionId: id, texto: 'no sé' });
  assert.equal(uno.diagnostico?.compuerta, null);
  assert.notEqual(uno.mensajes.at(-1), dos.mensajes.at(-1));
  assert.notEqual(dos.mensajes.at(-1), tres.mensajes.at(-1));
  assert.match(cuatro.mensajes.at(-1) ?? '', /no puedo ubicarlo con seguridad/i);
  assert.equal(llamadas, 3);
});

test('advierte la posible estafa antes del diagnóstico', async () => {
  const chat = crearConversador(async () => ({
    ...base,
    compuerta: 'reporte',
    razon: 'Usted dijo que le cobraron.',
    posible_estafa: true,
  }));
  const salida = await chat.conversar({
    sesionId: 'sim_estafa_123456789',
    texto: 'Me cobraron y me pidieron la huella',
  });
  assert.match(salida.mensajes[1], /cuidado/i);
  assert.match(salida.mensajes[2], /reportar el daño/i);
});

test('normaliza texto y audio del payload de Meta', () => {
  const mensajes = extraerMensajes({
    entry: [{ changes: [{ value: { messages: [
      { from: 'destino-sintetico', id: 'm1', type: 'text', text: { body: 'hola' } },
      { from: 'destino-sintetico', id: 'm2', type: 'audio', audio: { id: 'a1' } },
    ] } }] }],
  });
  assert.deepEqual(mensajes.map((item) => item.tipo), ['texto', 'audio']);
});

test('prepara la transcripción en memoria con los controles de Groq', async () => {
  const fetchOriginal = globalThis.fetch;
  const keyOriginal = process.env.GROQ_API_KEY;
  const modelOriginal = process.env.STT_MODEL;
  process.env.GROQ_API_KEY = 'gsk_clave_sintetica_para_prueba_unitaria';
  process.env.STT_MODEL = 'whisper-large-v3-turbo';
  let formulario: FormData | undefined;
  globalThis.fetch = (async (_input, init) => {
    formulario = init?.body as FormData;
    return new Response(JSON.stringify({ text: '  relato sintético  ' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  }) as typeof fetch;
  try {
    const texto = await transcribirAudio(new Blob(['audio-sintético'], { type: 'audio/wav' }), 'prueba.wav');
    assert.equal(texto, 'relato sintético');
    assert.equal(formulario?.get('model'), 'whisper-large-v3-turbo');
    assert.equal(formulario?.get('language'), 'es');
    assert.equal(formulario?.get('temperature'), '0');
    assert.equal((formulario?.get('file') as File).name, 'prueba.wav');
  } finally {
    globalThis.fetch = fetchOriginal;
    if (keyOriginal === undefined) delete process.env.GROQ_API_KEY;
    else process.env.GROQ_API_KEY = keyOriginal;
    if (modelOriginal === undefined) delete process.env.STT_MODEL;
    else process.env.STT_MODEL = modelOriginal;
  }
});

test('rechaza audio mayor de 10 MB antes de llamar al proveedor', async () => {
  const keyOriginal = process.env.GROQ_API_KEY;
  process.env.GROQ_API_KEY = 'gsk_clave_sintetica_para_prueba_unitaria';
  try {
    await assert.rejects(
      transcribirAudio(new Blob([new Uint8Array(MAX_AUDIO_BYTES + 1)]), 'grande.wav'),
      /supera el límite de 10 MB/,
    );
  } finally {
    if (keyOriginal === undefined) delete process.env.GROQ_API_KEY;
    else process.env.GROQ_API_KEY = keyOriginal;
  }
});

test('la identidad de sesión es estable y no contiene el valor original', () => {
  process.env.SESION_SAL = 'sal-sintetica-segura-para-pruebas';
  const id = idSeguroDeTelefono('destino-sintetico');
  assert.equal(id, idSeguroDeTelefono('destino-sintetico'));
  assert.equal(id.length, 64);
  assert.doesNotMatch(id, /destino/);
});

test('agrupa fragmentos consecutivos y clasifica el lote una sola vez', async () => {
  const lotes: string[][] = [];
  const agrupador = crearAgrupador<string>(async (entradas) => {
    lotes.push(entradas.map((entrada) => entrada.valor));
  }, { esperaMs: 5 });

  const primero = agrupador.recibir({ clave: 'sesion-a', id: 'm1', valor: 'La casa se agrietó' });
  const segundo = agrupador.recibir({ clave: 'sesion-a', id: 'm2', valor: 'y nadie volvió' });
  assert.deepEqual(await Promise.all([primero, segundo]), ['procesado', 'procesado']);
  assert.deepEqual(lotes, [['La casa se agrietó', 'y nadie volvió']]);
});

test('deduplica por id y libera el id si el procesamiento falla', async () => {
  let intentos = 0;
  const agrupador = crearAgrupador<string>(async () => {
    intentos += 1;
    if (intentos === 1) throw new Error('proveedor caído');
  }, { esperaMs: 5 });

  const primerIntento = agrupador.recibir({ clave: 'sesion-b', id: 'm-retry', valor: 'relato' });
  const duplicado = await agrupador.recibir({ clave: 'sesion-b', id: 'm-retry', valor: 'relato' });
  assert.equal(duplicado, 'duplicado');
  await assert.rejects(primerIntento, /proveedor caído/);
  assert.equal(
    await agrupador.recibir({ clave: 'sesion-b', id: 'm-retry', valor: 'relato' }),
    'procesado',
  );
  assert.equal(intentos, 2);
});

test('un fallo del clasificador no duplica el relato al reintentar', async () => {
  const relatos: string[] = [];
  const chat = crearConversador(async (relato) => {
    relatos.push(relato);
    if (relatos.length === 1) throw new Error('proveedor caído');
    return base;
  });
  const entrada = { sesionId: 'sim_reintento_123456', texto: 'Se me cayó la casa' };
  await assert.rejects(chat.conversar(entrada), /proveedor caído/);
  await chat.conversar(entrada);
  assert.deepEqual(relatos, ['Se me cayó la casa', 'Se me cayó la casa']);
});

test('serializa llamadas simultáneas de una misma sesión', async () => {
  let liberarPrimera!: () => void;
  const primeraPendiente = new Promise<void>((resolve) => { liberarPrimera = resolve; });
  const relatos: string[] = [];
  const chat = crearConversador(async (relato) => {
    relatos.push(relato);
    if (relatos.length === 1) await primeraPendiente;
    return base;
  });
  const primera = chat.conversar({ sesionId: 'sim_concurrente_1234', texto: 'Primera parte' });
  const segunda = chat.conversar({ sesionId: 'sim_concurrente_1234', texto: 'Segunda parte' });
  await new Promise((resolve) => setTimeout(resolve, 1));
  assert.equal(relatos.length, 1);
  liberarPrimera();
  await Promise.all([primera, segunda]);
  assert.deepEqual(relatos, ['Primera parte', 'Primera parte\nSegunda parte']);
});

test('aplica límites de debounce y de longitud del relato', async () => {
  assert.equal(debounceWhatsAppMs('1'), 10_000);
  assert.equal(debounceWhatsAppMs('99999'), 15_000);
  assert.equal(debounceWhatsAppMs('inválido'), 12_000);
  const chat = crearConversador(async () => base);
  await assert.rejects(
    chat.conversar({ sesionId: 'sim_limite_123456789', texto: 'x'.repeat(5001) }),
    ErrorLimiteConversacion,
  );
});

test('limita cada lote de WhatsApp a ocho mensajes', async () => {
  const agrupador = crearAgrupador<string>(async () => undefined, {
    esperaMs: 5,
    maximoPorLote: 8,
  });
  const aceptados = Array.from({ length: 8 }, (_, indice) => agrupador.recibir({
    clave: 'sesion-limite',
    id: `m-${indice}`,
    valor: `fragmento ${indice}`,
  }));
  await assert.rejects(
    agrupador.recibir({ clave: 'sesion-limite', id: 'm-8', valor: 'noveno' }),
    /Máximo 8 mensajes por lote/,
  );
  assert.deepEqual(await Promise.all(aceptados), Array(8).fill('procesado'));
});

test('crea el enlace temporal sólo con diagnóstico y secreto configurados', () => {
  const diagnostico: Diagnostico = { ...base, compuerta: 'reporte' };
  assert.equal(
    crearMensajeEnlacePeticion(diagnostico, 'Manizales', 'San José', 'https://demo.invalid', ''),
    null,
  );
  const mensaje = crearMensajeEnlacePeticion(
    diagnostico,
    'Manizales',
    'San José',
    'https://demo.invalid',
    'secreto-sintetico-de-prueba-con-mas-de-32-caracteres',
  );
  assert.match(mensaje ?? '', /^Borrador de derecho de petición/);
  assert.match(mensaje ?? '', /https:\/\/demo\.invalid\/api\/peticion\//);
  assert.match(mensaje ?? '', /15 minutos/);
});

test('el enlace de petición es cifrado, aleatorio y recupera el mismo borrador', () => {
  const secreto = 'secreto-sintetico-de-prueba-con-mas-de-32-caracteres';
  const ahora = Date.UTC(2026, 7, 15, 12);
  const datos = {
    municipio: 'Manizales',
    barrio: 'San José',
    compuerta: 'censo' as const,
    hechos: [{ afirmacion: 'La casa se agrietó.', evidencia: 'se agrietó' }],
  };
  const uno = crearTokenPeticion(datos, secreto, ahora);
  const dos = crearTokenPeticion(datos, secreto, ahora);
  assert.notEqual(uno, dos);
  assert.doesNotMatch(uno, /Manizales|San Jos/);
  const recuperado = leerTokenPeticion(uno, secreto, ahora + 1);
  assert.deepEqual(recuperado.datos, datos);
  const html = generarPeticionHtml(recuperado.datos, new Date(recuperado.emitidoEn));
  assert.match(html, /Alcaldía de Manizales/);
  assert.match(html, /barrio San José/);
  assert.match(html, /Borrador · No radicado/);
});

test('rechaza enlaces de petición alterados o expirados', () => {
  const secreto = 'otro-secreto-sintetico-de-prueba-con-32-caracteres';
  const ahora = Date.UTC(2026, 7, 15, 12);
  const token = crearTokenPeticion({
    municipio: 'Manizales',
    barrio: '',
    compuerta: 'reporte',
    hechos: [],
  }, secreto, ahora);
  const alterado = `${token.slice(0, -1)}${token.endsWith('a') ? 'b' : 'a'}`;
  assert.throws(() => leerTokenPeticion(alterado, secreto, ahora + 1), ErrorTokenPeticion);
  assert.throws(
    () => leerTokenPeticion(token, secreto, ahora + PETICION_TOKEN_TTL_MS),
    (error: unknown) => error instanceof ErrorTokenPeticion && error.codigo === 'expirado',
  );
});

test('escapa contenido de la persona dentro del borrador', () => {
  const html = generarPeticionHtml({
    municipio: '<script>mal</script>',
    barrio: 'Centro & Norte',
    compuerta: 'reporte',
    hechos: [{ afirmacion: '<img src=x onerror=alert(1)>', evidencia: 'literal' }],
  }, new Date(Date.UTC(2026, 7, 15)));
  assert.doesNotMatch(html, /<script>mal|<img src=x/);
  assert.match(html, /&lt;script&gt;mal&lt;\/script&gt;/);
  assert.match(html, /Centro &amp; Norte/);
});
