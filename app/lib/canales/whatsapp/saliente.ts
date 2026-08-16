/**
 * Código de Meta para «el número de destino no está en la lista de
 * destinatarios autorizados». Un número de pruebas de Cloud API sólo puede
 * responderle a los teléfonos que estén en esa lista; a cualquier otro le
 * acepta el mensaje entrante y le rechaza la respuesta, de modo que la persona
 * no recibe absolutamente nada.
 */
export const META_DESTINO_NO_AUTORIZADO = 131030;

/**
 * Envío rechazado por Meta.
 *
 * Guarda el código propio de Meta porque el estado HTTP no alcanza: un 400
 * puede ser la lista de autorizados, la ventana de 24 horas o un cuerpo mal
 * formado, y en el log se veían todos iguales. El teléfono de destino nunca
 * entra en el mensaje: no se registra en ninguna parte.
 */
export class ErrorEnvioMeta extends Error {
  readonly estado: number;
  readonly codigo: number | null;

  constructor(estado: number, codigo: number | null, detalle: string) {
    super(`Meta rechazó el envío (HTTP ${estado}${codigo === null ? '' : `, código ${codigo}`}): ${detalle}`);
    this.name = 'ErrorEnvioMeta';
    this.estado = estado;
    this.codigo = codigo;
  }
}

async function leerErrorMeta(response: Response) {
  try {
    const cuerpo = (await response.json()) as { error?: { code?: number; message?: string } };
    return {
      codigo: typeof cuerpo.error?.code === 'number' ? cuerpo.error.code : null,
      detalle: cuerpo.error?.message ?? 'sin detalle',
    };
  } catch {
    return { codigo: null, detalle: 'respuesta ilegible' };
  }
}

function configMeta() {
  const token = process.env.WHATSAPP_TOKEN;
  const phoneId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  const version = process.env.WHATSAPP_GRAPH_VERSION;
  if (!token || !phoneId || !version) {
    throw new Error('Faltan WHATSAPP_TOKEN, WHATSAPP_PHONE_NUMBER_ID o WHATSAPP_GRAPH_VERSION.');
  }
  return { token, phoneId, version };
}

export async function enviarTexto(destino: string, texto: string) {
  if (process.env.WHATSAPP_SEND_ENABLED !== 'true') {
    throw new Error('Envío real desactivado: defina WHATSAPP_SEND_ENABLED=true.');
  }
  const { token, phoneId, version } = configMeta();
  const response = await fetch(
    `https://graph.facebook.com/${version}/${phoneId}/messages`,
    {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to: destino,
        type: 'text',
        text: { preview_url: false, body: texto },
      }),
    },
  );
  if (!response.ok) {
    const { codigo, detalle } = await leerErrorMeta(response);
    throw new ErrorEnvioMeta(response.status, codigo, detalle);
  }
}
