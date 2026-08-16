import Anthropic from '@anthropic-ai/sdk';
import { DIAGNOSTICO_SCHEMA, type Diagnostico } from './schema';

export type ProveedorClasificador = 'anthropic' | 'openai';

export function configClasificador() {
  const proveedor = (process.env.AI_CLASSIFIER_PROVIDER?.trim() ||
    'anthropic') as ProveedorClasificador;
  if (proveedor !== 'anthropic' && proveedor !== 'openai') {
    throw new Error('AI_CLASSIFIER_PROVIDER debe ser anthropic u openai.');
  }
  return {
    proveedor,
    modelo:
      process.env.AI_CLASSIFIER_MODEL?.trim() ||
      (proveedor === 'openai' ? 'gpt-4o-mini' : 'claude-sonnet-5'),
  };
}

export const SISTEMA_CLASIFICADOR = `Ubicas a una familia damnificada por el terremoto del 10 de agosto de 2026 en Colombia dentro de la ruta oficial de atención, a partir de lo que ella misma cuenta.

La ruta tiene cinco compuertas, en este orden:

1. reporte — avisó que su vivienda resultó afectada. No implica estar censado.
2. censo — un funcionario tomó sus datos. No implica estar en el RUD.
3. evaluacion_tecnica — falta que un técnico visite la vivienda y deje constancia. Es la fila más larga.
4. rud — quedó inscrito en el Registro Único de Damnificados. Solo el Consejo Municipal de Gestión del Riesgo puede inscribir.
5. subsidio — figura entre los beneficiarios; el aviso llega por mensaje de texto.

La compuerta que devuelves es donde la persona está TRABADA: el último paso que sí completó. Si le tomaron datos pero nadie ha vuelto, está en "censo" esperando la evaluación técnica.

No avance a RUD sólo porque hubo visita técnica: RUD exige que la persona diga que quedó inscrita en ese registro. No avance a subsidio sin una afirmación explícita de que figura como beneficiaria o recibió el aviso correspondiente.

Cómo leer los relatos: la gente no usa el vocabulario oficial. Para orientar esta ruta, "vino una señora con chaleco y anotó en un cuaderno" seguido de que nadie volvió se ubica provisionalmente en censo, pero se describe como aparente intento de censo: no prueba que fuera funcionaria ni que exista un registro oficial. Pregunte por identificación o comprobante. "Me dijeron que ya estaba en la lista" puede ser censo o RUD — si no puede distinguirlo, no lo adivine.

Abstención: si el relato no alcanza para ubicar la compuerta, devuelve compuerta null y llena falta_preguntar con las preguntas concretas que resolverían la duda. Abstenerse es una respuesta correcta y esperada. Inventar una compuerta es el peor error que puedes cometer aquí, porque la persona actuará sobre ella.

Evidencia y precisión:
- Cada hecho lleva una subcadena exacta del relato, copiada literalmente, sin corregir puntuación ni agregar palabras. Si no puede citarla, el hecho no existe.
- La afirmación no puede agregar identidad, cargo, oficialidad, documento, constancia o resultado que la cita no diga.
- Una persona con chaleco o cuaderno no queda convertida en funcionaria: descríbala como una visita o aparente intento de censo.
- "Anotó en un cuaderno" no equivale a "anotó datos", "anotó información" ni "tomó sus datos". Repita sólo que anotó en un cuaderno. Puede preguntar qué anotó o si la persona se identificó, pero no completar esa información.
- Que un ingeniero haya ido y haya explicado verbalmente un daño no prueba que dejó una constancia escrita. Puede preguntar si le entregaron algo o señalar que el relato no lo menciona; nunca afirme que existe, quedó registrada o está pendiente una constancia, certificado o documento.
- No recomiende documentos concretos ni dé ejemplos de documentos como aceptados por una entidad si la ruta verificada no lo confirma. No mencione recibos de servicios, declaraciones extrajuicio ni certificados catastrales. Indique únicamente que pregunte cuál alternativa admite la autoridad y que pida respuesta por escrito.

Riesgos de exclusión: márcalos solo cuando el relato los sustente.
- arrendatario: paga arriendo. Varios apoyos piden acreditar propiedad.
- sin_titulo: ocupa o construyó sin escritura.
- titular_ausente: la vivienda está a nombre de un tercero fallecido o ausente.
- sin_documentos: la persona dice explícitamente que perdió o no tiene disponibles su cédula o papeles. Que alguien le haya pedido, fotografiado o recibido la cédula no activa este riesgo.
- ausente_en_visita: no estaba cuando pasaron tomando datos.
- zona_sin_cobertura: la persona dice explícitamente que nadie ha visitado su zona o barrio. Que no hayan regresado a su caso individual no activa este riesgo.
Para cada uno, la acción debe ser algo concreto que la persona pueda pedir o hacer, no un consejo general.

posible_estafa: márquelo true si el relato dice que le cobraron, le pidieron huella o datos bancarios, o dice explícitamente que la persona no se identificó. Que el relato no mencione identificación no demuestra por sí solo que no se identificó.
Ir de civil tampoco demuestra que no se identificaron. No escriba “sin
identificación”, “no se identificaron” ni equivalentes salvo que el relato lo
diga explícitamente; base la alerta en el cobro, huella u otra señal narrada.
Una visita o contacto sospechoso no demuestra que la persona completó reporte,
censo ni otra compuerta. Si el relato no menciona por separado una actuación
oficial suficiente, devuelva compuerta null y haga preguntas.

Use exclusivamente "usted" y sus formas; nunca use tú, tu, te ni voseo (por ejemplo contás, describís, preguntá o acercate). Escriba frases cortas y sin jerga. Devuelva como máximo tres preguntas en falta_preguntar, ordenadas por cuánto ayudan a decidir. No prometa que la ayuda llegará. No afirme que una vivienda es segura, habitable o que cumple norma. Ante duda sobre un hecho o riesgo, omítalo y pregunte.`;

export interface Clasificador {
  (relato: string, municipio: string): Promise<Diagnostico>;
}

function asegurarInvariantes(diagnostico: Diagnostico, relato = ''): Diagnostico {
  if (!diagnostico || !Array.isArray(diagnostico.falta_preguntar)) {
    throw new Error('El modelo devolvió un diagnóstico incompleto.');
  }
  const relatoNormalizado = relato.toLocaleLowerCase('es');
  const mencionaSinDocumentos =
    /(?:perd(?:í|io|ió|imos)|no (?:tengo|tiene|tenemos)|sin)\b.{0,35}\b(?:cédula|documentos?|papeles?)/iu.test(relatoNormalizado) ||
    /(?:cédula|documentos?|papeles?)\b.{0,35}\b(?:perdid[oa]s?|no (?:están|aparecen)|se (?:perdieron|extraviaron))/iu.test(relatoNormalizado);
  const mencionaZonaSinCobertura =
    /(?:barrio|zona|vereda|sector)\b.{0,60}\b(?:nadie|no han|no ha sido)\b.{0,40}\b(?:visit|pas|lleg)/iu.test(relatoNormalizado) ||
    /(?:nadie|no han)\b.{0,40}\b(?:visit|pas|lleg)\b.{0,60}\b(?:barrio|zona|vereda|sector)/iu.test(relatoNormalizado);
  const mencionaPosibleEstafa =
    /\b(?:cobr|pag(?:ar|ué|ó)|huella|datos? bancarios?|cuenta bancaria|no se identific)/iu.test(relatoNormalizado);
  const riesgoSustentado = (riesgo: Diagnostico['alertas'][number]['riesgo']) => {
    switch (riesgo) {
      case 'arrendatario':
        return /\b(?:arriendo|arrend|alquiler|inquilin)/iu.test(relatoNormalizado);
      case 'sin_titulo':
        return /(?:sin|no (?:tengo|tiene|tenemos))\b.{0,25}\b(?:escritura|t[ií]tulo)/iu.test(relatoNormalizado);
      case 'titular_ausente':
        return /a nombre de\b.{0,50}\b(?:fallecid|muri[oó]|ausente|no (?:vive|est[aá]))/iu.test(relatoNormalizado);
      case 'sin_documentos':
        return mencionaSinDocumentos;
      case 'ausente_en_visita':
        return /(?:no estaba|estaba ausente|no me encontr)/iu.test(relatoNormalizado) &&
          /(?:visit|pasaron|fueron|llegaron|censo)/iu.test(relatoNormalizado);
      case 'zona_sin_cobertura':
        return mencionaZonaSinCobertura;
    }
  };
  const copyRiesgo: Record<Diagnostico['alertas'][number]['riesgo'], { razon: string; accion: string }> = {
    arrendatario: {
      razon: 'Usted indicó que paga arriendo; esa situación puede requerir orientación específica para algunos apoyos.',
      accion: 'Pregunte a la autoridad municipal qué alternativa admite para acreditar su situación como arrendatario y pida la respuesta por escrito.',
    },
    sin_titulo: {
      razon: 'Usted indicó que no tiene escritura; esa situación puede requerir una alternativa para acreditar su relación con la vivienda.',
      accion: 'Pregunte a la autoridad municipal qué alternativa admite cuando no hay escritura y pida la respuesta por escrito.',
    },
    titular_ausente: {
      razon: 'Usted indicó que el titular de la vivienda está ausente o falleció; esa situación puede requerir orientación específica.',
      accion: 'Pregunte a la autoridad municipal cómo continuar cuando el titular está ausente o falleció y pida la respuesta por escrito.',
    },
    sin_documentos: {
      razon: 'Usted indicó que perdió o no tiene disponibles sus documentos.',
      accion: 'Pregunte a la autoridad municipal cómo continuar sin esos documentos y pida la respuesta por escrito.',
    },
    ausente_en_visita: {
      razon: 'Usted indicó que no estaba cuando hicieron la visita.',
      accion: 'Solicite a la autoridad municipal verificar la visita y explicar cómo completarla; pida la respuesta por escrito.',
    },
    zona_sin_cobertura: {
      razon: 'Usted indicó que su zona o barrio todavía no ha recibido visita.',
      accion: 'Solicite a la autoridad municipal confirmar cómo reportar la zona pendiente y pida la respuesta por escrito.',
    },
  };
  const hechoAgregaRolODocumento = (afirmacion: string, evidencia: string) =>
    ['funcionari', 'constancia', 'certificad', 'documento', 'radicado'].some(
      (raiz) => afirmacion.toLocaleLowerCase('es').includes(raiz) &&
        !evidencia.toLocaleLowerCase('es').includes(raiz),
    );
  const hechos = Array.isArray(diagnostico.hechos)
    ? diagnostico.hechos.filter(
      (hecho) => typeof hecho.evidencia === 'string' && relato.includes(hecho.evidencia),
    ).map((hecho) => hechoAgregaRolODocumento(hecho.afirmacion, hecho.evidencia)
      ? { ...hecho, afirmacion: hecho.evidencia }
      : hecho)
    : [];
  const alertas = Array.isArray(diagnostico.alertas)
    ? diagnostico.alertas.filter((alerta) => riesgoSustentado(alerta.riesgo))
      .map((alerta) => ({ ...alerta, ...copyRiesgo[alerta.riesgo] }))
    : [];
  const razonesCompuerta: Record<Exclude<Diagnostico['compuerta'], null>, string> = {
    reporte: 'Con lo que usted contó, el último paso que se puede ubicar es el reporte. Falta confirmar qué ocurrió después.',
    censo: 'Con lo que usted contó, el caso se ubica provisionalmente en censo. Falta confirmar qué ocurrió después.',
    evaluacion_tecnica: 'Con lo que usted contó, el último paso que se puede ubicar es la evaluación técnica. Falta confirmar qué ocurrió después.',
    rud: 'Con lo que usted contó, el último paso que se puede ubicar es el Registro Único de Damnificados. Falta confirmar qué ocurrió después.',
    subsidio: 'Con lo que usted contó, el último paso que se puede ubicar es el subsidio. Falta confirmar qué ocurrió después.',
  };
  const razon = diagnostico.compuerta
    ? razonesCompuerta[diagnostico.compuerta]
    : 'Con lo que usted contó no hay información suficiente para ubicar el caso con seguridad. Responda las preguntas para precisar el paso.';
  const preguntas = diagnostico.falta_preguntar.slice(0, 3).map((pregunta) =>
    pregunta.replace(/anot[oó] (?:sus |los )?datos/giu, 'anotó en el cuaderno'));
  const normalizado = {
    ...diagnostico,
    razon,
    hechos,
    alertas,
    falta_preguntar: preguntas,
    posible_estafa: diagnostico.posible_estafa && mencionaPosibleEstafa,
  };
  if (normalizado.compuerta === null && normalizado.falta_preguntar.length === 0) {
    return {
      ...normalizado,
      falta_preguntar: [
        '¿Alguien ha ido a su casa a tomar datos o a revisarla? ¿Cuándo?',
      ],
    };
  }
  return normalizado;
}

async function clasificarAnthropic(relato: string, municipio: string, modelo: string) {
  const client = new Anthropic();
  const response = await client.messages.create({
    model: modelo,
    max_tokens: 2000,
    thinking: { type: 'disabled' },
    system: SISTEMA_CLASIFICADOR,
    output_config: {
      effort: 'medium',
      format: { type: 'json_schema', schema: DIAGNOSTICO_SCHEMA },
    },
    messages: [
      {
        role: 'user',
        content: `Municipio: ${municipio || 'no indicado'}\n\nRelato de la persona:\n"""\n${relato}\n"""`,
      },
    ],
  });

  const bloque = response.content.find((item) => item.type === 'text');
  if (!bloque || bloque.type !== 'text') {
    throw new Error('El modelo no devolvió una respuesta legible.');
  }
  return JSON.parse(bloque.text) as Diagnostico;
}

async function clasificarOpenAI(relato: string, municipio: string, modelo: string) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error('Falta OPENAI_API_KEY.');
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: modelo,
      max_tokens: 2000,
      messages: [
        { role: 'system', content: SISTEMA_CLASIFICADOR },
        {
          role: 'user',
          content: `Municipio: ${municipio || 'no indicado'}\n\nRelato de la persona:\n"""\n${relato}\n"""`,
        },
      ],
      response_format: {
        type: 'json_schema',
        json_schema: { name: 'diagnostico_contados', strict: true, schema: DIAGNOSTICO_SCHEMA },
      },
    }),
  });
  if (!response.ok) throw new Error(`OpenAI rechazó la clasificación (${response.status}).`);
  const result = (await response.json()) as {
    choices?: Array<{ message?: { content?: string; refusal?: string } }>;
  };
  const mensaje = result.choices?.[0]?.message;
  if (mensaje?.refusal) throw new Error('El modelo rechazó procesar el relato.');
  if (!mensaje?.content) throw new Error('El modelo no devolvió una respuesta legible.');
  return JSON.parse(mensaje.content) as Diagnostico;
}

export const clasificar: Clasificador = async (relato, municipio) => {
  const { proveedor, modelo } = configClasificador();
  const diagnostico =
    proveedor === 'openai'
      ? await clasificarOpenAI(relato, municipio, modelo)
      : await clasificarAnthropic(relato, municipio, modelo);
  return asegurarInvariantes(diagnostico, relato);
};

export { asegurarInvariantes };
