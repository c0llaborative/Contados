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
  if (!response.ok) throw new Error(`Meta rechazó el envío (${response.status}).`);
}
