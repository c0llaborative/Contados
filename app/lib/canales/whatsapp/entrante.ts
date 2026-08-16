export interface MensajeMeta {
  de: string;
  id: string;
  tipo: 'texto' | 'audio';
  texto?: string;
  audioId?: string;
}

type MetaPayload = {
  entry?: Array<{
    changes?: Array<{
      value?: {
        messages?: Array<{
          from?: string;
          id?: string;
          type?: string;
          text?: { body?: string };
          audio?: { id?: string };
        }>;
      };
    }>;
  }>;
};

export function extraerMensajes(payload: MetaPayload): MensajeMeta[] {
  const resultado: MensajeMeta[] = [];
  for (const entry of payload.entry ?? []) {
    for (const change of entry.changes ?? []) {
      for (const message of change.value?.messages ?? []) {
        if (!message.from || !message.id) continue;
        if (message.type === 'text' && message.text?.body) {
          resultado.push({ de: message.from, id: message.id, tipo: 'texto', texto: message.text.body });
        } else if (message.type === 'audio' && message.audio?.id) {
          resultado.push({ de: message.from, id: message.id, tipo: 'audio', audioId: message.audio.id });
        }
      }
    }
  }
  return resultado;
}
