import Anthropic from '@anthropic-ai/sdk';
import { NextResponse } from 'next/server';
import { DIAGNOSTICO_SCHEMA, type Diagnostico } from '@/lib/schema';

const client = new Anthropic();

const SISTEMA = `Ubicas a una familia damnificada por el terremoto del 10 de agosto de 2026 en Colombia dentro de la ruta oficial de atención, a partir de lo que ella misma cuenta.

La ruta tiene cinco compuertas, en este orden:

1. reporte — avisó que su vivienda resultó afectada. No implica estar censado.
2. censo — un funcionario tomó sus datos. No implica estar en el RUD.
3. evaluacion_tecnica — falta que un técnico visite la vivienda y deje constancia. Es la fila más larga.
4. rud — quedó inscrito en el Registro Único de Damnificados. Solo el Consejo Municipal de Gestión del Riesgo puede inscribir.
5. subsidio — figura entre los beneficiarios; el aviso llega por mensaje de texto.

La compuerta que devuelves es donde la persona está TRABADA: el último paso que sí completó. Si le tomaron datos pero nadie ha vuelto, está en "censo" esperando la evaluación técnica.

Cómo leer los relatos: la gente no usa el vocabulario oficial. "Vino una señora con chaleco y anotó en un cuaderno" es un intento de censo, no un registro en RUD. "Me dijeron que ya estaba en la lista" puede ser censo o RUD — si no puedes distinguirlo, no lo adivines.

Abstención: si el relato no alcanza para ubicar la compuerta, devuelve compuerta null y llena falta_preguntar con las preguntas concretas que resolverían la duda. Abstenerse es una respuesta correcta y esperada. Inventar una compuerta es el peor error que puedes cometer aquí, porque la persona actuará sobre ella.

Evidencia: cada hecho lleva la frase textual del relato que lo sustenta, copiada literalmente. Si no puedes citar la frase, el hecho no existe.

Riesgos de exclusión: márcalos solo cuando el relato los sustente.
- arrendatario: paga arriendo. Varios apoyos piden acreditar propiedad.
- sin_titulo: ocupa o construyó sin escritura.
- titular_ausente: la vivienda está a nombre de un tercero fallecido o ausente.
- sin_documentos: perdió cédula o papeles.
- ausente_en_visita: no estaba cuando pasaron tomando datos.
- zona_sin_cobertura: su zona todavía no ha sido visitada por nadie.
Para cada uno, la acción debe ser algo concreto que la persona pueda pedir o hacer, no un consejo general.

posible_estafa: márcalo true si quien tomó los datos pudo no ser funcionario — por ejemplo si le cobraron, le pidieron huella o datos bancarios, o no se identificó. Hay denuncias verificadas de suplantación de funcionarios puerta a puerta.

Escribe en segunda persona ("usted"), en frases cortas y sin jerga. No prometas que la ayuda llegará. No afirmes que una vivienda es segura, habitable o que cumple norma.`;

export async function POST(req: Request) {
  let relato: string;
  let municipio: string;

  try {
    const body = await req.json();
    relato = typeof body.relato === 'string' ? body.relato.trim() : '';
    municipio = typeof body.municipio === 'string' ? body.municipio : '';
  } catch {
    return NextResponse.json({ error: 'Cuerpo inválido' }, { status: 400 });
  }

  if (relato.length < 10) {
    return NextResponse.json(
      { error: 'Cuéntenos un poco más de lo que pasó.' },
      { status: 400 },
    );
  }

  try {
    const response = await client.messages.create({
      model: 'claude-opus-5',
      max_tokens: 16000,
      system: SISTEMA,
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

    const bloque = response.content.find((b) => b.type === 'text');
    if (!bloque || bloque.type !== 'text') {
      return NextResponse.json(
        { error: 'El modelo no devolvió una respuesta legible.' },
        { status: 502 },
      );
    }

    const diagnostico = JSON.parse(bloque.text) as Diagnostico;

    // Invariante: sin compuerta, tiene que decir qué falta preguntar.
    // Si el modelo se abstiene sin explicar, eso es un fallo nuestro, no suyo.
    if (diagnostico.compuerta === null && diagnostico.falta_preguntar.length === 0) {
      diagnostico.falta_preguntar = [
        '¿Alguien ha ido a su casa a tomar datos o a revisarla? ¿Cuándo?',
      ];
    }

    return NextResponse.json(diagnostico);
  } catch (error) {
    if (error instanceof Anthropic.RateLimitError) {
      return NextResponse.json(
        { error: 'Hay mucha gente usando el sistema. Intente en un momento.' },
        { status: 429 },
      );
    }
    console.error('[diagnose]', error);
    return NextResponse.json(
      { error: 'No pudimos analizar su caso en este momento.' },
      { status: 500 },
    );
  }
}
